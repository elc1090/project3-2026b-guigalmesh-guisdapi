import os
from dotenv import load_dotenv
from supabase import create_client, Client
from fastapi import Depends

def get_supabase() -> Client:
    load_dotenv()
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

class UserRepository:
    def __init__(self, db: Client = Depends(get_supabase)):
        self.db = db

    def criar_usuario(self, dados: dict):
        # CREATE
        return self.db.table("users").insert(dados).execute()

    def buscar_por_id(self, id: int):
        # READ
        return self.db.table("users").select("*").eq("id", id).execute()

    def listar_usuarios(self, limite: int = 10, offset: int = 0):
        # READ
        return self.db.table("users").select("*").range(offset, offset + limite - 1).execute()

    def atualizar_usuario(self, id: int, dados_atualizados: dict):
        # UPDATE
        return self.db.table("users").update(dados_atualizados).eq("id", id).execute()

    def deletar_usuario(self, id: int):
        # DELETE
        return self.db.table("users").delete().eq("id", id).execute()
