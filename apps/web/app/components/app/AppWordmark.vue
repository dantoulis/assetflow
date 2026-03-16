<template>
  <NuxtLink :to="destination" class="group inline-flex items-center gap-3">
    <div
      class="relative flex size-11 items-center justify-center overflow-hidden rounded-2xl border border-white/15 bg-[linear-gradient(135deg,var(--color-primary),var(--color-chart-2))] shadow-[0_18px_45px_-20px_var(--color-primary)]"
    >
      <div class="absolute inset-[1px] rounded-[calc(theme(borderRadius.2xl)-1px)] bg-black/10" />
      <div class="relative grid grid-cols-2 gap-1">
        <span class="size-1.5 rounded-full bg-white/90" />
        <span class="size-1.5 rounded-full bg-white/55" />
        <span class="size-1.5 rounded-full bg-white/55" />
        <span class="size-1.5 rounded-full bg-white/90" />
      </div>
    </div>
    <div v-if="!props.compact" class="flex flex-col">
      <span
        class="font-display text-lg font-semibold leading-none tracking-[-0.03em] text-foreground"
        >AssetFlow</span
      >
      <span class="text-xs font-medium uppercase tracking-[0.22em] text-muted-foreground"
        >Control Surface</span
      >
    </div>
  </NuxtLink>
</template>

<script setup lang="ts">
const props = withDefaults(
  defineProps<{
    compact?: boolean;
  }>(),
  {
    compact: false,
  },
);

const { homePath, isAuthenticated } = useMockAuth();

const destination = computed(() => (isAuthenticated.value ? homePath.value : '/login'));
</script>
