import os
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

_URL = os.environ["SUPABASE_URL"]
_KEY = os.environ["SUPABASE_KEY"]

_supabase_global: Client = create_client(_URL, _KEY)

def get_supabase() -> Client:
    return _supabase_global

def get_supabase_for_user(token: str) -> Client:
    """Cria cliente autenticado com o token do usuário para respeitar o RLS."""
    client = create_client(_URL, _KEY)
    client.postgrest.auth(token)
    return client