import { createI18n } from 'vue-i18n'
import es from './es.json'
import pt from './pt.json'
import { lerIdiomaInicial, atualizarDocumento } from './idioma'

const inicial = lerIdiomaInicial()

export const i18n = createI18n({
  legacy: false,
  locale: inicial,
  fallbackLocale: 'es',
  messages: { es, pt }
})

atualizarDocumento(i18n, inicial)
