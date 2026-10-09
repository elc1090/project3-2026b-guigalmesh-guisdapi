from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel
from app.database import UserRepository, get_supabase

app = FastAPI()

# CORS (Cross-Origin Resource Sharing) é uma política de segurança que impede que um site faça requisições para outro site em um domínio diferente.
# Por padrão, os navegadores bloqueiam conversas entre portas diferentes por segurança.
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"],  # porta do frontend (Vue) que vai conversar com o backend (FastAPI)
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# o que o FastAPI espera receber do Vue (o mesmo nome das variáveis do Vue)
class Respostas(BaseModel):
    pergunta1: int
    pergunta2: int

# ROTA DE TESTE
class Usuario(BaseModel):
    user_name: str
    user_email: str

@app.post("/api/criarUsuario")
async def criar_usuario(usuario: Usuario):
    supabase = get_supabase()
    dados = usuario.model_dump()

    try:
        supabase.table("users").insert(dados).execute()
        return {"mensagem": "Usuário criado com sucesso"}
    except Exception as e:
         raise HTTPException(status_code=400, detail=f"Erro ao criar o usuário: {str(e)}")


# rota que faz o cálculo
@app.post("/api/diagnostico")
async def calcular_diagnostico(respostas: Respostas):
    # O FastAPI pega as variáveis do Vue, nós somamos os valores
    nota_final = respostas.pergunta1 + respostas.pergunta2

    # O FastAPI retorna um JSON com a nota final e uma mensagem de sucesso
    return {
        "pontuacao": nota_final,
        "mensagem": "Cálculo feito com sucesso no FastAPI!"
    }

@app.get("/health")
async def health_check():
    return {"status": "ok"}
