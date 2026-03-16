<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'user',
  middleware: 'auth',
});

await navigateTo('/app/dashboard');
</script>
