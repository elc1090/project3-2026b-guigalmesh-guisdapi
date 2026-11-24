"""Idioma da resposta: o front envia o idioma escolhido no cabeçalho Accept-Language ("es" ou "pt").

As mensagens de erro continuam escritas em espanhol nas rotas; o handler de HTTPException
(app/main.py) troca pela versão em português quando o pedido veio em "pt".
"""
from fastapi import Request

IDIOMA_PADRAO = "es"


def idioma_de(accept_language: str | None) -> str:
    return "pt" if (accept_language or "").strip().lower().startswith("pt") else IDIOMA_PADRAO


def idioma(request: Request) -> str:
    """Dependência do FastAPI: idioma do pedido atual."""
    return idioma_de(request.headers.get("accept-language"))


MENSAGENS_PT = {
    "Token inválido o expirado": "Token inválido ou expirado",
    "Error de conexión con la base de datos": "Erro de conexão com o banco de dados",
    "Primero debes registrar tu empresa": "Primeiro você precisa cadastrar sua empresa",
    "Error al consultar preguntas": "Erro ao consultar as perguntas",
    "Error al consultar diagnóstico": "Erro ao consultar o diagnóstico",
    "Error al guardar": "Erro ao salvar",
    "Aún no hay un diagnóstico completado": "Ainda não há um diagnóstico concluído",
    "Error al consultar el historial": "Erro ao consultar o histórico",
    "Error al guardar la actividad": "Erro ao salvar a atividade",
    "Error al consultar las actividades": "Erro ao consultar as atividades",
    "Actividad no encontrada": "Atividade não encontrada",
    "Ya existe una empresa registrada": "Já existe uma empresa cadastrada",
    "Empresa no encontrada": "Empresa não encontrada",
    "Recomendación no encontrada": "Recomendação não encontrada",
    "Error al guardar el estado de la acción": "Erro ao salvar a situação da ação",
    "Error al consultar el análisis": "Erro ao consultar a análise",
    "Alcanzaste el límite de análisis para este diagnóstico.": "Você atingiu o limite de análises para este diagnóstico.",
    "El análisis con IA no está disponible en este momento.": "A análise com IA não está disponível no momento.",
    "La IA tiene mucha demanda en este momento. Espera un par de minutos e inténtalo de nuevo.":
        "A IA está com muita demanda no momento. Aguarde alguns minutos e tente de novo.",
    "La IA no pudo generar el análisis. Inténtalo de nuevo en unos minutos.":
        "A IA não conseguiu gerar a análise. Tente de novo em alguns minutos.",
    "No hay preguntas activas para calcular el diagnóstico": "Não há perguntas ativas para calcular o diagnóstico",
    "Error interno del servidor": "Erro interno do servidor",
}

# mensagens com uma parte variável no fim (ex.: "Faltan respuestas: ['q_amb_01']")
PREFIXOS_PT = {
    "Preguntas desconocidas:": "Perguntas desconhecidas:",
    "Faltan respuestas:": "Faltam respostas:",
    "Valor inválido en ": "Valor inválido em ",
}


def traduzir_mensagem(texto, idioma_pedido: str):
    if idioma_pedido != "pt" or not isinstance(texto, str):
        return texto
    if texto in MENSAGENS_PT:
        return MENSAGENS_PT[texto]
    for prefixo, traducao in PREFIXOS_PT.items():
        if texto.startswith(prefixo):
            return traducao + texto[len(prefixo):].replace("debe ser un entero entre", "deve ser um inteiro entre").replace(" y ", " e ")
    return texto
