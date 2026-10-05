import { createRouter, createWebHistory } from 'vue-router'
import DiagnosticoTeste from '../views/DiagnosticoTeste.vue'

const routes = [
  { path: '/diagnostico', component: DiagnosticoTeste },
]

export default createRouter({ history: createWebHistory(), routes })