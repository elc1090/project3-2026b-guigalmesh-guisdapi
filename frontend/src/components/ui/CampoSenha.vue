<script setup>
import { ref } from 'vue'
import Icone from './Icone.vue'
import { ICONE_OLHO, ICONE_OLHO_FECHADO } from '../../constants/icones'

// atributos (id, autocomplete, aria-*) vão para o <input>, não para a div
defineOptions({ inheritAttrs: false })
const senha = defineModel({ type: String, default: '' })
const visivel = ref(false)
</script>

<template>
  <div class="relative">
    <input v-bind="$attrs" v-model="senha" :type="visivel ? 'text' : 'password'" class="campo !pr-12" />
    <button
      type="button"
      @click="visivel = !visivel"
      class="absolute inset-y-0 right-0 px-3.5 flex items-center rounded-r-xl text-slate-400 hover:text-slate-600 transition cursor-pointer"
      :aria-label="visivel ? 'Ocultar contraseña' : 'Mostrar contraseña'"
      :aria-pressed="visivel"
    >
      <Icone :d="visivel ? ICONE_OLHO_FECHADO : ICONE_OLHO" class="w-5 h-5" />
    </button>
  </div>
</template>
