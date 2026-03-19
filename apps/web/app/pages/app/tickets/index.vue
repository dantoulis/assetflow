<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Support"
      title="Your ticket threads."
      description="Open a ticket for one of your assets, follow the conversation, and keep track of what is waiting on you or the admin team."
    >
      <template #actions>
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button class="rounded-2xl">
              <MessageCirclePlus class="size-4" />
              New ticket
            </Button>
          </DialogTrigger>
          <DialogContent class="rounded-3xl sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Open a support ticket</DialogTitle>
              <DialogDescription>
                Create a ticket and send the opening message to the admin team.
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-2">
              <div class="space-y-2">
                <Label for="ticket-asset">Related asset</Label>
                <AppSelectField
                  id="ticket-asset"
                  v-model="draft.assetId"
                  :options="assetOptions"
                  placeholder="Choose asset"
                />
              </div>
              <div class="grid gap-4 md:grid-cols-2">
                <div class="space-y-2">
                  <Label for="ticket-category">Category</Label>
                  <AppSelectField
                    id="ticket-category"
                    v-model="draft.category"
                    :options="categoryOptions"
                    placeholder="Choose category"
                  />
                </div>
                <div class="space-y-2">
                  <Label for="ticket-priority">Priority</Label>
                  <AppSelectField
                    id="ticket-priority"
                    v-model="draft.priority"
                    :options="priorityOptions"
                    placeholder="Choose priority"
                  />
                </div>
              </div>
              <div class="space-y-2">
                <Label for="ticket-subject">Subject</Label>
                <Input id="ticket-subject" v-model="draft.subject" class="h-11 rounded-2xl" />
              </div>
              <div class="space-y-2">
                <Label for="ticket-message">Opening message</Label>
                <Textarea
                  id="ticket-message"
                  v-model="draft.message"
                  class="min-h-32 rounded-3xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" class="rounded-2xl" @click="dialogOpen = false"
                >Cancel</Button
              >
              <Button class="rounded-2xl" :disabled="creating" @click="submitTicket">
                {{ creating ? 'Creating...' : 'Create ticket' }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        title="All tickets"
        :value="`${tickets.length}`"
        delta="History"
        hint="Every conversation on your account."
      >
        <template #icon><MessagesSquare class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Waiting on admin"
        :value="`${pendingAdminTickets.length}`"
        delta="Queue"
        hint="Threads where the next step belongs to the admin team."
        tone="warning"
      >
        <template #icon><ShieldCheck class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Waiting on you"
        :value="`${pendingUserTickets.length}`"
        delta="Follow up"
        hint="Threads that need your reply or confirmation."
        tone="neutral"
      >
        <template #icon><MessageSquareReply class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Resolved"
        :value="`${resolvedTickets.length}`"
        delta="Closed loop"
        hint="Finished conversations kept for reference."
        tone="success"
      >
        <template #icon><CircleCheckBig class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader class="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Ticket list</CardTitle>
          <CardDescription
            >Filter by status and priority to focus on the threads that matter now.</CardDescription
          >
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <AppSelectField
            v-model="statusFilter"
            :options="statusFilterOptions"
            placeholder="All statuses"
            trigger-class="min-w-44"
          />
          <AppSelectField
            v-model="priorityFilter"
            :options="priorityFilterOptions"
            placeholder="All priorities"
            trigger-class="min-w-44"
          />
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <NuxtLink
          v-for="ticket in filteredTickets"
          :key="ticket.id"
          :to="`/app/tickets/${ticket.id}`"
          class="app-list-item"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="ticket.status" />
                <StatusBadge :status="ticket.priority" />
              </div>
              <div>
                <p class="font-semibold">{{ ticket.subject }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ assetTitle(ticket.assetId) }} · Updated
                  {{ formatRelativeDate(ticket.updatedAt) }}
                </p>
              </div>
            </div>
            <StatusBadge :status="ticket.category" />
          </div>
        </NuxtLink>

        <div
          v-if="!filteredTickets.length"
          class="rounded-3xl border border-dashed border-border/70 bg-background/35 p-6 text-sm text-muted-foreground"
        >
          No tickets match the current filters.
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import {
  CircleCheckBig,
  MessageCirclePlus,
  MessageSquareReply,
  MessagesSquare,
  ShieldCheck,
} from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { formatRelativeDate, humanizeEnum } from '@/lib/app-formatters';
import type { TicketCategory, TicketPriority, TicketStatus } from '@/lib/app-types';

definePageMeta({
  layout: 'user',
});

useHead({
  title: 'My Tickets',
});

const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();

await Promise.all([assetsStore.fetchAll(), ticketsStore.fetchAll()]);

const { assets } = storeToRefs(assetsStore);
const { pendingAdminTickets, pendingUserTickets, resolvedTickets, tickets } =
  storeToRefs(ticketsStore);
const dialogOpen = ref(false);
const creating = ref(false);
const statusFilter = ref<'ALL' | TicketStatus>('ALL');
const priorityFilter = ref<'ALL' | TicketPriority>('ALL');
const categories: TicketCategory[] = ['ACCESS', 'BILLING', 'HARDWARE', 'OTHER', 'SUBSCRIPTION'];
const priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
const statuses: TicketStatus[] = ['OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'RESOLVED'];
const assetOptions = computed(() => [
  { label: 'General request', value: 0 },
  ...assets.value.map((asset) => ({ label: asset.title, value: asset.id })),
]);
const categoryOptions = categories.map((category) => ({
  label: humanizeEnum(category),
  value: category,
})) as Array<{ label: string; value: TicketCategory }>;
const priorityOptions = priorities.map((priority) => ({
  label: humanizeEnum(priority),
  value: priority,
})) as Array<{ label: string; value: TicketPriority }>;
const statusFilterOptions = [
  { label: 'All statuses', value: 'ALL' },
  ...statuses.map((status) => ({ label: humanizeEnum(status), value: status })),
] as Array<{ label: string; value: 'ALL' | TicketStatus }>;
const priorityFilterOptions = [
  { label: 'All priorities', value: 'ALL' },
  ...priorities.map((priority) => ({ label: humanizeEnum(priority), value: priority })),
] as Array<{ label: string; value: 'ALL' | TicketPriority }>;

const draft = reactive({
  assetId: 0,
  category: 'ACCESS' as TicketCategory,
  priority: 'MEDIUM' as TicketPriority,
  subject: '',
  message: '',
});

const filteredTickets = computed(() =>
  tickets.value.filter((ticket) => {
    if (statusFilter.value !== 'ALL' && ticket.status !== statusFilter.value) return false;
    if (priorityFilter.value !== 'ALL' && ticket.priority !== priorityFilter.value) return false;
    return true;
  }),
);

const assetTitle = (assetId: number | null) => assetsStore.titleFor(assetId);

const resetDraft = () => {
  draft.assetId = 0;
  draft.category = 'ACCESS';
  draft.priority = 'MEDIUM';
  draft.subject = '';
  draft.message = '';
};

const submitTicket = async () => {
  if (!draft.subject.trim() || !draft.message.trim()) {
    toast.error('Add both a subject and an opening message.');
    return;
  }

  creating.value = true;

  try {
    await ticketsStore.createTicketWithMessage(
      {
        subject: draft.subject.trim(),
        category: draft.category,
        priority: draft.priority,
        ...(draft.assetId ? { assetId: draft.assetId } : {}),
      },
      draft.message.trim(),
    );
    dialogOpen.value = false;
    resetDraft();
    toast.success('Ticket created');
  } catch {
    toast.error('Unable to create ticket');
  } finally {
    creating.value = false;
  }
};
</script>
