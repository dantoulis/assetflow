<template>
  <div class="space-y-4">
    <svg
      class="h-44 w-full overflow-visible"
      :viewBox="`0 0 ${width} ${height}`"
      fill="none"
      :style="{ '--chart-stroke': props.stroke, '--chart-fill': props.fill }"
    >
      <line
        v-for="guide in [0.25, 0.5, 0.75]"
        :key="guide"
        x1="0"
        :y1="height * guide"
        :x2="width"
        :y2="height * guide"
        stroke="color-mix(in oklab, var(--color-border) 65%, transparent)"
        stroke-dasharray="4 4"
      />
      <polygon :points="areaPath" fill="var(--chart-fill)" />
      <polyline
        :points="linePath"
        stroke="var(--chart-stroke)"
        stroke-linecap="round"
        stroke-linejoin="round"
        stroke-width="3"
      />
      <g v-for="point in coordinates" :key="point.label">
        <circle :cx="point.x" :cy="point.y" r="5" fill="var(--chart-stroke)" />
        <circle
          :cx="point.x"
          :cy="point.y"
          r="10"
          fill="color-mix(in oklab, var(--chart-stroke) 18%, transparent)"
        />
      </g>
    </svg>
    <div class="grid grid-cols-6 gap-2 text-xs text-muted-foreground">
      <div v-for="point in props.points" :key="point.label" class="text-center font-medium">
        {{ point.label }}
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { ChartPoint } from '@/lib/mock-data';

const props = withDefaults(
  defineProps<{
    points: ChartPoint[];
    stroke?: string;
    fill?: string;
  }>(),
  {
    stroke: 'var(--color-primary)',
    fill: 'color-mix(in oklab, var(--color-primary) 18%, transparent)',
  },
);

const width = 320;
const height = 160;
const padding = 16;

const maxValue = computed(() => Math.max(...props.points.map((point) => point.value), 1));

const coordinates = computed(() => {
  if (!props.points.length) return [];

  return props.points.map((point, index) => {
    const x = padding + ((width - padding * 2) / Math.max(props.points.length - 1, 1)) * index;
    const y = height - padding - ((height - padding * 2) * point.value) / maxValue.value;
    return { ...point, x, y };
  });
});

const linePath = computed(() =>
  coordinates.value.map((point) => `${point.x},${point.y}`).join(' '),
);
const areaPath = computed(() => {
  const start = coordinates.value[0];
  const end = coordinates.value[coordinates.value.length - 1];

  if (!start || !end) return '';

  return `${linePath.value} ${end.x},${height - padding} ${start.x},${height - padding}`;
});
</script>
