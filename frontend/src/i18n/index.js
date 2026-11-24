import { createI18n } from 'vue-i18n'
import es from './es.json'
import pt from './pt.json'
import { lerIdiomaInicial } from './idioma'

const inicial = lerIdiomaInicial()
document.documentElement.lang = inicial

export const i18n = createI18n({
  legacy: false,
  locale: inicial,
  fallbackLocale: 'es',
  messages: { es, pt }
})
