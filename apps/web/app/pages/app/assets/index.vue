<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Owned assets"
      title="Everything currently assigned to you."
      description="This view keeps ownership transparent: hardware, subscriptions, renewal timing, and current operational status in one place."
    />

    <section class="grid gap-4 xl:grid-cols-3">
      <MetricCard
        title="Assigned assets"
        :value="`${assets.length}`"
        delta="Current profile footprint"
        hint="Every asset currently linked to your account."
      >
        <template #icon><Boxes class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Renewals due soon"
        :value="`${assets.filter((asset) => ['EXPIRING_SOON', 'EXPIRED'].includes(asset.status)).length}`"
        delta="Watch closely"
        hint="These assets may need support or admin follow-up."
        tone="warning"
      >
        <template #icon><CalendarClock class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Recurring monthly spend"
        :value="formatCurrency(getRecurringMonthlySpend(assets))"
        delta="Software only"
        hint="Recurring services normalized to monthly cost."
        tone="success"
      >
        <template #icon><CreditCard class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>Asset list</CardTitle>
        <CardDescription
          >Focused on the data the user actually cares about: what it is, its state, and when it
          renews or expires.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Asset</TableHead>
              <TableHead>Type</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Next date</TableHead>
              <TableHead class="text-right">Amount</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="asset in assets" :key="asset.id">
              <TableCell>
                <NuxtLink
                  :to="`/app/assets/${asset.id}`"
                  class="font-semibold hover:text-primary"
                  >{{ asset.title }}</NuxtLink
                >
                <p class="text-xs text-muted-foreground">{{ asset.vendor }}</p>
              </TableCell>
              <TableCell><StatusBadge :status="asset.type" /></TableCell>
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
  </div>
</template>

<script setup lang="ts">
import { Boxes, CalendarClock, CreditCard } from 'lucide-vue-next';
import {
  formatCurrency,
  formatRelativeDate,
  getAssetsForUser,
  getRecurringMonthlySpend,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'user',
  middleware: 'auth',
});

const { currentUser } = useMockAuth();

if (!currentUser.value) throw createError({ statusCode: 401, statusMessage: 'Missing session' });

useHead({
  title: 'My Assets',
});

const assets = getAssetsForUser(currentUser.value.id);
</script>
