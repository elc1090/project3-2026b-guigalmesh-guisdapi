import { createRouter, createWebHistory } from 'vue-router'
import { supabase } from '../lib/supabase'
import { sessao } from '../lib/sessao'
import { navegando } from './estado'
import { useEmpresaStore } from '../stores/empresa'
import { SLUGS_DIMENSOES } from '../constants/dimensoes'

import DefaultLayout from '../layouts/DefaultLayout.vue'
import AuthLayout from '../layouts/AuthLayout.vue'
// Telas carregadas sob demanda: cada uma vira um arquivo JS separado no build
const DiagnosticoMenu = () => import('../views/Diagnostico/DiagnosticoMenu.vue')
const DimensaoView = () => import('../views/Diagnostico/DimensaoView.vue')
const SignIn = () => import('../views/SignIn.vue')
const Login = () => import('../views/Login.vue')
const Home = () => import('../views/Home.vue')
const Empresa = () => import('../views/Empresa.vue')
const Resultado = () => import('../views/Resultado.vue')

const routes = [
  // login e cadastro usam o mesmo AuthLayout: ao trocar entre eles o layout é reaproveitado
  // (só o formulário troca, com transição, e o seletor desliza)
  {
    path: '/login',
    component: AuthLayout,
    children: [{ path: '', component: Login, meta: { apenasVisitante: true } }]
  },
  {
    path: '/cadastro',
    component: AuthLayout,
    children: [{ path: '', component: SignIn, meta: { apenasVisitante: true } }]
  },
  {
    path: '/',
    component: DefaultLayout,
    children: [
      {
        path: 'diagnostico',
        meta: { requerLogin: true, requerEmpresa: true },
        children: [
          {
            path: '',
            component: DiagnosticoMenu
          },
          {
            path: `:dimensao(${SLUGS_DIMENSOES})`,
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

// barra de progresso: só aparece se a navegação demorar (trocas rápidas não piscam a barra).
// Registrado ANTES do guard abaixo: os guards rodam em ordem, então o timer já conta a espera dele.
const ATRASO_BARRA_MS = 150
let timerBarra = null
router.beforeEach(() => {
  clearTimeout(timerBarra)
  timerBarra = setTimeout(() => { navegando.value = true }, ATRASO_BARRA_MS)
})
const fimNavegacao = () => {
  clearTimeout(timerBarra)
  navegando.value = false
}
router.afterEach(fimNavegacao)
router.onError(fimNavegacao)

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