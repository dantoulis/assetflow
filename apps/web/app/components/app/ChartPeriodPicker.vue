<template>
  <div class="flex flex-wrap items-center gap-2">
    <Button
      v-for="option in options"
      :key="option.value"
      size="sm"
      :variant="modelValue === option.value ? 'default' : 'outline'"
      class="rounded-full"
      @click="emit('update:modelValue', option.value)"
    >
      {{ option.label }}
    </Button>

    <Popover v-model:open="customOpen">
      <PopoverTrigger as-child>
        <Button
          size="sm"
          :variant="modelValue === 'CUSTOM' ? 'default' : 'outline'"
          class="rounded-full"
          @click="emit('update:modelValue', 'CUSTOM')"
        >
          <CalendarDays class="size-4" />
          {{ customLabel }}
        </Button>
      </PopoverTrigger>
      <PopoverContent align="end" class="w-auto p-0">
        <div class="space-y-1 border-b border-border/70 px-4 py-3">
          <p class="text-sm font-semibold">Custom range</p>
          <p class="text-xs text-muted-foreground">
            Pick a start and end date for the chart window.
          </p>
        </div>
        <RangeCalendar
          v-model="rangeModel"
          class="rounded-3xl p-4"
          locale="en"
          :number-of-months="2"
          disable-days-outside-current-view
        />
      </PopoverContent>
    </Popover>
  </div>
</template>

<script setup lang="ts">
import type { DateRange } from 'reka-ui';
import { CalendarDays } from 'lucide-vue-next';
import { getLocalTimeZone } from '@internationalized/date';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { RangeCalendar } from '@/components/ui/range-calendar';
import type { ChartPeriodPreset } from '@/lib/app-types';

const props = defineProps<{
  modelValue: ChartPeriodPreset;
  range: {
    start?: { toDate: (timeZone: string) => Date } | null;
    end?: { toDate: (timeZone: string) => Date } | null;
  };
}>();

const emit = defineEmits<{
  'update:modelValue': [value: ChartPeriodPreset];
  'update:range': [value: DateRange];
}>();

const options: Array<{ label: string; value: Exclude<ChartPeriodPreset, 'CUSTOM'> }> = [
  { label: 'Today', value: 'TODAY' },
  { label: '7 days', value: '7D' },
  { label: '30 days', value: '30D' },
];

const timezone = getLocalTimeZone();
const customOpen = ref(false);

const rangeModel = computed({
  get: () => props.range as DateRange,
  set: (value: DateRange) => {
    emit('update:range', value);
    emit('update:modelValue', 'CUSTOM');
  },
});

const customLabel = computed(() => {
  const start = props.range.start?.toDate(timezone);
  const end = props.range.end?.toDate(timezone);

  if (!start || !end) {
    return 'Custom';
  }

  const formatter = new Intl.DateTimeFormat('en-US', {
    month: 'short',
    day: 'numeric',
  });

  return `${formatter.format(start)} - ${formatter.format(end)}`;
});
</script>
