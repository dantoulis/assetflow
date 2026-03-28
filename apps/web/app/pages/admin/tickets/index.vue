<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Support"
      title="Ticket queue with live ownership context."
      description="Review every thread in one place, filter the queue, and drill into the conversations that need action."
    >
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        title="All tickets"
        :value="`${tickets.length}`"
        delta="Total queue"
        hint="Every support conversation in the system."
      >
        <template #icon><Icon name="lucide:messages-square" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Pending admin"
        :value="`${pendingAdminTickets.length}`"
        delta="Needs reply"
        hint="Threads where the next step belongs to the admin team."
        tone="warning"
      >
        <template #icon><Icon name="lucide:triangle-alert" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Resolved"
        :value="`${resolvedTickets.length}`"
        delta="Closed loop"
        hint="Tickets that have already been wrapped up."
        tone="success"
      >
        <template #icon><Icon name="lucide:check-check" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="High priority"
        :value="`${highPriorityTickets.length}`"
        delta="Fast lane"
        hint="Tickets that should be handled first."
        tone="neutral"
      >
        <template #icon><Icon name="lucide:timer-reset" class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader class="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Ticket queue</CardTitle>
          <CardDescription>Filter by status and priority to focus the queue.</CardDescription>
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
          :to="`/admin/tickets/${ticket.id}`"
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
                  {{ userName(ticket.requesterId) }} · {{ assetTitle(ticket.assetId) }} · Updated
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
import { formatRelativeDate, getDisplayName, humanizeEnum } from '@/lib/app-formatters';
import type { TicketPriority, TicketStatus } from '@/lib/app-types';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Tickets',
});

const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();
const usersStore = useUsersStore();

await Promise.all([ticketsStore.fetchAll(), usersStore.fetchAll(), assetsStore.fetchAll()]);

const { highPriorityTickets, pendingAdminTickets, resolvedTickets, tickets } =
  storeToRefs(ticketsStore);
const statuses: TicketStatus[] = ['OPEN', 'PENDING_ADMIN', 'PENDING_USER', 'RESOLVED'];
const priorities: TicketPriority[] = ['LOW', 'MEDIUM', 'HIGH'];
const statusFilter = ref<'ALL' | TicketStatus>('ALL');
const priorityFilter = ref<'ALL' | TicketPriority>('ALL');
const statusFilterOptions: Array<{ label: string; value: 'ALL' | TicketStatus }> = [
  { label: 'All statuses', value: 'ALL' },
  ...statuses.map((status) => ({ label: humanizeEnum(status), value: status })),
];
const priorityFilterOptions: Array<{ label: string; value: 'ALL' | TicketPriority }> = [
  { label: 'All priorities', value: 'ALL' },
  ...priorities.map((priority) => ({ label: humanizeEnum(priority), value: priority })),
];

const userName = (userId: number) => getDisplayName(usersStore.findUserById(userId));
const assetTitle = (assetId: number | null) => assetsStore.titleFor(assetId);

const filteredTickets = computed(() =>
  tickets.value.filter((ticket) => {
    if (statusFilter.value !== 'ALL' && ticket.status !== statusFilter.value) return false;
    if (priorityFilter.value !== 'ALL' && ticket.priority !== priorityFilter.value) return false;
    return true;
  }),
);
</script>
