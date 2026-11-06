"""Testes da validação local do token, sem rede: o JWKS é trocado por um falso."""
import os
import time

os.environ.setdefault("SUPABASE_URL", "https://teste.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "chave-de-teste")

import jwt
import pytest
from cryptography.hazmat.primitives.asymmetric import ec
from fastapi import HTTPException
from fastapi.security import HTTPAuthorizationCredentials

from app import auth

CHAVE = ec.generate_private_key(ec.SECP256R1())
OUTRA_CHAVE = ec.generate_private_key(ec.SECP256R1())


class JwksFalso:
    def __init__(self, chave_publica=None, erro=None):
        self.chave_publica, self.erro = chave_publica, erro

    def get_signing_key_from_jwt(self, token):
        if self.erro:
            raise self.erro
        return type("Chave", (), {"key": self.chave_publica})()


def gerar_token(chave=CHAVE, alg="ES256", **extra):
    claims = {
        "sub": "user-123",
        "email": "a@b.com",
        "aud": "authenticated",
        "iss": auth.ISSUER,
        "exp": int(time.time()) + 3600,
        **extra,
    }
    return jwt.encode(claims, chave, algorithm=alg)


def chamar(token):
    return auth.get_current_user(HTTPAuthorizationCredentials(scheme="Bearer", credentials=token))


@pytest.fixture(autouse=True)
def jwks(monkeypatch):
    monkeypatch.setattr(auth, "_jwks", JwksFalso(CHAVE.public_key()))
    monkeypatch.setattr(auth, "JWT_SECRET", None)
    # se algum teste cair no Supabase sem querer, falha em vez de fazer rede
    monkeypatch.setattr(auth, "_validar_no_supabase", lambda t: pytest.fail("não deveria chamar o Supabase"))


def test_token_valido_campos():
    token = gerar_token()
    user = chamar(token)
    assert user["id"] == "user-123"
    assert user["email"] == "a@b.com"
    assert user["token"] == token


@pytest.mark.parametrize("token", [
    gerar_token(exp=int(time.time()) - 10),          # expirado
    gerar_token(chave=OUTRA_CHAVE),                    # assinado por outra chave
    gerar_token(aud="anon"),                           # audiência errada
    gerar_token(iss="https://outro.supabase.co/auth/v1"),  # emissor errado
    "isso-nao-e-um-jwt",
])
def test_token_invalido_da_401(token):
    with pytest.raises(HTTPException) as erro:
        chamar(token)
    assert erro.value.status_code == 401


def test_hs256_com_secret_valida_localmente(monkeypatch):
    monkeypatch.setattr(auth, "JWT_SECRET", "segredo-de-teste-com-pelo-menos-32-bytes!!")
    token = gerar_token(chave=auth.JWT_SECRET, alg="HS256")
    assert chamar(token)["id"] == "user-123"


def test_hs256_sem_secret_usa_supabase(monkeypatch):
    monkeypatch.setattr(auth, "_validar_no_supabase", lambda t: {"id": "via-supabase", "email": None, "token": t})
    token = gerar_token(chave="segredo-de-teste-com-pelo-menos-32-bytes!!", alg="HS256")
    assert chamar(token)["id"] == "via-supabase"


def test_jwks_fora_do_ar_usa_supabase(monkeypatch):
    monkeypatch.setattr(auth, "_jwks", JwksFalso(erro=jwt.PyJWKClientConnectionError("sem rede")))
    monkeypatch.setattr(auth, "_validar_no_supabase", lambda t: {"id": "via-supabase", "email": None, "token": t})
    assert chamar(gerar_token())["id"] == "via-supabase"
