import { tipoPorId } from '../constants/huella'
import { dataLocal } from './fechasAmbientales'

// Texto pronto para convidar os trabalhadores (WhatsApp, e-mail…), em espanhol.
export function textoInvitacion(actividad, nombreEmpresa = '') {
  const tipo = tipoPorId(actividad.tipo)
  const data = dataLocal(actividad.fecha)
  const fecha = data
    ? data.toLocaleDateString('es-CL', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const linhas = [
    '¡Hola, equipo! 🌱',
    '',
    `${nombreEmpresa ? `En ${nombreEmpresa} ` : ''}queremos dejar una huella positiva y te invitamos a participar en:`,
    `*${actividad.titulo}* (${tipo.nombre.toLowerCase()})`,
    '',
    `📅 ${fecha}`,
    `📍 ${actividad.lugar || 'Lugar por confirmar'}`
  ]
  if (tipo.llevar.length) linhas.push(`🎒 Qué llevar: ${tipo.llevar.join(', ')}.`)
  if (actividad.notas) linhas.push('', actividad.notas)
  linhas.push(
    '',
    'Pueden participar también tus familiares. ¡Tu participación hace la diferencia!',
    'Confirma tu asistencia respondiendo este mensaje.'
  )
  return linhas.join('\n')
}
