import { ref } from 'vue'

// Fica num módulo próprio (sem imports) para evitar dependência circular entre
// auth.js -> useDiagnostico.js -> api.js -> auth.js
export const sessao = ref(null)
