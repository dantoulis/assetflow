<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Asset detail"
      :title="asset.title"
      description="This page is designed around the admin actions you described: renew, assign, unassign, inspect ownership context, and follow linked support traffic."
    >
      <template #actions>
        <Button
          class="rounded-2xl"
          @click="toast.message('Renewal action is mocked in the frontend.')"
          >Renew asset</Button
        >
        <Button
          variant="outline"
          class="rounded-2xl"
          @click="toast.message('Assignment dialog will be persisted once the API exists.')"
          >Reassign</Button
        >
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card class="app-surface overflow-hidden">
        <CardContent class="space-y-6 p-6">
          <div class="flex flex-wrap items-center gap-2">
            <StatusBadge :status="asset.type" />
            <StatusBadge :status="asset.status" />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Vendor</p>
              <p class="mt-1 font-semibold">{{ asset.vendor }}</p>
            </div>
            <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Reference</p>
              <p class="mt-1 font-semibold">{{ asset.reference }}</p>
            </div>
            <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Assigned</p>
              <p class="mt-1 font-semibold">{{ owner?.name ?? 'Unassigned' }}</p>
            </div>
            <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Current amount</p>
              <p class="mt-1 font-semibold">{{ formatCurrency(asset.amount, asset.currency) }}</p>
            </div>
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Notes</p>
            <p class="mt-2 text-sm leading-6">{{ asset.notes }}</p>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <MetricCard
          title="Lifecycle"
          :value="formatRelativeDate(asset.renewalAt ?? asset.expiresAt ?? '')"
          delta="Next operational date"
          hint="Renewal and expiry timing is surfaced prominently for admin action."
          tone="warning"
        >
          <template #icon><CalendarClock class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Billing cadence"
          :value="asset.billingCycle"
          delta="Commercial footprint"
          hint="Used later to drive backend renewal logic."
          tone="success"
        >
          <template #icon><Repeat2 class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Linked tickets"
          :value="`${relatedTickets.length}`"
          delta="Support history"
          hint="Conversations currently linked to this asset."
          tone="neutral"
        >
          <template #icon><Ticket class="size-5" /></template>
        </MetricCard>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Ownership context</CardTitle>
          <CardDescription
            >Who has this asset and what admin action would usually follow next.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Purchased</p>
            <p class="mt-1 font-semibold">{{ formatDate(asset.purchasedAt) }}</p>
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Assigned on</p>
            <p class="mt-1 font-semibold">
              {{ asset.assignedAt ? formatDate(asset.assignedAt) : 'Not assigned yet' }}
            </p>
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            <p class="text-sm text-muted-foreground">Owner profile</p>
            <p class="mt-1 font-semibold">{{ owner?.name ?? 'Unassigned inventory' }}</p>
            <p class="mt-2 text-sm text-muted-foreground">
              {{
                owner
                  ? `${owner.team} · ${owner.location}`
                  : 'Ready to be assigned to the next user.'
              }}
            </p>
          </div>
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Linked tickets</CardTitle>
          <CardDescription
            >Support history that should stay visible while ownership and renewal decisions are
            made.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="ticket in relatedTickets"
            :key="ticket.id"
            :to="`/admin/tickets/${ticket.id}`"
            class="block rounded-3xl border border-border/70 bg-background/55 p-4 transition hover:border-primary/20 hover:bg-primary/5"
          >
            <div class="flex flex-wrap items-center gap-2">
              <StatusBadge :status="ticket.priority" />
              <StatusBadge :status="ticket.status" />
            </div>
            <p class="mt-3 font-semibold">{{ ticket.subject }}</p>
            <p class="mt-1 text-sm text-muted-foreground">{{ ticket.preview }}</p>
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
import { toast } from 'vue-sonner';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getAssetById,
  getTicketsForAsset,
  getUserById,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

const route = useRoute();
const asset = getAssetById(route.params.id as string);

if (!asset) throw createError({ statusCode: 404, statusMessage: 'Asset not found' });

useHead({
  title: asset.title,
});

const relatedTickets = getTicketsForAsset(asset.id);
const owner = getUserById(asset.ownerId);
</script>
