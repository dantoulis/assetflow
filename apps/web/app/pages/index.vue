<template>
  <div>
    <h1>{{ data }}</h1>
  </div>
</template>

<script setup lang="ts">
const config = useRuntimeConfig();
const { data } = await useFetch('/', { baseURL: config.public.apiBase });
</script>
