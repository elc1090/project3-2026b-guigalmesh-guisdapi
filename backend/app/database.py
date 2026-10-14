import os
from dotenv import load_dotenv
from supabase import Client, create_client

load_dotenv()

def get_supabase() -> Client:
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])

def get_supabase_for_user(token: str) -> Client:
    """Cliente cujas consultas ao banco levam o token do usuário,
    então o RLS é aplicado de verdade."""
    client = get_supabase()
    client.postgrest.auth(token)
    return client