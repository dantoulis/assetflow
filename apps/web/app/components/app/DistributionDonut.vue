<template>
  <div class="grid gap-6 lg:grid-cols-[180px_1fr] lg:items-center">
    <div class="relative mx-auto size-44">
      <div class="absolute inset-0 rounded-full" :style="{ backgroundImage: donutBackground }" />
      <div
        class="absolute inset-5 rounded-full border border-border/60 bg-background/95 backdrop-blur"
      />
      <div class="absolute inset-0 flex flex-col items-center justify-center text-center">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          {{ centerLabel }}
        </p>
        <p class="mt-2 text-3xl font-semibold tracking-[-0.04em]">{{ centerValue }}</p>
      </div>
    </div>
    <div class="space-y-3">
      <div
        v-for="segment in props.segments"
        :key="segment.label"
        class="flex items-center justify-between rounded-2xl border border-border/60 bg-background/50 px-4 py-3"
      >
        <div class="flex items-center gap-3">
          <span class="size-3 rounded-full" :style="{ backgroundColor: segment.color }" />
          <span class="font-medium">{{ segment.label }}</span>
        </div>
        <div class="text-right">
          <p class="font-semibold">{{ segment.value }}</p>
          <p class="text-xs text-muted-foreground">
            {{ total ? Math.round((segment.value / total) * 100) : 0 }}%
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { DistributionSegment } from '@/lib/mock-data';

const props = defineProps<{
  segments: DistributionSegment[];
  centerLabel: string;
  centerValue: string;
}>();

const total = computed(() => props.segments.reduce((sum, segment) => sum + segment.value, 0));

const donutBackground = computed(() => {
  if (!total.value) return 'conic-gradient(var(--color-muted) 0deg, var(--color-muted) 360deg)';

  let current = 0;
  const slices = props.segments.map((segment) => {
    const slice = `${segment.color} ${current}deg ${current + (segment.value / total.value) * 360}deg`;
    current += (segment.value / total.value) * 360;
    return slice;
  });

  return `conic-gradient(${slices.join(', ')})`;
});
</script>
