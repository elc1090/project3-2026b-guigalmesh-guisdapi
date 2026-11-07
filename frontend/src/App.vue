<script setup>
import { iniciarAuth } from './lib/auth'
import AvisoServidor from './components/ui/AvisoServidor.vue'

iniciarAuth()
</script>

<template>
  <router-view />
  <AvisoServidor />
</template>
