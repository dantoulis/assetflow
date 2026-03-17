<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Personal workspace"
      title="Your assets, renewals, and support threads."
      description="The user dashboard stays narrower than the admin one on purpose. It is optimized for ownership clarity, upcoming renewals, and the latest replies on active tickets."
    />

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        v-for="(metric, index) in dashboard.metrics"
        :key="metric.label"
        :title="metric.label"
        :value="metric.value"
        :delta="metric.delta"
        :hint="metric.hint"
        :tone="index === 1 ? 'warning' : index === 3 ? 'success' : 'primary'"
      >
        <template #icon>
          <component :is="metricIcons[index]" class="size-5" />
        </template>
      </MetricCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Your recurring tooling spend</CardTitle>
          <CardDescription
            >Only recurring services tied to your profile are included here.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-6">
          <div>
            <p class="text-sm text-muted-foreground">Current run-rate</p>
            <p class="mt-2 text-4xl font-semibold tracking-[-0.05em]">
              {{ formatCurrency(recurringSpend) }}
            </p>
          </div>
          <TrendChart
            :points="dashboard.spendSeries"
            stroke="var(--color-chart-2)"
            fill="color-mix(in oklab, var(--color-chart-2) 18%, transparent)"
          />
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>What you have assigned</CardTitle>
          <CardDescription
            >At-a-glance distribution across hardware and subscriptions.</CardDescription
          >
        </CardHeader>
        <CardContent>
          <DistributionDonut
            :segments="dashboard.distribution"
            center-label="Assigned"
            :center-value="`${dashboard.distribution.reduce((sum, item) => sum + item.value, 0)}`"
          />
        </CardContent>
      </Card>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.05fr_0.95fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Renewals coming up</CardTitle>
          <CardDescription
            >Subscriptions and licenses that need your attention soon.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="asset in dashboard.renewals"
            :key="asset.id"
            :to="`/app/assets/${asset.id}`"
            class="flex items-center justify-between gap-4 rounded-3xl border border-border/70 bg-background/55 p-4 transition hover:border-primary/20 hover:bg-primary/5"
          >
            <div>
              <p class="font-semibold">{{ asset.title }}</p>
              <p class="text-sm text-muted-foreground">
                {{ asset.vendor }} ·
                {{ formatRelativeDate(asset.renewalAt ?? asset.expiresAt ?? '') }}
              </p>
            </div>
            <div class="text-right">
              <StatusBadge :status="asset.status" />
            </div>
          </NuxtLink>

          <div
            v-if="!dashboard.renewals.length"
            class="rounded-3xl border border-dashed border-border/70 bg-background/35 p-6 text-sm text-muted-foreground"
          >
            Nothing is expiring soon. Your current assignments are in a healthy state.
          </div>
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Recent support activity</CardTitle>
          <CardDescription>The latest movement on your ticket threads.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="ticket in dashboard.tickets"
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
            <p class="mt-3 text-xs text-muted-foreground">
              Updated {{ formatRelativeDate(ticket.updatedAt) }}
            </p>
          </NuxtLink>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Boxes, CreditCard, MessageSquareMore, TimerReset } from 'lucide-vue-next';
import {
  buildUserDashboard,
  formatCurrency,
  formatRelativeDate,
  getAssetsForUser,
  getRecurringMonthlySpend,
  previewUser,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'user',
});

useHead({
  title: 'My Dashboard',
});

const viewer = previewUser;
const dashboard = buildUserDashboard(viewer.id);
const metricIcons = [Boxes, TimerReset, MessageSquareMore, CreditCard];
const recurringSpend = getRecurringMonthlySpend(getAssetsForUser(viewer.id));
</script>
