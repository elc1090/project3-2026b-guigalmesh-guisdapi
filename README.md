# project3-2026b-guigalmesh-guisdapi

## Sobre o projeto
Para tecnologias, pensamos em utilizar Vue com Tailwind CSS e Chart.js no front-end, Python (FastAPI) no back-end para processar as regras de negócio, cálculos do diagnóstico e priorização das recomendações, e Supabase para gerenciar a autenticação segura de usuários e a persistência dos dados em banco PostgreSQL.  
A ideia é desenvolver uma aplicação web voltada a auxiliar pequenas e médias empresas na gestão de sustentabilidade. A plataforma permite o cadastro da organização, aplica um questionário diagnóstico, calcula automaticamente os níveis de maturidade e gera recomendações práticas, permitindo que a empresa estruture e acompanhe seu próprio plano de ação e evolução em um dashboard interativo.

## Diário de evolução

| Data | Nome | O que foi feito | Próximos passos |
|---|---|---|---|
| 03/10 | Guilherme D. | Configuração inicial do front-end com Vue <br> Configuração back-end com FastAPI | Configuração Supabase |
| 05/10 | Guilherme D. | Configuração Supabase <br> Criação do DiagnosticoTeste.vue para testar o front, e ajuste nas rotas no main.py no back para conectar com o front. <br> Configuração do Vue Router em src/router/index.js | Conectar o back com o Supabase |
|  |  |  |  |

## Roadmap

- [ ] Preparar o ambiente de trabalho: repositório clonado, front-end com Vue e Tailwind, back-end com FastAPI e rota de teste `/health`, projeto criado no Supabase e variáveis de ambiente configuradas. A etapa termina quando os dois integrantes conseguem rodar front e back localmente e trocar commits sem erro.
- [ ] Construir o menor fluxo possível ponta a ponta: o usuário responde duas perguntas no front, a API recebe as respostas, calcula uma pontuação, salva no Supabase e devolve o resultado para a tela. O objetivo é provar que Vue, FastAPI e Supabase se comunicam, mesmo com visual simples.
- [ ] Implementar cadastro, login e logout com o Supabase Auth, proteger as rotas do front e validar o token no back-end. Em seguida, criar o cadastro da empresa (nome, setor, porte e número de funcionários), vinculado ao usuário logado.
- [ ] Cadastrar no banco as 10 perguntas do diagnóstico (duas por dimensão: Ambiental, Social, Econômica, Governança e Comunidade) com quatro opções de resposta. Criar a tela do questionário e o serviço de cálculo que transforma as respostas em uma nota por dimensão e um nível de maturidade, com testes automatizados.
- [ ] Exibir o resultado do diagnóstico com gráfico radar e barras por dimensão. Criar as regras que associam dimensões com nota baixa a recomendações do catálogo, ordenadas por prioridade, e a tela com as ações sugeridas para a empresa.
- [ ] Permitir que o usuário adicione uma recomendação ao plano de ação e a transforme em uma ação concreta, com responsável, prazo, indicador e status. Incluir o registro de progresso de cada ação, com histórico.
- [ ] Montar o painel de acompanhamento com métricas (ações no plano, concluídas, progresso médio) e a tela inicial com o resumo e o fluxo da empresa. Ao final desta etapa, o MVP está completo e navegável do início ao fim.
- [ ] Revisar a aplicação: corrigir bugs, tratar erros e estados vazios, ajustar o visual para celular, revisar as regras de segurança do banco (RLS) e testar o fluxo completo com um usuário novo. Publicar o front-end e o back-end e confirmar que funcionam online.

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
