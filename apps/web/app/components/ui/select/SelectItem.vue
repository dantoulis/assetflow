<template>
  <SelectItem
    data-slot="select-item"
    v-bind="{ ...$attrs, ...forwarded }"
    :class="
      cn(
        'focus:bg-accent/75 focus:text-accent-foreground relative flex min-h-11 w-full cursor-pointer items-center rounded-2xl py-2.5 pl-9 pr-3 text-sm outline-hidden transition-colors select-none data-[disabled]:pointer-events-none data-[disabled]:opacity-50',
        props.class,
      )
    "
  >
    <span class="absolute left-3 flex size-4 items-center justify-center">
      <SelectItemIndicator>
        <Icon name="lucide:check" class="size-4 text-primary"  />
      </SelectItemIndicator>
    </span>
    <SelectItemText>
      <slot />
    </SelectItemText>
  </SelectItem>
</template>

<script setup lang="ts">
import { reactiveOmit } from '@vueuse/core';
import type { SelectItemProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { SelectItem, SelectItemIndicator, SelectItemText, useForwardProps } from 'reka-ui';
import { cn } from '@/lib/utils';

defineOptions({
  inheritAttrs: false,
});

const props = defineProps<SelectItemProps & { class?: HTMLAttributes['class'] }>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardProps(delegatedProps);
</script>

