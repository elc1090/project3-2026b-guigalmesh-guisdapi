import logging
import os

from fastapi import FastAPI, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import JSONResponse
from app.routes import empresa, diagnostico

log = logging.getLogger(__name__)

app = FastAPI()
app.include_router(empresa.router)
app.include_router(diagnostico.router)


# Erro não tratado vira um 500 em JSON. Este middleware é registrado ANTES do CORS, então fica
# por dentro dele: a resposta de erro também recebe os cabeçalhos de CORS. Sem isso o navegador
# acusa erro de CORS e o front mostra "sin conexión" em vez de um erro do servidor.
@app.middleware("http")
async def erros_inesperados(request: Request, call_next):
    try:
        return await call_next(request)
    except Exception:
        log.exception("Erro não tratado em %s %s", request.method, request.url.path)
        return JSONResponse(status_code=500, content={"detail": "Error interno del servidor"})

# CORS (Cross-Origin Resource Sharing) é uma política de segurança que impede que um site faça requisições para outro site em um domínio diferente.
# Por padrão, os navegadores bloqueiam conversas entre portas diferentes por segurança.
# Origens permitidas vêm de CORS_ORIGINS (separadas por vírgula). Com allow_credentials=True
# a especificação não aceita "*", então é preciso listar as origens explicitamente.
ORIGENS_PADRAO = "http://localhost:5173,https://project3-2026b-guigalmesh-guisdapi.vercel.app"
CORS_ORIGINS = [o.strip() for o in os.getenv("CORS_ORIGINS", ORIGENS_PADRAO).split(",") if o.strip()]

app.add_middleware(
    CORSMiddleware,
    allow_origins=CORS_ORIGINS,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}