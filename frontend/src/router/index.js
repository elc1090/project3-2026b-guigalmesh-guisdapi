import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import { sessao } from '../lib/sessao'
import { useEmpresaStore } from '../stores/empresa'

import DefaultLayout from '../layouts/DefaultLayout.vue'
import DiagnosticoLayout from '../layouts/DiagnosticoLayout.vue'
import DiagnosticoMenu from '../views/Diagnostico/DiagnosticoMenu.vue'
import DimensaoView from '../views/Diagnostico/DimensaoView.vue'
import SignIn from '../views/SignIn.vue'
import Login from '../views/Login.vue'
import Home from '../views/Home.vue'
import Empresa from '../views/Empresa.vue'
import Resultado from '../views/Resultado.vue'

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
      },
      {
        path: 'guia',
        component: () => import('../views/Guia.vue'),
        meta: { requerLogin: true }
      },
      {
        path: 'ods',
        component: () => import('../views/Ods.vue'),
        meta: { requerLogin: true }
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
  const logado = !!data.session

  // na primeira navegação o iniciarAuth() pode ainda não ter terminado;
  // assim as stores já sabem de qual usuário é o cache
  if (sessao.value?.access_token !== data.session?.access_token) {
    sessao.value = data.session
  }

  if (to.meta.requerLogin && !logado) {
    return { path: '/login', query: { redirect: to.fullPath } }
  }

  if (to.meta.requerEmpresa && logado) {
    try {
      // vem do cache quando possível (revalida em segundo plano se estiver velho)
      const empresa = await useEmpresaStore().carregar()
      if (empresa === null) {
        return '/empresa'
      }
    } catch (e) {
      console.error('Erro ao verificar empresa no router:', e)
    }
  }

  if (to.meta.apenasVisitante && logado) {
    return '/diagnostico'
  }
})

export default router