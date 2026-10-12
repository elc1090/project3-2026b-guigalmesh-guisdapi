import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import DiagnosticoMenu from '../views/Diagnostico/DiagnosticoMenu.vue'
import SignIn from '../views/SignIn.vue'
import Login from '../views/Login.vue'
import DefaultLayout from '../layouts/DefaultLayout.vue'
import Home from '../views/Home.vue'
import Empresa from '../views/Empresa.vue'
import Resultado from '../views/Resultado.vue'
import GobernanzaView from '../views/Diagnostico/GobernanzaView.vue'
import SocialView from '../views/Diagnostico/SocialView.vue'
import EconomicoView from '../views/Diagnostico/EconomicoView.vue'
import AmbientalView from '../views/Diagnostico/AmbientalView.vue'
import DiagnosticoLayout from '../layouts/DiagnosticoLayout.vue'

const routes = [
  { path: '/login',
    component: Login,
    meta: { apenasVisitante: true }
  },
  { path: '/cadastro',
    component: SignIn,
    meta: { apenasVisitante: true }
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: '/diagnostico',
        component: DiagnosticoLayout,
        meta: { requerLogin: true },
        children: [
          {
            path: '',
            component: DiagnosticoMenu
          },
          {
            path: 'gobernanza',
            component: GobernanzaView
          },
          {
            path: 'social',
            component: SocialView
          },
          {
            path: 'economica',
            component: EconomicoView
          },
          {
            path: 'ambiental',
            component: AmbientalView
          }
        ]
      },
      {
        path: '',
        component: Home,
        meta: { requerLogin: true }
      },
      {
        path: '/empresa',
        component: Empresa,
        meta: { requerLogin: true }
      },
      {
        path: '/resultado',
        component: Resultado,
        meta: { requerLogin: true }
      }
    ]
  },
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
