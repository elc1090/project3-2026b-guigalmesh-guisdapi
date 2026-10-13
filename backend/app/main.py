from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware
from app.routes import empresa, diagnostico

app = FastAPI()
app.include_router(empresa.router)
app.include_router(diagnostico.router)

# CORS (Cross-Origin Resource Sharing) é uma política de segurança que impede que um site faça requisições para outro site em um domínio diferente.
# Por padrão, os navegadores bloqueiam conversas entre portas diferentes por segurança.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],  # porta do frontend (Vue) que vai conversar com o backend (FastAPI)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/health")
async def health_check():
    return {"status": "ok"}