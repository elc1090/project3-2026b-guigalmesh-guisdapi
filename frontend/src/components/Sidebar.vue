<script setup>
import { useRouter } from 'vue-router'
import { sair } from '../lib/auth'
import { limparCacheEmpresa } from '../router'

const router = useRouter()

const fazerLogout = async () => {
  await sair()
  limparCacheEmpresa()
  router.push('/login')
}
</script>

<template>
  <div class="h-full w-64 text-slate-300 flex flex-col justify-between py-4 px-2">
    <div>
      <div class="flex items-center gap-2 px-4 py-2 mb-8">
        <span class="font-bold tracking-wider text-white">SOSTENPYME</span>
      </div>

      <nav class="flex flex-col gap-5">
        <router-link
          to="/"
          class="flex items-center gap-3 px-4 py-3 text-white rounded-xl font-medium hover:bg-white/5 transition"
          exact-active-class="bg-white/10 text-white font-medium"
        >
          Inicio
        </router-link>

        <router-link
          to="/empresa"
          class="flex items-center gap-3 px-4 py-3 text-slate-100 rounded-xl font-medium hover:bg-white/5 transition"
          active-class="bg-white/10 text-white font-medium"
        >
          Mi empresa
        </router-link>

        <router-link
          to="/diagnostico"
          class="flex items-center gap-3 px-4 py-3 text-white rounded-xl font-medium hover:bg-white/5 transition"
          active-class="bg-white/10 text-white font-medium"
        >
          Diagnóstico
        </router-link>

        <router-link
          to="/resultado"
          class="flex items-center gap-3 px-4 py-3 text-white rounded-xl font-medium hover:bg-white/5 transition"
          active-class="bg-white/10 text-white font-medium"
        >
          Resultado
        </router-link>
      </nav>
    </div>

    <button
      @click="fazerLogout"
      class="flex items-center gap-3 px-4 py-3 text-slate-200 hover:text-white hover:bg-white/10 rounded-xl font-medium transition cursor-pointer w-full text-left"
    >
      Cerrar sesión
    </button>
  </div>
</template>