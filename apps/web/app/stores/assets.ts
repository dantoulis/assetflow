import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import type { AppAsset, AssetCreatePayload, AssetUpdatePayload } from '@/lib/app-types';
import {
  buildStatusDistribution,
  buildTypeDistribution,
  getRenewingAssets,
} from '@/lib/app-analytics';
import { removeItemById } from './store-helpers';

export const useAssetsStore = defineStore('assets', () => {
  const getApi = () => useAssetFlowApi();

  const assets = ref<AppAsset[]>([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

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

  const removeFromState = (id: number) => {
    assets.value = removeItemById(assets.value, id);
  };

  const fetchAll = async (force = false) => {
    if (isLoaded.value && !force) {
      return assets.value;
    }

    const api = getApi();
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
    const cachedAsset = findAssetById(id);

    if (cachedAsset && !force) {
      return cachedAsset;
    }

    const api = getApi();
    const asset = await api.fetchAsset(id);
    return upsert(asset);
  };

  const createAsset = async (payload: AssetCreatePayload) => {
    const api = getApi();
    const createdAsset = await api.createAsset(payload);
    return upsert(createdAsset);
  };

  const updateAsset = async (id: number, payload: AssetUpdatePayload) => {
    const api = getApi();
    const updatedAsset = await api.updateAsset(id, payload);
    return upsert(updatedAsset);
  };

  const deleteAsset = async (id: number) => {
    const api = getApi();
    const deletedAsset = await api.deleteAsset(id);
    removeFromState(id);
    return deletedAsset;
  };

  const findAssetById = (id: number) => assets.value.find((asset) => asset.id === id) ?? null;
  const byUserId = (userId: number) => assets.value.filter((asset) => asset.userId === userId);
  const titleFor = (assetId: number | null) =>
    findAssetById(assetId ?? -1)?.title ?? 'General request';
  const renewingWithin = (days: number) => getRenewingAssets(assets.value, days);
  const urgentRenewals = (limit: number, days = 7) => renewingWithin(days).slice(0, limit);

  return {
    assets,
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
    createAsset,
    updateAsset,
    deleteAsset,
    byUserId,
    findAssetById,
    titleFor,
    renewingWithin,
    urgentRenewals,
    replaceAll,
    upsert,
  };
});
