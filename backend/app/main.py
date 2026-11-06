import os

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import empresa, diagnostico

app = FastAPI()
app.include_router(empresa.router)
app.include_router(diagnostico.router)

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