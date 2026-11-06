import logging
import time

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel
from app.auth import get_current_user
from app.database import get_supabase_for_user
from app.services.calculo import (
    RespostasInvalidas,
    calcular_diagnostico,
    validar_respostas,
)
from app.services.recomendacoes import gerar_recomendacoes

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/diagnostico", tags=["diagnostico"])

STATUS_RASCUNHO = "rascunho"
STATUS_COMPLETADO = "completado"

# As perguntas quase nunca mudam: ficam em memória por alguns minutos.
# Depois de rodar o seed_perguntas, reinicie o back-end (ou espere o tempo abaixo).
CACHE_PERGUNTAS_SEGUNDOS = 300
_cache_perguntas = {"dados": None, "em": 0.0}


class RespostasIn(BaseModel):
    respostas: dict[str, int]


def get_contexto(user=Depends(get_current_user)):
    """Dependência das rotas: cliente com o token do usuário (RLS vale) + id da empresa dele."""
    try:
        sb = get_supabase_for_user(user["token"])
        emp = sb.table("empresas").select("id").eq("user_id", user["id"]).execute()
    except Exception:
        log.exception("Erro ao buscar a empresa do usuário")
        raise HTTPException(503, "Error de conexión con la base de datos")
    if not emp.data:
        raise HTTPException(400, "Primero debes registrar tu empresa")
    return sb, emp.data[0]["id"]


def _perguntas_ativas(sb):
    agora = time.monotonic()
    if _cache_perguntas["dados"] is not None and agora - _cache_perguntas["em"] < CACHE_PERGUNTAS_SEGUNDOS:
        return _cache_perguntas["dados"]
    try:
        res = sb.table("perguntas").select("id, categoria, peso").eq("ativo", True).execute()
    except Exception:
        log.exception("Erro ao consultar perguntas")
        raise HTTPException(503, "Error al consultar preguntas")
    _cache_perguntas.update(dados=res.data or [], em=agora)
    return _cache_perguntas["dados"]


def _ultimo(sb, empresa_id, status):
    try:
        res = (
            sb.table("diagnostico")
            .select("*")
            .eq("empresa_id", empresa_id)
            .eq("status", status)
            .order("created_at", desc=True)
            .limit(1)
            .execute()
        )
        return res.data[0] if res.data else None
    except Exception:
        log.exception("Erro ao consultar diagnóstico")
        raise HTTPException(503, "Error al consultar diagnóstico")


@router.get("/rascunho")
def obter_rascunho(ctx=Depends(get_contexto)):
    sb, empresa_id = ctx
    rascunho = _ultimo(sb, empresa_id, STATUS_RASCUNHO)
    if rascunho and rascunho.get("respostas"):
        return {"respostas": rascunho["respostas"]}
    concluido = _ultimo(sb, empresa_id, STATUS_COMPLETADO)
    return {"respostas": (concluido.get("respostas") or {}) if concluido else {}}


@router.put("/rascunho")
def guardar_rascunho(dados: RespostasIn, ctx=Depends(get_contexto)):
    sb, empresa_id = ctx
    try:
        validar_respostas(_perguntas_ativas(sb), dados.respostas, completo=False)
    except RespostasInvalidas as e:
        raise HTTPException(422, str(e))

    rascunho = _ultimo(sb, empresa_id, STATUS_RASCUNHO)
    try:
        if rascunho:
            sb.table("diagnostico").update({"respostas": dados.respostas}).eq("id", rascunho["id"]).execute()
        else:
            sb.table("diagnostico").insert({
                "empresa_id": empresa_id,
                "respostas": dados.respostas,
                "status": STATUS_RASCUNHO,
            }).execute()
    except Exception:
        log.exception("Erro ao salvar diagnóstico")
        raise HTTPException(500, "Error al guardar")
    return {"mensagem": "Borrador guardado"}


@router.post("/concluir")
def concluir(dados: RespostasIn, ctx=Depends(get_contexto)):
    sb, empresa_id = ctx
    try:
        resultado = calcular_diagnostico(_perguntas_ativas(sb), dados.respostas)
    except RespostasInvalidas as e:
        raise HTTPException(422, str(e))

    rascunho = _ultimo(sb, empresa_id, STATUS_RASCUNHO)
    registro = {"respostas": dados.respostas, "status": STATUS_COMPLETADO}
    try:
        if rascunho:
            sb.table("diagnostico").update(registro).eq("id", rascunho["id"]).execute()
        else:
            sb.table("diagnostico").insert({**registro, "empresa_id": empresa_id}).execute()
    except Exception:
        log.exception("Erro ao salvar diagnóstico")
        raise HTTPException(500, "Error al guardar")

    resultado["recomendacoes"] = gerar_recomendacoes(resultado)
    return resultado


@router.get("/resultado")
def obter_resultado(ctx=Depends(get_contexto)):
    """Só leitura: devolve o último diagnóstico concluído (quem conclui é o POST /concluir)."""
    sb, empresa_id = ctx

    concluido = _ultimo(sb, empresa_id, STATUS_COMPLETADO)
    if not concluido or not concluido.get("respostas"):
        raise HTTPException(404, "Aún no hay un diagnóstico completado")

    try:
        resultado = calcular_diagnostico(_perguntas_ativas(sb), concluido["respostas"])
        resultado["recomendacoes"] = gerar_recomendacoes(resultado)
        return resultado
    except RespostasInvalidas as e:
        raise HTTPException(409, str(e))