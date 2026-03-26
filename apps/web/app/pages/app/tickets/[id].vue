<template>
  <div v-if="ticket" class="space-y-6">
    <PageIntro
      eyebrow="Ticket detail"
      :title="ticket.subject"
      description="Follow the live conversation, review the current status, and reply without leaving the workspace."
    />

    <section class="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Thread status</CardTitle>
          <CardDescription>What the conversation is waiting on right now.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="ticket.status" />
            <StatusBadge :status="ticket.priority" />
          </div>
          <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Category</p>
            <p class="font-semibold">{{ humanizeEnum(ticket.category) }}</p>
          </div>
          <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Related asset</p>
            <p class="font-semibold">{{ assetTitle }}</p>
          </div>
          <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Last updated</p>
            <p class="font-semibold">{{ formatRelativeDate(ticket.updatedAt) }}</p>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>User-visible replies only.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversationThread
              :messages="messages"
              :current-user-id="viewer.id"
              :authors="authors"
            />
          </CardContent>
        </Card>

        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Reply</CardTitle>
            <CardDescription>
              {{
                isResolved
                  ? 'This ticket has been resolved. Replies are disabled unless support reopens it.'
                  : 'Send a real reply to continue the thread.'
              }}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Textarea
              v-model="draft"
              class="min-h-36 rounded-3xl"
              :disabled="isResolved"
              :placeholder="
                isResolved ? 'Resolved tickets cannot receive new replies.' : 'Write your reply...'
              "
            />
            <div class="flex flex-wrap gap-3">
              <Button class="rounded-2xl" :disabled="sending || isResolved" @click="sendReply">
                {{ sending ? 'Sending...' : 'Send reply' }}
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </section>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import {
  formatRelativeDate,
  getDisplayName,
  getInitials,
  humanizeEnum,
} from '@/lib/app-formatters';
import type { AppTicket, AppTicketMessage } from '@/lib/app-types';

definePageMeta({
  layout: 'user',
});

const route = useRoute();
const ticketId = Number(route.params.id);
const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();
const ticketThreadSyncStore = useTicketThreadSyncStore();
const { currentUser, refreshSession } = useAuth();

if (!currentUser.value) {
  await refreshSession();
}

const viewer = currentUser.value;

if (!viewer) {
  throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
}

let ticketValue: AppTicket;

try {
  ticketValue = await ticketsStore.fetchOne(ticketId);
} catch {
  throw createError({ statusCode: 404, statusMessage: 'Ticket not found' });
}

if (ticketValue.assetId) {
  await assetsStore.fetchOne(ticketValue.assetId);
}

await ticketsStore.fetchMessages(ticketId);

onMounted(() => {
  ticketThreadSyncStore.startTicketThreadSync(ticketId);
});

onBeforeUnmount(() => {
  ticketThreadSyncStore.stopTicketThreadSync(ticketId);
});

const { messagesByTicketId } = storeToRefs(ticketsStore);
const ticket = computed<AppTicket>(() => ticketsStore.findTicketById(ticketId) ?? ticketValue);
const messages = computed<AppTicketMessage[]>(() => messagesByTicketId.value[ticketId] ?? []);
const draft = ref('');
const sending = ref(false);

useHead({
  title: ticket.value.subject,
});

const authors = computed(() => {
  const supportName = ticket.value.assignedAdminId ? 'Assigned admin' : 'Support';

  return {
    [viewer.id]: {
      name: getDisplayName(viewer),
      initials: getInitials(viewer),
    },
    ...(ticket.value.assignedAdminId
      ? {
          [ticket.value.assignedAdminId]: {
            name: supportName,
            initials: 'AD',
          },
        }
      : {}),
  };
});

const assetTitle = computed(() => assetsStore.titleFor(ticket.value.assetId));
const isResolved = computed(() => ticket.value.status === 'RESOLVED');

const sendReply = async () => {
  if (!draft.value.trim() || isResolved.value) return;

  sending.value = true;

  try {
    await ticketsStore.sendMessage(ticketId, {
      body: draft.value.trim(),
    });
    draft.value = '';
    toast.success('Reply sent');
  } catch {
    toast.error('Unable to send reply');
  } finally {
    sending.value = false;
  }
};
</script>
