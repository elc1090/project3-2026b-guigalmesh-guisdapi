<script setup>
import { useRouter } from 'vue-router'
import { sessao, iniciarAuth, sair } from './lib/auth'

const router = useRouter()

iniciarAuth()

const sairDaConta = async () => {
  await sair()
  router.push('/login')
}
</script>

<template>
  <nav class="p-4 bg-gray-200 flex items-center gap-4">
    <template v-if="sessao">
      <router-link to="/diagnostico" class="text-blue-600">Diagnóstico</router-link>
      <span class="ml-auto text-sm text-gray-700">{{ sessao.user.email }}</span>
      <button @click="sairDaConta" class="text-blue-600 hover:underline">Cerrar sesión</button>
    </template>

    <template v-else>
      <router-link to="/login" class="text-blue-600">Iniciar sesión</router-link>
      <router-link to="/cadastro" class="text-blue-600">Registrarse</router-link>
    </template>
  </nav>

  <router-view></router-view>
</template>