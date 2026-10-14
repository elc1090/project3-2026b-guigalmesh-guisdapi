from app.services.recomendacoes import gerar_recomendacoes


def test_empresa_toda_avanzada_nao_recebe_recomendacoes():
    resultado = {
        "dimensoes": {
            "Ambiental": {"pontuacao": 80.0, "nivel": "Avanzado"},
            "Social": {"pontuacao": 100.0, "nivel": "Avanzado"},
        },
        "geral": {"pontuacao": 90.0, "nivel": "Avanzado"},
    }
    assert gerar_recomendacoes(resultado) == []


def test_ordena_da_menor_pontuacao_para_a_maior():
    resultado = {
        "dimensoes": {
            "Social": {"pontuacao": 60.0, "nivel": "Intermedio"},
            "Ambiental": {"pontuacao": 15.0, "nivel": "Inicial"},
            "Gobernanza": {"pontuacao": 35.0, "nivel": "Básico"},
            "Económica": {"pontuacao": 85.0, "nivel": "Avanzado"},
        },
        "geral": {"pontuacao": 48.8, "nivel": "Básico"},
    }
    recs = gerar_recomendacoes(resultado)

    # Económica é Avanzado, não deve aparecer
    categorias_retornadas = [r["categoria"] for r in recs]
    assert "Económica" not in categorias_retornadas

    # A primeira recomendação deve ser da dimensão com menor nota (Ambiental: 15.0)
    assert recs[0]["categoria"] == "Ambiental"
    assert recs[0]["prioridade"] == "Alta"

    # As pontuações das dimensões devem estar em ordem não-decrescente
    pontuacoes = [r["pontuacao_dimensao"] for r in recs]
    assert pontuacoes == sorted(pontuacoes)


def test_nivel_intermedio_recebe_apenas_recomendacoes_de_refinamento():
    resultado = {
        "dimensoes": {
            "Ambiental": {"pontuacao": 60.0, "nivel": "Intermedio"},
        },
        "geral": {"pontuacao": 60.0, "nivel": "Intermedio"},
    }
    recs = gerar_recomendacoes(resultado)

    # Com nota 60.0, só entra a recomendação com nota_maxima=75.0 (e não a de < 50.0)
    assert len(recs) == 1
    assert recs[0]["id"] == "rec_amb_02"
    assert recs[0]["prioridade"] == "Baja"


def test_nivel_inicial_recebe_todas_as_recomendacoes_da_dimensao():
    resultado = {
        "dimensoes": {
            "Gobernanza": {"pontuacao": 10.0, "nivel": "Inicial"},
        },
        "geral": {"pontuacao": 10.0, "nivel": "Inicial"},
    }
    recs = gerar_recomendacoes(resultado)

    assert len(recs) == 2
    assert [r["id"] for r in recs] == ["rec_gob_01", "rec_gob_02"]
    assert all(r["prioridade"] == "Alta" for r in recs)