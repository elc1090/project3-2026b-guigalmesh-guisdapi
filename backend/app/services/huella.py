"""Empresas que dejan huella positiva: resumo do impacto das atividades ambientais da empresa.

Função pura, sem acesso a banco, para poder ser testada com pytest.
"""

# mesmos valores aceitos pela coluna actividades.tipo (check no banco) e pelo front (constants/huella.js)
TIPOS = (
    "limpieza_playa",
    "limpieza_rio",
    "limpieza_bosque",
    "reforestacion",
    "areas_verdes",
    "reciclaje",
    "educacion",
    "voluntariado",
    "otra",
)

ESTADO_PLANIFICADA = "planificada"
ESTADO_REALIZADA = "realizada"


def _numero(valor) -> float:
    try:
        return float(valor or 0)
    except (TypeError, ValueError):
        return 0.0


def resumir_actividades(actividades: list[dict]) -> dict:
    """Totais do impacto. Só as atividades realizadas contam nos resultados;
    as planejadas aparecem apenas na contagem de planejadas."""
    realizadas = [a for a in actividades if a.get("estado") == ESTADO_REALIZADA]
    return {
        "actividades_realizadas": len(realizadas),
        "actividades_planificadas": sum(1 for a in actividades if a.get("estado") == ESTADO_PLANIFICADA),
        "participantes": int(sum(_numero(a.get("participantes")) for a in realizadas)),
        "horas_voluntariado": round(sum(_numero(a.get("horas_voluntariado")) for a in realizadas), 1),
        "kg_residuos": round(sum(_numero(a.get("kg_residuos")) for a in realizadas), 1),
        "arboles_plantados": int(sum(_numero(a.get("arboles_plantados")) for a in realizadas)),
        "espacios_recuperados": sum(1 for a in realizadas if (a.get("espacio_recuperado") or "").strip()),
    }
