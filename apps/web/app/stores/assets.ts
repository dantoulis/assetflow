import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppAsset } from '@/lib/app-types';
import {
  buildStatusDistribution,
  buildTypeDistribution,
  getRenewingAssets,
} from '@/lib/app-analytics';

export const useAssetsStore = defineStore('assets', () => {
  const api = useAssetFlowApi();

  const assets = ref<AppAsset[]>([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  const byId = computed(
    () =>
      Object.fromEntries(assets.value.map((asset) => [asset.id, asset])) as Record<
        number,
        AppAsset
      >,
  );
  const count = computed(() => assets.value.length);
  const activeAssets = computed(() => assets.value.filter((asset) => asset.status === 'ACTIVE'));
  const inRepairAssets = computed(() =>
    assets.value.filter((asset) => asset.status === 'IN_REPAIR'),
  );
  const statusDistribution = computed(() => buildStatusDistribution(assets.value));
  const typeDistribution = computed(() => buildTypeDistribution(assets.value));

  const resetStoreState = () => {
    assets.value = [];
    isLoaded.value = false;
    isLoading.value = false;
  };

  const replaceAll = (nextAssets: AppAsset[]) => {
    assets.value = nextAssets;
    isLoaded.value = true;
  };

  const upsert = (asset: AppAsset) => {
    const index = assets.value.findIndex((entry) => entry.id === asset.id);

    if (index === -1) {
      assets.value = [asset, ...assets.value];
      return asset;
    }

    assets.value[index] = asset;
    assets.value = [...assets.value];
    return asset;
  };

  const fetchAll = async (force = false) => {
    if (isLoaded.value && !force) {
      return assets.value;
    }

    isLoading.value = true;

    try {
      const nextAssets = await api.fetchAssets();
      replaceAll(nextAssets);
      return assets.value;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchOne = async (id: number, force = false) => {
    const cachedAsset = byId.value[id];

    if (cachedAsset && !force) {
      return cachedAsset;
    }

    const asset = await api.fetchAsset(id);
    return upsert(asset);
  };

  const byUserId = (userId: number) => assets.value.filter((asset) => asset.userId === userId);
  const titleFor = (assetId: number | null) =>
    assets.value.find((asset) => asset.id === assetId)?.title ?? 'General request';
  const renewingWithin = (days: number) => getRenewingAssets(assets.value, days);
  const urgentRenewals = (limit: number, days = 7) => renewingWithin(days).slice(0, limit);

  return {
    assets,
    byId,
    count,
    activeAssets,
    inRepairAssets,
    statusDistribution,
    typeDistribution,
    isLoaded,
    isLoading,
    resetStoreState,
    fetchAll,
    fetchOne,
    byUserId,
    titleFor,
    renewingWithin,
    urgentRenewals,
    replaceAll,
    upsert,
  };
});
