import logging
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.database import get_supabase_for_user

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/empresa", tags=["empresa"])


# mesma lista do front (views/Empresa.vue)
Setor = Literal[
    "Agricultura", "Comercio", "Construcción", "Manufactura",
    "Servicios", "Tecnología", "Turismo", "Otro",
]


class EmpresaIn(BaseModel):
    nome: str = Field(min_length=2, max_length=120)
    setor: Setor
    porte: Literal["micro", "pequena", "mediana"]
    num_funcionarios: int = Field(gt=0, le=100_000)


def _erro_banco(acao: str) -> HTTPException:
    log.exception("Erro ao %s empresa", acao)
    return HTTPException(503, "Error de conexión con la base de datos")


@router.get("")
def obter_empresa(user=Depends(get_current_user)):
    try:
        sb = get_supabase_for_user(user["token"])
        res = sb.table("empresas").select("*").eq("user_id", user["id"]).execute()
    except Exception:
        raise _erro_banco("buscar")
    return res.data[0] if res.data else None


@router.post("", status_code=201)
def criar_empresa(dados: EmpresaIn, user=Depends(get_current_user)):
    try:
        sb = get_supabase_for_user(user["token"])
        existe = sb.table("empresas").select("id").eq("user_id", user["id"]).execute()
    except Exception:
        raise _erro_banco("verificar")
    if existe.data:
        raise HTTPException(409, "Ya existe una empresa registrada")
    try:
        res = sb.table("empresas").insert(
            {**dados.model_dump(), "user_id": user["id"]}
        ).execute()
    except Exception:
        log.exception("Erro ao salvar empresa")
        raise HTTPException(500, "Error al guardar")
    return res.data[0]


@router.put("")
def atualizar_empresa(dados: EmpresaIn, user=Depends(get_current_user)):
    try:
        sb = get_supabase_for_user(user["token"])
        res = (
            sb.table("empresas")
            .update(dados.model_dump())
            .eq("user_id", user["id"])
            .execute()
        )
    except Exception:
        raise _erro_banco("atualizar")
    if not res.data:
        raise HTTPException(404, "Empresa no encontrada")
    return res.data[0]