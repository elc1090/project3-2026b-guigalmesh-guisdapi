<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Icone from './ui/Icone.vue'
import { NAV_PRINCIPAL, NAV_SECUNDARIA } from '../constants/navegacao'
import { ICONE_MAIS, ICONE_SAIR, ICONE_FECHAR } from '../constants/icones'
import { useUsuario } from '../composables/useUsuario'

const route = useRoute()
const { nome, email, inicial, sairDaConta } = useUsuario()

const maisAberto = ref(false)
const painel = ref(null)

// "Más" fica destacado quando a tela atual é uma das que estão dentro dele (Guía, ODS)
const secundariaAtiva = computed(() => NAV_SECUNDARIA.some((item) => route.path.startsWith(item.para)))
// posição do indicador de vidro: 0-3 = itens principais, 4 = "Más", -1 = nenhum
const indiceAtivo = computed(() => {
  const i = NAV_PRINCIPAL.findIndex((item) => (item.exato ? route.path === item.para : route.path.startsWith(item.para)))
  if (i !== -1) return i
  return secundariaAtiva.value ? NAV_PRINCIPAL.length : -1
})

const abrirMais = async () => {
  maisAberto.value = true
  await nextTick()
  painel.value?.querySelector('a, button')?.focus()
}
const fecharMais = () => { maisAberto.value = false }

// fecha ao trocar de tela ou ao apertar Esc
watch(() => route.path, fecharMais)
const aoTeclar = (e) => { if (e.key === 'Escape') fecharMais() }
onMounted(() => window.addEventListener('keydown', aoTeclar))
onBeforeUnmount(() => window.removeEventListener('keydown', aoTeclar))

const sair = async () => {
  fecharMais()
  await sairDaConta()
}
</script>

<template>
  <!-- pílula flutuante estilo "liquid glass": translúcida, desfoca o conteúdo que passa por trás -->
  <nav
    class="md:hidden fixed inset-x-4 bottom-[calc(0.75rem+env(safe-area-inset-bottom))] z-30 rounded-full p-1.5
           bg-white/55 backdrop-blur-xl backdrop-saturate-150 border border-white/60
           shadow-[0_10px_40px_-8px_rgba(2,44,34,0.35),inset_0_1px_0_rgba(255,255,255,0.9)]"
    aria-label="Navegación principal"
  >
    <ul class="relative grid grid-cols-5">
      <!-- "gota" de vidro do item ativo, desliza entre os itens -->
      <li
        v-show="indiceAtivo !== -1"
        aria-hidden="true"
        class="absolute inset-y-0 left-0 w-1/5 rounded-full bg-white/85 ring-1 ring-black/5
               shadow-[0_4px_14px_-2px_rgba(2,44,34,0.25),inset_0_1px_0_rgba(255,255,255,1)]
               transition-transform duration-500 ease-[cubic-bezier(0.3,1.35,0.5,1)] motion-reduce:transition-none"
        :style="{ transform: `translateX(${indiceAtivo * 100}%)` }"
      ></li>

      <li v-for="(item, i) in NAV_PRINCIPAL" :key="item.para" class="relative">
        <router-link
          :to="item.para"
          class="flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[11px] font-medium transition-colors"
          :class="indiceAtivo === i ? 'text-emerald-800 font-semibold' : 'text-slate-600'"
        >
          <Icone :d="item.icone" class="w-[22px] h-[22px]" />
          {{ item.rotuloCurto ?? item.rotulo }}
        </router-link>
      </li>

      <li class="relative">
        <button
          type="button"
          @click="abrirMais"
          aria-haspopup="dialog"
          :aria-expanded="maisAberto"
          class="w-full flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
          :class="indiceAtivo === NAV_PRINCIPAL.length || maisAberto ? 'text-emerald-800 font-semibold' : 'text-slate-600'"
        >
          <Icone :d="ICONE_MAIS" :stroke-width="3" class="w-[22px] h-[22px]" />
          Más
        </button>
      </li>
    </ul>
  </nav>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="maisAberto" class="md:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]" @click="fecharMais"></div>
    </Transition>

    <Transition name="painel">
      <div
        v-if="maisAberto"
        ref="painel"
        role="dialog"
        aria-modal="true"
        aria-label="Más opciones"
        class="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white/80 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/70 rounded-t-3xl shadow-2xl px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div class="flex items-center justify-between mb-2">
          <div class="w-10"></div>
          <div class="h-1.5 w-10 rounded-full bg-slate-200"></div>
          <button
            type="button"
            @click="fecharMais"
            class="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label="Cerrar"
          >
            <Icone :d="ICONE_FECHAR" class="w-5 h-5" />
          </button>
        </div>

        <nav class="flex flex-col gap-1">
          <router-link
            v-for="item in NAV_SECUNDARIA"
            :key="item.para"
            :to="item.para"
            class="flex items-center gap-3 px-3 py-3 rounded-xl text-slate-700 font-medium hover:bg-slate-50 transition"
            active-class="bg-emerald-50 !text-emerald-900 font-semibold"
          >
            <span class="w-10 h-10 rounded-full bg-emerald-50 text-emerald-700 flex items-center justify-center shrink-0">
              <Icone :d="item.icone" class="w-5 h-5" />
            </span>
            {{ item.rotulo }}
          </router-link>
        </nav>

        <div class="border-t border-slate-100 mt-3 pt-3 flex items-center gap-3 px-3">
          <div class="w-10 h-10 rounded-full bg-emerald-800 text-white flex items-center justify-center font-bold shrink-0">
            {{ inicial }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="text-sm font-semibold text-slate-800 truncate">{{ nome }}</p>
            <p class="text-xs text-slate-500 truncate">{{ email }}</p>
          </div>
          <button
            type="button"
            @click="sair"
            class="flex items-center gap-2 px-3 py-2 rounded-xl text-sm font-semibold text-red-700 hover:bg-red-50 transition cursor-pointer"
          >
            <Icone :d="ICONE_SAIR" class="w-4 h-4" />
            Cerrar sesión
          </button>
        </div>
      </div>
    </Transition>
  </Teleport>
</template>
