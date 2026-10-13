<script setup>
import { ref, reactive, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { apiFetch } from '../lib/api'

const router = useRouter()

// os valores de "porte" precisam bater com o Literal do back (EmpresaIn)
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

const jaTemEmpresa = ref(false)
const carregando = ref(true)
const salvando = ref(false)
const erro = ref('')

const sessaoInvalida = (response) => response.status === 401 || response.status === 403

// Se a empresa já existe, carrega os dados para edição
onMounted(async () => {
  try {
    const response = await apiFetch('/api/empresa')

    if (sessaoInvalida(response)) {
      router.push('/login')
      return
    }

    if (response.ok) {
      const empresa = await response.json()
      if (empresa) {
        form.nome = empresa.nome
        form.setor = empresa.setor
        form.porte = empresa.porte
        form.num_funcionarios = empresa.num_funcionarios
        jaTemEmpresa.value = true
      }
    }
  } catch (e) {
    console.error('Erro ao buscar empresa:', e)
    erro.value = 'No se pudo conectar con el servidor.'
  } finally {
    carregando.value = false
  }
})

const guardar = async () => {
  erro.value = ''

  if (!form.nome.trim() || !form.setor || !form.porte || !form.num_funcionarios) {
    erro.value = 'Completa todos los campos.'
    return
  }
  if (form.num_funcionarios < 1) {
    erro.value = 'El número de empleados debe ser al menos 1.'
    return
  }

  salvando.value = true
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

    router.push('/diagnostico')
  } catch (e) {
    console.error('Erro ao salvar empresa:', e)
    erro.value = 'No se pudo conectar con el servidor.'
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <div class="max-w-xl mx-auto py-8 px-4">

    <div class="mb-8">
      <h1 class="text-3xl font-bold text-slate-800">Datos de tu empresa</h1>
      <p class="text-slate-500 mt-2">
        Necesitamos esta información para preparar el diagnóstico de sostenibilidad.
      </p>
    </div>

    <div v-if="carregando" class="flex justify-center items-center py-12">
      <div class="animate-spin rounded-full h-10 w-10 border-b-2 border-emerald-800"></div>
      <span class="ml-3 text-slate-500 font-medium">Cargando...</span>
    </div>

    <form v-else class="bg-white rounded-xl shadow-lg p-8 space-y-5" @submit.prevent="guardar">

      <div>
        <label for="nome" class="block text-sm font-medium text-slate-700 mb-1">Nombre de la empresa:</label>
        <input
          v-model="form.nome"
          type="text"
          id="nome"
          placeholder="Nombre de tu empresa"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
        >
      </div>

      <div>
        <label for="setor" class="block text-sm font-medium text-slate-700 mb-1">Sector:</label>
        <select
          v-model="form.setor"
          id="setor"
          class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
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
          class="w-full px-4 py-2 border border-gray-300 rounded-lg bg-white focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
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
          class="w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-emerald-700 focus:border-emerald-700 outline-none transition"
        >
      </div>

      <p v-if="erro" class="text-sm text-red-600">{{ erro }}</p>

      <div class="flex justify-end pt-2">
        <button
          type="submit"
          :disabled="salvando"
          class="bg-emerald-800 text-slate-200 px-6 py-3 rounded-lg font-bold hover:bg-emerald-950 disabled:opacity-60 transition shadow-lg cursor-pointer"
        >
          {{ salvando ? 'Guardando...' : (jaTemEmpresa ? 'Guardar cambios' : 'Guardar empresa') }}
        </button>
      </div>

    </form>
  </div>
</template>