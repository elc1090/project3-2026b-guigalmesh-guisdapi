"""Idioma das respostas (cabeçalho Accept-Language) e tradução das mensagens de erro."""
import os

os.environ.setdefault("SUPABASE_URL", "https://teste.supabase.co")
os.environ.setdefault("SUPABASE_KEY", "chave-de-teste")

from fastapi.testclient import TestClient

from app.idioma import MENSAGENS_PT, idioma_de, traduzir_mensagem
from app.main import app


def test_idioma_do_cabecalho():
    assert idioma_de("pt") == "pt"
    assert idioma_de("pt-BR,pt;q=0.9") == "pt"
    assert idioma_de("es") == "es"
    assert idioma_de("en-US") == "es"
    assert idioma_de(None) == "es"


def test_traduz_mensagens_fixas_e_com_parte_variavel():
    assert traduzir_mensagem("Actividad no encontrada", "pt") == "Atividade não encontrada"
    assert traduzir_mensagem("Actividad no encontrada", "es") == "Actividad no encontrada"
    assert traduzir_mensagem("Faltan respuestas: ['q_amb_01']", "pt") == "Faltam respostas: ['q_amb_01']"
    assert traduzir_mensagem("Texto desconhecido", "pt") == "Texto desconhecido"
    assert traduzir_mensagem({"campo": "x"}, "pt") == {"campo": "x"}  # erros de validação ficam iguais


def test_toda_mensagem_tem_traducao_nao_vazia():
    assert all(MENSAGENS_PT.values())


def test_erro_http_sai_no_idioma_pedido():
    cliente = TestClient(app)
    cabecalho = {"Authorization": "Bearer token-invalido"}
    es = cliente.get("/api/empresa", headers={**cabecalho, "Accept-Language": "es"})
    pt = cliente.get("/api/empresa", headers={**cabecalho, "Accept-Language": "pt"})
    assert es.status_code == pt.status_code == 401
    assert es.json()["detail"] == "Token inválido o expirado"
    assert pt.json()["detail"] == "Token inválido ou expirado"
