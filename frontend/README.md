# Estrutura típica de um projeto Vue

```
src/
├── main.js          → ponto de entrada: cria o app e liga o router
├── App.vue          → componente raiz; tem o <RouterView />
├── router/
│   └── index.js     → mapa URL → componente
├── views/           → componentes que são telas inteiras
│   └── DiagnosticoTeste.vue
└── components/      → peças reutilizáveis (botões, cards, inputs)
```

## O que cada parte faz

| Item | Função |
|------|--------|
| `main.js` | Cria a aplicação Vue e registra o router |
| `App.vue` | Componente raiz; contém o `<RouterView />`, onde a tela da URL atual é exibida |
| `router/index.js` | Associa cada URL a um componente (ex.: `/diagnostico` → `DiagnosticoTeste.vue`) |
| `views/` | Componentes que representam **telas inteiras** |
| `components/` | Componentes **reutilizáveis** usados dentro das telas |

## Convenção do projeto

- Se é uma **tela** (tem uma rota própria), vai em `views/`.
- Se é uma **peça reutilizável** (botão, card, input), vai em `components/`.