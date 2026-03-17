<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Profile"
      title="Your account snapshot."
      description="This page reserves space for profile, security, and account preferences while the real auth flow is connected to backend endpoints and the rest of the product still runs on preview data."
    />

    <section class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
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
                  {{ user.team }} - {{ user.company }} - {{ user.location }}
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
          delta="Visible in your workspace"
          hint="All current hardware, licenses, and subscriptions assigned to you."
        >
          <template #icon><UserRound class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Open tickets"
          :value="`${tickets.filter((ticket) => ticket.status !== 'RESOLVED').length}`"
          delta="Active support load"
          hint="Conversations where a reply or action is still pending."
          tone="warning"
        >
          <template #icon><ShieldCheck class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Recurring spend"
          :value="formatCurrency(getRecurringMonthlySpend(assets))"
          delta="Monthly normalized"
          hint="Current recurring software cost tied to your seat."
          tone="success"
        >
          <template #icon><CreditCard class="size-5" /></template>
        </MetricCard>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-2">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Security placeholder</CardTitle>
          <CardDescription
            >Reserved for password recovery, MFA, and trusted-session controls in the backend
            phase.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-3 text-sm leading-6 text-muted-foreground">
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            Password recovery routes already exist in the UI.
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            The cookie-based backend session is real, but route access is still intentionally open
            while the frontend auth flow is being finished.
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            Real credential storage, reset tokens, and audit history will be added later.
          </div>
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Preferences placeholder</CardTitle>
          <CardDescription
            >Theme, notifications, and account metadata will eventually live here.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-3 text-sm leading-6 text-muted-foreground">
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            Theme switching is already live via the header toggle.
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            Ticket notifications and renewal alerts are planned for later backend wiring.
          </div>
          <div class="rounded-3xl border border-border/70 bg-background/55 p-4">
            This page will also be a natural home for profile edits and communication preferences.
          </div>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { CreditCard, ShieldCheck, UserRound } from 'lucide-vue-next';
import {
  formatCurrency,
  formatDate,
  getAssetsForUser,
  getRecurringMonthlySpend,
  getTicketsForUser,
  previewUser,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'user',
});

const user = previewUser;

useHead({
  title: 'Profile',
});

const assets = getAssetsForUser(user.id);
const tickets = getTicketsForUser(user.id);
</script>
