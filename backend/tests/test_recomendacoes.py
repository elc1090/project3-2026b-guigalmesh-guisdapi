import json
from pathlib import Path

from app.services.calculo import calcular_diagnostico
from app.services.recomendacoes import (
    CATALOGO_PADRAO,
    gerar_fortalezas,
    gerar_recomendacoes,
)
from app.services.recomendacoes_pt import CATALOGO_PT, ENLACES_PT

PERGUNTAS = json.loads(
    (Path(__file__).parent.parent / "app" / "perguntas.json").read_text(encoding="utf-8")
)


def todas(valor):
    return {p["id"]: valor for p in PERGUNTAS}


def ids(recomendacoes):
    return [r["id"] for r in recomendacoes]


# ---------------------------------------------------------------- catálogo

def test_catalogo_cobre_todas_as_perguntas_ativas():
    ativas = {p["id"] for p in PERGUNTAS if p["ativo"]}
    assert set(CATALOGO_PADRAO) == ativas


def test_catalogo_usa_a_mesma_categoria_da_pergunta():
    categoria = {p["id"]: p["categoria"] for p in PERGUNTAS}
    for pergunta_id, item in CATALOGO_PADRAO.items():
        assert item["categoria"] == categoria[pergunta_id]


def test_catalogo_tem_tres_dimensoes():
    assert {item["categoria"] for item in CATALOGO_PADRAO.values()} == {"Ambiental", "Social", "Económica"}


def test_catalogo_tem_campos_obrigatorios_e_ods_validos():
    for item in CATALOGO_PADRAO.values():
        assert item["parametro"] and item["indicador"]
        assert item["ods"] and all(1 <= n <= 17 for n in item["ods"])
        for etapa in ("empieza", "avanza"):
            assert item[etapa]["titulo"] and item[etapa]["descricao"]


# ---------------------------------------------------------------- regras

def test_resposta_4_nao_gera_recomendacao():
    assert gerar_recomendacoes(todas(4)) == []


def test_sem_respostas():
    assert gerar_recomendacoes({}) == []


def test_respostas_1_e_2_geram_empieza_e_3_gera_avanza():
    recs = gerar_recomendacoes({"q_amb_03": 1, "q_amb_04": 2, "q_soc_07": 3})
    etapa = {r["pergunta_id"]: r["etapa"] for r in recs}
    assert etapa == {"q_amb_03": "Empieza", "q_amb_04": "Empieza", "q_soc_07": "Avanza"}


def test_prioridade_segue_a_resposta():
    recs = gerar_recomendacoes({"q_amb_03": 1, "q_amb_04": 2, "q_soc_07": 3})
    prioridade = {r["pergunta_id"]: r["prioridade"] for r in recs}
    assert prioridade == {"q_amb_03": "Alta", "q_amb_04": "Media", "q_soc_07": "Baja"}


def test_ordena_por_prioridade():
    recs = gerar_recomendacoes({"q_soc_07": 3, "q_amb_04": 2, "q_eco_01": 1})
    assert [r["pergunta_id"] for r in recs] == ["q_eco_01", "q_amb_04", "q_soc_07"]


def test_empate_de_prioridade_vem_primeiro_a_dimensao_de_menor_nota():
    resultado = {"dimensoes": {
        "Ambiental": {"pontuacao": 80.0, "nivel": "Avanzado"},
        "Social": {"pontuacao": 20.0, "nivel": "Inicial"},
    }}
    recs = gerar_recomendacoes({"q_amb_01": 1, "q_soc_01": 1}, resultado=resultado)
    assert [r["pergunta_id"] for r in recs] == ["q_soc_01", "q_amb_01"]
    assert recs[0]["pontuacao_dimensao"] == 20.0
    assert recs[0]["nivel_dimensao"] == "Inicial"


def test_setor_prioritario_sobe_a_prioridade():
    respostas = {"q_amb_06": 3}
    (sem_setor,) = gerar_recomendacoes(respostas, empresa={"setor": "Servicios"})
    (comercio,) = gerar_recomendacoes(respostas, empresa={"setor": "Comercio"})
    assert sem_setor["prioridade"] == "Baja"
    assert comercio["prioridade"] == "Media"


def test_prioridade_alta_nao_passa_de_alta():
    (rec,) = gerar_recomendacoes({"q_amb_08": 1}, empresa={"setor": "Turismo"})
    assert rec["prioridade"] == "Alta"


def test_microempresa_recebe_texto_simplificado():
    respostas = {"q_eco_06": 3}
    (pequena,) = gerar_recomendacoes(respostas, empresa={"porte": "pequena"})
    (micro,) = gerar_recomendacoes(respostas, empresa={"porte": "micro"})
    assert pequena["descricao"] == CATALOGO_PADRAO["q_eco_06"]["avanza"]["descricao"]
    assert micro["descricao"] == CATALOGO_PADRAO["q_eco_06"]["avanza"]["descricao_micro"]


def test_micro_sem_texto_proprio_usa_o_texto_normal():
    (rec,) = gerar_recomendacoes({"q_amb_03": 1}, empresa={"porte": "micro"})
    assert rec["descricao"] == CATALOGO_PADRAO["q_amb_03"]["empieza"]["descricao"]


def test_campos_da_recomendacao():
    (rec,) = gerar_recomendacoes({"q_amb_05": 2})
    assert rec["id"] == "rec_q_amb_05_empieza"
    assert rec["categoria"] == "Ambiental"
    assert rec["parametro"] == "Generación de residuos"
    assert rec["ods"] == [12]
    assert rec["indicador_sugerido"]
    assert rec["enlace"]["para"] == "/educacion/ley-rep"


def test_enlace_da_etapa_tem_preferencia():
    (empieza,) = gerar_recomendacoes({"q_amb_08": 1})
    (avanza,) = gerar_recomendacoes({"q_amb_08": 3})
    assert empieza["enlace"]["para"] == "/educacion/ecosistemas"
    assert avanza["enlace"]["para"] == "/huella-positiva"


def test_catalogo_customizado():
    catalogo = {"x1": {
        "categoria": "Social", "parametro": "P",
        "empieza": {"titulo": "T1", "descricao": "D1"},
        "avanza": {"titulo": "T2", "descricao": "D2"},
    }}
    (rec,) = gerar_recomendacoes({"x1": 3}, catalogo=catalogo)
    assert rec["titulo"] == "T2"
    assert rec["indicador_sugerido"] == ""
    assert rec["ods"] == []
    assert rec["enlace"] is None


# ---------------------------------------------------------------- fortalezas

def test_fortalezas_sao_as_respostas_4():
    fortalezas = gerar_fortalezas({"q_amb_01": 4, "q_amb_02": 3, "q_eco_07": 4})
    assert [f["pergunta_id"] for f in fortalezas] == ["q_amb_01", "q_eco_07"]
    assert fortalezas[0]["parametro"] == "Emisiones de gases de efecto invernadero"


def test_integracao_com_calcular_diagnostico():
    respostas = {p["id"]: (1 if p["categoria"] == "Ambiental" else 4) for p in PERGUNTAS}
    resultado = calcular_diagnostico(PERGUNTAS, respostas)
    assert set(resultado["dimensoes"]) == {"Ambiental", "Social", "Económica"}

    recs = gerar_recomendacoes(respostas, resultado=resultado)
    assert len(recs) == 8
    assert {r["categoria"] for r in recs} == {"Ambiental"}
    assert all(r["prioridade"] == "Alta" and r["etapa"] == "Empieza" for r in recs)
    assert len(gerar_fortalezas(respostas)) == 14

def test_links_da_educacion_apontam_para_temas_que_existem():
    """Os slugs dos temas ficam no front (constants/educacion.js): um link quebrado aqui
    faria o botão sumir da recomendação sem ninguém perceber."""
    import re
    arquivo = Path(__file__).parents[2] / "frontend" / "src" / "constants" / "educacion.js"
    slugs = set(re.findall(r"slug: '([a-z0-9-]+)'", arquivo.read_text(encoding="utf-8")))
    assert slugs, "nenhum tema encontrado em constants/educacion.js"
    for item in CATALOGO_PADRAO.values():
        for enlace in (item.get("enlace"), item["empieza"].get("enlace"), item["avanza"].get("enlace")):
            if enlace and enlace["para"].startswith("/educacion/"):
                assert enlace["para"].removeprefix("/educacion/") in slugs, enlace["para"]


# ---------------------------------------------------------------- idioma


def test_catalogo_pt_cobre_todas_as_perguntas():
    assert set(CATALOGO_PT) == set(CATALOGO_PADRAO)
    for pid, item in CATALOGO_PADRAO.items():
        pt = CATALOGO_PT[pid]
        assert pt["parametro"] and pt["indicador"], pid
        for etapa in ("empieza", "avanza"):
            assert pt[etapa]["titulo"] and pt[etapa]["descricao"], pid
            assert ("descricao_micro" in pt[etapa]) == ("descricao_micro" in item[etapa]), pid
        for enlace in (item.get("enlace"), item["empieza"].get("enlace"), item["avanza"].get("enlace")):
            if enlace:
                assert enlace["para"] in ENLACES_PT, pid


def test_recomendacoes_em_portugues_mantem_ids_e_codigos():
    respostas = {"q_amb_01": 1, "q_soc_07": 3, "q_amb_08": 3}
    es = gerar_recomendacoes(respostas, empresa={"porte": "micro"})
    pt = gerar_recomendacoes(respostas, empresa={"porte": "micro"}, idioma="pt")
    assert [r["id"] for r in pt] == [r["id"] for r in es]
    assert [(r["categoria"], r["etapa"], r["prioridade"]) for r in pt] == [(r["categoria"], r["etapa"], r["prioridade"]) for r in es]
    por_id = {r["pergunta_id"]: r for r in pt}
    assert por_id["q_amb_01"]["titulo"] == "Identifique suas fontes de emissões"
    assert por_id["q_soc_07"]["descricao"].startswith("Programe pelo menos")  # texto de microempresa
    assert por_id["q_amb_08"]["enlace"] == {"para": "/huella-positiva", "rotulo": ENLACES_PT["/huella-positiva"]}


def test_fortalezas_em_portugues():
    assert gerar_fortalezas({"q_amb_04": 4}, idioma="pt")[0]["parametro"] == "Consumo de água"
