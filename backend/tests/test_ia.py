import json
from types import SimpleNamespace

import pytest

from app.services.ia import (
    FalhaIA,
    IANaoConfigurada,
    IASobrecarregada,
    MODELO_PADRAO,
    MODELO_RESERVA_PADRAO,
    gerar_analise,
    interpretar_resposta,
    modelo_configurado,
    montar_contexto,
    montar_prompt,
)

RESULTADO = {
    "geral": {"pontuacao": 45.0, "nivel": "Básico"},
    "dimensoes": {"Ambiental": {"pontuacao": 30.0, "nivel": "Básico"}},
    "recomendacoes": [
        {"parametro": "Consumo de energía", "categoria": "Ambiental", "etapa": "Empieza", "prioridade": "Alta",
         "titulo": "Controla tu consumo eléctrico", "descricao": "Registra los kWh.", "ods": [7], "status": "pendiente"},
        {"parametro": "Ley REP", "categoria": "Ambiental", "etapa": "Avanza", "prioridade": "Baja",
         "titulo": "Revisa si la Ley REP te aplica", "descricao": "…", "ods": [12], "status": "realizada"},
    ],
    "fortalezas": [{"parametro": "Educación y capacitación"}],
}
EMPRESA = {"nome": "Panadería El Trigal", "setor": "Comercio", "porte": "micro", "num_funcionarios": 8}

RESPOSTA_OK = {
    "resumen": "Tu empresa está en nivel básico.",
    "prioridades": [
        {"titulo": f"Prioridad {i}", "motivo": "Porque sí.", "primer_paso": "Haz algo."} for i in range(4)
    ],
    "fortalezas": "Capacitas a tu equipo.",
}


class ErroAPI(Exception):
    """Imita google.genai.errors.APIError (tem o código HTTP em .code)."""

    def __init__(self, code):
        super().__init__(f"HTTP {code}")
        self.code = code


class ClienteFalso:
    """Imita genai.Client: guarda as chamadas e devolve um texto fixo. "erros" é uma lista
    de exceções lançadas nas primeiras chamadas (uma por chamada)."""

    def __init__(self, texto=None, erro=None, erros=None):
        self.texto, self.chamadas = texto, []
        self.erros = list(erros or ([erro] if erro else []))
        self.models = self

    def generate_content(self, **kwargs):
        self.chamadas.append(kwargs)
        if self.erros:
            raise self.erros.pop(0)
        return SimpleNamespace(text=self.texto)


# ---------------------------------------------------------------- contexto

def test_contexto_nao_envia_nome_da_empresa():
    contexto = montar_contexto(RESULTADO, EMPRESA)
    assert "Panadería" not in json.dumps(contexto, ensure_ascii=False)
    assert contexto["empresa"] == {"sector": "Comercio", "tamano": "Microempresa", "numero_trabajadores": 8}


def test_contexto_separa_pendentes_e_realizadas():
    contexto = montar_contexto(RESULTADO, EMPRESA)
    assert [r["parametro"] for r in contexto["recomendaciones_pendientes"]] == ["Consumo de energía"]
    assert contexto["acciones_ya_realizadas"] == ["Ley REP"]
    assert contexto["fortalezas"] == ["Educación y capacitación"]


def test_contexto_sem_empresa():
    assert montar_contexto({}, None)["empresa"]["sector"] is None


def test_prompt_leva_o_contexto_em_json():
    assert '"sector": "Comercio"' in montar_prompt(montar_contexto(RESULTADO, EMPRESA))


# ---------------------------------------------------------------- resposta

def test_interpreta_e_limita_a_tres_prioridades():
    analise = interpretar_resposta(json.dumps(RESPOSTA_OK))
    assert len(analise["prioridades"]) == 3
    assert analise["resumen"].startswith("Tu empresa")


@pytest.mark.parametrize("texto", [None, "", "isto não é json", json.dumps({"resumen": "x"}),
                                   json.dumps({**RESPOSTA_OK, "prioridades": []})])
def test_resposta_invalida(texto):
    with pytest.raises(FalhaIA):
        interpretar_resposta(texto)


# ---------------------------------------------------------------- chamada (com cliente falso)

def test_gerar_analise_usa_o_modelo_e_o_formato_json(monkeypatch):
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    cliente = ClienteFalso(texto=json.dumps(RESPOSTA_OK))
    analise, modelo = gerar_analise(montar_contexto(RESULTADO, EMPRESA), cliente=cliente)
    assert analise["fortalezas"] == "Capacitas a tu equipo."
    assert modelo == MODELO_PADRAO
    (chamada,) = cliente.chamadas
    assert chamada["model"] == MODELO_PADRAO
    assert chamada["config"].response_mime_type == "application/json"


def test_modelo_vem_da_variavel_de_ambiente(monkeypatch):
    monkeypatch.setenv("GEMINI_MODEL", "modelo-x")
    assert modelo_configurado() == "modelo-x"


def test_erro_sem_codigo_vira_falha_ia_sem_tentar_outro_modelo():
    cliente = ClienteFalso(erro=RuntimeError("falha de rede"))
    with pytest.raises(FalhaIA):
        gerar_analise({}, cliente=cliente)
    assert len(cliente.chamadas) == 1


def test_modelo_sobrecarregado_usa_o_de_reserva(monkeypatch):
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    monkeypatch.delenv("GEMINI_MODEL_RESERVA", raising=False)
    cliente = ClienteFalso(texto=json.dumps(RESPOSTA_OK), erros=[ErroAPI(503)])
    analise, modelo = gerar_analise({}, cliente=cliente)
    assert modelo == MODELO_RESERVA_PADRAO
    assert [c["model"] for c in cliente.chamadas] == [MODELO_PADRAO, MODELO_RESERVA_PADRAO]
    assert analise["resumen"]


def test_todos_sobrecarregados(monkeypatch):
    monkeypatch.delenv("GEMINI_MODEL", raising=False)
    cliente = ClienteFalso(erros=[ErroAPI(503), ErroAPI(429)])
    with pytest.raises(IASobrecarregada):
        gerar_analise({}, cliente=cliente)


def test_chave_invalida_nao_tenta_outro_modelo():
    cliente = ClienteFalso(erros=[ErroAPI(400)])
    with pytest.raises(FalhaIA) as info:
        gerar_analise({}, cliente=cliente)
    assert not isinstance(info.value, IASobrecarregada)
    assert len(cliente.chamadas) == 1


def test_sem_chave(monkeypatch):
    monkeypatch.delenv("GEMINI_API_KEY", raising=False)
    with pytest.raises(IANaoConfigurada):
        gerar_analise({})
