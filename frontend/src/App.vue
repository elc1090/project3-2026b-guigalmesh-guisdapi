<script setup>

</script>

<template>
  <nav class="p-4 bg-gray-200 flex gap-4">
    <router-link to="/cadastro" class="text-blue-600">Cadastro</router-link>
    <router-link to="/diagnostico" class="text-blue-600">Diagnóstico</router-link>
  </nav>

  <router-view></router-view>
</template>
