from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, Field

from app.auth import get_current_user
from app.database import get_supabase_for_user

router = APIRouter(prefix="/api/empresa", tags=["empresa"])


class EmpresaIn(BaseModel):
    nome: str = Field(min_length=2)
    setor: str
    porte: Literal["micro", "pequena", "mediana"]
    num_funcionarios: int = Field(gt=0)


@router.get("")
def obter_empresa(user=Depends(get_current_user)):
    sb = get_supabase_for_user(user["token"])
    res = sb.table("empresas").select("*").eq("user_id", user["id"]).execute()
    return res.data[0] if res.data else None


@router.post("", status_code=201)
def criar_empresa(dados: EmpresaIn, user=Depends(get_current_user)):
    sb = get_supabase_for_user(user["token"])
    existe = sb.table("empresas").select("id").eq("user_id", user["id"]).execute()
    if existe.data:
        raise HTTPException(409, "Ya existe una empresa registrada")
    try:
        res = sb.table("empresas").insert(
            {**dados.model_dump(), "user_id": user["id"]}
        ).execute()
    except Exception as e:
        raise HTTPException(500, f"Error al guardar: {e}")
    return res.data[0]


@router.put("")
def atualizar_empresa(dados: EmpresaIn, user=Depends(get_current_user)):
    sb = get_supabase_for_user(user["token"])
    res = (
        sb.table("empresas")
        .update(dados.model_dump())
        .eq("user_id", user["id"])
        .execute()
    )
    if not res.data:
        raise HTTPException(404, "Empresa no encontrada")
    return res.data[0]