import { createApp } from 'vue'
import { createPinia } from 'pinia'
// fontes: Plus Jakarta Sans (texto e títulos menores) e Bricolage Grotesque (títulos grandes)
import '@fontsource-variable/plus-jakarta-sans'
import '@fontsource-variable/bricolage-grotesque/opsz.css'
import './style.css'
import App from './App.vue'
import router from './router/index.js'
import { acordarServidor } from './lib/api'

// o back-end (Render) pode estar dormindo: começa a acordá-lo já, em paralelo com o carregamento da tela
acordarServidor()

const app = createApp(App)
// o Pinia precisa vir antes do router: o guard de rotas usa a store da empresa
app.use(createPinia())
app.use(router)
app.mount('#app')
