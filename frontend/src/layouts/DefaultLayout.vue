<script setup>
import Sidebar from './Sidebar.vue';
import BackgroundWaves from '../ui/BackgroundWaves.vue';
</script>

<template>
    <div class="relative flex h-screen bg-emerald-900 p-4 gap-4 overflow-hidden">

    <BackgroundWaves class="absolute inset-0 pointer-events-none select-none -z-10"/>

    <Sidebar class="relative z-10"/>

    <main class="relative z-10 flex-1 h-full bg-slate-100 p-8 rounded-3xl shadow-2xl overflow-y-auto">
      <router-view />
    </main>
  </div>
</template>
