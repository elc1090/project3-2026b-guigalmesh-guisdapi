"""Plano de ação: a empresa marca cada recomendação como "en_progreso" ou "realizada".

O status fica na tabela acoes (uma linha por empresa + recomendação, com RLS) e volta junto
com as recomendações em GET /api/diagnostico/resultado.
"""
import logging
import re
from datetime import datetime, timezone
from typing import Literal

from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel

from app.routes.diagnostico import get_contexto
from app.services.recomendacoes import CATALOGO_PADRAO

log = logging.getLogger(__name__)
router = APIRouter(prefix="/api/acoes", tags=["acoes"])

# ids gerados por services/recomendacoes.py: rec_<id da pergunta>_<etapa>
ID_RECOMENDACAO = re.compile(r"^rec_(q_[a-z]{3}_\d{2})_(empieza|avanza)$")


class StatusIn(BaseModel):
    status: Literal["pendiente", "en_progreso", "realizada"]


@router.put("/{recomendacao_id}")
def atualizar_status(recomendacao_id: str, dados: StatusIn, ctx=Depends(get_contexto)):
    sb, empresa_id = ctx

    encontrado = ID_RECOMENDACAO.match(recomendacao_id)
    if not encontrado or encontrado.group(1) not in CATALOGO_PADRAO:
        raise HTTPException(404, "Recomendación no encontrada")

    registro = {
        "empresa_id": empresa_id,
        "recomendacao_id": recomendacao_id,
        "status": dados.status,
        "atualizado_em": datetime.now(timezone.utc).isoformat(),
    }
    try:
        sb.table("acoes").upsert(registro, on_conflict="empresa_id,recomendacao_id").execute()
    except Exception:
        log.exception("Erro ao salvar o status da ação")
        raise HTTPException(500, "Error al guardar el estado de la acción")

    return {"recomendacao_id": recomendacao_id, "status": dados.status}
