<script setup>
import { useRouter } from 'vue-router'
import { iniciarAuth } from './lib/auth'

const router = useRouter()

iniciarAuth()

</script>

<template>
  <router-view />
</template>
