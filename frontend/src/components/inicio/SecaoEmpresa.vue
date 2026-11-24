<script setup>
import { ref, reactive, computed, watch } from 'vue'
import { useI18n } from 'vue-i18n'
import { useEmpresaStore } from '../../stores/empresa'
import { focarPrimeiroErro } from '../../lib/validacao'
import Campo from '../ui/Campo.vue'
import Alerta from '../ui/Alerta.vue'
import { rotuloSetor, rotuloPorte } from '../../i18n/rotulos'

// Seção "Tu empresa" do Início (antiga tela "Mi empresa").
// Sem empresa: formulário aberto. Com empresa: resumo compacto + "Editar".
const emit = defineEmits(['cadastrada'])
const { t } = useI18n()

// mesma lista aceita pelo back-end (routes/empresa.py); o valor salvo continua em espanhol
const SETORES = ['Agricultura', 'Comercio', 'Construcción', 'Manufactura', 'Servicios', 'Tecnología', 'Turismo', 'Otro']
const PORTES = ['micro', 'pequena', 'mediana']

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
  nome: form.nome.trim().length < 2 ? 'secaoEmpresa.erros.nombre' : '',
  setor: !form.setor ? 'secaoEmpresa.erros.sector' : '',
  porte: !form.porte ? 'secaoEmpresa.erros.tamano' : '',
  num_funcionarios: !Number.isInteger(form.num_funcionarios) || form.num_funcionarios < 1
    ? 'secaoEmpresa.erros.empleados'
    : ''
}))
const erroDe = (campo) => (tentou.value ? errosCampos.value[campo] : '')

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
      mensagemSucesso.value = 'secaoEmpresa.actualizados'
      setTimeout(() => { mensagemSucesso.value = '' }, 3500)
    }
  } catch (e) {
    if (e?.status === 401) return // o apiFetch já leva ao login
    console.error('Erro ao salvar empresa:', e)
    erro.value = e?.status
      ? 'secaoEmpresa.erroGuardar'
      : 'comum.conexion'
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
        <!-- quebra em linhas no celular em vez de cortar o porte e o número de funcionários -->
        <p class="text-sm text-slate-500 flex flex-wrap gap-x-1.5">
          <span>{{ rotuloSetor(empresa.setor) }} ·</span>
          <span>{{ rotuloPorte(empresa.porte) }} ·</span>
          <span>{{ t('secaoEmpresa.empleados', { n: empresa.num_funcionarios }) }}</span>
        </p>
        <p v-if="mensagemSucesso" class="text-xs font-semibold text-emerald-700 mt-0.5" role="status">✓ {{ t(mensagemSucesso) }}</p>
      </div>
      <button type="button" @click="iniciarEdicao" class="btn-secundario btn-compacto shrink-0">
        {{ t('comum.editar') }}
      </button>
    </div>

    <!-- criação / edição -->
    <form v-else class="cartao p-5 sm:p-8 space-y-5" novalidate @submit.prevent="guardar">
      <div>
        <h2 id="titulo-empresa" class="text-lg font-bold text-slate-800">
          {{ empresa ? t('secaoEmpresa.editarTitulo') : t('secaoEmpresa.titulo') }}
        </h2>
        <p v-if="!empresa" class="text-sm text-slate-500 mt-1">
          {{ t('secaoEmpresa.texto') }}
        </p>
      </div>

      <Campo id="nome" :rotulo="t('secaoEmpresa.nombre')" :erro="erroDe('nome') && t(erroDe('nome'))">
        <template #default="{ invalido, descricao }">
          <input
            v-model="form.nome"
            type="text"
            id="nome"
            autocomplete="organization"
            maxlength="120"
            :placeholder="t('secaoEmpresa.placeholderNombre')"
            class="campo"
            :aria-invalid="invalido"
            :aria-describedby="descricao"
          >
        </template>
      </Campo>

      <div class="grid grid-cols-1 sm:grid-cols-3 gap-5">
        <Campo id="setor" :rotulo="t('secaoEmpresa.sector')" :erro="erroDe('setor') && t(erroDe('setor'))">
          <template #default="{ invalido, descricao }">
            <select v-model="form.setor" id="setor" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
              <option value="" disabled>{{ t('comum.selecciona') }}</option>
              <option v-for="setor in SETORES" :key="setor" :value="setor">{{ rotuloSetor(setor) }}</option>
            </select>
          </template>
        </Campo>

        <Campo id="porte" :rotulo="t('secaoEmpresa.tamano')" :erro="erroDe('porte') && t(erroDe('porte'))">
          <template #default="{ invalido, descricao }">
            <select v-model="form.porte" id="porte" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
              <option value="" disabled>{{ t('comum.selecciona') }}</option>
              <option v-for="porte in PORTES" :key="porte" :value="porte">{{ rotuloPorte(porte) }}</option>
            </select>
          </template>
        </Campo>

        <Campo id="num_funcionarios" :rotulo="t('secaoEmpresa.empleadosRotulo')" :erro="erroDe('num_funcionarios') && t(erroDe('num_funcionarios'))">
          <template #default="{ invalido, descricao }">
            <input
              v-model.number="form.num_funcionarios"
              type="number"
              inputmode="numeric"
              min="1"
              step="1"
              id="num_funcionarios"
              :placeholder="t('secaoEmpresa.placeholderEmpleados')"
              class="campo"
              :aria-invalid="invalido"
              :aria-describedby="descricao"
            >
          </template>
        </Campo>
      </div>

      <Alerta v-if="erro">{{ t(erro) }}</Alerta>

      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3">
        <button v-if="empresa" type="button" @click="cancelarEdicao" class="btn-secundario w-full sm:w-auto">
          {{ t('comum.cancelar') }}
        </button>
        <button type="submit" :disabled="salvando" :aria-busy="salvando" class="btn-primario w-full sm:w-auto">
          <span v-if="salvando" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true"></span>
          {{ salvando ? t('comum.guardando') : (empresa ? t('secaoEmpresa.guardarCambios') : t('secaoEmpresa.registrar')) }}
        </button>
      </div>
    </form>
  </section>
</template>
