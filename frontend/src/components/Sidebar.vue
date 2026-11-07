<script setup>
import { useRoute } from 'vue-router'
import Icone from './ui/Icone.vue'
import Logo from './ui/Logo.vue'
import { NAVEGACAO, itemAtivo } from '../constants/navegacao'
import { ICONE_SAIR } from '../constants/icones'
import { useUsuario } from '../composables/useUsuario'

const route = useRoute()
const { nome, email, inicial, sairDaConta } = useUsuario()

// item ativo com efeito de vidro fosco: fundo translúcido + blur do que está atrás + borda clara
const CLASSE_ATIVA = 'bg-white/15 backdrop-blur-md !border-white/25 !text-white font-semibold shadow-lg shadow-emerald-950/30'
</script>

<template>
  <aside class="hidden md:flex relative z-10 h-full w-64 shrink-0 text-slate-200 flex-col justify-between py-6 px-3 select-none">
    <div>
      <div class="px-4 mb-10">
        <Logo />
      </div>

      <nav class="flex flex-col gap-2" aria-label="Navegación principal">
        <router-link
          v-for="item in NAVEGACAO"
          :key="item.para"
          :to="item.para"
          class="flex items-center gap-3 px-4 py-3 text-emerald-100/80 rounded-xl font-medium border border-transparent hover:bg-white/10 hover:text-white transition focus-visible:outline-white"
          :class="itemAtivo(item, route.path) ? CLASSE_ATIVA : ''"
          :aria-current="itemAtivo(item, route.path) ? 'page' : undefined"
        >
          <Icone :d="item.icone" class="w-5 h-5 shrink-0" />
          {{ item.rotulo }}
        </router-link>
      </nav>
    </div>

    <div class="border-t border-white/15 pt-4 space-y-2">
      <div class="flex items-center gap-3 px-3 py-2">
        <div class="w-9 h-9 rounded-full bg-emerald-950/60 border border-white/20 flex items-center justify-center text-white font-bold text-sm shrink-0">
          {{ inicial }}
        </div>
        <div class="overflow-hidden">
          <p class="text-sm font-semibold text-white truncate">{{ nome }}</p>
          <p class="text-xs text-emerald-200/70 truncate">{{ email }}</p>
        </div>
      </div>
      <button
        @click="sairDaConta"
        class="flex items-center gap-3 px-4 py-2.5 text-emerald-100/80 hover:text-white hover:bg-red-500/20 rounded-xl font-medium transition cursor-pointer w-full text-left text-sm focus-visible:outline-white"
      >
        <Icone :d="ICONE_SAIR" class="w-4 h-4 shrink-0" />
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>
