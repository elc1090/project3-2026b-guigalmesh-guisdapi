<script setup>
import { ref, computed, watch, nextTick, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'
import Icone from './ui/Icone.vue'
import { NAVEGACAO, itemAtivo } from '../constants/navegacao'
import { ICONE_SAIR, ICONE_FECHAR } from '../constants/icones'
import { useUsuario } from '../composables/useUsuario'

// Barra inferior do celular: os 4 itens de navegação + "Cuenta" (dados do usuário e sair)
const route = useRoute()
const { nome, email, inicial, sairDaConta } = useUsuario()

const contaAberta = ref(false)
const painel = ref(null)

// posição da "gota" de vidro: índice do item ativo, -1 = nenhum
const indiceAtivo = computed(() => NAVEGACAO.findIndex((item) => itemAtivo(item, route.path)))

const abrirConta = async () => {
  contaAberta.value = true
  await nextTick()
  painel.value?.querySelector('button')?.focus()
}
const fecharConta = () => { contaAberta.value = false }

// fecha ao trocar de tela ou ao apertar Esc
watch(() => route.path, fecharConta)
const aoTeclar = (e) => { if (e.key === 'Escape') fecharConta() }
onMounted(() => window.addEventListener('keydown', aoTeclar))
onBeforeUnmount(() => window.removeEventListener('keydown', aoTeclar))

const sair = async () => {
  fecharConta()
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

      <li v-for="(item, i) in NAVEGACAO" :key="item.para" class="relative">
        <router-link
          :to="item.para"
          class="flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[11px] font-medium transition-colors"
          :class="indiceAtivo === i ? 'text-emerald-800 font-semibold' : 'text-slate-600'"
          :aria-current="indiceAtivo === i ? 'page' : undefined"
        >
          <Icone :d="item.icone" class="w-[22px] h-[22px]" />
          {{ item.rotuloCurto ?? item.rotulo }}
        </router-link>
      </li>

      <li class="relative">
        <button
          type="button"
          @click="abrirConta"
          aria-haspopup="dialog"
          :aria-expanded="contaAberta"
          class="w-full flex flex-col items-center gap-0.5 py-1.5 rounded-full text-[11px] font-medium transition-colors cursor-pointer"
          :class="contaAberta ? 'text-emerald-800 font-semibold' : 'text-slate-600'"
        >
          <span class="w-[22px] h-[22px] rounded-full bg-emerald-800 text-white text-[11px] font-bold flex items-center justify-center" aria-hidden="true">
            {{ inicial }}
          </span>
          Cuenta
        </button>
      </li>
    </ul>
  </nav>

  <Teleport to="body">
    <Transition name="fade">
      <div v-if="contaAberta" class="md:hidden fixed inset-0 z-40 bg-slate-950/40 backdrop-blur-[2px]" @click="fecharConta"></div>
    </Transition>

    <Transition name="painel">
      <div
        v-if="contaAberta"
        ref="painel"
        role="dialog"
        aria-modal="true"
        aria-label="Tu cuenta"
        class="md:hidden fixed inset-x-0 bottom-0 z-50 bg-white/90 backdrop-blur-2xl backdrop-saturate-150 border-t border-white/70 rounded-t-3xl shadow-2xl px-4 pt-3 pb-[calc(1rem+env(safe-area-inset-bottom))]"
      >
        <div class="flex items-center justify-between mb-3">
          <div class="w-10"></div>
          <div class="h-1.5 w-10 rounded-full bg-slate-200"></div>
          <button
            type="button"
            @click="fecharConta"
            class="w-10 h-10 flex items-center justify-center rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer"
            aria-label="Cerrar"
          >
            <Icone :d="ICONE_FECHAR" class="w-5 h-5" />
          </button>
        </div>

        <div class="flex items-center gap-3 px-2">
          <div class="w-12 h-12 rounded-full bg-emerald-800 text-white flex items-center justify-center text-lg font-bold shrink-0">
            {{ inicial }}
          </div>
          <div class="min-w-0 flex-1">
            <p class="font-semibold text-slate-800 truncate">{{ nome }}</p>
            <p class="text-sm text-slate-500 truncate">{{ email }}</p>
          </div>
        </div>

        <button
          type="button"
          @click="sair"
          class="mt-5 w-full flex items-center justify-center gap-2 px-4 py-3 rounded-xl border border-red-200 text-red-700 font-semibold hover:bg-red-50 transition cursor-pointer"
        >
          <Icone :d="ICONE_SAIR" class="w-5 h-5" />
          Cerrar sesión
        </button>
      </div>
    </Transition>
  </Teleport>
</template>
