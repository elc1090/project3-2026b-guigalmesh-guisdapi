import { ref } from 'vue'

// true enquanto uma troca de tela está esperando (guard consultando a empresa, download da tela).
// Fica num módulo próprio para o AvisoServidor não importar o router inteiro.
export const navegando = ref(false)
