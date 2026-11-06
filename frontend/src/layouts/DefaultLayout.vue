<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import BackgroundWaves from '../components/ui/BackgroundWaves.vue'
import Logo from '@/components/ui/Logo.vue'
import Icone from '@/components/ui/Icone.vue'
import { ICONE_MENU } from '@/constants/icones'

const menuAberto = ref(false)
</script>

<template>
  <div class="relative flex flex-col md:flex-row h-dvh bg-emerald-800 p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden">
    <BackgroundWaves class="absolute inset-0 pointer-events-none select-none -z-10" />

    <header class="md:hidden relative z-20 flex items-center justify-between px-4 py-3 bg-emerald-900/60 backdrop-blur-md rounded-2xl text-white border border-white/10">
      <Logo compacto />
      <button
        @click="menuAberto = true"
        class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        aria-label="Abrir menú"
      >
        <Icone :d="ICONE_MENU" class="w-6 h-6" />
      </button>
    </header>

    <div
      v-if="menuAberto"
      @click="menuAberto = false"
      class="fixed inset-0 bg-slate-950/60 backdrop-blur-xs z-30 md:hidden transition-opacity"
    ></div>

    <Sidebar
      :aberto="menuAberto"
      @fechar="menuAberto = false"
      class="fixed inset-y-0 left-0 z-40 bg-emerald-900 md:bg-transparent shadow-2xl md:shadow-none transform transition-transform duration-300 ease-in-out md:relative md:translate-x-0"
      :class="menuAberto ? 'translate-x-0' : '-translate-x-full'"
    />

    <main class="relative z-10 flex-1 h-full bg-slate-100 p-4 sm:p-6 md:p-8 rounded-2xl md:rounded-3xl shadow-2xl overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>