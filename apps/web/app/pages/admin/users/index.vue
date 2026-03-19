<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Directory"
      title="Users, roles, and ownership snapshots."
      description="Review who owns what, where support load is building, and which accounts might need attention next."
    />

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        title="Managed users"
        :value="`${managedUsers.length}`"
        delta="Active directory"
        hint="Every non-admin account currently visible to the workspace."
      >
        <template #icon><UsersRound class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Admins"
        :value="`${adminCount}`"
        delta="Operational coverage"
        hint="Accounts with elevated access."
        tone="success"
      >
        <template #icon><ShieldCheck class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Avg assigned assets"
        :value="averageAssetCount"
        delta="Per managed user"
        hint="How much inventory follows a typical user."
        tone="warning"
      >
        <template #icon><Boxes class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Open tickets"
        :value="`${openTickets}`"
        delta="Support load"
        hint="Tickets still active across managed users."
        tone="neutral"
      >
        <template #icon><MessagesSquare class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader class="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>User directory</CardTitle>
          <CardDescription>Filter by team to focus on specific groups.</CardDescription>
        </div>
        <AppSelectField
          v-model="teamFilter"
          :options="teamOptions"
          placeholder="All teams"
          trigger-class="min-w-48"
        />
      </CardHeader>
      <CardContent class="space-y-3">
        <NuxtLink
          v-for="user in filteredUsers"
          :key="user.id"
          :to="`/admin/users/${user.id}`"
          class="app-list-item"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-2">
              <div class="flex items-center gap-3">
                <Avatar class="size-10 border border-white/10">
                  <AvatarFallback class="bg-primary/12 text-primary">
                    {{ getInitials(user) }}
                  </AvatarFallback>
                </Avatar>
                <div>
                  <p class="font-semibold">{{ getDisplayName(user) }}</p>
                  <p class="text-sm text-muted-foreground">{{ user.email }}</p>
                </div>
              </div>
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="user.role" />
                <span class="text-xs text-muted-foreground">
                  {{ user.team || 'No team' }} | {{ user.location || 'No location' }}
                </span>
              </div>
            </div>
            <div class="text-right text-sm text-muted-foreground">
              <p>{{ userAssetCount(user.id) }} assets</p>
              <p>{{ userOpenTicketCount(user.id) }} open tickets</p>
            </div>
          </div>
        </NuxtLink>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { Boxes, MessagesSquare, ShieldCheck, UsersRound } from 'lucide-vue-next';
import { getDisplayName, getInitials } from '@/lib/app-formatters';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Users',
});

const api = useAssetFlowApi();
const [users, assets, tickets] = await Promise.all([
  api.fetchUsers(),
  api.fetchAssets(),
  api.fetchTickets(),
]);
const teamFilter = ref('ALL');

const managedUsers = computed(() => users.filter((user) => user.role === 'USER'));
const adminCount = computed(() => users.filter((user) => user.role === 'ADMIN').length);
const openTickets = computed(() => tickets.filter((ticket) => ticket.status !== 'RESOLVED').length);
const teams = computed(
  () => [...new Set(managedUsers.value.map((user) => user.team).filter(Boolean))] as string[],
);
const teamOptions = computed(() => [
  { label: 'All teams', value: 'ALL' },
  ...teams.value.map((team) => ({ label: team, value: team })),
]);
const filteredUsers = computed(() =>
  managedUsers.value.filter((user) =>
    teamFilter.value === 'ALL' ? true : user.team === teamFilter.value,
  ),
);
const averageAssetCount = computed(() => {
  if (!managedUsers.value.length) return '0';
  return (assets.length / managedUsers.value.length).toFixed(1);
});

const userAssetCount = (userId: number) => assets.filter((asset) => asset.userId === userId).length;
const userOpenTicketCount = (userId: number) =>
  tickets.filter((ticket) => ticket.requesterId === userId && ticket.status !== 'RESOLVED').length;
</script>
