<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useEmpresaStore } from '../../stores/empresa'
import { focarPrimeiroErro } from '../../lib/validacao'
import Campo from '../ui/Campo.vue'
import Alerta from '../ui/Alerta.vue'

// Seção "Tu empresa" do Início (antiga tela "Mi empresa").
// Sem empresa: formulário aberto. Com empresa: resumo compacto + "Editar".
const emit = defineEmits(['cadastrada'])

// mesma lista aceita pelo back-end (routes/empresa.py)
const SETORES = ['Agricultura', 'Comercio', 'Construcción', 'Manufactura', 'Servicios', 'Tecnología', 'Turismo', 'Otro']
const PORTES = [
  { valor: 'micro', rotulo: 'Microempresa' },
  { valor: 'pequena', rotulo: 'Pequeña empresa' },
  { valor: 'mediana', rotulo: 'Mediana empresa' }
]

const VAZIO = { nome: '', setor: '', porte: '', num_funcionarios: null }
const form = reactive({ ...VAZIO })

const empresaStore = useEmpresaStore()
const empresa = computed(() => empresaStore.dado ?? null)

const editando = ref(false)
const salvando = ref(false)
const erro = ref('')
const mensagemSucesso = ref('')
// os erros dos campos só aparecem depois da primeira tentativa de enviar (igual ao login)
const tentou = ref(false)

const errosCampos = computed(() => ({
  nome: form.nome.trim().length < 2 ? 'Ingresa el nombre de la empresa (mínimo 2 caracteres).' : '',
  setor: !form.setor ? 'Selecciona un sector.' : '',
  porte: !form.porte ? 'Selecciona el tamaño de la empresa.' : '',
  num_funcionarios: !Number.isInteger(form.num_funcionarios) || form.num_funcionarios < 1
    ? 'Ingresa un número entero mayor que 0.'
    : ''
}))
const erroDe = (campo) => (tentou.value ? errosCampos.value[campo] : '')

const rotuloPorte = computed(() => PORTES.find((p) => p.valor === empresa.value?.porte)?.rotulo ?? empresa.value?.porte)

// sem empresa cadastrada: formulário já aberto
watch(empresa, (emp) => { if (emp === null) editando.value = true }, { immediate: true })

const iniciarEdicao = () => {
  erro.value = ''
  mensagemSucesso.value = ''
  tentou.value = false
  Object.assign(form, {
    nome: empresa.value.nome,
    setor: empresa.value.setor,
    porte: empresa.value.porte,
    num_funcionarios: empresa.value.num_funcionarios
  })
  editando.value = true
}

const cancelarEdicao = () => {
  erro.value = ''
  editando.value = false
}

const guardar = async () => {
  erro.value = ''
  mensagemSucesso.value = ''
  tentou.value = true
  if (Object.values(errosCampos.value).some(Boolean)) {
    focarPrimeiroErro(errosCampos.value)
    return
  }

  salvando.value = true
  const eraPrimeiroCadastro = !empresa.value
  try {
    await empresaStore.salvar({
      nome: form.nome.trim(),
      setor: form.setor,
      porte: form.porte,
      num_funcionarios: form.num_funcionarios
    })
    editando.value = false
    if (eraPrimeiroCadastro) {
      emit('cadastrada')
    } else {
      mensagemSucesso.value = 'Datos actualizados.'
      setTimeout(() => { mensagemSucesso.value = '' }, 3500)
    }
  } catch (e) {
    if (e?.status === 401) return // o apiFetch já leva ao login
    console.error('Erro ao salvar empresa:', e)
    erro.value = e?.status
      ? 'No fue posible guardar los datos de la empresa. Inténtalo de nuevo.'
      : 'No se pudo conectar con el servidor.'
  } finally {
    salvando.value = false
  }
}
</script>

<template>
  <section id="empresa" class="scroll-mt-6" aria-labelledby="titulo-empresa">
    <!-- resumo compacto -->
    <div v-if="empresa && !editando" class="cartao p-4 sm:p-5 flex items-center gap-4">
      <div class="w-12 h-12 rounded-xl bg-emerald-800 text-white flex items-center justify-center text-xl font-extrabold shrink-0" aria-hidden="true">
        {{ empresa.nome.charAt(0).toUpperCase() }}
      </div>
      <div class="min-w-0 flex-1">
        <p id="titulo-empresa" class="font-bold text-slate-800 truncate">{{ empresa.nome }}</p>
        <p class="text-sm text-slate-500 truncate">
          {{ empresa.setor }} · {{ rotuloPorte }} · {{ empresa.num_funcionarios }} empleados
        </p>
        <p v-if="mensagemSucesso" class="text-xs font-semibold text-emerald-700 mt-0.5" role="status">✓ {{ mensagemSucesso }}</p>
      </div>
      <button type="button" @click="iniciarEdicao" class="btn-secundario btn-compacto shrink-0">
        Editar
      </button>
    </div>

    <!-- criação / edição -->
    <form v-else class="cartao p-5 sm:p-8 space-y-5" novalidate @submit.prevent="guardar">
      <div>
        <h2 id="titulo-empresa" class="text-lg font-bold text-slate-800">
          {{ empresa ? 'Editar datos de la empresa' : 'Datos de tu empresa' }}
        </h2>
        <p v-if="!empresa" class="text-sm text-slate-500 mt-1">
          Con esta información preparamos el diagnóstico de sostenibilidad.
        </p>
      </div>

      <Campo id="nome" rotulo="Nombre de la empresa" :erro="erroDe('nome')">
        <template #default="{ invalido, descricao }">
          <input
            v-model="form.nome"
            type="text"
            id="nome"
            autocomplete="organization"
            maxlength="120"
            placeholder="Nombre de tu empresa"
            class="campo"
            :aria-invalid="invalido"
            :aria-describedby="descricao"
          >
        </template>
      </Campo>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Campo id="setor" rotulo="Sector" :erro="erroDe('setor')">
          <template #default="{ invalido, descricao }">
            <select v-model="form.setor" id="setor" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
              <option value="" disabled>Selecciona</option>
              <option v-for="setor in SETORES" :key="setor" :value="setor">{{ setor }}</option>
            </select>
          </template>
        </Campo>

        <Campo id="porte" rotulo="Tamaño" :erro="erroDe('porte')">
          <template #default="{ invalido, descricao }">
            <select v-model="form.porte" id="porte" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
              <option value="" disabled>Selecciona</option>
              <option v-for="porte in PORTES" :key="porte.valor" :value="porte.valor">{{ porte.rotulo }}</option>
            </select>
          </template>
        </Campo>

        <Campo id="num_funcionarios" rotulo="Empleados" :erro="erroDe('num_funcionarios')">
          <template #default="{ invalido, descricao }">
            <input
              v-model.number="form.num_funcionarios"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              id="num_funcionarios"
              placeholder="Ej.: 12"
              class="campo"
              :aria-invalid="invalido"
              :aria-describedby="descricao"
            >
          </template>
        </Campo>
      </div>

      <Alerta v-if="erro">{{ erro }}</Alerta>

      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button v-if="empresa" type="button" @click="cancelarEdicao" class="btn-secundario w-full sm:w-auto">
          Cancelar
        </button>
        <button type="submit" :disabled="salvando" :aria-busy="salvando" class="btn-primario w-full sm:w-auto">
          <span v-if="salvando" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true"></span>
          {{ salvando ? 'Guardando...' : (empresa ? 'Guardar cambios' : 'Registrar empresa') }}
        </button>
      </div>
    </form>
  </section>
</template>
