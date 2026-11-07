<script setup>
import { ref, computed, watch, onBeforeUnmount } from 'vue'
import { servidorLento, lentoDesde } from '../../lib/api'
import { navegando } from '../../router/estado'

// Dois indicadores globais (ficam no App.vue, valem para todas as telas):
// 1) barra fina no topo enquanto uma troca de tela espera dados (ex.: checar a empresa);
// 2) aviso "Conectando con el servidor" quando o back-end demora (Render acordando).

// segundos esperando, para trocar a mensagem se passar muito tempo
const segundos = ref(0)
let relogio = null

watch(servidorLento, (lento) => {
  clearInterval(relogio)
  if (!lento) return
  const atualizar = () => { segundos.value = Math.floor((Date.now() - lentoDesde.value) / 1000) }
  atualizar()
  relogio = setInterval(atualizar, 1000)
})
onBeforeUnmount(() => clearInterval(relogio))

const detalhe = computed(() => {
  if (segundos.value < 10) return 'Un momento, por favor…'
  if (segundos.value < 45) return 'El servidor estaba en reposo y está despertando. La primera conexión puede tardar hasta un minuto.'
  return 'Está tardando más de lo normal. Si no avanza, revisa tu conexión a internet.'
})
</script>

<template>
  <!-- barra de progresso indeterminada no topo -->
  <Transition name="fade">
    <div
      v-if="navegando"
      class="fixed inset-x-0 top-0 z-[60] h-1 overflow-hidden bg-emerald-100/40 pointer-events-none"
      role="progressbar"
      aria-label="Cargando"
    >
      <div class="barra-indeterminada h-full w-1/3 rounded-full bg-emerald-400"></div>
    </div>
  </Transition>

  <!-- aviso de servidor lento: no topo, acima de tudo, sem bloquear a tela -->
  <Transition name="aviso">
    <div
      v-if="servidorLento"
      class="fixed z-[60] left-1/2 -translate-x-1/2 top-[calc(0.75rem+env(safe-area-inset-top))] w-[calc(100%-2rem)] max-w-sm
             flex items-start gap-3 rounded-2xl px-4 py-3 bg-white/95 backdrop-blur-md border border-emerald-100
             shadow-[0_10px_40px_-8px_rgba(2,44,34,0.35)]"
      role="status"
      aria-live="polite"
    >
      <span class="mt-0.5 w-5 h-5 shrink-0 rounded-full border-2 border-emerald-200 border-t-emerald-700 animate-spin motion-reduce:animate-none" aria-hidden="true"></span>
      <div class="min-w-0">
        <p class="text-sm font-semibold text-slate-800">
          Conectando con el servidor<span v-if="segundos >= 5" class="font-normal text-slate-500"> · {{ segundos }} s</span>
        </p>
        <p class="text-xs text-slate-500 mt-0.5">{{ detalhe }}</p>
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.barra-indeterminada {
  animation: desliza 1.1s ease-in-out infinite;
}
@keyframes desliza {
  from { transform: translateX(-100%); }
  to { transform: translateX(300%); }
}
@media (prefers-reduced-motion: reduce) {
  .barra-indeterminada { animation: none; width: 100%; opacity: 0.6; }
}

.aviso-enter-active,
.aviso-leave-active {
  transition: opacity 200ms ease, transform 200ms ease;
}
.aviso-enter-from,
.aviso-leave-to {
  opacity: 0;
  /* a centralização usa a propriedade "translate" (Tailwind 4); aqui só desliza na vertical */
  transform: translateY(-8px);
}
@media (prefers-reduced-motion: reduce) {
  .aviso-enter-active,
  .aviso-leave-active { transition: none; }
}
</style>
