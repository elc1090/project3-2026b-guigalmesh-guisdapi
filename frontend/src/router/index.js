import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import DiagnosticoTeste from '../views/DiagnosticoTeste.vue'
import SignInTeste from '../views/SignInTeste.vue'
import Login from '../views/Login.vue'

const routes = [
  { path: '/', redirect: '/diagnostico' },
  { path: '/login', component: Login, meta: { apenasVisitante: true } },
  { path: '/cadastro', component: SignInTeste, meta: { apenasVisitante: true } },
  { path: '/diagnostico', component: DiagnosticoTeste, meta: { requerLogin: true } }
]

const router = createRouter({ history: createWebHistory(), routes })

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  const logado = !!data.session

  if (to.meta.requerLogin && !logado) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.apenasVisitante && logado) {
    return '/diagnostico'
  }
})

export default router