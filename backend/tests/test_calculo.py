import pytest

from app.services.calculo import (
    RespostasInvalidas,
    calcular_diagnostico,
    nivel_de_madurez,
    validar_respostas,
)


def perguntas_exemplo():
    # duas dimensões com duas perguntas cada
    return [
        {"id": "q_amb_01", "categoria": "Ambiental", "peso": 1},
        {"id": "q_amb_02", "categoria": "Ambiental", "peso": 1},
        {"id": "q_soc_01", "categoria": "Social", "peso": 1},
        {"id": "q_soc_02", "categoria": "Social", "peso": 1},
    ]


def todas(valor):
    return {p["id"]: valor for p in perguntas_exemplo()}


def test_tudo_no_maximo_da_100_e_nivel_avanzado():
    r = calcular_diagnostico(perguntas_exemplo(), todas(4))
    assert r["dimensoes"]["Ambiental"] == {"pontuacao": 100.0, "nivel": "Avanzado"}
    assert r["dimensoes"]["Social"]["pontuacao"] == 100.0
    assert r["geral"] == {"pontuacao": 100.0, "nivel": "Avanzado"}


def test_tudo_no_minimo_da_zero_e_nivel_inicial():
    r = calcular_diagnostico(perguntas_exemplo(), todas(1))
    assert r["dimensoes"]["Ambiental"] == {"pontuacao": 0.0, "nivel": "Inicial"}
    assert r["geral"] == {"pontuacao": 0.0, "nivel": "Inicial"}


def test_dimensoes_independentes():
    respostas = {"q_amb_01": 4, "q_amb_02": 4, "q_soc_01": 1, "q_soc_02": 1}
    r = calcular_diagnostico(perguntas_exemplo(), respostas)
    assert r["dimensoes"]["Ambiental"]["pontuacao"] == 100.0
    assert r["dimensoes"]["Social"]["pontuacao"] == 0.0
    assert r["geral"]["pontuacao"] == 50.0
    assert r["geral"]["nivel"] == "Intermedio"


def test_valor_intermediario():
    # soma 5 de min 2 / max 8 -> (5-2)/(8-2) = 50%
    respostas = {"q_amb_01": 3, "q_amb_02": 2, "q_soc_01": 3, "q_soc_02": 2}
    r = calcular_diagnostico(perguntas_exemplo(), respostas)
    assert r["dimensoes"]["Ambiental"]["pontuacao"] == 50.0


def test_peso_muda_o_resultado():
    perguntas = [
        {"id": "a", "categoria": "Ambiental", "peso": 3},
        {"id": "b", "categoria": "Ambiental", "peso": 1},
    ]
    # a=4 (peso 3) e b=1 (peso 1): soma 13, min 4, max 16 -> 75%
    r = calcular_diagnostico(perguntas, {"a": 4, "b": 1})
    assert r["dimensoes"]["Ambiental"]["pontuacao"] == 75.0


def test_resposta_faltando_levanta_erro():
    respostas = todas(3)
    del respostas["q_soc_02"]
    with pytest.raises(RespostasInvalidas):
        calcular_diagnostico(perguntas_exemplo(), respostas)


def test_pergunta_desconhecida_levanta_erro():
    respostas = {**todas(3), "q_inexistente": 2}
    with pytest.raises(RespostasInvalidas):
        calcular_diagnostico(perguntas_exemplo(), respostas)


@pytest.mark.parametrize("valor", [0, 5, -1, True])
def test_valor_fora_da_faixa_levanta_erro(valor):
    respostas = {**todas(3), "q_amb_01": valor}
    with pytest.raises(RespostasInvalidas):
        calcular_diagnostico(perguntas_exemplo(), respostas)


def test_rascunho_aceita_respostas_parciais():
    validar_respostas(perguntas_exemplo(), {"q_amb_01": 2}, completo=False)


def test_rascunho_continua_validando_valores():
    with pytest.raises(RespostasInvalidas):
        validar_respostas(perguntas_exemplo(), {"q_amb_01": 9}, completo=False)


@pytest.mark.parametrize(
    "porcentagem, nivel",
    [(0, "Inicial"), (24.9, "Inicial"), (25, "Básico"), (49.9, "Básico"),
     (50, "Intermedio"), (74.9, "Intermedio"), (75, "Avanzado"), (100, "Avanzado")],
)
def test_limites_dos_niveis(porcentagem, nivel):
    assert nivel_de_madurez(porcentagem) == nivel