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
        <template #icon><Icon name="lucide:users-round" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Admins"
        :value="`${adminCount}`"
        delta="Operational coverage"
        hint="Accounts with elevated access."
        tone="success"
      >
        <template #icon><Icon name="lucide:shield-check" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Avg assigned assets"
        :value="averageAssetCount"
        delta="Per managed user"
        hint="How much inventory follows a typical user."
        tone="warning"
      >
        <template #icon><Icon name="lucide:boxes" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Open tickets"
        :value="`${openTicketCount}`"
        delta="Support load"
        hint="Tickets still active across managed users."
        tone="neutral"
      >
        <template #icon><Icon name="lucide:messages-square" class="size-5" /></template>
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
import { storeToRefs } from 'pinia';
import { getDisplayName, getInitials } from '@/lib/app-formatters';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Users',
});

const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();
const usersStore = useUsersStore();

await Promise.all([usersStore.fetchAll(), assetsStore.fetchAll(), ticketsStore.fetchAll()]);

const { admins, managedUsers, teams } = storeToRefs(usersStore);
const { assets } = storeToRefs(assetsStore);
const { openTickets } = storeToRefs(ticketsStore);
const teamFilter = ref('ALL');

const adminCount = computed(() => admins.value.length);
const openTicketCount = computed(() => openTickets.value.length);
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
  return (assets.value.length / managedUsers.value.length).toFixed(1);
});

const userAssetCount = (userId: number) => assetsStore.byUserId(userId).length;
const userOpenTicketCount = (userId: number) =>
  ticketsStore.byRequesterId(userId).filter((ticket) => ticket.status !== 'RESOLVED').length;
</script>
