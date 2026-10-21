import pytest

from app.services.calculo import (
    RespostasInvalidas,
    calcular_diagnostico,
    nivel_de_madurez,
    validar_respostas,
)


def perguntas_simples(categoria="Ambiental", n=5, peso=1):
    return [{"id": f"{categoria[:3].lower()}{i}", "categoria": categoria, "peso": peso} for i in range(1, n + 1)]


def responder(perguntas, valor):
    return {p["id"]: valor for p in perguntas}


# ---------- nivel_de_madurez ----------

@pytest.mark.parametrize(
    "nota, esperado",
    [
        (0, "Inicial"),
        (24.9, "Inicial"),
        (25, "Básico"),
        (49.9, "Básico"),
        (50, "Intermedio"),
        (74.9, "Intermedio"),
        (75, "Avanzado"),
        (100, "Avanzado"),
    ],
)
def test_niveis_nos_limites(nota, esperado):
    assert nivel_de_madurez(nota) == esperado


# ---------- calcular_diagnostico ----------

def test_todas_respostas_minimas_dao_zero():
    perguntas = perguntas_simples()
    r = calcular_diagnostico(perguntas, responder(perguntas, 1))
    assert r["dimensoes"]["Ambiental"] == {"pontuacao": 0.0, "nivel": "Inicial"}
    assert r["geral"] == {"pontuacao": 0.0, "nivel": "Inicial"}


def test_todas_respostas_maximas_dao_cem():
    perguntas = perguntas_simples()
    r = calcular_diagnostico(perguntas, responder(perguntas, 4))
    assert r["dimensoes"]["Ambiental"] == {"pontuacao": 100.0, "nivel": "Avanzado"}
    assert r["geral"] == {"pontuacao": 100.0, "nivel": "Avanzado"}


def test_peso_maior_pesa_mais_na_nota():
    perguntas = [
        {"id": "a", "categoria": "Social", "peso": 1},
        {"id": "b", "categoria": "Social", "peso": 3},
    ]
    # soma = 1*4 + 3*1 = 7; min = 4; max = 16 -> (7 - 4) / 12 = 25%
    r = calcular_diagnostico(perguntas, {"a": 4, "b": 1})
    assert r["dimensoes"]["Social"] == {"pontuacao": 25.0, "nivel": "Básico"}


@pytest.mark.parametrize("peso", [None, 0])
def test_peso_ausente_ou_zero_conta_como_um(peso):
    com_peso = [
        {"id": "a", "categoria": "Social", "peso": peso},
        {"id": "b", "categoria": "Social", "peso": 1},
    ]
    explicito = [
        {"id": "a", "categoria": "Social", "peso": 1},
        {"id": "b", "categoria": "Social", "peso": 1},
    ]
    respostas = {"a": 4, "b": 2}
    assert calcular_diagnostico(com_peso, respostas) == calcular_diagnostico(explicito, respostas)


def test_media_geral_das_dimensoes():
    perguntas = perguntas_simples("Ambiental", 2) + perguntas_simples("Social", 2)
    respostas = {**responder(perguntas[:2], 1), **responder(perguntas[2:], 4)}
    r = calcular_diagnostico(perguntas, respostas)
    assert r["dimensoes"]["Ambiental"]["pontuacao"] == 0.0
    assert r["dimensoes"]["Social"]["pontuacao"] == 100.0
    assert r["geral"] == {"pontuacao": 50.0, "nivel": "Intermedio"}


def test_nivel_coerente_com_a_nota_arredondada():
    # 74.961...% arredonda para 75.0; o nível precisa acompanhar a nota exibida
    perguntas = [
        {"id": "a", "categoria": "Social", "peso": 1000},
        {"id": "b", "categoria": "Social", "peso": 3019},
    ]
    r = calcular_diagnostico(perguntas, {"a": 4, "b": 3})
    dim = r["dimensoes"]["Social"]
    assert dim["pontuacao"] == 75.0
    assert dim["nivel"] == "Avanzado"
    assert dim["nivel"] == nivel_de_madurez(dim["pontuacao"])


def test_lista_de_perguntas_vazia_levanta_erro_claro():
    with pytest.raises(RespostasInvalidas):
        calcular_diagnostico([], {})


# ---------- validação ----------

def test_resposta_para_pergunta_desconhecida():
    perguntas = perguntas_simples(n=2)
    respostas = {**responder(perguntas, 3), "xyz": 2}
    with pytest.raises(RespostasInvalidas, match="desconocidas"):
        calcular_diagnostico(perguntas, respostas)


@pytest.mark.parametrize("valor", [0, 5, -1, 3.0, "3", None, True])
def test_valores_invalidos_sao_rejeitados(valor):
    perguntas = perguntas_simples(n=2)
    respostas = responder(perguntas, 3)
    respostas[perguntas[0]["id"]] = valor
    with pytest.raises(RespostasInvalidas):
        calcular_diagnostico(perguntas, respostas)


def test_respostas_faltando():
    perguntas = perguntas_simples(n=3)
    respostas = responder(perguntas[:2], 3)
    with pytest.raises(RespostasInvalidas, match="Faltan"):
        calcular_diagnostico(perguntas, respostas)


def test_rascunho_aceita_respostas_parciais():
    perguntas = perguntas_simples(n=3)
    validar_respostas(perguntas, responder(perguntas[:1], 2), completo=False)


def test_rascunho_ainda_rejeita_valor_invalido():
    perguntas = perguntas_simples(n=3)
    with pytest.raises(RespostasInvalidas):
        validar_respostas(perguntas, {perguntas[0]["id"]: 9}, completo=False)