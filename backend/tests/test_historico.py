from app.services.historico import data_conclusao, montar_historico

PERGUNTAS = [
    {"id": "a1", "categoria": "Ambiental", "peso": 1},
    {"id": "s1", "categoria": "Social", "peso": 1},
]


def test_usa_concluido_em_e_cai_para_created_at():
    assert data_conclusao({"concluido_em": "2026-11-22", "created_at": "2026-11-01"}) == "2026-11-22"
    assert data_conclusao({"concluido_em": None, "created_at": "2026-11-01"}) == "2026-11-01"


def test_ordena_do_mais_antigo_para_o_mais_novo():
    diagnosticos = [
        {"concluido_em": "2026-11-22T10:00:00+00:00", "respostas": {"a1": 4, "s1": 4}},
        {"concluido_em": "2026-10-01T10:00:00+00:00", "respostas": {"a1": 1, "s1": 1}},
    ]
    historico = montar_historico(PERGUNTAS, diagnosticos)
    assert [h["geral"] for h in historico] == [0.0, 100.0]
    assert historico[0]["dimensoes"] == {"Ambiental": 0.0, "Social": 0.0}


def test_ignora_questionario_antigo_e_linhas_sem_respostas():
    diagnosticos = [
        {"concluido_em": "2026-10-01", "respostas": {"q_gob_01": 4}},  # pergunta que não existe mais
        {"concluido_em": "2026-10-02", "respostas": None},
        {"concluido_em": "2026-10-03", "respostas": {"a1": 2, "s1": 3}},
    ]
    historico = montar_historico(PERGUNTAS, diagnosticos)
    assert [h["data"] for h in historico] == ["2026-10-03"]


def test_sem_diagnosticos():
    assert montar_historico(PERGUNTAS, []) == []
