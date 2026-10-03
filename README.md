# project3-2026b-guigalmesh-guisdapi

## Sobre o projeto
Para tecnologias, pensamos em utilizar Vue com Tailwind CSS e Chart.js no front-end, Python (FastAPI) no back-end para processar as regras de negócio, cálculos do diagnóstico e priorização das recomendações, e Supabase para gerenciar a autenticação segura de usuários e a persistência dos dados em banco PostgreSQL.  
A ideia é desenvolver uma aplicação web voltada a auxiliar pequenas e médias empresas na gestão de sustentabilidade. A plataforma permite o cadastro da organização, aplica um questionário diagnóstico, calcula automaticamente os níveis de maturidade e gera recomendações práticas, permitindo que a empresa estruture e acompanhe seu próprio plano de ação e evolução em um dashboard interativo.

## Diário de evolução

| Data | Nome | O que foi feito | Próximos passos |
|---|---|---|---|
| 03/10 | Guilherme D. | Configuração inicial do front-end com Vue <br> Configuração back-end com FastAPI | Configuração Supabase |
|  |  |  |  |

## Como rodar o projeto

### Back-end (FastAPI)
```bash
cd backend

# Criar e ativar o ambiente virtual
python -m venv .venv
.venv\Scripts\activate

# Instalar as dependências
pip install -r requirements.txt

# Configurar as variáveis de ambiente
cp .env.example .env            # Windows: copy .env.example .env
# Edite o arquivo .env e preencha SUPABASE_URL e SUPABASE_KEY

# Iniciar o servidor
uvicorn app.main:app --reload
```
- API: http://localhost:8000
- Documentação interativa: http://localhost:8000/docs
- Teste rápido: http://localhost:8000/health

### Front-end (Vue + Vite)
```bash
cd frontend

# Instalar as dependências
npm install

# Configurar as variáveis de ambiente
cp .env.example .env            # Windows: copy .env.example .env
# Edite o arquivo .env e preencha VITE_SUPABASE_URL e VITE_SUPABASE_ANON_KEY

# Iniciar o servidor de desenvolvimento
npm run dev
```
- Aplicação: http://localhost:5173
