"""Motor de recomendações por pergunta.

Cada pergunta do diagnóstico tem duas recomendações no catálogo:
- "Empieza": para quem respondeu 1 ou 2 (ainda não faz, ou faz pouco);
- "Avanza": para quem respondeu 3 (já faz, mas pode melhorar).
Quem respondeu 4 não recebe recomendação: a pergunta entra em "fortalezas".

Personalização:
- prioridade pela resposta (1 = Alta, 2 = Media, 3 = Baja);
- setor da empresa: em alguns temas a prioridade sobe um nível (ex.: Ley REP no Comercio);
- porte: algumas recomendações têm um texto mais simples para microempresas.

Funções puras, sem acesso a banco, para serem testadas com pytest.
"""

ETAPA_EMPIEZA = "Empieza"
ETAPA_AVANZA = "Avanza"

PRIORIDADE_POR_VALOR = {1: "Alta", 2: "Media", 3: "Baja"}
ORDEM_PRIORIDADE = {"Alta": 0, "Media": 1, "Baja": 2}
SOBE_PRIORIDADE = {"Baja": "Media", "Media": "Alta", "Alta": "Alta"}

# Links para os temas da Educación sostenible (front: constants/educacion.js) e para a seção
# Huella positiva. O front só mostra o link se a rota existir.
APRENDE_HUELLA = {"para": "/educacion/huella-de-carbono", "rotulo": "Aprende sobre la huella de carbono"}
APRENDE_REP = {"para": "/educacion/ley-rep", "rotulo": "Aprende sobre la Ley REP"}
APRENDE_ECOSISTEMAS = {"para": "/educacion/ecosistemas", "rotulo": "Aprende sobre los ecosistemas"}
APRENDE_VERDES = {"para": "/educacion/empresas-verdes", "rotulo": "Ideas de empresas verdes"}
APRENDE_CERTIFICACIONES = {"para": "/educacion/empresas-b-y-certificaciones", "rotulo": "Conoce las Empresas B y certificaciones"}
APRENDE_COMPETITIVIDAD = {"para": "/educacion/competitividad", "rotulo": "Sostenibilidad y competitividad"}
HUELLA_POSITIVA = {"para": "/huella-positiva", "rotulo": "Ir a Empresas que dejan huella positiva"}

# Chave: id da pergunta (tabela perguntas). "ods": números dos ODS da Agenda 2030.
CATALOGO_PADRAO = {
    # ------------------------------------------------------------------ Ambiental
    "q_amb_01": {
        "categoria": "Ambiental",
        "parametro": "Emisiones de gases de efecto invernadero",
        "ods": [13],
        "indicador": "Emisiones estimadas (t CO₂e) por año",
        "enlace": APRENDE_HUELLA,
        "empieza": {
            "titulo": "Identifica tus fuentes de emisiones",
            "descricao": "Haz una lista de las actividades que usan electricidad, combustibles o transporte y anota cada mes cuánto consumes según tus boletas.",
        },
        "avanza": {
            "titulo": "Mide tu huella de carbono",
            "descricao": "Estima tus emisiones una vez al año con una herramienta oficial, como el programa HuellaChile del Ministerio del Medio Ambiente, y fija una meta de reducción.",
        },
    },
    "q_amb_02": {
        "categoria": "Ambiental",
        "parametro": "Emisiones del transporte",
        "ods": [11, 13],
        "indicador": "Litros de combustible o km recorridos por mes",
        "empieza": {
            "titulo": "Reduce los desplazamientos innecesarios",
            "descricao": "Agrupa entregas y compras, planifica rutas y reemplaza reuniones presenciales por virtuales cuando sea posible.",
        },
        "avanza": {
            "titulo": "Transporte de menor impacto",
            "descricao": "Evalúa vehículos más eficientes o eléctricos e incentiva a tus trabajadores a usar bicicleta o transporte público.",
        },
    },
    "q_amb_03": {
        "categoria": "Ambiental",
        "parametro": "Consumo de energía",
        "ods": [7, 13],
        "indicador": "kWh por mes y % de reducción",
        "empieza": {
            "titulo": "Controla tu consumo eléctrico",
            "descricao": "Registra cada mes los kWh de la boleta, apaga luces y equipos que no se usan y cambia a iluminación LED.",
        },
        "avanza": {
            "titulo": "Eficiencia y energías renovables",
            "descricao": "Define una meta de ahorro anual, prefiere equipos eficientes al renovarlos y evalúa paneles solares u otras fuentes renovables.",
        },
    },
    "q_amb_04": {
        "categoria": "Ambiental",
        "parametro": "Consumo de agua",
        "ods": [6],
        "indicador": "m³ por mes y % de reducción",
        "empieza": {
            "titulo": "Controla tu consumo de agua",
            "descricao": "Registra los m³ de cada boleta, revisa y repara filtraciones e instala dispositivos ahorradores en llaves y baños.",
        },
        "avanza": {
            "titulo": "Uso eficiente y reutilización del agua",
            "descricao": "Fija metas de ahorro, programa mantenciones preventivas y evalúa reutilizar agua en riego o limpieza.",
        },
    },
    "q_amb_05": {
        "categoria": "Ambiental",
        "parametro": "Generación de residuos",
        "ods": [12],
        "indicador": "Kg reciclados / kg totales de residuos",
        "enlace": APRENDE_REP,
        "empieza": {
            "titulo": "Separa tus residuos",
            "descricao": "Habilita contenedores para papel y cartón, plásticos, vidrio y orgánicos, e identifica un punto limpio o reciclador cercano.",
        },
        "avanza": {
            "titulo": "Reduce y registra tus residuos",
            "descricao": "Lleva un registro de los kilos que generas y reciclas, entrégalos a gestores autorizados y reduce los envases desde tus compras.",
        },
    },
    "q_amb_06": {
        "categoria": "Ambiental",
        "parametro": "Ley REP",
        "ods": [12],
        "indicador": "Revisión de aplicabilidad de la Ley REP realizada",
        "enlace": APRENDE_REP,
        "setores_prioritarios": ["Comercio", "Manufactura"],
        "empieza": {
            "titulo": "Conoce la Ley REP",
            "descricao": "Infórmate sobre la Ley 20.920 y verifica si vendes, fabricas o importas productos prioritarios, como envases y embalajes.",
        },
        "avanza": {
            "titulo": "Revisa si la Ley REP te aplica",
            "descricao": "Confirma si tu empresa es considerada «productor» según la ley y, si corresponde, infórmate de tus obligaciones ante el Ministerio del Medio Ambiente.",
        },
    },
    "q_amb_07": {
        "categoria": "Ambiental",
        "parametro": "Uso de materiales sostenibles",
        "ods": [12],
        "indicador": "% de compras con criterios sostenibles",
        "enlace": APRENDE_VERDES,
        "empieza": {
            "titulo": "Prefiere materiales de menor impacto",
            "descricao": "Identifica los 3 insumos que más compras y busca alternativas recicladas, reutilizables o biodegradables.",
        },
        "avanza": {
            "titulo": "Criterios de compra sostenible",
            "descricao": "Define criterios ambientales para elegir proveedores e insumos y compártelos con tu equipo.",
        },
    },
    "q_amb_08": {
        "categoria": "Ambiental",
        "parametro": "Impacto en la biodiversidad",
        "ods": [14, 15],
        "indicador": "Actividades ambientales realizadas por año",
        "setores_prioritarios": ["Agricultura", "Turismo", "Construcción"],
        "empieza": {
            "titulo": "Conoce tu entorno natural",
            "descricao": "Identifica los ecosistemas cercanos a tu empresa (ríos, humedales, bosques, costa) y cómo tus actividades podrían afectarlos.",
            "enlace": APRENDE_ECOSISTEMAS,
        },
        "avanza": {
            "titulo": "Deja una huella positiva",
            "descricao": "Organiza con tus trabajadores una jornada de limpieza o una plantación de especies nativas y regístrala en la plataforma.",
            "enlace": HUELLA_POSITIVA,
        },
    },
    # ------------------------------------------------------------------ Social
    "q_soc_01": {
        "categoria": "Social",
        "parametro": "Prácticas laborales seguras",
        "ods": [3, 8],
        "indicador": "Accidentes laborales por año",
        "empieza": {
            "titulo": "Identifica los riesgos de tu trabajo",
            "descricao": "Recorre el lugar de trabajo con tu equipo, anota los riesgos y aplica medidas simples (orden, señalética, elementos de protección). Pide apoyo a tu mutualidad.",
        },
        "avanza": {
            "titulo": "Formaliza la prevención de riesgos",
            "descricao": "Documenta los procedimientos de seguridad, capacita al equipo y revisa los riesgos al menos una vez al año.",
        },
    },
    "q_soc_02": {
        "categoria": "Social",
        "parametro": "Prácticas laborales justas y bienestar",
        "ods": [3, 8],
        "indicador": "% de trabajadores que conocen el protocolo",
        "empieza": {
            "titulo": "Crea un protocolo contra el acoso",
            "descricao": "Define cómo se reciben y abordan las denuncias de forma confidencial, revisando lo que exige la normativa laboral vigente.",
        },
        "avanza": {
            "titulo": "Difunde el protocolo y suma bienestar",
            "descricao": "Da a conocer el protocolo a todos y agrega acciones de bienestar: pausas activas, flexibilidad horaria y reconocimiento.",
        },
    },
    "q_soc_03": {
        "categoria": "Social",
        "parametro": "Derechos laborales",
        "ods": [8],
        "indicador": "% de trabajadores con contrato y cotizaciones al día",
        "empieza": {
            "titulo": "Pon al día tus obligaciones laborales",
            "descricao": "Verifica que todos tengan contrato escrito, cotizaciones pagadas y jornada y descansos según la ley. Puedes consultar en la Dirección del Trabajo.",
        },
        "avanza": {
            "titulo": "Revisión laboral periódica",
            "descricao": "Define una revisión mensual de cotizaciones, vacaciones y horas extra.",
        },
    },
    "q_soc_04": {
        "categoria": "Social",
        "parametro": "Diversidad e inclusión",
        "ods": [5, 10],
        "indicador": "Brecha salarial en cargos similares",
        "empieza": {
            "titulo": "Igualdad de oportunidades",
            "descricao": "Usa los mismos criterios para todos al contratar y pagar, y revisa que tus avisos de empleo no excluyan por género, edad u origen.",
        },
        "avanza": {
            "titulo": "Política de inclusión",
            "descricao": "Escribe y comunica tus criterios de igualdad y revisa las diferencias salariales entre hombres y mujeres en cargos similares.",
        },
    },
    "q_soc_05": {
        "categoria": "Social",
        "parametro": "Relaciones con las comunidades locales",
        "ods": [11],
        "indicador": "% de compras a proveedores locales",
        "empieza": {
            "titulo": "Acércate a tu comunidad",
            "descricao": "Conversa con tus vecinos sobre los efectos de tu actividad (ruido, tránsito, residuos) y prefiere proveedores locales.",
        },
        "avanza": {
            "titulo": "Relación permanente con la comunidad",
            "descricao": "Habilita un canal de contacto con la comunidad y considera su opinión antes de realizar cambios importantes.",
        },
    },
    "q_soc_06": {
        "categoria": "Social",
        "parametro": "Desarrollo comunitario",
        "ods": [11, 17],
        "indicador": "Horas de voluntariado por año",
        "enlace": HUELLA_POSITIVA,
        "empieza": {
            "titulo": "Participa en una iniciativa local",
            "descricao": "Elige una causa cercana (junta de vecinos, escuela, organización social) y apóyala con tiempo, productos o conocimientos.",
        },
        "avanza": {
            "titulo": "Planifica tu aporte a la comunidad",
            "descricao": "Arma un calendario anual de voluntariado o alianzas y registra cada actividad realizada.",
        },
    },
    "q_soc_07": {
        "categoria": "Social",
        "parametro": "Educación y capacitación",
        "ods": [4, 8],
        "indicador": "Horas de capacitación por trabajador al año",
        "empieza": {
            "titulo": "Capacita a tu equipo",
            "descricao": "Identifica las habilidades que más necesita tu equipo y aprovecha cursos gratuitos o la franquicia tributaria SENCE.",
        },
        "avanza": {
            "titulo": "Plan anual de capacitación",
            "descricao": "Define temas, responsables y fechas de capacitación para el año, e incluye temas de sostenibilidad.",
            "descricao_micro": "Programa al menos una capacitación breve por trimestre e incluye temas de sostenibilidad.",
        },
    },
    # ------------------------------------------------------------------ Económica
    "q_eco_01": {
        "categoria": "Económica",
        "parametro": "Rentabilidad financiera",
        "ods": [8],
        "indicador": "Margen mensual",
        "empieza": {
            "titulo": "Conoce tu rentabilidad",
            "descricao": "Calcula cada mes tus ingresos, costos y margen para saber si el negocio es sostenible en el tiempo.",
        },
        "avanza": {
            "titulo": "Mide el retorno de lo sostenible",
            "descricao": "Registra lo que ahorras en energía, agua o materiales gracias a tus iniciativas sostenibles y compáralo con lo que invertiste.",
        },
    },
    "q_eco_02": {
        "categoria": "Económica",
        "parametro": "Gestión eficiente de los recursos económicos",
        "ods": [8, 12],
        "indicador": "% de desviación respecto del presupuesto",
        "empieza": {
            "titulo": "Registra tus gastos",
            "descricao": "Anota todos tus gastos, sepáralos en fijos y variables e identifica tres que puedas reducir.",
        },
        "avanza": {
            "titulo": "Presupuesto mensual",
            "descricao": "Compara cada mes lo presupuestado con lo real y corrige las desviaciones.",
        },
    },
    "q_eco_03": {
        "categoria": "Económica",
        "parametro": "Inversión en innovación y tecnología",
        "ods": [9],
        "indicador": "Mejoras de procesos implementadas por año",
        "enlace": APRENDE_COMPETITIVIDAD,
        "empieza": {
            "titulo": "Detecta oportunidades de mejora",
            "descricao": "Identifica un proceso que consuma mucho tiempo, energía o materiales y busca una solución simple, como digitalizar boletas o controlar el inventario.",
        },
        "avanza": {
            "titulo": "Plan de inversión en eficiencia",
            "descricao": "Evalúa el costo-beneficio de nuevas tecnologías y revisa programas públicos de apoyo, como los de CORFO o Sercotec.",
        },
    },
    "q_eco_04": {
        "categoria": "Económica",
        "parametro": "Creación de valor compartido",
        "ods": [8, 17],
        "indicador": "Iniciativas de valor compartido activas",
        "enlace": APRENDE_CERTIFICACIONES,
        "empieza": {
            "titulo": "Busca beneficios para todos",
            "descricao": "Crea una iniciativa que ayude al negocio y a otros: comprar a proveedores locales, descuentos por devolver envases o beneficios para trabajadores.",
        },
        "avanza": {
            "titulo": "Valor compartido en tu estrategia",
            "descricao": "Define metas para tus iniciativas de valor compartido y comunica sus resultados a clientes y proveedores.",
        },
    },
    "q_eco_05": {
        "categoria": "Económica",
        "parametro": "Transparencia financiera",
        "ods": [16],
        "indicador": "Registros financieros al día cada mes",
        "empieza": {
            "titulo": "Ordena tus registros financieros",
            "descricao": "Mantén boletas, facturas y movimientos al día y separa las cuentas personales de las de la empresa.",
        },
        "avanza": {
            "titulo": "Comunica tus resultados",
            "descricao": "Prepara un informe periódico simple de resultados para socios o trabajadores.",
            "descricao_micro": "Revisa tus números una vez al mes con tu contador y comparte lo principal con tu equipo.",
        },
    },
    "q_eco_06": {
        "categoria": "Económica",
        "parametro": "Ética y gobernanza empresarial",
        "ods": [16],
        "indicador": "% de trabajadores que conocen las reglas de la empresa",
        "empieza": {
            "titulo": "Define reglas claras",
            "descricao": "Escribe en una página cómo se toman las decisiones importantes y qué hacer ante un conflicto de interés.",
        },
        "avanza": {
            "titulo": "Código de ética",
            "descricao": "Formaliza tus reglas en un código de ética, compártelo con todos y revísalo una vez al año.",
            "descricao_micro": "Tu página de reglas ya es un buen comienzo: compártela con todo el equipo y revísala una vez al año.",
        },
    },
    "q_eco_07": {
        "categoria": "Económica",
        "parametro": "Cumplimiento normativo y reclamos",
        "ods": [16],
        "indicador": "% de reclamos resueltos dentro del plazo",
        "empieza": {
            "titulo": "Pon al día tus obligaciones legales",
            "descricao": "Haz una lista de los permisos, patentes, impuestos y normas que te aplican, con sus fechas de vencimiento.",
        },
        "avanza": {
            "titulo": "Canal de reclamos",
            "descricao": "Habilita un correo o formulario para reclamos, responde dentro de un plazo definido y registra cómo se resolvió cada caso.",
        },
    },
}


def _prioridade(valor: int, item: dict, empresa: dict | None) -> str:
    prioridade = PRIORIDADE_POR_VALOR[valor]
    setor = (empresa or {}).get("setor")
    if setor and setor in item.get("setores_prioritarios", []):
        prioridade = SOBE_PRIORIDADE[prioridade]
    return prioridade


def gerar_recomendacoes(
    respostas: dict[str, int],
    empresa: dict | None = None,
    resultado: dict | None = None,
    catalogo: dict | None = None,
) -> list[dict]:
    """respostas: {id_da_pergunta: valor 1-4}; empresa: {"setor", "porte"} (opcional);
    resultado: dict de calcular_diagnostico(), usado para desempatar pela dimensão de menor nota.

    Ordem: prioridade (Alta > Media > Baja), depois a dimensão de menor nota,
    depois a ordem do catálogo.
    """
    itens = catalogo if catalogo is not None else CATALOGO_PADRAO
    dimensoes = (resultado or {}).get("dimensoes", {})
    micro = (empresa or {}).get("porte") == "micro"

    geradas = []
    for posicao, (pergunta_id, item) in enumerate(itens.items()):
        valor = respostas.get(pergunta_id)
        if valor not in PRIORIDADE_POR_VALOR:  # 4 (fortaleza) ou sem resposta
            continue

        etapa = ETAPA_EMPIEZA if valor <= 2 else ETAPA_AVANZA
        texto = item["empieza"] if etapa == ETAPA_EMPIEZA else item["avanza"]
        descricao = texto.get("descricao_micro") if micro else None
        dimensao = dimensoes.get(item["categoria"], {})

        geradas.append({
            "id": f"rec_{pergunta_id}_{etapa.lower()}",
            "pergunta_id": pergunta_id,
            "categoria": item["categoria"],
            "parametro": item["parametro"],
            "etapa": etapa,
            "titulo": texto["titulo"],
            "descricao": descricao or texto["descricao"],
            "indicador_sugerido": item.get("indicador", ""),
            "ods": item.get("ods", []),
            "enlace": texto.get("enlace") or item.get("enlace"),
            "prioridade": _prioridade(valor, item, empresa),
            "pontuacao_dimensao": dimensao.get("pontuacao"),
            "nivel_dimensao": dimensao.get("nivel"),
            "_posicao": posicao,
        })

    geradas.sort(key=lambda r: (
        ORDEM_PRIORIDADE[r["prioridade"]],
        r["pontuacao_dimensao"] if r["pontuacao_dimensao"] is not None else 0,
        r["_posicao"],
    ))
    for r in geradas:
        del r["_posicao"]
    return geradas


def gerar_fortalezas(respostas: dict[str, int], catalogo: dict | None = None) -> list[dict]:
    """Perguntas respondidas com 4: o que a empresa já faz bem."""
    itens = catalogo if catalogo is not None else CATALOGO_PADRAO
    return [
        {
            "pergunta_id": pergunta_id,
            "categoria": item["categoria"],
            "parametro": item["parametro"],
            "ods": item.get("ods", []),
        }
        for pergunta_id, item in itens.items()
        if respostas.get(pergunta_id) == 4
    ]
