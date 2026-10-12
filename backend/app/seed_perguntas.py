import json
import os
from dotenv import load_dotenv
from supabase import create_client, Client
from database import get_supabase

supabase = get_supabase()

def popular_base_dados():
    nome_ficheiro = 'perguntas.json'
    nome_tabela = 'perguntas'

    if not os.path.exists(nome_ficheiro):
        print(f"Erro: O ficheiro '{nome_ficheiro}' não foi encontrado na pasta.")
        return

    try:
        with open(nome_ficheiro, 'r', encoding='utf-8') as ficheiro:
            perguntas = json.load(ficheiro)

        print("Excluindo perguntas anteriores")

        supabase.table(nome_tabela).delete().neq("id", "0").execute()
        print(f"A preparar para inserir {len(perguntas)} perguntas...")

        resposta = supabase.table(nome_tabela).insert(perguntas).execute()

        print(f"Sucesso! {len(resposta.data)} registos foram inseridos na base de dados.")

    except Exception as erro:
        print(f"Ocorreu um erro durante a inserção: {erro}")

if __name__ == "__main__":
    popular_base_dados()
