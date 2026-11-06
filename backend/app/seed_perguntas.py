"""Recria a tabela de perguntas a partir do perguntas.json.

Rodar a partir da pasta backend/:
    python -m app.seed_perguntas
"""
import json
from pathlib import Path

from app.database import get_supabase

ARQUIVO = Path(__file__).parent / "perguntas.json"
TABELA = "perguntas"


def popular_base_dados():
    if not ARQUIVO.exists():
        print(f"Erro: o arquivo '{ARQUIVO}' não foi encontrado.")
        return

    supabase = get_supabase()
    try:
        perguntas = json.loads(ARQUIVO.read_text(encoding="utf-8"))

        print("Excluindo perguntas anteriores...")
        supabase.table(TABELA).delete().neq("id", "0").execute()

        print(f"Inserindo {len(perguntas)} perguntas...")
        resposta = supabase.table(TABELA).insert(perguntas).execute()
        print(f"Sucesso! {len(resposta.data)} registros inseridos.")
    except Exception as erro:
        print(f"Erro durante a inserção: {erro}")


if __name__ == "__main__":
    popular_base_dados()
