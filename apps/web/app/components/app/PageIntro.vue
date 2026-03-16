<template>
  <div class="flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
    <div class="max-w-3xl space-y-3">
      <p v-if="eyebrow" class="text-xs font-semibold uppercase tracking-[0.24em] text-primary">
        {{ eyebrow }}
      </p>
      <div class="space-y-2">
        <h1 class="text-3xl font-semibold tracking-[-0.04em] text-balance md:text-4xl">
          {{ title }}
        </h1>
        <p class="max-w-2xl text-sm leading-6 text-muted-foreground md:text-base">
          {{ description }}
        </p>
      </div>
    </div>
    <div v-if="$slots.actions" class="flex flex-wrap items-center gap-3">
      <slot name="actions" />
    </div>
  </div>
</template>

<script setup lang="ts">
defineProps<{
  eyebrow?: string;
  title: string;
  description: string;
}>();
</script>
