export const IDIOMAS = ['es', 'pt']
const CHAVE = 'idioma'

// ordem: escolha salva > idioma do navegador > espanhol (o app nasceu para o Chile)
export function idiomaInicial(salvo, navegador) {
  if (IDIOMAS.includes(salvo)) return salvo
  return String(navegador ?? '').toLowerCase().startsWith('pt') ? 'pt' : 'es'
}

export function lerIdiomaInicial() {
  let salvo = null
  try { salvo = localStorage.getItem(CHAVE) } catch { /* modo privado */ }
  return idiomaInicial(salvo, navigator.language)
}

export function aplicarIdioma(i18n, idioma) {
  i18n.global.locale.value = idioma
  document.documentElement.lang = idioma
  try { localStorage.setItem(CHAVE, idioma) } catch { /* modo privado */ }
}
