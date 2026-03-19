<template>
  <Select v-model="selectedValue" :disabled="disabled">
    <SelectTrigger :id="id" :class="cn('w-full', triggerClass)">
      <SelectValue :placeholder="placeholder" />
    </SelectTrigger>
    <SelectContent :class="contentClass">
      <SelectItem v-for="option in normalizedOptions" :key="option.key" :value="option.stringValue">
        {{ option.label }}
      </SelectItem>
    </SelectContent>
  </Select>
</template>

<script setup lang="ts">
import type { HTMLAttributes } from 'vue';
import { cn } from '@/lib/utils';

interface SelectOption {
  label: string;
  value: string | number;
}

const props = defineProps<{
  modelValue: string | number | null | undefined;
  options: SelectOption[];
  placeholder?: string;
  disabled?: boolean;
  id?: string;
  triggerClass?: HTMLAttributes['class'];
  contentClass?: HTMLAttributes['class'];
}>();

const emit = defineEmits<{
  'update:modelValue': [value: string | number | null];
}>();

const normalizedOptions = computed(() =>
  props.options.map((option) => ({
    ...option,
    stringValue: String(option.value),
    key: `${typeof option.value}:${String(option.value)}`,
  })),
);

const selectedValue = computed({
  get: () =>
    props.modelValue === null || props.modelValue === undefined
      ? undefined
      : String(props.modelValue),
  set: (value?: string) => {
    if (value === undefined) {
      emit('update:modelValue', null);
      return;
    }

    const option = normalizedOptions.value.find((item) => item.stringValue === value);
    emit('update:modelValue', option?.value ?? null);
  },
});
</script>
