import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import { apiFetch } from '../lib/api'

import DefaultLayout from '../layouts/DefaultLayout.vue'
import DiagnosticoLayout from '../layouts/DiagnosticoLayout.vue'
import DiagnosticoMenu from '../views/Diagnostico/DiagnosticoMenu.vue'
import DimensaoView from '../views/Diagnostico/DimensaoView.vue'
import SignIn from '../views/SignIn.vue'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Empresa from '../views/Empresa.vue'
import Resultado from '../views/Resultado.vue'

let usuarioComEmpresaId = null

export function limparCacheEmpresa() {
  usuarioComEmpresaId = null
}

const routes = [
  {
    path: '/login',
    component: Login,
    meta: { apenasVisitante: true }
  },
  {
    path: '/cadastro',
    component: SignIn,
    meta: { apenasVisitante: true }
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: 'diagnostico',
        component: DiagnosticoLayout,
        meta: { requerLogin: true, requerEmpresa: true },
        children: [
          {
            path: '',
            component: DiagnosticoMenu
          },
          {
            path: ':dimensao(gobernanza|social|economica|ambiental)',
            component: DimensaoView
          }
        ]
      },
      {
        path: '',
        component: Home,
        meta: { requerLogin: true }
      },
      {
        path: 'empresa',
        component: Empresa,
        meta: { requerLogin: true }
      },
      {
        path: 'resultado',
        component: Resultado,
        meta: { requerLogin: true, requerEmpresa: true }
      }
    ]
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

router.beforeEach(async (to) => {
  const { data } = await supabase.auth.getSession()
  const sessao = data.session
  const logado = !!sessao

  if (!logado) {
    usuarioComEmpresaId = null
  }

  if (to.meta.requerLogin && !logado) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requerEmpresa && logado) {
    if (usuarioComEmpresaId !== sessao.user.id) {
      try {
        const res = await apiFetch('/api/empresa')
        if (res.ok) {
          const empresa = await res.json()
          if (empresa === null) {
            return '/empresa'
          }
          usuarioComEmpresaId = sessao.user.id
        }
      } catch (e) {
        console.error('Erro ao verificar empresa no router:', e)
      }
    }
  }

  if (to.meta.apenasVisitante && logado) {
    return '/diagnostico'
  }
})

export default router