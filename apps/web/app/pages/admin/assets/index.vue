<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Inventory"
      title="Assets, subscriptions, and renewal pressure."
      description="This table is designed for assignment work, renewals, and support triage. Every record exposes ownership, cost, vendor, and the next operational date."
    >
      <template #actions>
        <Button
          class="rounded-2xl"
          @click="toast.message('Assign flow is mocked until the API phase.')"
          >Assign asset</Button
        >
        <Button
          variant="outline"
          class="rounded-2xl"
          @click="toast.message('Bulk renewals will be connected to backend jobs later.')"
          >Renew subscriptions</Button
        >
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        title="Total assets"
        :value="`${mockAssets.length}`"
        delta="All categories"
        hint="Hardware, subscriptions, licenses, and peripherals."
      >
        <template #icon><Boxes class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Assigned"
        :value="`${mockAssets.filter((asset) => asset.ownerId).length}`"
        delta="1 waiting"
        hint="Assets currently attached to a user profile."
        tone="success"
      >
        <template #icon><CreditCard class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Renewing soon"
        :value="`${getExpiringAssets(14).length}`"
        delta="14-day window"
        hint="Subscriptions and licenses likely to need admin action."
        tone="warning"
      >
        <template #icon><CalendarClock class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Repair queue"
        :value="`${mockAssets.filter((asset) => asset.status === 'IN_REPAIR').length}`"
        delta="Hardware"
        hint="Physical inventory currently blocked or being serviced."
        tone="neutral"
      >
        <template #icon><Wrench class="size-5" /></template>
      </MetricCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.35fr_0.65fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Asset directory</CardTitle>
          <CardDescription
            >Structured for assignment, renewal, and ownership changes.</CardDescription
          >
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Next date</TableHead>
                <TableHead class="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="asset in mockAssets" :key="asset.id">
                <TableCell>
                  <NuxtLink
                    :to="`/admin/assets/${asset.id}`"
                    class="font-semibold hover:text-primary"
                    >{{ asset.title }}</NuxtLink
                  >
                  <div class="mt-1 flex flex-wrap gap-2">
                    <StatusBadge :status="asset.type" />
                    <span class="text-xs text-muted-foreground">{{ asset.vendor }}</span>
                  </div>
                </TableCell>
                <TableCell>{{ getUserById(asset.ownerId)?.name ?? 'Unassigned' }}</TableCell>
                <TableCell><StatusBadge :status="asset.status" /></TableCell>
                <TableCell>{{
                  formatRelativeDate(asset.renewalAt ?? asset.expiresAt ?? '')
                }}</TableCell>
                <TableCell class="text-right">{{
                  formatCurrency(asset.amount, asset.currency)
                }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Recurring run-rate</CardTitle>
          <CardDescription
            >Current recurring spend from active subscriptions and licenses.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-6">
          <div>
            <p class="text-sm text-muted-foreground">Monthly normalized spend</p>
            <p class="mt-2 text-4xl font-semibold tracking-[-0.05em]">
              {{ formatCurrency(recurringMonthlySpend) }}
            </p>
          </div>
          <div class="space-y-3">
            <div
              v-for="asset in getExpiringAssets(21)"
              :key="asset.id"
              class="rounded-3xl border border-border/70 bg-background/55 p-4"
            >
              <div class="flex items-center justify-between gap-3">
                <div>
                  <p class="font-semibold">{{ asset.title }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ getUserById(asset.ownerId)?.name ?? 'Unassigned' }}
                  </p>
                </div>
                <StatusBadge :status="asset.status" />
              </div>
              <p class="mt-3 text-sm text-muted-foreground">
                {{ formatRelativeDate(asset.renewalAt ?? asset.expiresAt ?? '') }}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Boxes, CalendarClock, CreditCard, Wrench } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  formatCurrency,
  formatRelativeDate,
  getExpiringAssets,
  getRecurringMonthlySpend,
  getUserById,
  mockAssets,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

useHead({
  title: 'Assets',
});

const recurringMonthlySpend = getRecurringMonthlySpend(mockAssets);
</script>
