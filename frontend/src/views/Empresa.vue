<script setup>
import { ref, reactive, computed, watch, onMounted } from 'vue'
import { useRouter } from 'vue-router'
import { useEmpresaStore } from '../stores/empresa'
import { focarPrimeiroErro } from '../lib/validacao'
import Pagina from '../components/ui/Pagina.vue'
import Campo from '../components/ui/Campo.vue'
import Alerta from '../components/ui/Alerta.vue'
import Esqueleto from '../components/ui/Esqueleto.vue'
import { ICONE_EMPRESA } from '../constants/icones'

const router = useRouter()

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
// dados salvos vêm direto do cache (atualizam sozinhos quando a store revalida)
const dadosSalvos = computed(() => empresaStore.dado || VAZIO)
const jaTemEmpresa = computed(() => !!empresaStore.dado)
// esqueleto só se nunca carregou a empresa (sem cache)
const carregando = computed(() => empresaStore.carregando)

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

const rotuloPorte = computed(() => PORTES.find((p) => p.valor === dadosSalvos.value.porte)?.rotulo ?? dadosSalvos.value.porte)

// sem empresa cadastrada: abre direto o formulário de criação
watch(() => empresaStore.dado, (empresa) => {
  if (empresa === null) editando.value = true
}, { immediate: true })

const iniciarEdicao = () => {
  erro.value = ''
  mensagemSucesso.value = ''
  tentou.value = false
  Object.assign(form, {
    nome: dadosSalvos.value.nome,
    setor: dadosSalvos.value.setor,
    porte: dadosSalvos.value.porte,
    num_funcionarios: dadosSalvos.value.num_funcionarios
  })
  editando.value = true
}

const cancelarEdicao = () => {
  erro.value = ''
  editando.value = false
}

onMounted(() => {
  empresaStore.carregar().catch((e) => {
    // 401/403 já levam ao login pelo apiFetch
    console.error('Erro ao buscar empresa:', e)
    if (empresaStore.dado === undefined) erro.value = 'No se pudo conectar con el servidor.'
  })
})

const guardar = async () => {
  erro.value = ''
  mensagemSucesso.value = ''
  tentou.value = true
  if (Object.values(errosCampos.value).some(Boolean)) {
    focarPrimeiroErro(errosCampos.value)
    return
  }

  salvando.value = true
  const eraPrimeiroCadastro = !jaTemEmpresa.value
  try {
    await empresaStore.salvar({
      nome: form.nome.trim(),
      setor: form.setor,
      porte: form.porte,
      num_funcionarios: form.num_funcionarios
    })
    editando.value = false

    if (eraPrimeiroCadastro) {
      router.push('/diagnostico')
    } else {
      mensagemSucesso.value = 'Datos de la empresa actualizados correctamente.'
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
  <Pagina
    largura="estreita"
    :icone="ICONE_EMPRESA"
    titulo="Mi empresa"
    :subtitulo="jaTemEmpresa && !editando
      ? 'Información general registrada para tu organización.'
      : 'Necesitamos esta información para preparar el diagnóstico de sostenibilidad.'"
  >
    <template v-if="jaTemEmpresa && !editando" #lateral>
      <button type="button" @click="iniciarEdicao" class="btn-secundario btn-compacto">
        ✎ Editar datos
      </button>
    </template>

    <div v-if="carregando" class="cartao p-5 sm:p-8 space-y-5" aria-busy="true">
      <div v-for="n in 4" :key="n" class="space-y-2">
        <Esqueleto class="h-4 w-32" />
        <Esqueleto class="h-11 w-full" />
      </div>
      <span class="sr-only" role="status">Cargando...</span>
    </div>

    <div v-else-if="jaTemEmpresa && !editando" class="space-y-6">
      <Alerta v-if="mensagemSucesso" tipo="sucesso" class="font-medium">✓ {{ mensagemSucesso }}</Alerta>

      <div class="cartao p-5 sm:p-8">
        <div class="flex items-center gap-4 pb-6 border-b border-slate-100">
          <div class="w-14 h-14 rounded-2xl bg-emerald-800 text-white flex items-center justify-center text-2xl font-extrabold shadow-sm shrink-0">
            {{ dadosSalvos.nome.charAt(0).toUpperCase() }}
          </div>
          <div class="min-w-0">
            <span class="text-xs font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-100 text-emerald-800">
              Perfil activo
            </span>
            <h2 class="text-xl sm:text-2xl font-bold text-slate-800 mt-1 break-words">{{ dadosSalvos.nome }}</h2>
          </div>
        </div>

        <dl class="grid grid-cols-1 sm:grid-cols-3 gap-4 sm:gap-6 pt-6">
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <dt class="text-xs font-semibold uppercase text-slate-500">Sector</dt>
            <dd class="text-lg font-bold text-slate-800 mt-1">{{ dadosSalvos.setor }}</dd>
          </div>
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <dt class="text-xs font-semibold uppercase text-slate-500">Tamaño</dt>
            <dd class="text-lg font-bold text-slate-800 mt-1">{{ rotuloPorte }}</dd>
          </div>
          <div class="bg-slate-50 p-4 rounded-xl border border-slate-100">
            <dt class="text-xs font-semibold uppercase text-slate-500">Número de empleados</dt>
            <dd class="text-lg font-bold text-slate-800 mt-1">{{ dadosSalvos.num_funcionarios }}</dd>
          </div>
        </dl>
      </div>
    </div>

    <!-- modo edição / criação -->
    <form v-else class="cartao p-5 sm:p-8 space-y-5" novalidate @submit.prevent="guardar">
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

      <div class="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <Campo id="setor" rotulo="Sector" :erro="erroDe('setor')">
          <template #default="{ invalido, descricao }">
            <select v-model="form.setor" id="setor" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
              <option value="" disabled>Selecciona un sector</option>
              <option v-for="setor in SETORES" :key="setor" :value="setor">{{ setor }}</option>
            </select>
          </template>
        </Campo>

        <Campo id="porte" rotulo="Tamaño" :erro="erroDe('porte')">
          <template #default="{ invalido, descricao }">
            <select v-model="form.porte" id="porte" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
              <option value="" disabled>Selecciona el tamaño</option>
              <option v-for="porte in PORTES" :key="porte.valor" :value="porte.valor">{{ porte.rotulo }}</option>
            </select>
          </template>
        </Campo>
      </div>

      <Campo id="num_funcionarios" rotulo="Número de empleados" :erro="erroDe('num_funcionarios')">
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

      <Alerta v-if="erro">{{ erro }}</Alerta>

      <div class="flex flex-col-reverse sm:flex-row justify-end gap-3 pt-2">
        <button v-if="jaTemEmpresa" type="button" @click="cancelarEdicao" class="btn-secundario w-full sm:w-auto">
          Cancelar
        </button>
        <button type="submit" :disabled="salvando" :aria-busy="salvando" class="btn-primario w-full sm:w-auto">
          <span v-if="salvando" class="w-4 h-4 rounded-full border-2 border-white/40 border-t-white animate-spin" aria-hidden="true"></span>
          {{ salvando ? 'Guardando...' : (jaTemEmpresa ? 'Guardar cambios' : 'Registrar empresa') }}
        </button>
      </div>
    </form>
  </Pagina>
</template>
