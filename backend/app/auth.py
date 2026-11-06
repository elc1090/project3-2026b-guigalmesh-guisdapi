"""Validação do token (JWT) do Supabase Auth.

Caminho rápido: confere a assinatura aqui mesmo, sem ida e volta ao Supabase.
- Tokens com chave assimétrica (ES256/RS256): usa a chave pública do JWKS do projeto (fica em cache).
- Tokens HS256 (JWT secret legado): só se SUPABASE_JWT_SECRET estiver no .env.
Se não der para validar localmente, cai no caminho antigo: supabase.auth.get_user(token).
"""
import logging
import os

import jwt
from fastapi import Depends, HTTPException, status
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials

from app.database import get_supabase  # também carrega o .env

log = logging.getLogger(__name__)
bearer = HTTPBearer()

ISSUER = f"{os.environ['SUPABASE_URL'].rstrip('/')}/auth/v1"
JWT_SECRET = os.getenv("SUPABASE_JWT_SECRET")
ALGORITMOS_ASSIMETRICOS = {"ES256", "RS256"}

_jwks = jwt.PyJWKClient(f"{ISSUER}/.well-known/jwks.json", cache_keys=True, lifespan=3600)
_avisou_fallback = False


class NaoValidavelLocalmente(Exception):
    """O token não pode ser conferido aqui (sem chave disponível); perguntar ao Supabase."""


def _erro_401():
    return HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido o expirado")


def validar_localmente(token: str) -> dict:
    """Devolve o usuário do token. Lança jwt.InvalidTokenError se o token for inválido
    e NaoValidavelLocalmente se não houver como conferir a assinatura aqui."""
    alg = jwt.get_unverified_header(token).get("alg")

    if alg in ALGORITMOS_ASSIMETRICOS:
        try:
            chave = _jwks.get_signing_key_from_jwt(token).key
        except jwt.PyJWKClientError as e:  # JWKS fora do ar, vazio ou sem a chave (kid)
            raise NaoValidavelLocalmente(str(e)) from e
    elif alg == "HS256" and JWT_SECRET:
        chave = JWT_SECRET
    else:
        raise NaoValidavelLocalmente(f"algoritmo {alg} sem chave local")

    claims = jwt.decode(
        token,
        chave,
        algorithms=[alg],
        audience="authenticated",
        issuer=ISSUER,
        options={"require": ["exp", "sub"]},
    )
    return {"id": claims["sub"], "email": claims.get("email"), "token": token}


def _validar_no_supabase(token: str) -> dict:
    try:
        res = get_supabase().auth.get_user(token)
        user = res.user if res else None
    except Exception:
        user = None

    if user is None:
        raise _erro_401()
    return {"id": user.id, "email": user.email, "token": token}


def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)):
    global _avisou_fallback
    token = cred.credentials
    try:
        return validar_localmente(token)
    except NaoValidavelLocalmente as motivo:
        if not _avisou_fallback:
            log.warning("Validando tokens pelo Supabase (sem validação local): %s", motivo)
            _avisou_fallback = True
        return _validar_no_supabase(token)
    except jwt.InvalidTokenError:
        raise _erro_401()
