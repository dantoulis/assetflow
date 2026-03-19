<template>
  <Card :class="cn('app-surface overflow-hidden', props.class)">
    <CardContent class="grid gap-4 p-5">
      <div class="flex items-start justify-between gap-4">
        <div class="space-y-3">
          <p class="text-sm font-medium text-muted-foreground">{{ title }}</p>
          <div class="space-y-1">
            <p class="text-3xl font-semibold tracking-[-0.04em]">{{ value }}</p>
            <p class="text-sm font-medium text-foreground/80">{{ delta }}</p>
          </div>
        </div>
        <div
          :class="
            cn('flex size-12 shrink-0 items-center justify-center rounded-2xl ring-1', toneClasses)
          "
        >
          <slot name="icon" />
        </div>
      </div>
      <p class="text-sm leading-6 text-muted-foreground">{{ hint }}</p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    title: string;
    value: string;
    delta: string;
    hint: string;
    tone?: 'primary' | 'success' | 'warning' | 'neutral';
    class?: string;
  }>(),
  {
    tone: 'primary',
    class: '',
  },
);

const toneClasses = computed(() => {
  const tones = {
    primary: 'bg-primary/12 text-primary ring-primary/20',
    success: 'bg-emerald-500/14 text-emerald-600 ring-emerald-500/20 dark:text-emerald-300',
    warning: 'bg-amber-500/14 text-amber-600 ring-amber-500/20 dark:text-amber-300',
    neutral: 'bg-muted text-muted-foreground ring-border',
  };

  return tones[props.tone];
});
</script>
