<script lang="ts" setup>
import type { CalendarRootEmits, CalendarRootProps } from 'reka-ui';
import type { HTMLAttributes } from 'vue';
import { reactiveOmit } from '@vueuse/core';
import {
  CalendarCell,
  CalendarCellTrigger,
  CalendarGrid,
  CalendarGridBody,
  CalendarGridHead,
  CalendarGridRow,
  CalendarHeadCell,
  CalendarHeader,
  CalendarHeading,
  CalendarNext,
  CalendarPrev,
  CalendarRoot,
  useForwardPropsEmits,
} from 'reka-ui';
import { buttonVariants } from '@/components/ui/button';
import { cn } from '@/lib/utils';

const props = defineProps<CalendarRootProps & { class?: HTMLAttributes['class'] }>();
const emits = defineEmits<CalendarRootEmits>();

const delegatedProps = reactiveOmit(props, 'class');
const forwarded = useForwardPropsEmits(delegatedProps, emits);
</script>

<template>
  <CalendarRoot
    v-slot="{ grid, weekDays }"
    data-slot="calendar"
    :class="cn('p-3', props.class)"
    v-bind="forwarded"
  >
    <CalendarHeader class="relative flex w-full items-center justify-center pt-1">
      <CalendarHeading v-slot="{ headingValue }" class="text-sm font-medium">
        {{ headingValue }}
      </CalendarHeading>

      <div class="flex items-center gap-1">
        <CalendarPrev
          :class="
            cn(
              buttonVariants({ variant: 'outline' }),
              'absolute left-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
            )
          "
        >
          <Icon name="lucide:chevron-left" class="size-4" />
        </CalendarPrev>
        <CalendarNext
          :class="
            cn(
              buttonVariants({ variant: 'outline' }),
              'absolute right-1 size-7 bg-transparent p-0 opacity-50 hover:opacity-100',
            )
          "
        >
          <Icon name="lucide:chevron-right" class="size-4" />
        </CalendarNext>
      </div>
    </CalendarHeader>

    <div class="mt-4 flex flex-col gap-y-4 sm:flex-row sm:gap-x-4 sm:gap-y-0">
      <CalendarGrid
        v-for="month in grid"
        :key="month.value.toString()"
        class="w-full border-collapse space-x-1"
      >
        <CalendarGridHead>
          <CalendarGridRow>
            <CalendarHeadCell
              v-for="day in weekDays"
              :key="day"
              class="w-8 rounded-md text-[0.8rem] font-normal text-muted-foreground"
            >
              {{ day }}
            </CalendarHeadCell>
          </CalendarGridRow>
        </CalendarGridHead>
        <CalendarGridBody>
          <CalendarGridRow
            v-for="(weekDates, index) in month.rows"
            :key="`weekDate-${index}`"
            class="mt-2 w-full"
          >
            <CalendarCell
              v-for="weekDate in weekDates"
              :key="weekDate.toString()"
              :date="weekDate"
              class="relative p-0 text-center text-sm focus-within:relative focus-within:z-20"
            >
              <CalendarCellTrigger
                :day="weekDate"
                :month="month.value"
                :class="
                  cn(
                    buttonVariants({ variant: 'ghost' }),
                    'h-8 w-8 p-0 font-normal data-[selected]:opacity-100',
                    '[&[data-today]:not([data-selected])]:bg-accent [&[data-today]:not([data-selected])]:text-accent-foreground',
                    'data-[selected]:bg-primary data-[selected]:text-primary-foreground data-[selected]:hover:bg-primary data-[selected]:hover:text-primary-foreground data-[selected]:focus:bg-primary data-[selected]:focus:text-primary-foreground',
                    'data-[outside-view]:text-muted-foreground',
                    'data-[disabled]:text-muted-foreground data-[disabled]:opacity-50',
                    'data-[unavailable]:text-destructive-foreground data-[unavailable]:line-through',
                  )
                "
              />
            </CalendarCell>
          </CalendarGridRow>
        </CalendarGridBody>
      </CalendarGrid>
    </div>
  </CalendarRoot>
</template>
