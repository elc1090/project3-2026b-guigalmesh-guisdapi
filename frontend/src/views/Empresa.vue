<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../lib/api'
import { sessaoInvalida } from '../lib/cache'
import { useEmpresaStore } from '../stores/empresa'

const router = useRouter()

const setores = [
  'Agricultura',
  'Comercio',
  'Construcción',
  'Manufactura',
  'Servicios',
  'Tecnología',
  'Turismo',
  'Otro'
]

const portes = [
  { valor: 'micro', rotulo: 'Microempresa' },
  { valor: 'pequena', rotulo: 'Pequeña empresa' },
  { valor: 'mediana', rotulo: 'Mediana empresa' }
]

const form = reactive({
  nome: '',
  setor: '',
  porte: '',
  num_funcionarios: null
})

const VAZIO = { nome: '', setor: '', porte: '', num_funcionarios: null }

const empresaStore = useEmpresaStore()
// dados salvos vêm direto do cache (atualizam sozinhos quando a store revalida)
const dadosSalvos = computed(() => empresaStore.dado || VAZIO)
const jaTemEmpresa = computed(() => !!empresaStore.dado)
// spinner só se nunca carregou a empresa (sem cache)
const carregando = computed(() => empresaStore.carregando)

const editando = ref(false)
const salvando = ref(false)
const erro = ref('')
const mensagemSucesso = ref('')

const rotuloPorte = computed(() => {
  const encontrado = portes.find((p) => p.valor === dadosSalvos.value.porte)
  return encontrado ? encontrado.rotulo : dadosSalvos.value.porte
})

const preencherFormulario = (empresa) => {
  form.nome = empresa.nome
  form.setor = empresa.setor
  form.porte = empresa.porte
  form.num_funcionarios = empresa.num_funcionarios
}

// sem empresa cadastrada: abre direto o formulário de criação
watch(() => empresaStore.dado, (empresa) => {
  if (empresa === null) editando.value = true
}, { immediate: true })

const iniciarEdicao = () => {
  erro.value = ''
  mensagemSucesso.value = ''
  preencherFormulario(dadosSalvos.value)
  editando.value = true
}

const cancelarEdicao = () => {
  erro.value = ''
  editando.value = false
}

onMounted(async () => {
  try {
    await empresaStore.carregar()
  } catch (e) {
    if (sessaoInvalida(e)) {
      router.push('/login')
      return
    }
    console.error('Erro ao buscar empresa:', e)
    if (empresaStore.dado === undefined) erro.value = 'No se pudo conectar con el servidor.'
  }
})

const guardar = async () => {
  erro.value = ''
  mensagemSucesso.value = ''

  if (!form.nome.trim() || !form.setor || !form.porte || !form.num_funcionarios) {
    erro.value = 'Completa todos los campos.'
    return
  }
  if (form.num_funcionarios < 1) {
    erro.value = 'El número de empleados debe ser al menos 1.'
    return
  }

  salvando.value = true
  const eraPrimeiroCadastro = !jaTemEmpresa.value

  try {
    const response = await apiFetch('/api/empresa', {
      method: jaTemEmpresa.value ? 'PUT' : 'POST',
      body: JSON.stringify({
        nome: form.nome.trim(),
        setor: form.setor,
        porte: form.porte,
        num_funcionarios: Number(form.num_funcionarios)
      })
    })

    if (sessaoInvalida(response)) {
      router.push('/login')
      return
    }
    if (!response.ok) {
      console.error('Erro do back-end:', await response.json().catch(() => null))
      erro.value = 'No fue posible guardar los datos de la empresa. Inténtalo de nuevo.'
      return
    }

    const empresaAtualizada = await response.json()
    empresaStore.definir(empresaAtualizada)
    editando.value = false

    if (eraPrimeiroCadastro) {
      router.push('/diagnostico')
    } else {
      mensagemSucesso.value = 'Datos de la empresa actualizados correctamente.'
      setTimeout(() => { mensagemSucesso.value = '' }, 3500)
    }
  } catch (e) {
    console.error('Erro ao salvar empresa:', e)
    erro.value = 'No se pudo conectar con el servidor.'
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="max-w-3xl mx-auto py-4 sm:py-8 px-1 sm:px-4">
    <div class="mb-8 flex flex-wrap items-center justify-between gap-4">
      <div>
        <h1 class="text-3xl font-bold text-slate-800">Mi empresa</h1>
        <p class="text-slate-500 mt-1">
          {{ jaTemEmpresa && !editando
            ? 'Información general registrada para tu organización.'
            : 'Necesitamos esta información para preparar el diagnóstico de sostenibilidad.' }}
        </p>
      </div>

      <button
        v-if="jaTemEmpresa && !editando"
        @click="iniciarEdicao"
        class="bg-white border border-slate-300 text-slate-700 hover:bg-slate-50 px-4 py-2.5 rounded-xl font-semibold text-sm transition shadow-xs cursor-pointer"
      >
        ✎ Editar datos
      </button>
    </div>

    <div v-if="carregando" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800"></div>
      <span class="ml-3 text-slate-500 font-medium">Cargando...</span>
    </div>

    <div v-else-if="jaTemEmpresa && !editando" class="space-y-6">
      <p
        v-if="mensagemSucesso"
        class="text-sm text-emerald-800 bg-emerald-50 border border-emerald-200 rounded-xl px-4 py-3 font-medium"
      >
        ✓ {{ mensagemSucesso }}
      </p>

      <div class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8">
        <div class="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div class="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-2xl font-extrabold shadow-sm">
            {{ dadosSalvos.nome.charAt(0).toUpperCase() }}
          </div>
          <div>
            <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Perfil activo
            </span>
            <h2 class="text-2xl font-bold text-slate-800 mt-1">{{ dadosSalvos.nome }}</h2>
          </div>
        </div>

        <div class="grid grid-cols-1 sm:grid-cols-3 gap-6 pt-6">
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p class="text-xs font-semibold uppercase text-slate-400">Sector</p>
            <p class="text-lg font-bold text-slate-800 mt-1">{{ dadosSalvos.setor }}</p>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p class="text-xs font-semibold uppercase text-slate-400">Tamaño</p>
            <p class="text-lg font-bold text-slate-800 mt-1">{{ rotuloPorte }}</p>
          </div>

          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <p class="text-xs font-semibold uppercase text-slate-400">Número de empleados</p>
            <p class="text-lg font-bold text-slate-800 mt-1">{{ dadosSalvos.num_funcionarios }}</p>
          </div>
        </div>
      </div>
    </div>

    <!-- MODO EDIÇÃO / CRIAÇÃO -->
    <form v-else class="bg-white rounded-2xl shadow-sm border border-slate-200 p-5 sm:p-8 space-y-5" @submit.prevent="guardar">
      <div>
        <label for="nome" class="block text-sm font-medium text-slate-700 mb-1">Nombre de la empresa:</label>
        <input
          v-model="form.nome"
          type="text"
          id="nome"
          placeholder="Nombre de tu empresa"
          class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
        >
      </div>

      <div>
        <label for="setor" class="block text-sm font-medium text-slate-700 mb-1">Sector:</label>
        <select
          v-model="form.setor"
          id="setor"
          class="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
        >
          <option value="" disabled>Selecciona un sector</option>
          <option v-for="setor in setores" :key="setor" :value="setor">{{ setor }}</option>
        </select>
      </div>

      <div>
        <label for="porte" class="block text-sm font-medium text-slate-700 mb-1">Tamaño:</label>
        <select
          v-model="form.porte"
          id="porte"
          class="w-full px-4 py-2.5 border border-slate-300 rounded-xl bg-white focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
        >
          <option value="" disabled>Selecciona el tamaño</option>
          <option v-for="porte in portes" :key="porte.valor" :value="porte.valor">{{ porte.rotulo }}</option>
        </select>
      </div>

      <div>
        <label for="num_funcionarios" class="block text-sm font-medium text-slate-700 mb-1">Número de empleados:</label>
        <input
          v-model.number="form.num_funcionarios"
          type="number"
          min="1"
          id="num_funcionarios"
          placeholder="Ej.: 12"
          class="w-full px-4 py-2.5 border border-slate-300 rounded-xl focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
        >
      </div>

      <p v-if="erro" class="text-sm text-red-600">{{ erro }}</p>

      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
        <button
          v-if="jaTemEmpresa"
          type="button"
          @click="cancelarEdicao"
          class="w-full sm:w-auto px-5 py-3 rounded-xl border border-slate-300 text-slate-700 font-semibold hover:bg-slate-50 transition cursor-pointer"
        >
          Cancelar
        </button>
        <button
          type="submit"
          :disabled="salvando"
          class="w-full sm:w-auto bg-emerald-800 text-white px-6 py-3 rounded-xl font-bold hover:bg-emerald-950 disabled:opacity-60 transition shadow-md cursor-pointer"
        >
          {{ salvando ? 'Guardando...' : (jaTemEmpresa ? 'Guardar cambios' : 'Registrar empresa') }}
        </button>
      </div>
    </form>
  </div>
</template>