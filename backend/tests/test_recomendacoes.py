from app.services.calculo import nivel_de_madurez, calcular_diagnostico
from app.services.recomendacoes import CATALOGO_PADRAO, gerar_recomendacoes


def resultado(**notas):
    """Monta o dict de calcular_diagnostico() a partir de notas por dimensão."""
    return {
        "dimensoes": {
            nome: {"pontuacao": nota, "nivel": nivel_de_madurez(nota)}
            for nome, nota in notas.items()
        }
    }


def ids(recomendacoes):
    return [r["id"] for r in recomendacoes]


def test_dimensoes_avanzado_nao_geram_recomendacoes():
    assert gerar_recomendacoes(resultado(Ambiental=75.0, Social=100.0)) == []


def test_resultado_sem_dimensoes():
    assert gerar_recomendacoes({}) == []


def test_nota_abaixo_de_50_recebe_as_duas_acoes():
    recs = gerar_recomendacoes(resultado(Ambiental=30.0))
    assert ids(recs) == ["rec_amb_01", "rec_amb_02"]


def test_nota_entre_50_e_75_recebe_so_a_segunda_acao():
    recs = gerar_recomendacoes(resultado(Ambiental=60.0))
    assert ids(recs) == ["rec_amb_02"]


def test_nota_exatamente_50_recebe_so_a_segunda_acao():
    recs = gerar_recomendacoes(resultado(Social=50.0))
    assert ids(recs) == ["rec_soc_02"]


def test_prioridade_segue_o_nivel_da_dimensao():
    recs = gerar_recomendacoes(resultado(Ambiental=10.0, Social=40.0, Gobernanza=60.0))
    prioridade = {r["categoria"]: r["prioridade"] for r in recs}
    assert prioridade == {"Ambiental": "Alta", "Social": "Media", "Gobernanza": "Baja"}


def test_campos_da_recomendacao():
    (rec,) = gerar_recomendacoes(resultado(Gobernanza=60.0))
    assert rec["id"] == "rec_gob_02"
    assert rec["categoria"] == "Gobernanza"
    assert rec["pontuacao_dimensao"] == 60.0
    assert rec["nivel_dimensao"] == "Intermedio"
    assert rec["indicador_sugerido"]


def test_ordena_pela_menor_nota_primeiro():
    recs = gerar_recomendacoes(resultado(Social=60.0, Ambiental=20.0, Gobernanza=40.0))
    assert ids(recs) == [
        "rec_amb_01", "rec_amb_02",   # 20
        "rec_gob_01", "rec_gob_02",   # 40
        "rec_soc_02",                 # 60
    ]


def test_empate_de_nota_mantem_as_acoes_de_cada_dimensao_juntas():
    recs = gerar_recomendacoes(resultado(Social=40.0, Ambiental=40.0))
    assert ids(recs) == ["rec_amb_01", "rec_amb_02", "rec_soc_01", "rec_soc_02"]


def test_catalogo_customizado():
    catalogo = [
        {"id": "x1", "categoria": "Social", "nota_maxima": 60.0, "titulo": "T", "descricao": "D"},
    ]
    recs = gerar_recomendacoes(resultado(Social=55.0, Ambiental=10.0), catalogo=catalogo)
    assert ids(recs) == ["x1"]
    assert recs[0]["indicador_sugerido"] == ""


def test_item_sem_nota_maxima_vale_para_qualquer_dimensao_nao_avanzado():
    catalogo = [{"id": "x1", "categoria": "Social", "titulo": "T", "descricao": "D"}]
    assert ids(gerar_recomendacoes(resultado(Social=74.0), catalogo=catalogo)) == ["x1"]
    assert gerar_recomendacoes(resultado(Social=75.0), catalogo=catalogo) == []


def test_catalogo_padrao_cobre_as_quatro_dimensoes():
    categorias = {item["categoria"] for item in CATALOGO_PADRAO}
    assert categorias == {"Ambiental", "Social", "Económica", "Gobernanza"}


def test_catalogo_padrao_tem_ids_unicos_e_campos_obrigatorios():
    obrigatorios = {"id", "categoria", "nota_maxima", "ordem", "titulo", "descricao", "indicador_sugerido"}
    todos_ids = [item["id"] for item in CATALOGO_PADRAO]
    assert len(todos_ids) == len(set(todos_ids))
    for item in CATALOGO_PADRAO:
        assert obrigatorios <= item.keys()


def test_integracao_com_calcular_diagnostico():
    perguntas = (
        [{"id": f"a{i}", "categoria": "Ambiental", "peso": 1} for i in range(5)]
        + [{"id": f"s{i}", "categoria": "Social", "peso": 1} for i in range(5)]
    )
    respostas = {p["id"]: (1 if p["categoria"] == "Ambiental" else 4) for p in perguntas}
    diagnostico = calcular_diagnostico(perguntas, respostas)
    recs = gerar_recomendacoes(diagnostico)
    assert {r["categoria"] for r in recs} == {"Ambiental"}
    assert all(r["prioridade"] == "Alta" for r in recs)