<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Asset detail"
      :title="asset.title"
      description="The user detail surface focuses on clarity rather than control: what the asset is, what state it is in, and what support conversations are already attached to it."
    >
      <template #actions>
        <Button
          class="rounded-2xl"
          @click="toast.message('Ticket creation stays frontend-only for now.')"
          >Open support ticket</Button
        >
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
            <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Vendor</p>
              <p class="mt-1 font-semibold">{{ asset.vendor }}</p>
            </div>
            <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Reference</p>
              <p class="mt-1 font-semibold">{{ asset.reference }}</p>
            </div>
            <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
              <p class="text-sm text-muted-foreground">Assigned on</p>
              <p class="mt-1 font-semibold">
                {{ asset.assignedAt ? formatDate(asset.assignedAt) : 'Pending' }}
              </p>
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
          title="Next key date"
          :value="formatRelativeDate(asset.renewalAt ?? asset.expiresAt ?? '')"
          delta="Renewal or expiry"
          hint="The date your admin team is most likely watching for this asset."
          tone="warning"
        >
          <template #icon><TimerReset class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Support coverage"
          :value="`${relatedTickets.length} linked threads`"
          delta="Conversation history"
          hint="Support threads already attached to this asset."
          tone="neutral"
        >
          <template #icon><LifeBuoy class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="State"
          :value="asset.status.replaceAll('_', ' ')"
          delta="Operational posture"
          hint="This badge system is meant to mirror the future backend enum."
          tone="success"
        >
          <template #icon><ShieldCheck class="size-5" /></template>
        </MetricCard>
      </div>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>Related support conversations</CardTitle>
        <CardDescription
          >Any ticket already opened against this asset stays easy to find.</CardDescription
        >
      </CardHeader>
      <CardContent class="space-y-3">
        <NuxtLink
          v-for="ticket in relatedTickets"
          :key="ticket.id"
          :to="`/app/tickets/${ticket.id}`"
          class="block rounded-3xl border border-border/70 bg-background/55 p-4 transition hover:border-primary/20 hover:bg-primary/5"
        >
          <div class="flex flex-wrap items-center gap-2">
            <StatusBadge :status="ticket.status" />
            <StatusBadge :status="ticket.priority" />
          </div>
          <p class="mt-3 font-semibold">{{ ticket.subject }}</p>
          <p class="mt-1 text-sm text-muted-foreground">{{ ticket.preview }}</p>
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
import { toast } from 'vue-sonner';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getAssetById,
  getTicketsForAsset,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'user',
  middleware: 'auth',
});

const route = useRoute();
const asset = getAssetById(route.params.id as string);

if (!asset) throw createError({ statusCode: 404, statusMessage: 'Asset not found' });

useHead({
  title: asset.title,
});

const relatedTickets = getTicketsForAsset(asset.id);
</script>
