<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Operations overview"
      title="System-level visibility without leaving the desk."
      description="This dashboard is shaped for the admin role: all users, all assigned assets, renewal pressure, open support traffic, and spend snapshots in one scan."
    >
      <template #actions>
        <Button
          class="rounded-2xl"
          @click="toast.message('Asset creation flow stays frontend-only for now.')"
          >Add asset</Button
        >
        <Button
          variant="outline"
          class="rounded-2xl"
          @click="toast.message('User invite flow will be backed by auth later.')"
          >Invite user</Button
        >
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        v-for="(metric, index) in dashboard.metrics"
        :key="metric.label"
        :title="metric.label"
        :value="metric.value"
        :delta="metric.delta"
        :hint="metric.hint"
        :tone="index === 1 ? 'success' : index === 3 ? 'warning' : 'primary'"
      >
        <template #icon>
          <component :is="metricIcons[index]" class="size-5" />
        </template>
      </MetricCard>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.5fr_1fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader class="flex flex-row items-start justify-between gap-4 space-y-0">
          <div class="space-y-1">
            <CardTitle>Recurring spend trend</CardTitle>
            <CardDescription
              >Monthly normalized spend across all subscriptions and licenses.</CardDescription
            >
          </div>
          <div class="rounded-2xl bg-primary/10 p-3 text-primary">
            <TrendingUp class="size-5" />
          </div>
        </CardHeader>
        <CardContent class="space-y-6">
          <div class="flex flex-wrap items-end justify-between gap-3">
            <div>
              <p class="text-sm text-muted-foreground">Current run-rate</p>
              <p class="text-4xl font-semibold tracking-[-0.05em]">{{ formatCurrency(5180) }}</p>
            </div>
            <Badge
              variant="outline"
              class="rounded-full border-emerald-500/20 bg-emerald-500/10 px-3 py-1 text-emerald-700 dark:text-emerald-300"
            >
              +5.3% vs last month
            </Badge>
          </div>
          <TrendChart :points="dashboard.spendSeries" />
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Asset mix</CardTitle>
          <CardDescription>Where the current inventory budget is concentrated.</CardDescription>
        </CardHeader>
        <CardContent>
          <DistributionDonut
            :segments="dashboard.distribution"
            center-label="Assets"
            center-value="9"
          />
        </CardContent>
      </Card>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.25fr_1fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Renewals due in the next 21 days</CardTitle>
          <CardDescription
            >These licenses and subscriptions will need attention soon.</CardDescription
          >
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Owner</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Due</TableHead>
                <TableHead class="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="asset in dashboard.renewals" :key="asset.id">
                <TableCell>
                  <NuxtLink
                    :to="`/admin/assets/${asset.id}`"
                    class="font-semibold hover:text-primary"
                  >
                    {{ asset.title }}
                  </NuxtLink>
                  <p class="text-xs text-muted-foreground">{{ asset.vendor }}</p>
                </TableCell>
                <TableCell>{{ getUserById(asset.ownerId)?.name ?? 'Unassigned' }}</TableCell>
                <TableCell><StatusBadge :status="asset.status" /></TableCell>
                <TableCell>{{
                  formatRelativeDate(asset.renewalAt ?? asset.expiresAt ?? '')
                }}</TableCell>
                <TableCell class="text-right font-medium">{{
                  formatCurrency(asset.amount, asset.currency)
                }}</TableCell>
              </TableRow>
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Tickets needing attention</CardTitle>
          <CardDescription>Newest queue pressure, sorted by most recent updates.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="ticket in dashboard.ticketsNeedingAttention"
            :key="ticket.id"
            :to="`/admin/tickets/${ticket.id}`"
            class="block rounded-3xl border border-border/70 bg-background/55 p-4 transition hover:border-primary/20 hover:bg-primary/5"
          >
            <div class="flex items-start justify-between gap-3">
              <div class="space-y-1">
                <p class="font-semibold">{{ ticket.subject }}</p>
                <p class="text-sm text-muted-foreground">{{ ticket.preview }}</p>
              </div>
              <StatusBadge :status="ticket.priority" />
            </div>
            <div class="mt-4 flex flex-wrap items-center gap-2 text-xs text-muted-foreground">
              <StatusBadge :status="ticket.status" />
              <span>{{ getUserById(ticket.userId)?.name }}</span>
              <span>·</span>
              <span>{{ formatRelativeDate(ticket.updatedAt) }}</span>
            </div>
          </NuxtLink>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Boxes, CreditCard, MessageSquareDot, TrendingUp, UsersRound } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  buildAdminDashboard,
  formatCurrency,
  formatRelativeDate,
  getUserById,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Admin Dashboard',
});

const dashboard = buildAdminDashboard();
const metricIcons = [UsersRound, Boxes, CreditCard, MessageSquareDot];
</script>
