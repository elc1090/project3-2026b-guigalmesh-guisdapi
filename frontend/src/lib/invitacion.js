import { tipoPorId } from '../constants/huella'
import { dataLocal } from './fechasAmbientales'
import { i18n } from '../i18n'
import { localeData } from '../i18n/rotulos'

// Texto pronto para convidar os trabalhadores (WhatsApp, e-mail…), no idioma escolhido.
export function textoInvitacion(actividad, nombreEmpresa = '') {
  const t = i18n.global.t
  const tipo = tipoPorId(actividad.tipo)
  const data = dataLocal(actividad.fecha)
  const fecha = data
    ? data.toLocaleDateString(localeData(), { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : ''

  const linhas = [
    t('huella.invitacion.hola'),
    '',
    nombreEmpresa ? t('huella.invitacion.enEmpresa', { empresa: nombreEmpresa }) : t('huella.invitacion.sinEmpresa'),
    `*${actividad.titulo}* (${tipo.nombre.toLowerCase()})`,
    '',
    `📅 ${fecha}`,
    `📍 ${actividad.lugar || t('huella.invitacion.porConfirmar')}`
  ]
  if (tipo.llevar.length) linhas.push(t('huella.invitacion.llevar', { lista: tipo.llevar.join(', ') }))
  if (actividad.notas) linhas.push('', actividad.notas)
  linhas.push(
    '',
    t('huella.invitacion.familia'),
    t('huella.invitacion.confirma')
  )
  return linhas.join('\n')
}
