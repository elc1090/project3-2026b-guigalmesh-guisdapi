<script setup>
import { ref } from 'vue'
import Sidebar from '@/components/Sidebar.vue'
import BackgroundWaves from '../components/ui/BackgroundWaves.vue'

const menuAberto = ref(false)
</script>

<template>
  <div class="relative flex flex-col md:flex-row h-dvh bg-emerald-800 p-2 sm:p-4 gap-2 sm:gap-4 overflow-hidden">
    <BackgroundWaves class="absolute inset-0 pointer-events-none select-none -z-10" />

    <header class="md:hidden relative z-20 flex items-center justify-between px-4 py-3 bg-emerald-900/60 backdrop-blur-md rounded-2xl text-white border border-white/10">
      <div class="flex items-center gap-2.5">
        <div class="w-8 h-8 rounded-lg bg-white/15 flex items-center justify-center text-white font-extrabold text-base shadow-inner">
          S
        </div>
        <span class="font-extrabold tracking-wider text-white text-base">SOSTENPYME</span>
      </div>
      <button
        @click="menuAberto = true"
        class="p-2 rounded-xl bg-white/10 hover:bg-white/20 text-white transition cursor-pointer"
        aria-label="Abrir menu"
      >
        <svg class="w-6 h-6" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16" />
        </svg>
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