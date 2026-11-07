import os

import httpx
from dotenv import load_dotenv
from postgrest import SyncPostgrestClient
from supabase import Client, create_client

load_dotenv()

_URL = os.environ["SUPABASE_URL"].rstrip("/")
_KEY = os.environ["SUPABASE_KEY"]
_REST_URL = f"{_URL}/rest/v1"

_supabase_global: Client = create_client(_URL, _KEY)

# Um único cliente HTTP para todas as consultas ao banco: as conexões (e o handshake TLS)
# são reaproveitadas entre requisições. Antes, cada requisição criava um cliente Supabase
# completo e abria conexões novas. O httpx.Client pode ser usado por várias threads.
_http = httpx.Client(timeout=httpx.Timeout(10.0, connect=5.0), follow_redirects=True)


def get_supabase() -> Client:
    return _supabase_global


def get_supabase_for_user(token: str) -> SyncPostgrestClient:
    """Cliente do banco (PostgREST) com o token do usuário, para o RLS valer.

    É leve de criar: só guarda os cabeçalhos desta requisição. O token vai nos cabeçalhos
    deste objeto (não no httpx.Client compartilhado), então não vaza entre usuários.
    Tem a mesma API usada nas rotas: .table(...).select(...).execute().
    """
    return SyncPostgrestClient(
        _REST_URL,
        headers={"apikey": _KEY, "Authorization": f"Bearer {token}"},
        http_client=_http,
    )
