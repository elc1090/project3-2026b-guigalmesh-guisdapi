# Projeto final

![Substitua a imagem ao lado por um GIF/WEBP animado mostrando seu projeto](./moho_follow_through2.gif "GIF animado do projeto. Imagem temporária de Moho Animation https://moho.lostmarble.com/products/moho-pro-special-halls-head-college")

<!-- TODO: trocar a imagem acima por um GIF/WEBP do app (Início → diagnóstico → resultados → educación → huella positiva) -->

## Acesso

https://project3-2026b-guigalmesh-guisdapi.vercel.app/

## Desenvolvedores

Guilherme de Cezaro Martini - Sistemas de Informação  
Guilherme Serafini Dapieve - Sistemas de Informação

## Proposta

Continuar o desenvolvimento do sistema em colaboração com equipe no Chile, incluindo login federado e IA como serviço; otimização do código existente, acompanhadas de aprimoramentos na interface e experiência do usuário; adicionar língua portugues na interface.

Proposta (incluindo tecnologias):  
Front-end: Vue.js, Tailwind CSS, Chart.js e vue-i18n (suporte a português/espanhol).  
Back-end: FastAPI (Python) para regras de negócio e consumo de API externa de IA (OpenAI/Gemini) como serviço.  
Autenticação e Dados: Supabase para login federado (OAuth) e base de dados PostgreSQL.

### Continuação do projeto anterior

Este trabalho é a **continuação do projeto 3** (documentado em [README-projeto3.md](./README-projeto3.md)): uma aplicação web que ajuda pequenas e médias empresas (PYMES) a avaliar e melhorar sua sustentabilidade, desenvolvida em colaboração com a turma de *Sostenibilidad en los Negocios* do Chile. Por isso a interface está em espanhol.

No projeto 3, o app tinha cadastro e login por e-mail, cadastro da empresa, um questionário de 20 perguntas genéricas em 4 dimensões, cálculo do nível de maturidade e algumas recomendações por dimensão.

Neste projeto, além da otimização do código, implementamos o novo documento enviado pela equipe do Chile (*Propuesta de desarrollo de una aplicación de sostenibilidad para PYMES*):

| Pedido da equipe do Chile | O que foi feito |
|---|---|
| Parâmetros de sustentabilidade em 3 dimensões (ambiental, social, econômica) | Questionário refeito: 22 perguntas cobrindo os 17 parâmetros do documento, mais Ley REP e pegada de carbono. Ética e governança passaram para a dimensão econômica |
| Diagnóstico que identifique o que precisa de atenção e recomende de acordo com a realidade de cada negócio | Recomendações **por pergunta**: a resposta define a etapa (*Empieza* / *Avanza*) e a prioridade; o setor da empresa aumenta a prioridade de alguns temas e microempresas recebem textos mais simples. Cada recomendação mostra os ODS a que contribui |
| Medir os avanços | Plano de ação (marcar recomendações como *en progreso* / *realizada*), data do último diagnóstico e gráfico de evolução entre diagnósticos |
| Informação educativa (Agenda 2030, ODS, Ley REP, pegada de carbono, Empresas B, certificações, empresas verdes, ecossistemas, competitividade) | Seção **Educación sostenible** com 8 temas, cada um com fontes oficiais. A antiga Guía e a tela de ODS foram integradas a ela |
| Seção especial *Empresas que dejan huella positiva* (calendário, convites, atividades com trabalhadores, registro de resultados) | Calendário com 38 datas ambientais mundiais e chilenas, ideias de atividades, convite pronto para copiar e registro das atividades com resumo do impacto |
| Relação com a Agenda 2030 | Cada recomendação e cada tipo de atividade indica os ODS relacionados |

### Situação da proposta

- [x] Continuar o desenvolvimento em colaboração com a equipe do Chile
- [x] Otimização do código existente
- [x] Aprimoramentos na interface e na experiência do usuário
- [x] Login federado (OAuth com Google, via Supabase Auth)
- [x] IA como serviço (análise do diagnóstico com Gemini)
- [x] Interface em português (vue-i18n)

## Desenvolvimento

### Diário de evolução

| Nome | O que foi feito | Próximos passos |
|---|---|---|
| Guilherme D. | Novo documento do Chile: 3 dimensões e 22 perguntas novas, recomendações por pergunta (setor, porte e ODS); correção da regra do campo "porte" no banco | Plano de ação e evolução |
| Guilherme D. | Plano de ação (tabela `acoes`), data do último diagnóstico (`concluido_em`) e gráfico de evolução (`/api/diagnostico/historico`) | Seção educativa |
| Guilherme D. | Seção *Educación sostenible* com 8 temas e fontes oficiais; Guía e ODS integradas à seção | Seção *Huella positiva* |
| Guilherme D. | Seção *Empresas que dejan huella positiva*: tabela `actividades` com RLS, rotas CRUD, calendário ambiental, ideias de atividades, convite e cartão no Início | Login federado, IA e interface em português |
| Guilherme D. | Login federado com Google: cliente OAuth no Google Auth Platform, provedor Google no Supabase Auth, botão "Continuar con Google" (com o ícone oficial) no login e no cadastro, fluxo PKCE e retorno para a tela pedida | IA como serviço |
| Guilherme D. | *Análisis con IA* no Resultado: rota `/api/ia/analisis` que envia o diagnóstico (sem dados pessoais) ao Gemini, resposta em JSON validada, tabela `analisis_ia` com RLS, limite de 3 gerações por diagnóstico e modelo reserva quando o principal está sobrecarregado | Interface em português |
| Guilherme M. | Otimização da rota `/api/ia/analisis`: o perfil da empresa (setor, porte e nº de funcionários) é buscado uma única vez e reaproveitado no cálculo das recomendações e no contexto enviado ao Gemini; `pytest` adicionado ao `requirements.txt` | Interface em português |
| Guilherme M. | Interface em português com `vue-i18n`: seletor ES/PT (escolha salva no `localStorage`), textos das telas em `src/i18n/es.json` e `pt.json`, conteúdo longo (temas da Educación, ODS, Huella positiva) traduzido como uma camada por cima do original; perguntas com colunas `perguntaPt`/`opcoesRespostaPt`; back-end lê o `Accept-Language` e devolve erros, recomendações e a análise do Gemini no idioma escolhido (tabela `analisis_ia` passa a ter uma análise por idioma) | Revisão das traduções com a equipe |
| Guilherme M. | Revisão de UI/UX (heurísticas de Nielsen, celular e desktop): cabeçalho das páginas não é mais espremido pelo conteúdo lateral em telas médias (~1024px); botões do plano de ação com alvo de toque de 44px no celular; Resultados no celular mostram as notas em bloco compacto e o plano de ação logo depois, sem o comparativo repetido nem a evolução vazia; "Começar" virou a ação principal e "Marcar como realizada" a secundária | Modo foco no questionário e estado vazio da Pegada positiva |
| Guilherme M. | Continuação da revisão de UI/UX no celular: modo foco no questionário (a barra inferior some nas telas das dimensões), cabeçalho das páginas mais compacto (sem o ícone), Pegada positiva sem os seis indicadores zerados antes da primeira atividade e dados da empresa no Início sem cortar o porte e o número de funcionários | Testar os rótulos da barra inferior com usuários |
| Guilherme M. | Ajustes finos da revisão de UI/UX: selos e etiquetas de 11px passaram para 12px, notas com a vírgula decimal do idioma (68,4) via `fmtNumero`, radar sem os números dos anéis que ficavam por baixo dos pontos e a caixa de introdução da Educación trocada por uma dica curta que só aparece quando há tema recomendado | Testar os rótulos da barra inferior com usuários |
| Guilherme M. | Resultados em tela larga: a coluna da esquerda tinha ficado só com o radar e deixava um espaço vazio; agora a coluna principal tem as notas e o plano de ação, e a lateral tem radar, análise com IA, pontos fortes e evolução, com alturas equilibradas (no celular a ordem continua: notas, plano, IA) | Testar os rótulos da barra inferior com usuários |

### Processo


Guilherme D.:

Comecei este projeto pela otimização do que já existia: o back-end validava o token chamando o Supabase a cada requisição, então passei a validar o JWT localmente com a chave pública do projeto (JWKS), o que deixou as rotas mais rápidas. Também reorganizei o layout e a navegação, principalmente para o celular, já que a ideia é que donos de PYMES usem o app no dia a dia.

Quando chegou o novo documento da equipe do Chile, a principal decisão foi passar de 4 para 3 dimensões, como eles pediram, e refazer o questionário para cobrir todos os parâmetros listados. Com isso percebi que a lógica de recomendações antiga (por nota da dimensão) não fazia sentido: duas empresas com problemas diferentes recebiam o mesmo conselho. Passei a gerar as recomendações por pergunta, considerando também o setor e o porte da empresa.

Nas tabelas novas (`acoes` e `actividades`) segui o mesmo padrão de RLS das tabelas anteriores e testei diretamente no banco que uma empresa não consegue ler nem alterar os dados de outra. Usei bastante IA (Claude) nesta etapa para acelerar a implementação, revisando as decisões e testando cada parte.

Guilherme M.:

Comecei revisando o que já tinha sido feito e procurando pontos para otimizar. O primeiro foi na rota da análise com IA: o perfil da empresa era buscado duas vezes no banco a cada geração, então passei a buscá-lo uma vez só e reaproveitar no cálculo das recomendações e no contexto enviado ao Gemini.

Depois fiquei com o último item da proposta, a interface em português. A decisão principal foi o que traduzir: só os botões e menus deixariam o app misturado, porque as perguntas, as recomendações, o conteúdo educativo e a análise da IA continuariam em espanhol. Por isso traduzi tudo. No front usei o `vue-i18n` com um arquivo de mensagens por idioma; para o conteúdo longo (temas da Educación, ODS, datas ambientais) criei a tradução como uma "camada" por cima do original, para não duplicar ícones, links e ids, com testes que avisam se alguém acrescentar um item só em espanhol. No back-end, o front envia o idioma no cabeçalho `Accept-Language` e a API devolve erros, recomendações e a análise do Gemini nesse idioma. Os códigos salvos no banco (categoria, prioridade, nível) continuam em espanhol, e o front só troca o rótulo. Fui commitando por tela para cada etapa ficar testável.

Por último fiz uma revisão de UI/UX usando as heurísticas de Nielsen, testando principalmente no celular. Os problemas mais importantes eram um cabeçalho que se sobrepunha em telas médias, botões pequenos demais para o toque e a tela de Resultados longa demais, com o plano de ação no fim. Reorganizei os Resultados para mostrar primeiro as notas e o plano de ação, escondi a barra de navegação durante o questionário e removi blocos que repetiam a mesma informação.

### Login federado e IA como serviço

**Login federado (Google).** Seguimos a mesma metodologia do [demo da professora](https://github.com/elc1090/demo-auth-profile) (OpenID Connect: redirecionar ao Google, receber o retorno no *callback*, validar o ID token e iniciar uma sessão), mas quem executa a parte do servidor é o **Supabase Auth**, que o app já usava para o login por e-mail:

| Etapa | Demo da professora (Express) | Nosso projeto |
|---|---|---|
| Iniciar o login | Rota `/auth/google` gera `state` e `nonce` | O front chama `supabase.auth.signInWithOAuth({ provider: 'google' })`, com fluxo PKCE |
| Callback | `/auth/google/callback` no Express | Callback do Supabase (`https://<projeto>.supabase.co/auth/v1/callback`), cadastrado no Google Auth Platform |
| Trocar o código e validar o ID token | `google-auth-library` no servidor | Feito pelo servidor do Supabase |
| Usuário | Tabela própria, contas locais e Google separadas | `auth.users` do Supabase; contas com o mesmo e-mail são vinculadas automaticamente |
| Sessão | Cookie `HttpOnly` + CSRF | JWT do Supabase enviado como `Bearer`; o FastAPI valida o token e o RLS isola os dados de cada empresa |

O *client secret* do Google fica só no painel do Supabase (nunca no front nem no repositório). O back-end não precisou mudar: o token de quem entra com Google é emitido pelo mesmo Supabase.

**IA como serviço (Gemini).** Na tela de Resultados, o botão *Generar análisis con IA* chama o nosso back-end (`POST /api/ia/analisis`), que:
1. monta um contexto só com dados do diagnóstico (setor, porte, notas, recomendações pendentes e fortalezas), **sem** nome da empresa, e-mail ou nomes de pessoas;
2. envia ao Gemini (SDK `google-genai`) com instruções fixas (responder em espanhol, usar só os dados recebidos, não inventar leis nem números) e pede a resposta num **esquema JSON** (resumo, 3 prioridades com motivo e primeiro passo, fortalezas);
3. valida a resposta com Pydantic e salva na tabela `analisis_ia` (uma por diagnóstico, com RLS), para não chamar a IA de novo a cada visita;
4. limita a 3 gerações por diagnóstico e, se o modelo principal estiver sobrecarregado (erro 503) ou sem cota (429), tenta um modelo reserva mais leve.

A chave `GEMINI_API_KEY` fica só nas variáveis de ambiente do back-end (Render e `.env` local).

### Trechos de código

**1. Recomendações por pergunta** (`backend/app/services/recomendacoes.py`): a resposta (1 a 4) define a etapa e a prioridade, e o setor da empresa pode aumentar a prioridade. Resposta 4 não gera recomendação: vira um ponto forte.

```python
PRIORIDADE_POR_VALOR = {1: "Alta", 2: "Media", 3: "Baja"}
SOBE_PRIORIDADE = {"Baja": "Media", "Media": "Alta", "Alta": "Alta"}

def _prioridade(valor: int, item: dict, empresa: dict | None) -> str:
    prioridade = PRIORIDADE_POR_VALOR[valor]
    setor = (empresa or {}).get("setor")
    if setor and setor in item.get("setores_prioritarios", []):
        prioridade = SOBE_PRIORIDADE[prioridade]
    return prioridade
```

**2. RLS nas tabelas novas** (`backend/sql/2026-11-22_actividades.sql`): a segurança fica no banco. Mesmo que o back-end tenha um erro, o Supabase só deixa o usuário mexer nas atividades da própria empresa.

```sql
create policy "usuario borra sus actividades" on public.actividades for delete to authenticated
  using (exists (select 1 from public.empresas e
                 where e.id = actividades.empresa_id and e.user_id = (select auth.uid())));
```

**3. Cuidado com datas e fuso horário** (`frontend/src/lib/fechasAmbientales.js`): `new Date("2026-06-08")` é interpretado como meia-noite em UTC, que no Chile e no Brasil ainda é o dia 7. Para datas sem horário, montamos a data no fuso local:

```js
export function dataLocal(texto) {
  const [ano, mes, dia] = String(texto ?? '').split('-').map(Number)
  if (!ano || !mes || !dia) return null
  return new Date(ano, mes - 1, dia)
}
```

**4. Datas móveis do calendário ambiental**: algumas datas não têm dia fixo (por exemplo, o Día de Limpieza de Playas y Costas é no terceiro sábado de setembro), então a data é calculada para cada ano:

```js
const primeiro = new Date(ano, mes, 1)
const avanco = (efemeride.diaSemana - primeiro.getDay() + 7) % 7
return new Date(ano, mes, 1 + avanco + (efemeride.semana - 1) * 7)
```

**5. Atualização otimista do plano de ação** (`frontend/src/stores/resultado.js`): o status muda na tela na hora e volta ao anterior se o back-end recusar.

```js
const anterior = recurso.dado.value?.recomendacoes?.find((r) => r.id === recomendacaoId)?.status ?? 'pendiente'
comStatus(recomendacaoId, status)
const res = await apiFetch(`/api/acoes/${encodeURIComponent(recomendacaoId)}`, { method: 'PUT', body: JSON.stringify({ status }) })
if (!res?.ok) {
  comStatus(recomendacaoId, anterior)
  throw new ErroHttp(res?.status ?? 0)
}
```

**6. Login com Google pelo Supabase** (`frontend/src/lib/auth.js`): o app só inicia o fluxo; o Supabase cuida do retorno do Google e da validação do token. A URL de volta precisa estar na lista de *Redirect URLs* do Supabase.

```js
export async function entrarComGoogle(redirect = '') {
  const volta = new URL('/login', window.location.origin)
  if (redirect.startsWith('/') && !redirect.startsWith('//')) volta.searchParams.set('redirect', redirect)
  const { error } = await supabase.auth.signInWithOAuth({
    provider: 'google',
    options: { redirectTo: volta.toString(), queryParams: { prompt: 'select_account' } }
  })
  if (error) throw error
}
```

**7. IA com modelo reserva** (`backend/app/services/ia.py`): no primeiro teste o Gemini respondeu *503 – high demand*. Agora, se o modelo principal estiver sobrecarregado, o back-end tenta o modelo reserva antes de desistir.

```python
for modelo in modelos_a_tentar():
    try:
        resposta = cliente.models.generate_content(model=modelo, contents=montar_prompt(contexto), config=config)
    except Exception as erro:
        codigo = _codigo_http(erro)
        if codigo in CODIGOS_TENTAR_OUTRO:   # 404, 429, 5xx
            continue
        raise FalhaIA("Falha ao chamar a IA") from erro
    return interpretar_resposta(getattr(resposta, "text", None)), modelo
```

## Tecnologias

### Linguagens e afins

- **Front-end:** Vue 3 (Composition API, `<script setup>`), Vite, Vue Router, Pinia (cache *stale-while-revalidate* em `localStorage`), vue-i18n (espanhol e português), Tailwind CSS 4, Chart.js (gráficos radar e de linhas), fontes Plus Jakarta Sans e Bricolage Grotesque (Fontsource)
- **Back-end:** Python, FastAPI, Pydantic (validação), Uvicorn, PyJWT (validação local do token), supabase-py / PostgREST, google-genai (SDK do Gemini)
- **Banco e autenticação:** Supabase (PostgreSQL, Supabase Auth com JWT, Row Level Security); login federado com Google (OAuth 2.0 / OpenID Connect, cliente criado no Google Auth Platform)
- **IA como serviço:** Gemini API (Google AI Studio), com saída estruturada em JSON
- **Testes e qualidade:** pytest (back-end), Vitest + jsdom (front-end), ESLint
- **Deploy:** Vercel (front-end) e Render (back-end)

### Ambiente de desenvolvimento

Guilherme D.:
- VS Code
- Claude

Guilherme M.:
- VS Code
- Claude


## Referências e créditos

- Equipe da disciplina *Sostenibilidad en los Negocios* (Chile): documentos *Propuesta de desarrollo de una aplicación de sostenibilidad para PYMES* e texto da antiga Guía sostenible, usado no tema "La sostenibilidad y sus tres dimensiones"
- Documentação: [Vue](https://vuejs.org/guide/), [Vue Router](https://router.vuejs.org/), [Pinia](https://pinia.vuejs.org/), [Tailwind CSS](https://tailwindcss.com/docs), [Chart.js](https://www.chartjs.org/docs/), [FastAPI](https://fastapi.tiangolo.com/), [Supabase](https://supabase.com/docs) (Auth e Row Level Security)
- Fontes do conteúdo educativo e do calendário:
  - [Ley 20.920 – Biblioteca del Congreso Nacional](https://www.bcn.cl/leychile/navegar?idNorma=1090894)
  - [Economía Circular – Ministerio del Medio Ambiente](https://economiacircular.mma.gob.cl/)
  - [Programa HuellaChile – Ministerio del Medio Ambiente](https://huellachile.mma.gob.cl/)
  - [Sistema B](https://www.sistemab.org/)
  - [Agencia de Sustentabilidad y Cambio Climático (ASCC)](https://ascc.cl/)
  - [Agenda 2030 y ODS – Instituto Nacional de Estadísticas (INE)](https://www.ine.gob.cl/ods)
  - [Calendario Ambiental 2026 – Ministerio del Medio Ambiente (ChileAtiende)](https://www.chileatiende.gob.cl/fichas/75614-calendario-ambiental-2026)
- Ícones no estilo [Lucide](https://lucide.dev/) (traçados SVG)
- Login federado e IA:
  - [Demo de login federado da professora (elc1090/demo-auth-profile)](https://github.com/elc1090/demo-auth-profile)
  - [Supabase: Login with Google](https://supabase.com/docs/guides/auth/social-login/auth-google), [Redirect URLs](https://supabase.com/docs/guides/auth/redirect-urls) e [Identity Linking](https://supabase.com/docs/guides/auth/auth-identity-linking)
  - [Google: Sign in with Google Branding Guidelines](https://developers.google.com/identity/branding-guidelines) (ícone oficial do botão)
  - [Gemini API: Structured outputs](https://ai.google.dev/gemini-api/docs/generate-content/structured-output) e [Rate limits](https://ai.google.dev/gemini-api/docs/rate-limits)
- Claude (Anthropic): apoio na implementação das perguntas, recomendações, plano de ação, Educación sostenible, Huella positiva, login federado e análise com IA

---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b
