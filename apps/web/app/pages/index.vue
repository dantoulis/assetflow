<template>
  <div>
    <h1 class="bg-red-500">{{ data }}</h1>
    <Button size="sm">Shadcn works</Button>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const { data } = await useFetch('/', { baseURL: config.public.apiBase });
</script>
