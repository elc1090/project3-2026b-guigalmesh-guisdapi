<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { sessao, sair } from '../lib/auth'
import Icone from './ui/Icone.vue'
import Logo from './ui/Logo.vue'
import {
  ICONE_LIVRO, ICONE_CASA, ICONE_EMPRESA, ICONE_CHECKLIST, ICONE_TENDENCIA, ICONE_GLOBO, ICONE_SAIR, ICONE_FECHAR
} from '../constants/icones'

defineProps({
  aberto: {
    type: Boolean,
    default: false
  }
})

const emit = defineEmits(['fechar'])
const router = useRouter()

// exato: só fica ativo na rota exata (senão "/" ficaria ativo em todas as telas)
const MENU = [
  { para: '/guia', rotulo: 'Guía sostenible', icone: ICONE_LIVRO },
  { para: '/', rotulo: 'Inicio', icone: ICONE_CASA, exato: true },
  { para: '/empresa', rotulo: 'Mi empresa', icone: ICONE_EMPRESA },
  { para: '/diagnostico', rotulo: 'Diagnóstico', icone: ICONE_CHECKLIST },
  { para: '/resultado', rotulo: 'Resultados del diagnóstico', icone: ICONE_TENDENCIA },
  { para: '/ods', rotulo: 'Objetivos de Desarrollo Sostenible', icone: ICONE_GLOBO }
]
// item ativo com efeito de vidro fosco: fundo translúcido + blur do que está atrás + borda clara
const CLASSE_ATIVA = 'bg-white/15 backdrop-blur-md !border-white/25 !text-white font-semibold shadow-lg shadow-emerald-950/30'

const nomeUsuario = computed(() => {
  return sessao.value?.user?.user_metadata?.nome || sessao.value?.user?.email?.split('@')[0] || 'Usuario'
})

const emailUsuario = computed(() => sessao.value?.user?.email || '')
const inicialUsuario = computed(() => nomeUsuario.value.charAt(0).toUpperCase())

const fazerLogout = async () => {
  emit('fechar')
  await sair()
  router.push('/login')
}
</script>

<template>
  <aside class="h-full w-64 text-slate-200 flex flex-col justify-between py-6 px-3 select-none">
    <div>
      <div class="flex items-center justify-between px-4 mb-10">
        <Logo />

        <button
          @click="emit('fechar')"
          class="md:hidden p-1.5 rounded-lg text-emerald-200 hover:text-white hover:bg-white/10 transition"
          aria-label="Cerrar menú"
        >
          <Icone :d="ICONE_FECHAR" class="w-5 h-5" />
        </button>
      </div>

      <nav class="flex flex-col gap-2">
        <router-link
          v-for="item in MENU"
          :key="item.para"
          :to="item.para"
          @click="emit('fechar')"
          class="flex items-center gap-3 px-4 py-3 text-emerald-100/80 rounded-xl font-medium border border-transparent hover:bg-white/10 hover:text-white transition"
          :active-class="item.exato ? '' : CLASSE_ATIVA"
          :exact-active-class="CLASSE_ATIVA"
        >
          <Icone :d="item.icone" class="w-5 h-5 shrink-0" />
          {{ item.rotulo }}
        </router-link>
      </nav>
    </div>

    <div class="border-t border-white/15 pt-4 space-y-2">
      <div class="flex items-center gap-3 px-3 py-2">
        <div class="w-9 h-9 rounded-full bg-emerald-950/60 border border-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {{ inicialUsuario }}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-semibold text-white truncate">{{ nomeUsuario }}</p>
          <p class="text-xs text-emerald-200/70 truncate">{{ emailUsuario }}</p>
        </div>
      </div>
      <button
        @click="fazerLogout"
        class="flex items-center gap-3 px-4 py-2.5 text-emerald-100/80 hover:text-white hover:bg-red-500/20 rounded-xl font-medium transition cursor-pointer w-full text-left text-sm"
      >
        <Icone :d="ICONE_SAIR" class="w-4 h-4 shrink-0" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
