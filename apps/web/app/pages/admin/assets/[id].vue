<template>
  <div v-if="asset" class="space-y-6">
    <PageIntro
      eyebrow="Asset detail"
      :title="asset.title"
      description="Review ownership context, lifecycle dates, and linked ticket history for this asset."
    />

    <section class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card class="app-surface overflow-hidden">
        <CardContent class="space-y-6 p-6">
          <div class="flex flex-wrap items-center gap-2">
            <StatusBadge :status="asset.type" />
            <StatusBadge :status="asset.status" />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Vendor</p>
              <p class="font-semibold">{{ asset.vendor }}</p>
            </div>
            <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Reference</p>
              <p class="font-semibold">{{ asset.reference }}</p>
            </div>
            <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Owner</p>
              <p class="font-semibold">{{ ownerName }}</p>
            </div>
            <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Billing cadence</p>
              <p class="font-semibold">
                {{ asset.billingCycle ? humanizeEnum(asset.billingCycle) : 'One-time' }}
              </p>
            </div>
          </div>
          <div class="grid gap-2 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Notes</p>
            <p class="text-sm leading-6">
              {{ asset.notes || 'No notes recorded for this asset.' }}
            </p>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <MetricCard
          title="Next lifecycle date"
          :value="formatRelativeDate(getAssetNextDate(asset))"
          delta="Renewal or expiry"
          hint="The next operational date on this asset."
          tone="warning"
        >
          <template #icon><CalendarClock class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Linked tickets"
          :value="`${relatedTickets.length}`"
          delta="Support history"
          hint="Conversations already attached to this asset."
          tone="neutral"
        >
          <template #icon><Ticket class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Assigned on"
          :value="formatDate(asset.assignedAt)"
          delta="Ownership timeline"
          hint="When this asset was assigned to the current owner."
          tone="success"
        >
          <template #icon><Repeat2 class="size-5" /></template>
        </MetricCard>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Ownership context</CardTitle>
          <CardDescription>
            Dates and metadata the admin surface needs for decision-making.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="grid gap-1 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Purchased</p>
            <p class="font-semibold">{{ formatDate(asset.purchasedAt) }}</p>
          </div>
          <div class="grid gap-2 rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Owner profile</p>
            <p class="font-semibold">{{ ownerName }}</p>
            <p class="text-sm text-muted-foreground">{{ ownerMeta }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Linked tickets</CardTitle>
          <CardDescription>Support history connected to this asset.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="ticket in relatedTickets"
            :key="ticket.id"
            :to="`/admin/tickets/${ticket.id}`"
            class="app-list-item"
          >
            <div class="grid gap-3">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="ticket.priority" />
                <StatusBadge :status="ticket.status" />
              </div>
              <div class="space-y-1">
                <p class="font-semibold">{{ ticket.subject }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ humanizeEnum(ticket.category) }} | Updated
                  {{ formatRelativeDate(ticket.updatedAt) }}
                </p>
              </div>
            </div>
          </NuxtLink>

          <div
            v-if="!relatedTickets.length"
            class="rounded-3xl border border-dashed border-border/70 bg-background/35 p-6 text-sm text-muted-foreground"
          >
            No support history is linked to this asset yet.
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CalendarClock, Repeat2, Ticket } from 'lucide-vue-next';
import {
  formatDate,
  formatRelativeDate,
  getAssetNextDate,
  getDisplayName,
  humanizeEnum,
} from '@/lib/app-formatters';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const assetId = Number(route.params.id);
const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();
const usersStore = useUsersStore();

let assetValue;

try {
  assetValue = await assetsStore.fetchOne(assetId);
} catch {
  throw createError({ statusCode: 404, statusMessage: 'Asset not found' });
}

await Promise.all([usersStore.fetchAll(), ticketsStore.fetchAll()]);

const asset = computed(() => assetsStore.findAssetById(assetId) ?? assetValue);
const owner = computed(() => usersStore.findUserById(asset.value.userId));
const ownerName = computed(() => getDisplayName(owner.value));
const ownerMeta = computed(() =>
  owner.value
    ? `${owner.value.team || 'No team'} | ${owner.value.location || 'No location'}`
    : 'No owner metadata',
);
const relatedTickets = computed(() => ticketsStore.byAssetId(asset.value.id));

useHead({
  title: asset.value.title,
});
</script>
