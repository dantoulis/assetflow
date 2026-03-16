<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Directory"
      title="Users, roles, and ownership snapshots."
      description="This page is shaped around the admin question set: who owns what, how much recurring spend follows each user, and where role or renewal changes are likely next."
    >
      <template #actions>
        <Button
          class="rounded-2xl"
          @click="toast.message('Invite modal will hook into auth later.')"
          >Invite user</Button
        >
        <Button
          variant="outline"
          class="rounded-2xl"
          @click="toast.message('Role matrix is currently represented through status badges only.')"
          >Review permissions</Button
        >
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-3">
      <MetricCard
        title="Active seats"
        :value="`${users.filter((user) => user.status === 'ACTIVE').length}`"
        delta="Stable"
        hint="Users who currently have access and assigned assets."
      >
        <template #icon><UsersRound class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Trial accounts"
        :value="`${users.filter((user) => user.status === 'TRIAL').length}`"
        delta="1 onboarding"
        hint="Profiles likely to require assignment or provisioning help."
        tone="warning"
      >
        <template #icon><ShieldCheck class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Average monthly spend"
        :value="formatCurrency(avgSpend)"
        delta="Per active profile"
        hint="Normalized recurring spend excluding one-time hardware."
        tone="success"
      >
        <template #icon><CreditCard class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>User directory</CardTitle>
        <CardDescription
          >Every line item is structured to map cleanly to later admin actions: role change,
          assignment, suspension, and drilldown.</CardDescription
        >
      </CardHeader>
      <CardContent>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>User</TableHead>
              <TableHead>Status</TableHead>
              <TableHead>Assets</TableHead>
              <TableHead>Open tickets</TableHead>
              <TableHead class="text-right">Monthly spend</TableHead>
              <TableHead class="text-right">View</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            <TableRow v-for="user in users" :key="user.id">
              <TableCell>
                <div class="flex items-center gap-3">
                  <Avatar class="size-10 border border-white/10">
                    <AvatarFallback class="bg-primary/12 text-primary">{{
                      user.initials
                    }}</AvatarFallback>
                  </Avatar>
                  <div>
                    <p class="font-semibold">{{ user.name }}</p>
                    <p class="text-xs text-muted-foreground">{{ user.email }}</p>
                  </div>
                </div>
              </TableCell>
              <TableCell>
                <div class="flex gap-2">
                  <StatusBadge :status="user.role" />
                  <StatusBadge :status="user.status" />
                </div>
              </TableCell>
              <TableCell>{{ getActiveAssetCount(user.id) }}</TableCell>
              <TableCell>{{ getOpenTicketCount(user.id) }}</TableCell>
              <TableCell class="text-right font-medium">
                {{ formatCurrency(getRecurringMonthlySpend(getAssetsForUser(user.id))) }}
              </TableCell>
              <TableCell class="text-right">
                <Button variant="ghost" size="sm" as-child class="rounded-2xl">
                  <NuxtLink :to="`/admin/users/${user.id}`">
                    Open
                    <ArrowUpRight class="size-4" />
                  </NuxtLink>
                </Button>
              </TableCell>
            </TableRow>
          </TableBody>
        </Table>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { ArrowUpRight, CreditCard, ShieldCheck, UsersRound } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  formatCurrency,
  getActiveAssetCount,
  getOpenTicketCount,
  getRecurringMonthlySpend,
  getAssetsForUser,
  mockUsers,
} from '@/lib/mock-data';

definePageMeta({
  layout: 'admin',
  middleware: 'auth',
});

useHead({
  title: 'Users',
});

const users = mockUsers.filter((user) => user.role === 'USER');
const avgSpend = users.length
  ? getRecurringMonthlySpend(users.flatMap((user) => getAssetsForUser(user.id))) / users.length
  : 0;
</script>
