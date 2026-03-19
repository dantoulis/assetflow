<template>
  <div v-if="asset" class="space-y-6">
    <PageIntro
      eyebrow="Asset detail"
      :title="asset.title"
      description="Review the key dates, vendor details, and linked support conversations for this asset."
    >
      <template #actions>
        <Button class="rounded-2xl" @click="navigateTo('/app/tickets')">Open support ticket</Button>
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-[1.15fr_0.85fr]">
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
              <p class="text-sm text-muted-foreground">Assigned on</p>
              <p class="font-semibold">{{ formatDate(asset.assignedAt) }}</p>
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
          title="Next key date"
          :value="formatRelativeDate(getAssetNextDate(asset))"
          delta="Renewal or expiry"
          hint="The next operational date attached to this asset."
          tone="warning"
        >
          <template #icon><TimerReset class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Support coverage"
          :value="`${relatedTickets.length} linked threads`"
          delta="Conversation history"
          hint="Support history already attached to this asset."
          tone="neutral"
        >
          <template #icon><LifeBuoy class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Status"
          :value="humanizeEnum(asset.status)"
          delta="Operational posture"
          hint="How this asset currently shows up in the workspace."
          tone="success"
        >
          <template #icon><ShieldCheck class="size-5" /></template>
        </MetricCard>
      </div>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>Related support conversations</CardTitle>
        <CardDescription>Every ticket already linked to this asset.</CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <NuxtLink
          v-for="ticket in relatedTickets"
          :key="ticket.id"
          :to="`/app/tickets/${ticket.id}`"
          class="app-list-item"
        >
          <div class="grid gap-3">
            <div class="flex flex-wrap gap-2">
              <StatusBadge :status="ticket.status" />
              <StatusBadge :status="ticket.priority" />
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
          No support conversation exists for this asset yet.
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { LifeBuoy, ShieldCheck, TimerReset } from 'lucide-vue-next';
import {
  formatDate,
  formatRelativeDate,
  getAssetNextDate,
  humanizeEnum,
} from '@/lib/app-formatters';

definePageMeta({
  layout: 'user',
});

const route = useRoute();
const assetId = Number(route.params.id);
const api = useAssetFlowApi();

let assetValue;

try {
  assetValue = await api.fetchAsset(assetId);
} catch {
  throw createError({ statusCode: 404, statusMessage: 'Asset not found' });
}

const asset = assetValue;
const tickets = await api.fetchTickets();
const relatedTickets = tickets.filter((ticket) => ticket.assetId === asset.id);

useHead({
  title: asset.title,
});
</script>
