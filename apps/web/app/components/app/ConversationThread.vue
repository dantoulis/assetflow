<template>
  <div class="space-y-4">
    <div
      v-for="message in visibleMessages"
      :key="message.id"
      :class="
        cn(
          'flex items-start gap-3',
          message.authorId === props.currentUserId ? 'justify-end' : 'justify-start',
        )
      "
    >
      <template v-if="message.authorId !== props.currentUserId">
        <Avatar class="size-9 border border-white/10">
          <AvatarFallback class="bg-muted text-xs font-semibold text-foreground">
            {{ getAuthor(message.authorId).initials }}
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
        <div class="space-y-2">
          <div class="flex flex-wrap items-center gap-2 text-xs font-medium">
            <span>{{ getAuthor(message.authorId).name }}</span>
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
      </div>
      <template v-if="message.authorId === props.currentUserId">
        <Avatar class="size-9 border border-white/10">
          <AvatarFallback class="bg-primary/15 text-xs font-semibold text-primary">
            {{ getAuthor(message.authorId).initials }}
          </AvatarFallback>
        </Avatar>
      </template>
    </div>
  </div>
</template>

<script setup lang="ts">
import { formatDateTime } from '@/lib/app-formatters';
import type { AppTicketMessage } from '@/lib/app-types';
import { cn } from '@/lib/utils';

const props = withDefaults(
  defineProps<{
    messages: AppTicketMessage[];
    currentUserId: number;
    authors?: Record<number, { name: string; initials: string }>;
    includeInternal?: boolean;
  }>(),
  {
    includeInternal: false,
    authors: () => ({}),
  },
);

const visibleMessages = computed(() => {
  return props.includeInternal
    ? props.messages
    : props.messages.filter((message) => !message.internal);
});

const getAuthor = (authorId: number) => {
  return (
    props.authors[authorId] ?? {
      name: authorId === props.currentUserId ? 'You' : 'Support',
      initials: authorId === props.currentUserId ? 'YO' : 'SP',
    }
  );
};
</script>
