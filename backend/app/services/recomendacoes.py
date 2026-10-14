"""Motor de recomendações: associa dimensões com nota baixa (< 75)
a ações práticas do catálogo, ordenadas por prioridade (menor nota primeiro).
Função pura, sem acesso a banco, para ser testada com pytest.
"""

PRIORIDADE_POR_NIVEL = {
    "Inicial": "Alta",
    "Básico": "Media",
    "Intermedio": "Baja",
}

CATALOGO_PADRAO = [
    # Ambiental
    {
        "id": "rec_amb_01",
        "categoria": "Ambiental",
        "nota_maxima": 50.0,
        "ordem": 1,
        "titulo": "Diagnóstico de consumo energético y de recursos",
        "descricao": "Registrar mensualmente el consumo de agua, electricidad y combustibles para identificar las principales fuentes de emisiones y desperdicio.",
        "indicador_sugerido": "% de reducción en el consumo eléctrico/agua semestral",
    },
    {
        "id": "rec_amb_02",
        "categoria": "Ambiental",
        "nota_maxima": 75.0,
        "ordem": 2,
        "titulo": "Criterios ambientales en compras y diseño de productos",
        "descricao": "Evaluar el impacto ambiental de insumos y proveedores antes de lanzar o modificar productos y servicios, comunicando estas prácticas a los clientes.",
        "indicador_sugerido": "% de productos o proveedores evaluados con criterios ambientales",
    },
    # Social
    {
        "id": "rec_soc_01",
        "categoria": "Social",
        "nota_maxima": 50.0,
        "ordem": 1,
        "titulo": "Protocolo de prevención de acoso y bienestar laboral",
        "descricao": "Implementar un procedimiento formal y confidencial para prevenir y gestionar situaciones de acoso laboral, promoviendo un entorno seguro.",
        "indicador_sugerido": "Protocolo documentado y % de trabajadores capacitados",
    },
    {
        "id": "rec_soc_02",
        "categoria": "Social",
        "nota_maxima": 75.0,
        "ordem": 2,
        "titulo": "Programa de conciliación, participación y reconocimiento",
        "descricao": "Establecer medidas de flexibilidad laboral, espacios participativos de mejora continua y mecanismos periódicos de reconocimiento al desempeño.",
        "indicador_sugerido": "Índice de satisfacción laboral interna (encuesta semestral)",
    },
    # Económica
    {
        "id": "rec_eco_01",
        "categoria": "Económica",
        "nota_maxima": 50.0,
        "ordem": 1,
        "titulo": "Plan de continuidad operativa y contingencia financiera",
        "descricao": "Identificar los riesgos críticos de operación y estructurar un fondo o plan de acción para enfrentar períodos de caída de ingresos.",
        "indicador_sugerido": "Matriz de riesgos y plan de contingencia actualizado",
    },
    {
        "id": "rec_eco_02",
        "categoria": "Económica",
        "nota_maxima": 75.0,
        "ordem": 2,
        "titulo": "Planificación económica e innovación de mediano plazo",
        "descricao": "Definir metas económicas a 1-3 años con revisiones trimestrales y desarrollar nuevas soluciones adaptadas a las demandas futuras de los clientes.",
        "indicador_sugerido": "% de cumplimiento de metas trimestrales de ingresos",
    },
    # Gobernanza
    {
        "id": "rec_gob_01",
        "categoria": "Gobernanza",
        "nota_maxima": 50.0,
        "ordem": 1,
        "titulo": "Canal de reclamos y registro formal de decisiones",
        "descricao": "Documentar las decisiones clave de la empresa e implementar un canal accesible para recibir y resolver reclamos o denuncias con trazabilidad.",
        "indicador_sugerido": "% de reclamos resueltos dentro del plazo establecido",
    },
    {
        "id": "rec_gob_02",
        "categoria": "Gobernanza",
        "nota_maxima": 75.0,
        "ordem": 2,
        "titulo": "Prevención de conflictos de interés y evaluación directiva",
        "descricao": "Establecer reglas claras para evitar conflictos de interés en la toma de decisiones y revisar periódicamente el desempeño estratégico.",
        "indicador_sugerido": "Revisión estratégica y evaluación directiva realizada anualmente",
    },
]


def gerar_recomendacoes(resultado: dict, catalogo: list[dict] | None = None) -> list[dict]:
    """Recebe o dicionário retornado por calcular_diagnostico() e devolve a lista
    de recomendações aplicáveis ordenada pelas dimensões de menor nota.
    """
    itens_catalogo = catalogo if catalogo is not None else CATALOGO_PADRAO
    dimensoes = resultado.get("dimensoes", {})

    recomendacoes_geradas = []

    for categoria, dados in dimensoes.items():
        pontuacao = dados["pontuacao"]
        nivel = dados["nivel"]

        # Dimensões no nível "Avanzado" (>= 75) não precisam de recomendações corretivas
        if nivel == "Avanzado" or pontuacao >= 75.0:
            continue

        prioridade = PRIORIDADE_POR_NIVEL.get(nivel, "Baja")

        for item in itens_catalogo:
            if item["categoria"] != categoria:
                continue
            # Inclui a ação se a pontuação da dimensão estiver abaixo da nota_maxima da recomendação
            if pontuacao < item.get("nota_maxima", 75.0):
                recomendacoes_geradas.append({
                    "id": item["id"],
                    "categoria": categoria,
                    "titulo": item["titulo"],
                    "descricao": item["descricao"],
                    "indicador_sugerido": item.get("indicador_sugerido", ""),
                    "pontuacao_dimensao": pontuacao,
                    "nivel_dimensao": nivel,
                    "prioridade": prioridade,
                    "ordem": item.get("ordem", 1),
                })

    # Ordena: 1º menor pontuação da dimensão, 2º ordem do item no catálogo, 3º nome da categoria
    recomendacoes_geradas.sort(
        key=lambda r: (r["pontuacao_dimensao"], r["ordem"], r["categoria"])
    )

    return recomendacoes_geradas