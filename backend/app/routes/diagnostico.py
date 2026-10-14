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

router = APIRouter(prefix="/api/diagnostico", tags=["diagnostico"])

STATUS_RASCUNHO = "rascunho"
STATUS_COMPLETADO = "completado"


class RespostasIn(BaseModel):
    respostas: dict[str, int]


def _contexto(user):
    """Cliente com o token do usuário (RLS vale) + id da empresa dele."""
    sb = get_supabase_for_user(user["token"])
    emp = sb.table("empresas").select("id").eq("user_id", user["id"]).execute()
    if not emp.data:
        raise HTTPException(400, "Primero debes registrar tu empresa")
    return sb, emp.data[0]["id"]


def _perguntas_ativas(sb):
    res = sb.table("perguntas").select("id, categoria, peso").eq("ativo", True).execute()
    return res.data


def _ultimo(sb, empresa_id, status):
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


@router.get("/rascunho")
def obter_rascunho(user=Depends(get_current_user)):
    sb, empresa_id = _contexto(user)
    rascunho = _ultimo(sb, empresa_id, STATUS_RASCUNHO)
    return {"respostas": rascunho["respostas"] if rascunho else {}}


@router.put("/rascunho")
def guardar_rascunho(dados: RespostasIn, user=Depends(get_current_user)):
    sb, empresa_id = _contexto(user)
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
    except Exception as e:
        raise HTTPException(500, f"Error al guardar: {e}")
    return {"mensagem": "Borrador guardado"}


@router.post("/concluir")
def concluir(dados: RespostasIn, user=Depends(get_current_user)):
    sb, empresa_id = _contexto(user)
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
    except Exception as e:
        raise HTTPException(500, f"Error al guardar: {e}")

    resultado["recomendacoes"] = gerar_recomendacoes(resultado)
    return resultado


@router.get("/resultado")
def obter_resultado(user=Depends(get_current_user)):
    sb, empresa_id = _contexto(user)
    concluido = _ultimo(sb, empresa_id, STATUS_COMPLETADO)
    if not concluido:
        raise HTTPException(404, "Aún no hay un diagnóstico completado")
    try:
        resultado = calcular_diagnostico(_perguntas_ativas(sb), concluido["respostas"])
        resultado["recomendacoes"] = gerar_recomendacoes(resultado)
        return resultado
    except RespostasInvalidas as e:
        raise HTTPException(409, str(e))