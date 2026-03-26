<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Inventory"
      title="Assets, subscriptions, and renewal pressure."
      description="Scan the inventory, filter by type or status, and drill into anything that needs attention."
    />

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        title="Total assets"
        :value="`${assets.length}`"
        delta="All categories"
        hint="Every hardware and software asset currently tracked."
      >
        <template #icon><Boxes class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Active"
        :value="`${activeAssets.length}`"
        delta="Healthy inventory"
        hint="Assets currently in a healthy operational state."
        tone="success"
      >
        <template #icon><CircleCheckBig class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Renewing soon"
        :value="`${renewingSoon.length}`"
        delta="21-day window"
        hint="Assets likely to need follow-up soon."
        tone="warning"
      >
        <template #icon><CalendarClock class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Repair queue"
        :value="`${inRepairAssets.length}`"
        delta="Hardware"
        hint="Assets currently blocked or being serviced."
        tone="neutral"
      >
        <template #icon><Wrench class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader class="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Asset directory</CardTitle>
          <CardDescription>Filter by type and status to focus the inventory view.</CardDescription>
        </div>
        <div class="grid gap-3 md:grid-cols-2">
          <AppSelectField
            v-model="typeFilter"
            :options="typeFilterOptions"
            placeholder="All asset types"
            trigger-class="min-w-44"
          />
          <AppSelectField
            v-model="statusFilter"
            :options="statusFilterOptions"
            placeholder="All statuses"
            trigger-class="min-w-44"
          />
        </div>
      </CardHeader>
      <CardContent class="space-y-3">
        <NuxtLink
          v-for="asset in filteredAssets"
          :key="asset.id"
          :to="`/admin/assets/${asset.id}`"
          class="app-list-item"
        >
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="asset.type" />
                <StatusBadge :status="asset.status" />
              </div>
              <div>
                <p class="font-semibold">{{ asset.title }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ asset.vendor }} · {{ ownerName(asset.userId) }} ·
                  {{ formatRelativeDate(getAssetNextDate(asset)) }}
                </p>
              </div>
            </div>
            <span class="text-xs text-muted-foreground">{{ asset.reference }}</span>
          </div>
        </NuxtLink>

        <div
          v-if="!filteredAssets.length"
          class="rounded-3xl border border-dashed border-border/70 bg-background/35 p-6 text-sm text-muted-foreground"
        >
          No assets match the current filters.
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { Boxes, CalendarClock, CircleCheckBig, Wrench } from 'lucide-vue-next';
import {
  formatRelativeDate,
  getAssetNextDate,
  getDisplayName,
  humanizeEnum,
} from '@/lib/app-formatters';
import type { AssetStatus, AssetType } from '@/lib/app-types';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Assets',
});

const assetsStore = useAssetsStore();
const usersStore = useUsersStore();

await Promise.all([assetsStore.fetchAll(), usersStore.fetchAll()]);

const { activeAssets, assets, inRepairAssets } = storeToRefs(assetsStore);
const assetTypes: AssetType[] = ['LAPTOP', 'SUBSCRIPTION', 'LICENSE', 'PERIPHERAL'];
const statuses: AssetStatus[] = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'IN_REPAIR'];
const typeFilter = ref<'ALL' | AssetType>('ALL');
const statusFilter = ref<'ALL' | AssetStatus>('ALL');
const typeFilterOptions: Array<{ label: string; value: 'ALL' | AssetType }> = [
  { label: 'All asset types', value: 'ALL' },
  ...assetTypes.map((type) => ({ label: humanizeEnum(type), value: type })),
];
const statusFilterOptions: Array<{ label: string; value: 'ALL' | AssetStatus }> = [
  { label: 'All statuses', value: 'ALL' },
  ...statuses.map((status) => ({ label: humanizeEnum(status), value: status })),
];

const ownerName = (userId: number) => getDisplayName(usersStore.findUserById(userId));
const renewingSoon = computed(() => assetsStore.renewingWithin(21));
const filteredAssets = computed(() =>
  assets.value.filter((asset) => {
    if (typeFilter.value !== 'ALL' && asset.type !== typeFilter.value) return false;
    if (statusFilter.value !== 'ALL' && asset.status !== statusFilter.value) return false;
    return true;
  }),
);
</script>
