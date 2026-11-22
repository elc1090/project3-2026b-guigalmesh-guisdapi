"""Histórico de diagnósticos concluídos: a nota de cada um, para o gráfico de evolução.

Função pura, sem acesso a banco, para poder ser testada com pytest.
"""
from app.services.calculo import RespostasInvalidas, calcular_diagnostico


def data_conclusao(diagnostico: dict) -> str | None:
    """concluido_em só existe a partir de 22/11/2026; antes disso usa a data do rascunho."""
    return diagnostico.get("concluido_em") or diagnostico.get("created_at")


def montar_historico(perguntas: list[dict], diagnosticos: list[dict]) -> list[dict]:
    """diagnosticos: linhas concluídas da tabela diagnostico (respostas, concluido_em, created_at).

    Devolve [{"data", "geral", "dimensoes": {nome: pontuacao}}] do mais antigo para o mais novo.
    Diagnósticos que não batem com as perguntas atuais (questionário antigo) ficam de fora.
    """
    historico = []
    for diagnostico in diagnosticos:
        data = data_conclusao(diagnostico)
        if not data or not diagnostico.get("respostas"):
            continue
        try:
            resultado = calcular_diagnostico(perguntas, diagnostico["respostas"])
        except RespostasInvalidas:
            continue
        historico.append({
            "data": data,
            "geral": resultado["geral"]["pontuacao"],
            "dimensoes": {nome: d["pontuacao"] for nome, d in resultado["dimensoes"].items()},
        })
    historico.sort(key=lambda item: item["data"])
    return historico
