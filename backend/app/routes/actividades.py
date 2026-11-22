"""Empresas que dejan huella positiva: atividades ambientais da empresa (planejadas e realizadas).

Tabela actividades (uma linha por atividade, com RLS: cada usuário só vê as da própria empresa).
"""
import logging
from datetime import date, datetime, timezone
from typing import Literal
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Response
from pydantic import BaseModel, Field, field_validator

from app.routes.diagnostico import get_contexto
from app.services.huella import resumir_actividades

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/actividades", tags=["actividades"])

Tipo = Literal[
    "limpieza_playa", "limpieza_rio", "limpieza_bosque", "reforestacion",
    "areas_verdes", "reciclaje", "educacion", "voluntariado", "otra",
]


class ActividadIn(BaseModel):
    tipo: Tipo
    titulo: str = Field(min_length=2, max_length=120)
    fecha: date
    lugar: str | None = Field(default=None, max_length=160)
    estado: Literal["planificada", "realizada"] = "planificada"
    # resultados: só contam no resumo quando a atividade está "realizada"
    participantes: int = Field(default=0, ge=0, le=100_000)
    horas_voluntariado: float = Field(default=0, ge=0, le=1_000_000)
    kg_residuos: float = Field(default=0, ge=0, le=10_000_000)
    arboles_plantados: int = Field(default=0, ge=0, le=1_000_000)
    espacio_recuperado: str | None = Field(default=None, max_length=160)
    notas: str | None = Field(default=None, max_length=1000)

    @field_validator("titulo", "lugar", "espacio_recuperado", "notas", mode="before")
    @classmethod
    def limpar_texto(cls, valor):
        # espaços nas pontas saem; texto vazio vira null (o título vazio cai no min_length)
        if isinstance(valor, str):
            return valor.strip() or None
        return valor

    def para_banco(self) -> dict:
        dados = self.model_dump(mode="json")
        dados["horas_voluntariado"] = round(self.horas_voluntariado, 1)
        dados["kg_residuos"] = round(self.kg_residuos, 1)
        return dados


def _erro(acao: str) -> HTTPException:
    log.exception("Erro ao %s atividade", acao)
    return HTTPException(503, "Error al guardar la actividad" if acao != "listar" else "Error al consultar las actividades")


@router.get("")
def listar(ctx=Depends(get_contexto)):
    """Atividades da empresa (mais recentes primeiro) + resumo do impacto."""
    sb, empresa_id = ctx
    try:
        res = (
            sb.table("actividades")
            .select("*")
            .eq("empresa_id", empresa_id)
            .order("fecha", desc=True)
            .execute()
        )
    except Exception:
        raise _erro("listar")
    actividades = res.data or []
    return {"actividades": actividades, "resumen": resumir_actividades(actividades)}


@router.post("", status_code=201)
def criar(dados: ActividadIn, ctx=Depends(get_contexto)):
    sb, empresa_id = ctx
    try:
        res = sb.table("actividades").insert({**dados.para_banco(), "empresa_id": empresa_id}).execute()
    except Exception:
        raise _erro("criar")
    return res.data[0]


@router.put("/{actividad_id}")
def atualizar(actividad_id: UUID, dados: ActividadIn, ctx=Depends(get_contexto)):
    sb, empresa_id = ctx
    registro = {**dados.para_banco(), "atualizado_em": datetime.now(timezone.utc).isoformat()}
    try:
        res = (
            sb.table("actividades")
            .update(registro)
            .eq("id", str(actividad_id))
            .eq("empresa_id", empresa_id)
            .execute()
        )
    except Exception:
        raise _erro("atualizar")
    if not res.data:
        raise HTTPException(404, "Actividad no encontrada")
    return res.data[0]


@router.delete("/{actividad_id}", status_code=204)
def apagar(actividad_id: UUID, ctx=Depends(get_contexto)):
    sb, empresa_id = ctx
    try:
        res = (
            sb.table("actividades")
            .delete()
            .eq("id", str(actividad_id))
            .eq("empresa_id", empresa_id)
            .execute()
        )
    except Exception:
        raise _erro("apagar")
    if not res.data:
        raise HTTPException(404, "Actividad no encontrada")
    return Response(status_code=204)
