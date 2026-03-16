<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <Toaster position="top-right" :theme="toastTheme" rich-colors close-button />
  </div>
</template>

<script setup lang="ts">
const colorMode = useColorMode();

const toastTheme = computed(() => (colorMode.value === 'dark' ? 'dark' : 'light'));
</script>
