<template>
  <div />
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'user',
});

useHead({
  title: 'Profile',
});

await navigateTo('/app/account');
</script>
