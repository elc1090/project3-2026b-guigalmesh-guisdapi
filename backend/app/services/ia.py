"""Análise do diagnóstico com IA (Gemini) — "IA como serviço".

O back-end monta um contexto só com os dados do diagnóstico (sem nome de pessoa, e-mail
ou nome da empresa), pede ao Gemini uma análise no idioma da interface (espanhol ou
português) num formato JSON fixo e valida a resposta antes de devolver. Tudo aqui, menos chamar_gemini, é função pura
(testada com pytest).
"""
import json
import logging
import os

from pydantic import BaseModel, Field, ValidationError

log = logging.getLogger(__name__)

# o nome do modelo muda com frequência: fica numa variável de ambiente.
# "gemini-flash-latest" aponta sempre para o modelo Flash mais recente.
MODELO_PADRAO = "gemini-flash-latest"
# se o modelo principal estiver sobrecarregado (503) ou sem cota (429), tenta este,
# mais leve e geralmente mais disponível. Pode ser trocado por GEMINI_MODEL_RESERVA.
MODELO_RESERVA_PADRAO = "gemini-flash-lite-latest"
TEMPO_LIMITE_MS = 45_000
MAX_RECOMENDACOES_NO_CONTEXTO = 10

PORTES = {
    "es": {"micro": "Microempresa", "pequena": "Pequeña empresa", "mediana": "Mediana empresa"},
    "pt": {"micro": "Microempresa", "pequena": "Pequena empresa", "mediana": "Média empresa"},
}

INSTRUCOES_ES = """Eres un asesor de sostenibilidad para pequeñas y medianas empresas (pymes) de Chile.
Recibirás en JSON el resultado de un diagnóstico de sostenibilidad de una empresa
(dimensiones ambiental, social y económica), sus recomendaciones pendientes y sus fortalezas.

Reglas:
- Escribe en español de Chile, con un tono cercano, claro y práctico, para el dueño de una pyme.
- Usa SOLO la información recibida. No inventes datos, cifras, leyes, normas, certificaciones,
  programas, plazos ni costos que no estén en el JSON.
- Si falta información, no supongas que la empresa cumple algo.
- Elige exactamente 3 prioridades entre las recomendaciones pendientes, considerando su prioridad,
  el sector y el tamaño de la empresa. Explica por qué cada una importa para ESTA empresa y propone
  un primer paso concreto que se pueda hacer en una semana, sin grandes inversiones.
- Si no hay recomendaciones pendientes, propone cómo mantener y medir lo que ya se hace bien.
- Sé breve: resumen de 2 a 3 frases; cada campo de las prioridades en 1 o 2 frases."""

INSTRUCOES_PT = """Você é um consultor de sustentabilidade para pequenas e médias empresas (PMEs).
Você receberá em JSON o resultado de um diagnóstico de sustentabilidade de uma empresa
(dimensões ambiental, social e econômica), suas recomendações pendentes e seus pontos fortes.

Regras:
- Escreva em português do Brasil, com um tom próximo, claro e prático, para o dono de uma PME.
- Use SOMENTE as informações recebidas. Não invente dados, números, leis, normas, certificações,
  programas, prazos nem custos que não estejam no JSON.
- Se faltar informação, não suponha que a empresa cumpre algo.
- Escolha exatamente 3 prioridades entre as recomendações pendentes, considerando a prioridade,
  o setor e o porte da empresa. Explique por que cada uma importa para ESTA empresa e proponha
  um primeiro passo concreto que possa ser feito em uma semana, sem grandes investimentos.
- Se não houver recomendações pendentes, proponha como manter e medir o que já é feito bem.
- Seja breve: resumo de 2 a 3 frases; cada campo das prioridades com 1 ou 2 frases.
- Os nomes dos campos do JSON (resumen, prioridades, motivo, primer_paso, fortalezas) continuam
  iguais; só o conteúdo é em português."""

INSTRUCOES = {"es": INSTRUCOES_ES, "pt": INSTRUCOES_PT}
PEDIDO = {
    "es": "Analiza el siguiente diagnóstico de sostenibilidad y responde en el formato JSON indicado.",
    "pt": "Analise o diagnóstico de sustentabilidade a seguir e responda no formato JSON indicado.",
}


class Prioridade(BaseModel):
    titulo: str = Field(description="Nombre corto de la prioridad (máximo 8 palabras)")
    motivo: str = Field(description="Por qué es importante para esta empresa")
    primer_paso: str = Field(description="Primera acción concreta, realizable en una semana")


class AnaliseIA(BaseModel):
    resumen: str = Field(description="Resumen de la situación de la empresa en 2 o 3 frases")
    prioridades: list[Prioridade] = Field(description="Exactamente 3 prioridades")
    fortalezas: str = Field(description="Una o dos frases sobre lo que la empresa ya hace bien")


class IANaoConfigurada(RuntimeError):
    """Falta GEMINI_API_KEY no ambiente."""


class FalhaIA(RuntimeError):
    """A IA não respondeu, demorou demais ou respondeu fora do formato."""


class IASobrecarregada(FalhaIA):
    """Todos os modelos tentados estavam com alta demanda ou sem cota (503/429)."""


def montar_contexto(resultado: dict, empresa: dict | None, idioma: str = "es") -> dict:
    """Dados enviados à IA. De propósito NÃO inclui nome da empresa, e-mail nem nomes de pessoas
    (no plano gratuito do Gemini os dados podem ser usados pelo Google para melhorar os produtos)."""
    empresa = empresa or {}
    pendentes = [r for r in resultado.get("recomendacoes", []) if r.get("status") != "realizada"]
    realizadas = [r for r in resultado.get("recomendacoes", []) if r.get("status") == "realizada"]
    return {
        "empresa": {
            "sector": empresa.get("setor"),
            "tamano": PORTES.get(idioma, PORTES["es"]).get(empresa.get("porte"), empresa.get("porte")),
            "numero_trabajadores": empresa.get("num_funcionarios"),
        },
        "puntuacion_general": resultado.get("geral", {}),
        "dimensiones": resultado.get("dimensoes", {}),
        "recomendaciones_pendientes": [
            {
                "parametro": r.get("parametro"),
                "dimension": r.get("categoria"),
                "etapa": r.get("etapa"),
                "prioridad": r.get("prioridade"),
                "recomendacion": r.get("titulo"),
                "descripcion": r.get("descricao"),
                "ods": r.get("ods", []),
            }
            for r in pendentes[:MAX_RECOMENDACOES_NO_CONTEXTO]
        ],
        "acciones_ya_realizadas": [r.get("parametro") for r in realizadas],
        "fortalezas": [f.get("parametro") for f in resultado.get("fortalezas", [])],
    }


def montar_prompt(contexto: dict, idioma: str = "es") -> str:
    return PEDIDO.get(idioma, PEDIDO["es"]) + "\n\n" + json.dumps(contexto, ensure_ascii=False, indent=2)


def interpretar_resposta(texto: str | None) -> dict:
    """Valida o JSON devolvido pela IA; fica com no máximo 3 prioridades."""
    if not texto:
        raise FalhaIA("Resposta vazia da IA")
    try:
        analise = AnaliseIA.model_validate_json(texto)
    except ValidationError as erro:
        raise FalhaIA("Resposta da IA fora do formato esperado") from erro
    if not analise.resumen.strip() or not analise.prioridades:
        raise FalhaIA("Resposta da IA incompleta")
    dados = analise.model_dump()
    dados["prioridades"] = dados["prioridades"][:3]
    return dados


def modelo_configurado() -> str:
    return os.getenv("GEMINI_MODEL") or MODELO_PADRAO


def modelos_a_tentar() -> list[str]:
    """Modelo principal e, depois, o de reserva (sem repetir)."""
    reserva = os.getenv("GEMINI_MODEL_RESERVA") or MODELO_RESERVA_PADRAO
    return list(dict.fromkeys([modelo_configurado(), reserva]))


def _codigo_http(erro) -> int | None:
    codigo = getattr(erro, "code", None) or getattr(erro, "status_code", None)
    return codigo if isinstance(codigo, int) else None


def _cliente_padrao():
    chave = os.getenv("GEMINI_API_KEY")
    if not chave:
        raise IANaoConfigurada("GEMINI_API_KEY não configurada")
    from google import genai
    from google.genai import types

    return genai.Client(api_key=chave, http_options=types.HttpOptions(timeout=TEMPO_LIMITE_MS))


# erros em que vale tentar outro modelo: sobrecarga/instabilidade (5xx), sem cota (429)
# e modelo inexistente para esta chave (404)
CODIGOS_TENTAR_OUTRO = {404, 429, 500, 502, 503, 504}


def gerar_analise(contexto: dict, cliente=None, idioma: str = "es") -> tuple[dict, str]:
    """Chama o Gemini e devolve (análise validada, modelo usado). Se o modelo principal
    estiver sobrecarregado, tenta o de reserva. "cliente" permite trocar o Gemini por um
    falso nos testes."""
    from google.genai import types

    cliente = cliente or _cliente_padrao()
    config = types.GenerateContentConfig(
        system_instruction=INSTRUCOES.get(idioma, INSTRUCOES_ES),
        response_mime_type="application/json",
        response_schema=AnaliseIA,
        temperature=0.4,
    )
    modelos = modelos_a_tentar()
    sobrecarga = False
    for modelo in modelos:
        try:
            resposta = cliente.models.generate_content(
                model=modelo,
                contents=montar_prompt(contexto, idioma),
                config=config,
            )
        except Exception as erro:  # rede, cota, chave inválida, tempo esgotado…
            codigo = _codigo_http(erro)
            if codigo in CODIGOS_TENTAR_OUTRO:
                sobrecarga = sobrecarga or codigo in {429, 503}
                log.warning("Gemini (%s) respondeu %s; tentando o próximo modelo", modelo, codigo)
                continue
            log.exception("Erro ao chamar o Gemini (%s)", modelo)
            raise FalhaIA("Falha ao chamar a IA") from erro
        return interpretar_resposta(getattr(resposta, "text", None)), modelo

    if sobrecarga:
        raise IASobrecarregada(f"Modelos sobrecarregados: {', '.join(modelos)}")
    raise FalhaIA(f"Nenhum modelo respondeu: {', '.join(modelos)}")
