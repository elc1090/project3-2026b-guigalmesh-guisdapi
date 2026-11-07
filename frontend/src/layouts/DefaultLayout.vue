<script setup>
import { ref, watch } from 'vue'
import { useRoute } from 'vue-router'
import Sidebar from '@/components/Sidebar.vue'
import BottomNav from '@/components/BottomNav.vue'
// fundo decorativo verde (mais leve no celular, ver o componente)
import BackgroundAurora from '@/components/ui/BackgroundAurora.vue'
import Logo from '@/components/ui/Logo.vue'

const route = useRoute()
const conteudo = ref(null)
// o fade do topo só aparece depois que a pessoa rola (parado, ele cobriria o topo do primeiro card)
const rolou = ref(false)

// o conteúdo rola dentro do <main>, não na janela: volta ao topo ao trocar de tela
watch(() => route.path, () => conteudo.value?.scrollTo({ top: 0 }))
</script>

<template>
  <div class="relative flex flex-col md:flex-row h-dvh bg-emerald-800 md:p-4 md:gap-4 overflow-hidden">
    <BackgroundAurora />

    <!-- celular: só a marca no topo; a navegação fica na barra inferior -->
    <header class="md:hidden relative z-20 flex items-center justify-center px-4 pt-[calc(0.75rem+env(safe-area-inset-top))] pb-3">
      <Logo compacto />
    </header>

    <Sidebar />

    <main
      ref="conteudo"
      @scroll.passive="rolou = $event.target.scrollTop > 4"
      class="relative z-10 flex-1 min-h-0 overflow-y-auto bg-slate-100 rounded-t-3xl md:rounded-3xl shadow-2xl px-4 pt-5 pb-28 sm:px-6 md:p-8"
    >
      <!-- fade no topo: o conteúdo some suavemente ao rolar em vez de ser cortado na borda.
           Os negativos compensam o padding do <main> (pt-5 / px-4 / sm:px-6 / md:p-8) para a faixa
           encostar na borda; o -mb-8 faz ela não ocupar espaço no layout. -->
      <div
        aria-hidden="true"
        class="sticky -top-5 md:-top-8 z-20 h-8 -mt-5 md:-mt-8 -mb-8 -mx-4 sm:-mx-6 md:-mx-8 pointer-events-none bg-linear-to-b from-slate-100 via-slate-100/80 to-transparent transition-opacity duration-200"
        :class="rolou ? 'opacity-100' : 'opacity-0'"
      ></div>

      <router-view v-slot="{ Component, route: rota }">
        <Transition name="pagina" mode="out-in">
          <component :is="Component" :key="rota.path" />
        </Transition>
      </router-view>
    </main>

    <BottomNav />
  </div>
</template>
