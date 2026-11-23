"""Análisis con IA do último diagnóstico concluído (Gemini como serviço).

A análise fica salva na tabela analisis_ia (uma por diagnóstico, com RLS): ao voltar à tela
ela aparece na hora, sem nova chamada à IA. Cada diagnóstico pode ser analisado no máximo
MAX_GERACOES vezes (primeira análise + regenerações), para não gastar a cota gratuita.
"""
import logging
from datetime import datetime, timezone

from fastapi import APIRouter, Depends, HTTPException

from app.routes.diagnostico import (
    STATUS_COMPLETADO,
    _completar_resultado,
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


def _analise_salva(sb, diagnostico_id):
    try:
        res = sb.table("analisis_ia").select("*").eq("diagnostico_id", diagnostico_id).execute()
    except Exception:
        log.exception("Erro ao consultar a análise de IA")
        raise HTTPException(503, "Error al consultar el análisis")
    return res.data[0] if res.data else None


def _resposta(linha):
    geracoes = linha["geracoes"] if linha else 0
    return {
        "analisis": linha["conteudo"] if linha else None,
        "generado_em": linha["atualizado_em"] if linha else None,
        "geracoes": geracoes,
        "restantes": max(0, MAX_GERACOES - geracoes),
    }


@router.get("/analisis")
def obter(ctx=Depends(get_contexto)):
    """Análise salva do último diagnóstico (analisis = null se ainda não foi gerada)."""
    sb, empresa_id = ctx
    diagnostico = _diagnostico_atual(sb, empresa_id)
    return _resposta(_analise_salva(sb, diagnostico["id"]))


@router.post("/analisis")
def gerar(ctx=Depends(get_contexto)):
    """Gera (ou regenera) a análise do último diagnóstico. Rota síncrona: o FastAPI a executa
    numa thread separada, então a espera pela IA não trava as outras requisições."""
    sb, empresa_id = ctx
    diagnostico = _diagnostico_atual(sb, empresa_id)
    salva = _analise_salva(sb, diagnostico["id"])
    if salva and salva["geracoes"] >= MAX_GERACOES:
        raise HTTPException(429, "Alcanzaste el límite de análisis para este diagnóstico.")

    try:
        resultado = calcular_diagnostico(_perguntas_ativas(sb), diagnostico["respostas"])
        resultado = _completar_resultado(
            sb, empresa_id, resultado, diagnostico["respostas"], data_conclusao(diagnostico)
        )
    except RespostasInvalidas as e:
        raise HTTPException(409, str(e))

    try:
        emp = sb.table("empresas").select("setor, porte, num_funcionarios").eq("id", empresa_id).execute()
        empresa = emp.data[0] if emp.data else {}
    except Exception:
        log.exception("Erro ao buscar a empresa para a análise de IA")
        empresa = {}

    try:
        conteudo, modelo = gerar_analise(montar_contexto(resultado, empresa))
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
        "conteudo": conteudo,
        "modelo": modelo,
        "geracoes": (salva["geracoes"] + 1) if salva else 1,
        "atualizado_em": datetime.now(timezone.utc).isoformat(),
    }
    try:
        res = sb.table("analisis_ia").upsert(registro, on_conflict="diagnostico_id").execute()
    except Exception:
        log.exception("Erro ao salvar a análise de IA")
        # a análise foi gerada: devolve mesmo sem conseguir salvar
        return _resposta({**registro, "atualizado_em": registro["atualizado_em"]})
    return _resposta(res.data[0] if res.data else registro)
