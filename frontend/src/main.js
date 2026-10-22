import { createApp } from 'vue'
import { createPinia } from 'pinia'
import './style.css'
import App from './App.vue'
import router from './router/index.js'

const app = createApp(App)
// o Pinia precisa vir antes do router: o guard de rotas usa a store da empresa
app.use(createPinia())
app.use(router)
app.mount('#app')
