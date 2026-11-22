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
- [ ] Login federado (OAuth com Supabase)
- [ ] IA como serviço
- [ ] Interface em português (vue-i18n)

## Desenvolvimento

### Diário de evolução

| Nome | O que foi feito | Próximos passos |
|---|---|---|
| Guilherme D. | Novo documento do Chile: 3 dimensões e 22 perguntas novas, recomendações por pergunta (setor, porte e ODS); correção da regra do campo "porte" no banco | Plano de ação e evolução |
| Guilherme D. | Plano de ação (tabela `acoes`), data do último diagnóstico (`concluido_em`) e gráfico de evolução (`/api/diagnostico/historico`) | Seção educativa |
| Guilherme D. | Seção *Educación sostenible* com 8 temas e fontes oficiais; Guía e ODS integradas à seção | Seção *Huella positiva* |
| Guilherme D. | Seção *Empresas que dejan huella positiva*: tabela `actividades` com RLS, rotas CRUD, calendário ambiental, ideias de atividades, convite e cartão no Início | Login federado, IA e interface em português |

### Processo

<!-- TODO (dupla): explicar como a dupla se organizou neste projeto (divisão de tarefas, quem fez o quê). -->

Guilherme D.:

<!-- RASCUNHO: revisar-->
Comecei este projeto pela otimização do que já existia: o back-end validava o token chamando o Supabase a cada requisição, então passei a validar o JWT localmente com a chave pública do projeto (JWKS), o que deixou as rotas mais rápidas. Também reorganizei o layout e a navegação, principalmente para o celular, já que a ideia é que donos de PYMES usem o app no dia a dia.

Quando chegou o novo documento da equipe do Chile, a principal decisão foi passar de 4 para 3 dimensões, como eles pediram, e refazer o questionário para cobrir todos os parâmetros listados. Com isso percebi que a lógica de recomendações antiga (por nota da dimensão) não fazia sentido: duas empresas com problemas diferentes recebiam o mesmo conselho. Passei a gerar as recomendações por pergunta, considerando também o setor e o porte da empresa.

Nas tabelas novas (`acoes` e `actividades`) segui o mesmo padrão de RLS das tabelas anteriores e testei diretamente no banco que uma empresa não consegue ler nem alterar os dados de outra. Usei bastante IA (Claude) nesta etapa para acelerar a implementação, revisando as decisões e testando cada parte.

Guilherme M.:


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

## Tecnologias

### Linguagens e afins

- **Front-end:** Vue 3 (Composition API, `<script setup>`), Vite, Vue Router, Pinia (cache *stale-while-revalidate* em `localStorage`), Tailwind CSS 4, Chart.js (gráficos radar e de linhas), fontes Plus Jakarta Sans e Bricolage Grotesque (Fontsource)
- **Back-end:** Python, FastAPI, Pydantic (validação), Uvicorn, PyJWT (validação local do token), supabase-py / PostgREST
- **Banco e autenticação:** Supabase (PostgreSQL, Supabase Auth com JWT, Row Level Security)
- **Testes e qualidade:** pytest (back-end), Vitest + jsdom (front-end), ESLint
- **Deploy:** Vercel (front-end) e Render (back-end)

### Ambiente de desenvolvimento

Guilherme D.:
- VS Code
- Claude

Guilherme M.:
-  

  
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
- Claude (Anthropic): apoio na implementação das perguntas, recomendações, plano de ação, Educación sostenible e Huella positiva

---
Projeto entregue para a disciplina de [Desenvolvimento de Software para a Web](http://github.com/andreainfufsm/elc1090-2026b) em 2026b
