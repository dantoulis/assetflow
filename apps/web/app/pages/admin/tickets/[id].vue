<template>
  <div v-if="ticket" class="space-y-6">
    <PageIntro
      eyebrow="Ticket detail"
      :title="ticket.subject"
      description="Review the thread, update status, and reply in real time from the admin surface."
    >
      <template #actions>
        <Dialog v-model:open="reviewOpen">
          <DialogTrigger as-child>
            <Button class="rounded-2xl">
              <ShieldCheck class="size-4" />
              Review ticket
            </Button>
          </DialogTrigger>
          <DialogContent class="rounded-3xl sm:max-w-lg">
            <DialogHeader>
              <DialogTitle>Review ticket</DialogTitle>
              <DialogDescription>
                Update the status and priority after reviewing the thread.
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-2">
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <Label for="review-status">Status</Label>
                  <AppSelectField
                    id="review-status"
                    v-model="reviewForm.status"
                    :options="statusOptions"
                    placeholder="Choose status"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="review-priority">Priority</Label>
                  <AppSelectField
                    id="review-priority"
                    v-model="reviewForm.priority"
                    :options="priorityOptions"
                    placeholder="Choose priority"
                  />
                </div>
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" class="rounded-2xl" @click="reviewOpen = false">
                Cancel
              </Button>
              <Button class="rounded-2xl" :disabled="savingReview" @click="saveReview">
                {{ savingReview ? 'Saving...' : 'Save review' }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-[0.72fr_1.28fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Context</CardTitle>
          <CardDescription>Everything the admin team needs before replying.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="flex flex-wrap gap-2">
            <StatusBadge :status="ticket.status" />
            <StatusBadge :status="ticket.priority" />
          </div>
          <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Requester</p>
            <p class="font-semibold">{{ requesterName }}</p>
          </div>
          <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Linked asset</p>
            <p class="font-semibold">{{ assetTitle }}</p>
          </div>
          <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Last updated</p>
            <p class="font-semibold">{{ formatRelativeDate(ticket.updatedAt) }}</p>
          </div>
          <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Assigned admin</p>
            <p class="font-semibold">{{ assignedAdminName }}</p>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Conversation</CardTitle>
            <CardDescription>Internal notes stay visible on the admin side.</CardDescription>
          </CardHeader>
          <CardContent>
            <ConversationThread
              :messages="messages"
              :current-user-id="viewer.id"
              :authors="authors"
              include-internal
            />
          </CardContent>
        </Card>

        <Card class="app-surface overflow-hidden">
          <CardHeader>
            <CardTitle>Reply composer</CardTitle>
            <CardDescription>
              {{
                isResolved
                  ? 'This ticket is resolved. Reopen or change the status before sending a new reply.'
                  : 'Post a user-visible reply or save an internal note.'
              }}
            </CardDescription>
          </CardHeader>
          <CardContent class="space-y-4">
            <Textarea
              v-model="draft"
              class="min-h-36 rounded-3xl"
              :disabled="isResolved"
              :placeholder="
                isResolved ? 'Resolved tickets cannot receive new replies.' : 'Write a reply or internal note...'
              "
            />
            <label
              class="flex items-center gap-3 rounded-2xl border border-border/70 bg-background/55 px-4 py-3 text-sm"
            >
              <input
                v-model="internalNote"
                type="checkbox"
                :disabled="isResolved"
                class="size-4 rounded border-border bg-background"
              />
              Save as internal admin note
            </label>
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
import { ShieldCheck } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  formatRelativeDate,
  getDisplayName,
  getInitials,
  humanizeEnum,
} from '@/lib/app-formatters';
import type {
  AppTicket,
  AppTicketMessage,
  AppUser,
  TicketPriority,
  TicketStatus,
} from '@/lib/app-types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const ticketId = Number(route.params.id);
const api = useAssetFlowApi();
const { currentUser, refreshSession } = useAuth();

if (!currentUser.value) {
  await refreshSession();
}

const viewer = currentUser.value;

if (!viewer) {
  throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
}

const [ticketData, users, assets, messagesData] = await Promise.all([
  api.fetchTicket(ticketId),
  api.fetchUsers(),
  api.fetchAssets(),
  api.fetchTicketMessages(ticketId),
]);

const ticket = ref<AppTicket>(ticketData);
const messages = ref<AppTicketMessage[]>(messagesData);
const statuses: TicketStatus[] = ['OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'RESOLVED'];
const priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
const statusOptions = statuses.map((status) => ({
  label: humanizeEnum(status),
  value: status,
})) as Array<{ label: string; value: TicketStatus }>;
const priorityOptions = priorities.map((priority) => ({
  label: humanizeEnum(priority),
  value: priority,
})) as Array<{ label: string; value: TicketPriority }>;
const reviewOpen = ref(false);
const savingReview = ref(false);
const sending = ref(false);
const internalNote = ref(false);
const draft = ref('');
const reviewForm = reactive({
  status: ticket.value.status,
  priority: ticket.value.priority,
});

useHead({
  title: ticket.value.subject,
});

const userMap = computed(
  () => Object.fromEntries(users.map((user) => [user.id, user])) as Record<number, AppUser>,
);

const authors = computed(() => {
  const requester = userMap.value[ticket.value.requesterId];
  const assignedAdmin = ticket.value.assignedAdminId
    ? userMap.value[ticket.value.assignedAdminId]
    : null;

  return {
    [viewer.id]: {
      name: getDisplayName(viewer),
      initials: getInitials(viewer),
    },
    ...(requester
      ? {
          [requester.id]: {
            name: getDisplayName(requester),
            initials: getInitials(requester),
          },
        }
      : {}),
    ...(assignedAdmin
      ? {
          [assignedAdmin.id]: {
            name: getDisplayName(assignedAdmin),
            initials: getInitials(assignedAdmin),
          },
        }
      : {}),
  };
});

const requesterName = computed(() => getDisplayName(userMap.value[ticket.value.requesterId]));
const assignedAdminName = computed(() =>
  ticket.value.assignedAdminId
    ? getDisplayName(userMap.value[ticket.value.assignedAdminId])
    : 'Unassigned',
);
const assetTitle = computed(
  () => assets.find((asset) => asset.id === ticket.value.assetId)?.title ?? 'General request',
);
const isResolved = computed(() => ticket.value.status === 'RESOLVED');

const refreshTicketState = async () => {
  ticket.value = await api.fetchTicket(ticketId);
  messages.value = await api.fetchTicketMessages(ticketId);
  reviewForm.status = ticket.value.status;
  reviewForm.priority = ticket.value.priority;
};

const saveReview = async () => {
  savingReview.value = true;

  try {
    ticket.value = await api.updateTicket(ticketId, {
      status: reviewForm.status,
      priority: reviewForm.priority,
      assignedAdminId: viewer.id,
    });
    reviewOpen.value = false;
    toast.success('Ticket updated');
  } catch {
    toast.error('Unable to update ticket');
  } finally {
    savingReview.value = false;
  }
};

const sendReply = async () => {
  if (!draft.value.trim() || isResolved.value) return;

  sending.value = true;

  try {
    await api.createTicketMessage(ticketId, {
      body: draft.value.trim(),
      internal: internalNote.value,
    });
    await refreshTicketState();
    draft.value = '';
    internalNote.value = false;
    toast.success('Reply sent');
  } catch {
    toast.error('Unable to send reply');
  } finally {
    sending.value = false;
  }
};
</script>
