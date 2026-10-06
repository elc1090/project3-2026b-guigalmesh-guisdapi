import { createRouter, createWebHistory } from 'vue-router'
import DiagnosticoTeste from '../views/DiagnosticoTeste.vue'
import SignInTeste from '../views/SignInTeste.vue'

const routes = [
  { path: '/diagnostico', component: DiagnosticoTeste },
  { path: '/cadastro', component: SignInTeste}
]

export default createRouter({ history: createWebHistory(), routes })
