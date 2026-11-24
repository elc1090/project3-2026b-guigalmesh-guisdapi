<script setup>
import { useI18n } from 'vue-i18n'
import { i18n } from '../../i18n'
import { IDIOMAS, aplicarIdioma } from '../../i18n/idioma'

defineProps({
  // escuro: sobre o fundo verde (sidebar, login); claro: sobre fundo branco
  escuro: { type: Boolean, default: false }
})

const { locale, t } = useI18n()
</script>

<template>
  <div
    role="group"
    :aria-label="t('comum.idioma')"
    class="inline-flex p-0.5 rounded-full text-xs font-semibold"
    :class="escuro ? 'bg-white/10 border border-white/15' : 'bg-slate-100 border border-slate-200'"
  >
    <button
      v-for="idioma in IDIOMAS"
      :key="idioma"
      type="button"
      @click="aplicarIdioma(i18n, idioma)"
      :aria-pressed="locale === idioma"
      class="px-3 py-1 rounded-full uppercase transition cursor-pointer"
      :class="locale === idioma
        ? (escuro ? 'bg-white text-emerald-900' : 'bg-white text-emerald-800 shadow-sm')
        : (escuro ? 'text-emerald-100/80 hover:text-white' : 'text-slate-500 hover:text-slate-700')"
    >
      {{ idioma }}
    </button>
  </div>
</template>
