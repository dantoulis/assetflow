<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="User detail"
      :title="user.name"
      description="The drilldown page merges ownership, subscriptions, support history, and profile posture so an admin can make changes without context switching."
    >
      <template #actions>
        <Button
          class="rounded-2xl"
          @click="toast.message('Role change will become a guarded backend action later.')"
          >Change role</Button
        >
        <Button
          variant="outline"
          class="rounded-2xl"
          @click="toast.message('Suspension is UI-only during the frontend pass.')"
          >Suspend access</Button
        >
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card class="app-surface overflow-hidden">
        <CardContent class="flex flex-col gap-6 p-6 md:flex-row md:items-center md:justify-between">
          <div class="flex items-center gap-4">
            <Avatar class="size-16 border border-white/10">
              <AvatarFallback class="bg-primary/12 text-xl font-semibold text-primary">{{
                user.initials
              }}</AvatarFallback>
            </Avatar>
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="user.role" />
                <StatusBadge :status="user.status" />
              </div>
              <div>
                <p class="text-2xl font-semibold tracking-[-0.04em]">{{ user.name }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ user.team }} · {{ user.company }} · {{ user.location }}
                </p>
              </div>
            </div>
          </div>
          <div class="grid gap-3 text-sm text-muted-foreground">
            <p><span class="font-semibold text-foreground">Email:</span> {{ user.email }}</p>
            <p><span class="font-semibold text-foreground">Phone:</span> {{ user.phone }}</p>
            <p>
              <span class="font-semibold text-foreground">Joined:</span>
              {{ formatDate(user.joinedAt) }}
            </p>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <MetricCard
          title="Assigned assets"
          :value="`${assets.length}`"
          delta="Current footprint"
          hint="Everything currently attributed to this user."
        >
          <template #icon><ShieldCheck class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Recurring spend"
          :value="formatCurrency(recurringSpend)"
          delta="Monthly normalized"
          hint="Only subscriptions and licenses are included."
          tone="success"
        >
          <template #icon><CreditCard class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Open tickets"
          :value="`${tickets.filter((ticket) => ticket.status !== 'RESOLVED').length}`"
          delta="Support load"
          hint="Conversations that still require a reply or decision."
          tone="warning"
        >
          <template #icon><Ticket class="size-5" /></template>
        </MetricCard>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Assigned assets</CardTitle>
          <CardDescription
            >Ownership, expiry pressure, and renewal posture for this user.</CardDescription
          >
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Asset</TableHead>
                <TableHead>Type</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Renewal / expiry</TableHead>
                <TableHead class="text-right">Amount</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              <TableRow v-for="asset in assets" :key="asset.id">
                <TableCell>
                  <NuxtLink
                    :to="`/admin/assets/${asset.id}`"
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

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Recent ticket history</CardTitle>
          <CardDescription>Support state associated with this user.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="ticket in tickets"
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
            <p class="mt-3 text-xs text-muted-foreground">
              Updated {{ formatRelativeDate(ticket.updatedAt) }}
            </p>
          </NuxtLink>

          <div
            class="rounded-3xl border border-border/70 bg-background/55 p-4 text-sm leading-6 text-muted-foreground"
          >
            <div class="mb-3 flex items-center gap-2 font-semibold text-foreground">
              <UserCog class="size-4 text-primary" />
              Admin actions ready for backend wiring
            </div>
            Role change, renewals, reassignment, and account suspension are intentionally
            represented in the UI before the API exists, so the later Nest routes can follow this
            exact admin flow.
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CreditCard, ShieldCheck, Ticket, UserCog } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  formatCurrency,
  formatDate,
  formatRelativeDate,
  getAssetsForUser,
  getTicketsForUser,
  getRecurringMonthlySpend,
  getUserById,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

const route = useRoute();
const userId = route.params.id as string;
const user = getUserById(userId);

if (!user || user.role !== 'USER')
  throw createError({ statusCode: 404, statusMessage: 'User not found' });

useHead({
  title: `${user.name}`,
});

const assets = getAssetsForUser(user.id);
const tickets = getTicketsForUser(user.id);
const recurringSpend = getRecurringMonthlySpend(assets);
</script>
