import os
from dotenv import load_dotenv
from supabase import create_client, Client


def get_supabase() -> Client:
    load_dotenv()
    return create_client(os.environ["SUPABASE_URL"], os.environ["SUPABASE_KEY"])