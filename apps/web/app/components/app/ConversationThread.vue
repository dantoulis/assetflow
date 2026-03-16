<template>
  <div class="space-y-4">
    <div
      v-for="message in visibleMessages"
      :key="message.id"
      :class="
        cn('flex gap-3', message.authorId === props.currentUserId ? 'justify-end' : 'justify-start')
      "
    >
      <template v-if="message.authorId !== props.currentUserId">
        <Avatar class="mt-1 size-9 border border-white/10">
          <AvatarFallback class="bg-muted text-xs font-semibold text-foreground">
            {{ getUserById(message.authorId)?.initials }}
          </AvatarFallback>
        </Avatar>
      </template>
      <div
        :class="
          cn(
            'max-w-2xl rounded-3xl border px-4 py-3 shadow-sm',
            message.internal
              ? 'border-amber-500/20 bg-amber-500/10 text-amber-950 dark:text-amber-100'
              : message.authorId === props.currentUserId
                ? 'border-primary/10 bg-primary text-primary-foreground'
                : 'border-border/70 bg-card/90 text-foreground',
          )
        "
      >
        <div class="mb-2 flex items-center gap-2 text-xs font-medium">
          <span>{{ getUserById(message.authorId)?.name }}</span>
          <span class="text-current/60">{{ formatDateTime(message.createdAt) }}</span>
          <Badge
            v-if="message.internal"
            variant="outline"
            class="rounded-full border-amber-500/20 bg-amber-500/12 px-2 py-0.5 text-[10px] font-semibold uppercase tracking-[0.16em] text-amber-700 dark:text-amber-300"
          >
            Internal note
          </Badge>
        </div>
        <p class="text-sm leading-6">{{ message.body }}</p>
      </div>
      <template v-if="message.authorId === props.currentUserId">
        <Avatar class="mt-1 size-9 border border-white/10">
          <AvatarFallback class="bg-primary/15 text-xs font-semibold text-primary">
            {{ getUserById(message.authorId)?.initials }}
          </AvatarFallback>
        </Avatar>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { MockTicketMessage } from '@/lib/mock-data';
import { formatDateTime, getUserById } from '@/lib/mock-data';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    messages: MockTicketMessage[];
    currentUserId: string;
    includeInternal?: boolean;
  }>(),
  {
    includeInternal: false,
  },
);

const visibleMessages = computed(() => {
  return props.includeInternal
    ? props.messages
    : props.messages.filter((message) => !message.internal);
});
</script>
