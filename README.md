# Projeto: Aplicação com cadastro e autenticação de usuários integrando frontend, backend e persistência


![Substitua a imagem ao lado por um GIF/WEBP animado mostrando seu projeto](./apresentacao.gif "GIF animado do projeto. Imagem temporária de Moho Animation https://moho.lostmarble.com/products/moho-pro-special-halls-head-college")


## Acesso

https://project3-2026b-guigalmesh-guisdapi.vercel.app/

## Desenvolvedores
Guilherme de Cezaro Martini - Sistemas de Informação  
Guilherme Serafini Dapieve - Sistemas de Informação

## Proposta

Para tecnologias, pensamos em utilizar Vue com Tailwind CSS e Chart.js no front-end, Python (FastAPI) no back-end para processar as regras de negócio, cálculos do diagnóstico e priorização das recomendações, e Supabase para gerenciar a autenticação segura de usuários e a persistência dos dados em banco PostgreSQL.
A ideia é desenvolver uma aplicação web voltada a auxiliar pequenas e médias empresas na gestão de sustentabilidade. A plataforma permite o cadastro da organização, aplica um questionário diagnóstico, calcula automaticamente os níveis de maturidade e gera recomendações práticas, permitindo que a empresa estruture e acompanhe seu próprio plano de ação e evolução em um dashboard interativo.

## Desenvolvimento

### Diário de evolução

| Data | Nome | O que foi feito | Próximos passos |
|---|---|---|---|
| 03/10 | Guilherme D. | Configuração inicial do front-end com Vue <br> Configuração back-end com FastAPI | Configuração Supabase |
| 05/10 | Guilherme D. | Configuração Supabase <br> Criação do DiagnosticoTeste.vue para testar o front, e ajuste nas rotas no main.py no back para conectar com o front. <br> Configuração do Vue Router em src/router/index.js | Conectar o back com o Supabase |
| 05/10 | Guilherme M. | Criação database.py <br> Criação de TABLE users no supabase <br> Rota teste para criação de usuários | Implementar usando o Supabase Auth |
| 06/10 | Guilherme M. | Criação de routes para teste | Integrar Supabase Auth |
| 09/10 | Guilherme D. | Criação da tabela diagnosticos no Supabase, rota /api/diagnostico salvando no banco <br> Cadastro funcionando com Supabase Auth (adicionado /lib/supabase.js) <br> Login e logout implementado em Login.vue e auth.js | Proteção de rotas no back-end (validar o token) <br> Adicionar user_id na tabela diagnosticos e ligar o RLS (Supabase) <br> Criar o cadastro da empresa|
| 11/10 | Guilherme M. | Criação das perguntas no e modelagem delas no backend <br> Criação de várias telas da aplicação <br> Criação da tela de diagnostico e separação por assunto <br> Organização do código do frontend |
| 13/10 | Guilherme D. | Cadastro da empresa: tabela empresas com user_id e RLS, rotas GET/POST/PUT /api/empresa, tela Empresa.vue e guard no router <br> Rotas do diagnóstico (rascunho, concluir, resultado) com validação do token e RLS na tabela diagnostico <br> Serviço de cálculo (nota por dimensão e nível de maturidade) com 21 testes pytest <br> Salvamento automático do rascunho, botão de finalizar e tela de resultado com gráficos radar e barras | Testar o fluxo completo no navegador <br> Regras de recomendação por dimensão (etapa 5) |
| 14/10 | Guilherme D. | Implementadas regras de recomendação por dimensão <br> Melhorias no front-end e Home.vue | |
| 15/10 | Guilherme D. | Otimização do layout para mobile | |
| 21/10 | Guilherme D. | Implementação de pedidos de última hora dos clientes | |
| 21/10 | Guilherme M. | Implementação de otimização de cache utilizando o Plinia para site ficar mais responsivo | |
|  |  |  |  |

### Processo

Guilherme M.:
Começamos o projeto fazendo protótipos sobre como funcionaria a integração com o supabase, eu nunca havia utilizado. Acabou que usar o supabase acaba abstraindo bastante a parte de autenticação e autorização (com o supabase Auth). Utilizando o supabase, acaba que não tem muita necessidade de termos o backend em Python, poderíamos fazer tudo pelo frontend.
Utilizar o Vue foi uma experiência bem legal, muito mais fácil que o React e achei a sintaxe dos Single File Componentes muito melhor

Guilherme D.:
Gostei de utilizar o Vue, achei que foi uma experiência mais fácil e intuitiva do que foi trabalhar com o React. Com o Supabase, começamos com pequenos protótipos para testar a ferramenta e como funcionava a autenticação. Com ele percebi que muito dessa parte de autenticação funciona "debaixo dos panos", o que de um lado facilitou na hora da implementação.  
No geral, gostei de trabalhar com essas tecnologias e de perceber como elas se complementaram na construção dessa aplicação. Começar com testes menores e depois integrar as funcionalidades ao projeto foi importante para entender melhor como cada parte funciona e se comunica com as demais.

### Trechos de código

```python
bearer = HTTPBearer()


def get_current_user(cred: HTTPAuthorizationCredentials = Depends(bearer)):
    token = cred.credentials
    try:
        res = get_supabase().auth.get_user(token)
        user = res.user if res else None
    except Exception:
        user = None

    if user is None:
        raise HTTPException(status.HTTP_401_UNAUTHORIZED, "Token inválido ou expirado")

    return {"id": user.id, "email": user.email, "token": token}
```

```html
<template>
  <router-link
    :to="route"
    class="bg-white border border-slate-200/80 shadow-md hover:shadow-xl hover:-translate-y-1 hover:border-emerald-600/50 rounded-2xl p-6 flex flex-col items-center justify-center text-center transition-all duration-200 cursor-pointer group"
  >
    <div class="mb-5 p-4 rounded-2xl bg-emerald-50/70 group-hover:bg-emerald-100/80 transition">
      <slot></slot>
    </div>
    <h2 class="text-xl font-bold text-slate-800 group-hover:text-emerald-900 transition">{{ title }}</h2>
    <p class="text-xs text-slate-500 mt-1.5 max-w-[180px]">{{ description }}</p>
    <span class="mt-4 text-xs font-bold text-emerald-800 group-hover:translate-x-1 transition-transform">
      Responder →
    </span>
  </router-link>
</template>
```

## Tecnologias

### Linguagens e afins
- Framework front-end: Vue, Vite
- Backend: Python com FastAPI
- Supabase
- Vercel para deploy

### Autenticação e autorização

Utilizamos o Supabase Auth baseado em tokens (JWT).
No frontend, a sessão é gerenciada pela biblioteca de cliente do Supabase. Utilizando o Vue Router fazemos a proteção de rotas. Já no backend, as requisições enviam o token JWT e validamos esse token em cada rota.
No Supabase também implementamos Row level security (RLS) para isolar os dados e permitir que as empresas acessem somente seus dados

### Ambiente de desenvolvimetno

Guilherme M.:
- VSCode
- Gemini Argon
- Antigravity

Guilherme D.:
- VSCode
- Gemini
- Claude

## Refêrencias e créditos
https://vuejs.org/tutorial/
https://supabase.com/docs
