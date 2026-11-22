<script setup>
import { reactive, ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import Campo from '../ui/Campo.vue'
import Alerta from '../ui/Alerta.vue'
import Icone from '../ui/Icone.vue'
import { useActividadesStore } from '../../stores/actividades'
import { TIPOS_ACTIVIDAD } from '../../constants/huella'
import { ICONE_FECHAR } from '../../constants/icones'

// Janela para criar ou editar uma atividade. "inicial" pode vir preenchido pela tela
// (ex.: "Planificar actividad" de uma data ambiental). Com "inicial.id" edita; sem, cria.
const props = defineProps({
  inicial: { type: Object, default: () => ({}) },
  // título da janela; sem ele: "Editar actividad" ou "Nueva actividad"
  titulo: { type: String, default: '' }
})
const emit = defineEmits(['fechar', 'salvo'])

const store = useActividadesStore()
const editando = computed(() => !!props.inicial.id)

const form = reactive({
  tipo: props.inicial.tipo ?? '',
  titulo: props.inicial.titulo ?? '',
  fecha: props.inicial.fecha ?? '',
  lugar: props.inicial.lugar ?? '',
  estado: props.inicial.estado ?? 'planificada',
  participantes: props.inicial.participantes ?? 0,
  horas_voluntariado: Number(props.inicial.horas_voluntariado ?? 0),
  kg_residuos: Number(props.inicial.kg_residuos ?? 0),
  arboles_plantados: props.inicial.arboles_plantados ?? 0,
  espacio_recuperado: props.inicial.espacio_recuperado ?? '',
  notas: props.inicial.notas ?? ''
})

const tentou = ref(false)
const salvando = ref(false)
const erroServidor = ref('')

const naoNegativo = (v) => v === '' || v === null || (Number.isFinite(Number(v)) && Number(v) >= 0)
const erros = computed(() => {
  if (!tentou.value) return {}
  return {
    tipo: form.tipo ? '' : 'Selecciona el tipo de actividad.',
    titulo: form.titulo.trim().length >= 2 ? '' : 'Escribe un nombre para la actividad.',
    fecha: form.fecha ? '' : 'Selecciona la fecha.',
    participantes: Number.isInteger(Number(form.participantes)) && naoNegativo(form.participantes) ? '' : 'Ingresa un número entero igual o mayor que 0.',
    horas_voluntariado: naoNegativo(form.horas_voluntariado) ? '' : 'Ingresa un número igual o mayor que 0.',
    kg_residuos: naoNegativo(form.kg_residuos) ? '' : 'Ingresa un número igual o mayor que 0.',
    arboles_plantados: Number.isInteger(Number(form.arboles_plantados)) && naoNegativo(form.arboles_plantados) ? '' : 'Ingresa un número entero igual o mayor que 0.'
  }
})
const temErro = computed(() => Object.values(erros.value).some(Boolean))

async function salvar() {
  tentou.value = true
  erroServidor.value = ''
  if (temErro.value) return
  const realizada = form.estado === 'realizada'
  // planejada: resultados zerados (só contam depois de realizada)
  const dados = {
    tipo: form.tipo,
    titulo: form.titulo.trim(),
    fecha: form.fecha,
    lugar: form.lugar.trim() || null,
    estado: form.estado,
    participantes: realizada ? Number(form.participantes || 0) : 0,
    horas_voluntariado: realizada ? Number(form.horas_voluntariado || 0) : 0,
    kg_residuos: realizada ? Number(form.kg_residuos || 0) : 0,
    arboles_plantados: realizada ? Number(form.arboles_plantados || 0) : 0,
    espacio_recuperado: realizada ? form.espacio_recuperado.trim() || null : null,
    notas: form.notas.trim() || null
  }
  salvando.value = true
  try {
    if (editando.value) await store.atualizar(props.inicial.id, dados)
    else await store.criar(dados)
    emit('salvo', dados)
  } catch (e) {
    if (e?.status === 401) return // o apiFetch já leva ao login
    erroServidor.value = e?.status === 422
      ? 'Revisa los datos ingresados.'
      : 'No se pudo guardar la actividad. Inténtalo de nuevo.'
  } finally {
    salvando.value = false
  }
}

// fecha com Esc; foco no primeiro campo ao abrir
const janela = ref(null)
const aoTeclar = (e) => { if (e.key === 'Escape' && !salvando.value) emit('fechar') }
onMounted(async () => {
  window.addEventListener('keydown', aoTeclar)
  await nextTick()
  janela.value?.querySelector('select, input')?.focus()
})
onBeforeUnmount(() => window.removeEventListener('keydown', aoTeclar))
</script>

<template>
  <Teleport to="body">
    <div class="fixed inset-0 z-50 flex items-end sm:items-center justify-center bg-emerald-950/40 backdrop-blur-sm p-0 sm:p-4" @click.self="!salvando && emit('fechar')">
      <div
        ref="janela"
        role="dialog"
        aria-modal="true"
        aria-labelledby="titulo-form-actividad"
        class="w-full sm:max-w-2xl max-h-[92dvh] overflow-y-auto bg-white rounded-t-3xl sm:rounded-2xl shadow-2xl p-5 sm:p-7"
      >
        <div class="flex items-start justify-between gap-4 mb-5">
          <div>
            <p class="text-xs font-bold uppercase tracking-wider text-emerald-700">Huella positiva</p>
            <h2 id="titulo-form-actividad" class="text-xl font-bold text-slate-800">
              {{ titulo || (editando ? 'Editar actividad' : 'Nueva actividad') }}
            </h2>
          </div>
          <button type="button" class="p-2 -m-2 rounded-full text-slate-500 hover:bg-slate-100 cursor-pointer" aria-label="Cerrar" @click="emit('fechar')">
            <Icone :d="ICONE_FECHAR" class="w-5 h-5" />
          </button>
        </div>

        <form class="space-y-4" novalidate @submit.prevent="salvar">
          <div class="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <Campo id="act-tipo" rotulo="Tipo de actividad" :erro="erros.tipo">
              <template #default="{ invalido, descricao }">
                <select id="act-tipo" v-model="form.tipo" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
                  <option value="" disabled>Selecciona…</option>
                  <option v-for="t in TIPOS_ACTIVIDAD" :key="t.id" :value="t.id">{{ t.nombre }}</option>
                </select>
              </template>
            </Campo>
            <Campo id="act-fecha" rotulo="Fecha" :erro="erros.fecha">
              <template #default="{ invalido, descricao }">
                <input id="act-fecha" v-model="form.fecha" type="date" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
              </template>
            </Campo>
          </div>

          <Campo id="act-titulo" rotulo="Nombre de la actividad" :erro="erros.titulo">
            <template #default="{ invalido, descricao }">
              <input id="act-titulo" v-model="form.titulo" maxlength="120" class="campo" placeholder="Ej.: Limpieza de la playa La Herradura" :aria-invalid="invalido" :aria-describedby="descricao">
            </template>
          </Campo>

          <Campo id="act-lugar" rotulo="Lugar (opcional)">
            <template #default>
              <input id="act-lugar" v-model="form.lugar" maxlength="160" class="campo" placeholder="Ej.: Playa La Herradura, Coquimbo">
            </template>
          </Campo>

          <fieldset>
            <legend class="rotulo">Estado</legend>
            <div class="grid grid-cols-2 gap-2">
              <label
                v-for="op in [{ v: 'planificada', t: 'Planificada' }, { v: 'realizada', t: 'Realizada' }]"
                :key="op.v"
                class="flex items-center justify-center gap-2 px-4 py-2.5 rounded-xl border text-sm font-semibold cursor-pointer transition"
                :class="form.estado === op.v ? 'bg-emerald-800 border-emerald-800 text-white' : 'bg-white border-slate-300 text-slate-700 hover:bg-slate-50'"
              >
                <input v-model="form.estado" type="radio" name="act-estado" :value="op.v" class="sr-only">
                {{ op.t }}
              </label>
            </div>
          </fieldset>

          <!-- resultados: só para atividade realizada -->
          <div v-if="form.estado === 'realizada'" class="bg-emerald-50/60 border border-emerald-100 rounded-2xl p-4 space-y-4">
            <p class="text-sm font-semibold text-emerald-900">Resultados de la actividad</p>
            <div class="grid grid-cols-2 gap-4">
              <Campo id="act-participantes" rotulo="Participantes" :erro="erros.participantes">
                <template #default="{ invalido, descricao }">
                  <input id="act-participantes" v-model.number="form.participantes" type="number" min="0" step="1" inputmode="numeric" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
                </template>
              </Campo>
              <Campo id="act-horas" rotulo="Horas de voluntariado (total)" :erro="erros.horas_voluntariado">
                <template #default="{ invalido, descricao }">
                  <input id="act-horas" v-model.number="form.horas_voluntariado" type="number" min="0" step="0.5" inputmode="decimal" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
                </template>
              </Campo>
              <Campo id="act-kg" rotulo="Kg de residuos recolectados" :erro="erros.kg_residuos">
                <template #default="{ invalido, descricao }">
                  <input id="act-kg" v-model.number="form.kg_residuos" type="number" min="0" step="0.1" inputmode="decimal" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
                </template>
              </Campo>
              <Campo id="act-arboles" rotulo="Árboles nativos plantados" :erro="erros.arboles_plantados">
                <template #default="{ invalido, descricao }">
                  <input id="act-arboles" v-model.number="form.arboles_plantados" type="number" min="0" step="1" inputmode="numeric" class="campo" :aria-invalid="invalido" :aria-describedby="descricao">
                </template>
              </Campo>
            </div>
            <Campo id="act-espacio" rotulo="Espacio natural recuperado (opcional)">
              <template #default>
                <input id="act-espacio" v-model="form.espacio_recuperado" maxlength="160" class="campo" placeholder="Ej.: Plaza del barrio, 200 m de ribera del río">
              </template>
            </Campo>
          </div>

          <Campo id="act-notas" rotulo="Notas (opcional)">
            <template #default>
              <textarea id="act-notas" v-model="form.notas" rows="3" maxlength="1000" class="campo resize-y" placeholder="Detalles, punto de encuentro, horario…"></textarea>
            </template>
          </Campo>

          <Alerta v-if="erroServidor">{{ erroServidor }}</Alerta>

          <div class="flex flex-col-reverse sm:flex-row sm:justify-end gap-2 pt-1">
            <button type="button" class="btn-secundario btn-compacto" :disabled="salvando" @click="emit('fechar')">Cancelar</button>
            <button type="submit" class="btn-primario btn-compacto" :disabled="salvando">
              {{ salvando ? 'Guardando…' : editando ? 'Guardar cambios' : 'Guardar actividad' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  </Teleport>
</template>
