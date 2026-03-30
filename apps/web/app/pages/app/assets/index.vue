<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="My assets"
      title="Everything assigned to your account."
      description="Track the assets on your profile, watch upcoming renewals, and jump directly into any related support conversation."
    />

    <section class="grid gap-4 xl:grid-cols-3">
      <MetricCard
        title="Assigned assets"
        :value="`${assets.length}`"
        delta="Current footprint"
        hint="Every asset currently linked to your account."
      >
        <template #icon><Icon name="lucide:boxes" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Renewals due soon"
        :value="`${renewingSoon.length}`"
        delta="Next 21 days"
        hint="Assets likely to need attention soon."
        tone="warning"
      >
        <template #icon><Icon name="lucide:calendar-clock" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Linked tickets"
        :value="`${assetsWithTickets}`"
        delta="Support context"
        hint="Assets that already have support history attached."
        tone="success"
      >
        <template #icon><Icon name="lucide:life-buoy" class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader class="gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <CardTitle>Asset list</CardTitle>
          <CardDescription
            >Filter by type to focus on the assets you need right now.</CardDescription
          >
        </div>
        <AppSelectField
          v-model="typeFilter"
          :options="typeFilterOptions"
          placeholder="All asset types"
          trigger-class="min-w-44"
        />
      </CardHeader>
      <CardContent class="space-y-3">
        <NuxtLink
          v-for="asset in filteredAssets"
          :key="asset.id"
          :to="`/app/assets/${asset.id}`"
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
                  {{ asset.vendor }} · {{ asset.reference }} ·
                  {{ formatRelativeDate(getAssetNextDate(asset)) }}
                </p>
              </div>
            </div>
            <span class="text-xs text-muted-foreground">
              {{ linkedTicketCount(asset.id) }} linked
              {{ linkedTicketCount(asset.id) === 1 ? 'ticket' : 'tickets' }}
            </span>
          </div>
        </NuxtLink>

        <div v-if="!filteredAssets.length" class="app-empty-state">
          No assets match the current filter.
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { formatRelativeDate, getAssetNextDate, humanizeEnum } from '@/lib/app-formatters';
import type { AssetType } from '@/lib/app-types';

definePageMeta({
  layout: 'user',
});

useHead({
  title: 'My Assets',
});

const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();

await Promise.all([assetsStore.fetchAll(), ticketsStore.fetchAll()]);

const { assets } = storeToRefs(assetsStore);
const assetTypes: AssetType[] = ['LAPTOP', 'SUBSCRIPTION', 'LICENSE', 'PERIPHERAL'];
const typeFilter = ref<'ALL' | AssetType>('ALL');
const typeFilterOptions: Array<{ label: string; value: 'ALL' | AssetType }> = [
  { label: 'All asset types', value: 'ALL' },
  ...assetTypes.map((type) => ({ label: humanizeEnum(type), value: type })),
];

const renewingSoon = computed(() => assetsStore.renewingWithin(21));
const assetsWithTickets = computed(
  () => assets.value.filter((asset) => ticketsStore.byAssetId(asset.id).length > 0).length,
);
const filteredAssets = computed(() =>
  assets.value.filter((asset) =>
    typeFilter.value === 'ALL' ? true : asset.type === typeFilter.value,
  ),
);

const linkedTicketCount = (assetId: number) => ticketsStore.byAssetId(assetId).length;
</script>
