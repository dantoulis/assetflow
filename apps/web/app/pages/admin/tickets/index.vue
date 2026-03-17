<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Support"
      title="Ticket inbox with ownership context."
      description="Admin needs more than a generic list: the ticket queue is cross-linked with users, assets, priority, and recency so support decisions can be made inside the operational surface."
    />

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        title="All tickets"
        :value="`${mockTickets.length}`"
        delta="Current dataset"
        hint="Every support thread currently represented in the preview."
      >
        <template #icon><MessagesSquare class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Urgent"
        :value="`${mockTickets.filter((ticket) => ticket.priority === 'URGENT').length}`"
        delta="Requires immediate action"
        hint="Highest-priority tickets at the top of the support queue."
        tone="warning"
      >
        <template #icon><AlertTriangle class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Resolved"
        :value="`${mockTickets.filter((ticket) => ticket.status === 'RESOLVED').length}`"
        delta="Closed loop"
        hint="Threads where the admin can archive or review outcome quality."
        tone="success"
      >
        <template #icon><CheckCheck class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Awaiting reply"
        :value="`${mockTickets.filter((ticket) => ticket.status === 'PENDING_ADMIN').length}`"
        delta="Admin action"
        hint="Conversations where the next step belongs to the admin."
        tone="neutral"
      >
        <template #icon><TimerReset class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>Ticket queue</CardTitle>
        <CardDescription
          >The column set is intentionally backend-ready: status, priority, owner, linked asset, and
          freshness.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Ticket</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Asset</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Priority</TableHead>
              <TableHead class="text-right">Updated</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="ticket in mockTickets" :key="ticket.id">
              <TableCell>
                <NuxtLink
                  :to="`/admin/tickets/${ticket.id}`"
                  class="font-semibold hover:text-primary"
                >
                  {{ ticket.subject }}
                </NuxtLink>
                <p class="text-xs text-muted-foreground">{{ ticket.preview }}</p>
              </TableCell>
              <TableCell>{{ getUserById(ticket.userId)?.name }}</TableCell>
              <TableCell>{{ assetTitle(ticket.assetId) }}</TableCell>
              <TableCell><StatusBadge :status="ticket.status" /></TableCell>
              <TableCell><StatusBadge :status="ticket.priority" /></TableCell>
              <TableCell class="text-right text-sm text-muted-foreground">{{
                formatRelativeDate(ticket.updatedAt)
              }}</TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { AlertTriangle, CheckCheck, MessagesSquare, TimerReset } from 'lucide-vue-next';
import { formatRelativeDate, getUserById, mockAssets, mockTickets } from '@/lib/mock-data';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Tickets',
});

const assetTitle = (assetId?: string) => {
  return mockAssets.find((asset) => asset.id === assetId)?.title ?? 'General request';
};
</script>
