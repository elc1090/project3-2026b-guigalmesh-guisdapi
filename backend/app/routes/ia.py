"""Análisis con IA do último diagnóstico concluído (Gemini como serviço).

A análise fica salva na tabela analisis_ia (uma por diagnóstico e idioma, com RLS): ao voltar à
tela ela aparece na hora, sem nova chamada à IA. Cada diagnóstico pode ser analisado no máximo
MAX_GERACOES vezes somando os idiomas (primeira análise + regenerações), para não gastar a cota
gratuita.
"""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.idioma import idioma
from app.routes.diagnostico import (
    STATUS_COMPLETADO,
    _completar_resultado,
    _perfil_empresa,
    _perguntas_ativas,
    _ultimo,
    get_contexto,
)
from app.services.calculo import RespostasInvalidas, calcular_diagnostico
from app.services.historico import data_conclusao
from app.services.ia import FalhaIA, IANaoConfigurada, IASobrecarregada, gerar_analise, montar_contexto

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/ia", tags=["ia"])

MAX_GERACOES = 3


def _diagnostico_atual(sb, empresa_id):
    concluido = _ultimo(sb, empresa_id, STATUS_COMPLETADO)
    if not concluido or not concluido.get("respostas"):
        raise HTTPException(404, "Aún no hay un diagnóstico completado")
    return concluido


def _analises_salvas(sb, diagnostico_id):
    """Análises do diagnóstico, uma por idioma."""
    try:
        res = (
            sb.table("analisis_ia")
            .select("idioma, conteudo, geracoes, atualizado_em")
            .eq("diagnostico_id", diagnostico_id)
            .execute()
        )
    except Exception:
        log.exception("Erro ao consultar a análise de IA")
        raise HTTPException(503, "Error al consultar el análisis")
    return res.data or []


def _resposta(linha, geracoes_total):
    return {
        "analisis": linha["conteudo"] if linha else None,
        "generado_em": linha["atualizado_em"] if linha else None,
        "geracoes": geracoes_total,
        "restantes": max(0, MAX_GERACOES - geracoes_total),
    }


def _do_idioma(analises, idioma_pedido):
    return next((a for a in analises if a.get("idioma", "es") == idioma_pedido), None)


@router.get("/analisis")
def obter(ctx=Depends(get_contexto), idioma_pedido: str = Depends(idioma)):
    """Análise salva do último diagnóstico no idioma pedido (analisis = null se ainda não foi gerada)."""
    sb, empresa_id = ctx
    diagnostico = _diagnostico_atual(sb, empresa_id)
    analises = _analises_salvas(sb, diagnostico["id"])
    return _resposta(_do_idioma(analises, idioma_pedido), sum(a["geracoes"] for a in analises))


@router.post("/analisis")
def gerar(ctx=Depends(get_contexto), idioma_pedido: str = Depends(idioma)):
    """Gera (ou regenera) a análise do último diagnóstico. Rota síncrona: o FastAPI a executa
    numa thread separada, então a espera pela IA não trava as outras requisições."""
    sb, empresa_id = ctx
    diagnostico = _diagnostico_atual(sb, empresa_id)
    analises = _analises_salvas(sb, diagnostico["id"])
    total = sum(a["geracoes"] for a in analises)
    if total >= MAX_GERACOES:
        raise HTTPException(429, "Alcanzaste el límite de análisis para este diagnóstico.")
    salva = _do_idioma(analises, idioma_pedido)

    empresa = _perfil_empresa(sb, empresa_id)
    try:
        resultado = calcular_diagnostico(_perguntas_ativas(sb), diagnostico["respostas"])
        resultado = _completar_resultado(
            sb, empresa_id, resultado, diagnostico["respostas"], data_conclusao(diagnostico),
            empresa=empresa, idioma_pedido=idioma_pedido,
        )
    except RespostasInvalidas as e:
        raise HTTPException(409, str(e))

    try:
        conteudo, modelo = gerar_analise(montar_contexto(resultado, empresa, idioma_pedido), idioma=idioma_pedido)
    except IANaoConfigurada:
        log.error("GEMINI_API_KEY não configurada no servidor")
        raise HTTPException(503, "El análisis con IA no está disponible en este momento.")
    except IASobrecarregada:
        raise HTTPException(
            503, "La IA tiene mucha demanda en este momento. Espera un par de minutos e inténtalo de nuevo."
        )
    except FalhaIA:
        raise HTTPException(502, "La IA no pudo generar el análisis. Inténtalo de nuevo en unos minutos.")

    registro = {
        "empresa_id": empresa_id,
        "diagnostico_id": diagnostico["id"],
        "idioma": idioma_pedido,
        "conteudo": conteudo,
        "modelo": modelo,
        "geracoes": (salva["geracoes"] + 1) if salva else 1,
        "atualizado_em": datetime.now(timezone.utc).isoformat(),
    }
    try:
        res = sb.table("analisis_ia").upsert(registro, on_conflict="diagnostico_id,idioma").execute()
    except Exception:
        log.exception("Erro ao salvar a análise de IA")
        # a análise foi gerada: devolve mesmo sem conseguir salvar
        return _resposta(registro, total + 1)
    return _resposta(res.data[0] if res.data else registro, total + 1)
