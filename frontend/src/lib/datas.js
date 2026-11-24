import { localeData } from '../i18n/rotulos'

// Datas no idioma escolhido (es-CL ou pt-BR).

const valida = (iso) => {
  const data = iso ? new Date(iso) : null
  return data && !Number.isNaN(data.getTime()) ? data : null
}

// "22 de noviembre de 2026"
export function formatarData(iso) {
  const data = valida(iso)
  return data ? data.toLocaleDateString(localeData(), { day: 'numeric', month: 'long', year: 'numeric' }) : ''
}

// "22 nov" (eixo do gráfico)
export function formatarDataCurta(iso) {
  const data = valida(iso)
  return data ? data.toLocaleDateString(localeData(), { day: 'numeric', month: 'short' }) : ''
}

// "22 nov, 14:30" (quando há dois diagnósticos no mesmo dia)
export function formatarDataHora(iso) {
  const data = valida(iso)
  if (!data) return ''
  const hora = data.toLocaleTimeString(localeData(), { hour: '2-digit', minute: '2-digit' })
  return `${formatarDataCurta(iso)}, ${hora}`
}
