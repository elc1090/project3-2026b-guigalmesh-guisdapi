<script setup>
import { computed } from 'vue'
import { useRouter } from 'vue-router'
import { sessao, sair } from '../lib/auth'
import { limparCacheEmpresa } from '../router'

const router = useRouter()

const nomeUsuario = computed(() => {
  return sessao.value?.user?.user_metadata?.nome || sessao.value?.user?.email?.split('@')[0] || 'Usuario'
})

const emailUsuario = computed(() => sessao.value?.user?.email || '')

const inicialUsuario = computed(() => nomeUsuario.value.charAt(0).toUpperCase())

const fazerLogout = async () => {
  await sair()
  limparCacheEmpresa()
  router.push('/login')
}
</script>

<template>
  <aside class="h-full w-64 text-slate-200 flex flex-col justify-between py-6 px-3 select-none">
    <div>
      <!-- Logo -->
      <div class="flex items-center gap-3 px-4 mb-10">
        <div class="w-9 h-9 rounded-xl bg-white/15 flex items-center justify-center text-white font-extrabold text-lg shadow-inner">
          S
        </div>
        <div>
          <span class="font-extrabold tracking-wider text-white text-lg block leading-none">SOSTENPYME</span>
          <span class="text-[11px] text-emerald-200/80 tracking-wide">Gestión Sostenible</span>
        </div>
      </div>

      <!-- Navegação -->
      <nav class="flex flex-col gap-2">
        <router-link
          to="/"
          class="flex items-center gap-3 px-4 py-3 text-emerald-100/80 rounded-xl font-medium hover:bg-white/10 hover:text-white transition"
          exact-active-class="bg-white/15 !text-white font-semibold shadow-xs"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" />
          </svg>
          Inicio
        </router-link>

        <router-link
          to="/empresa"
          class="flex items-center gap-3 px-4 py-3 text-emerald-100/80 rounded-xl font-medium hover:bg-white/10 hover:text-white transition"
          active-class="bg-white/15 !text-white font-semibold shadow-xs"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 21h18M5 21V7l8-4v18m6 0V11l-6-4" />
          </svg>
          Mi empresa
        </router-link>

        <router-link
          to="/diagnostico"
          class="flex items-center gap-3 px-4 py-3 text-emerald-100/80 rounded-xl font-medium hover:bg-white/10 hover:text-white transition"
          active-class="bg-white/15 !text-white font-semibold shadow-xs"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M9 11l3 3L22 4M21 12v7a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h11" />
          </svg>
          Diagnóstico
        </router-link>

        <router-link
          to="/resultado"
          class="flex items-center gap-3 px-4 py-3 text-emerald-100/80 rounded-xl font-medium hover:bg-white/10 hover:text-white transition"
          active-class="bg-white/15 !text-white font-semibold shadow-xs"
        >
          <svg class="w-5 h-5" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 3v18h18M7 16l4-4 4 4 5-6" />
          </svg>
          Resultado
        </router-link>
      </nav>
    </div>

    <!-- Rodapé do Usuário + Logout -->
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
        <svg class="w-4 h-4" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4m7 14 5-5-5-5m5 5H9" />
        </svg>
        Cerrar sesión
      </button>
    </div>
  </aside>
</template>