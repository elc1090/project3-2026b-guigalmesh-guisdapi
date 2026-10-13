"""Cálculo do diagnóstico: nota por dimensão (0-100) e nível de maturidade.

Função pura, sem acesso a banco, para poder ser testada com pytest.
"""
from collections import defaultdict

VALOR_MIN = 1  # "No"
VALOR_MAX = 4  # "Sistemáticamente"

# (limite superior exclusivo, nível). Faixas sugeridas: alinhar com a turma do Chile.
NIVELES = [
    (25, "Inicial"),
    (50, "Básico"),
    (75, "Intermedio"),
    (101, "Avanzado"),
]


class RespostasInvalidas(ValueError):
    """Respostas que não batem com as perguntas ativas."""


def nivel_de_madurez(porcentagem: float) -> str:
    for limite, nome in NIVELES:
        if porcentagem < limite:
            return nome
    return NIVELES[-1][1]


def validar_respostas(perguntas: list[dict], respostas: dict[str, int], completo: bool = True) -> None:
    """Valida ids e valores. Com completo=False aceita respostas parciais (rascunho)."""
    ids = {p["id"] for p in perguntas}

    desconhecidas = set(respostas) - ids
    if desconhecidas:
        raise RespostasInvalidas(f"Preguntas desconocidas: {sorted(desconhecidas)}")

    for pergunta_id, valor in respostas.items():
        if isinstance(valor, bool) or not isinstance(valor, int) or not VALOR_MIN <= valor <= VALOR_MAX:
            raise RespostasInvalidas(
                f"Valor inválido en {pergunta_id}: debe ser un entero entre {VALOR_MIN} y {VALOR_MAX}"
            )

    if completo:
        faltando = ids - set(respostas)
        if faltando:
            raise RespostasInvalidas(f"Faltan respuestas: {sorted(faltando)}")


def calcular_diagnostico(perguntas: list[dict], respostas: dict[str, int]) -> dict:
    """perguntas: [{"id", "categoria", "peso"}]; respostas: {id_da_pergunta: valor 1-4}.

    Normaliza cada dimensão para 0-100 com (soma - min) / (max - min), porque o
    menor valor possível é 1 e não 0.
    """
    validar_respostas(perguntas, respostas, completo=True)

    acumulado = defaultdict(lambda: {"soma": 0.0, "min": 0.0, "max": 0.0})
    for pergunta in perguntas:
        peso = pergunta.get("peso") or 1
        dimensao = acumulado[pergunta["categoria"]]
        dimensao["soma"] += peso * respostas[pergunta["id"]]
        dimensao["min"] += peso * VALOR_MIN
        dimensao["max"] += peso * VALOR_MAX

    dimensoes = {}
    for categoria, a in acumulado.items():
        porcentagem = (a["soma"] - a["min"]) / (a["max"] - a["min"]) * 100
        dimensoes[categoria] = {
            "pontuacao": round(porcentagem, 1),
            "nivel": nivel_de_madurez(porcentagem),
        }

    media = sum(d["pontuacao"] for d in dimensoes.values()) / len(dimensoes)
    return {
        "dimensoes": dimensoes,
        "geral": {"pontuacao": round(media, 1), "nivel": nivel_de_madurez(media)},
    }