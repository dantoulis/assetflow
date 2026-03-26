import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { buildStatusDistribution } from '@/lib/app-analytics';
import type {
  AppAssetRequest,
  AssetRequestCreatePayload,
  AssetRequestFulfillPayload,
  AssetRequestReviewPayload,
  AssetRequestUpdatePayload,
} from '@/lib/app-types';
import { removeItemById } from './store-helpers';

export const useAssetRequestsStore = defineStore('assetRequests', () => {
  const getApi = () => useAssetFlowApi();

  const requests = ref<AppAssetRequest[]>([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  const count = computed(() => requests.value.length);
  const countsByStatus = computed(() => ({
    PENDING: requests.value.filter((request) => request.status === 'PENDING').length,
    APPROVED: requests.value.filter((request) => request.status === 'APPROVED').length,
    REJECTED: requests.value.filter((request) => request.status === 'REJECTED').length,
    FULFILLED: requests.value.filter((request) => request.status === 'FULFILLED').length,
  }));
  const pendingRequests = computed(() =>
    requests.value.filter((request) => request.status === 'PENDING'),
  );
  const actionableRequests = computed(() =>
    requests.value.filter(
      (request) => request.status === 'PENDING' || request.status === 'APPROVED',
    ),
  );
  const statusDistribution = computed(() => buildStatusDistribution(requests.value));

  const resetStoreState = () => {
    requests.value = [];
    isLoaded.value = false;
    isLoading.value = false;
  };

  const replaceAll = (nextRequests: AppAssetRequest[]) => {
    requests.value = nextRequests;
    isLoaded.value = true;
  };

  const upsert = (request: AppAssetRequest) => {
    const index = requests.value.findIndex((entry) => entry.id === request.id);

    if (index === -1) {
      requests.value = [request, ...requests.value];
      return request;
    }

    requests.value[index] = request;
    requests.value = [...requests.value];
    return request;
  };

  const findRequestById = (id: number) =>
    requests.value.find((request) => request.id === id) ?? null;

  const fetchAll = async (force = false) => {
    if (isLoaded.value && !force) {
      return requests.value;
    }

    const api = getApi();
    isLoading.value = true;

    try {
      const nextRequests = await api.fetchAssetRequests();
      replaceAll(nextRequests);
      return requests.value;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchOne = async (id: number, force = false) => {
    const cachedRequest = findRequestById(id);

    if (cachedRequest && !force) {
      return cachedRequest;
    }

    const api = getApi();
    const request = await api.fetchAssetRequest(id);
    return upsert(request);
  };

  const createRequest = async (payload: AssetRequestCreatePayload) => {
    const api = getApi();
    const createdRequest = await api.createAssetRequest(payload);
    return upsert(createdRequest);
  };

  const updateRequest = async (id: number, payload: AssetRequestUpdatePayload) => {
    const api = getApi();
    const updatedRequest = await api.updateAssetRequest(id, payload);
    return upsert(updatedRequest);
  };

  const reviewRequest = async (id: number, payload: AssetRequestReviewPayload) => {
    const api = getApi();
    const updatedRequest = await api.reviewAssetRequest(id, payload);
    return upsert(updatedRequest);
  };

  const fulfillRequest = async (id: number, payload: AssetRequestFulfillPayload) => {
    const api = getApi();
    const updatedRequest = await api.fulfillAssetRequest(id, payload);
    return upsert(updatedRequest);
  };

  const deleteRequest = async (id: number) => {
    const api = getApi();
    const deletedRequest = await api.deleteAssetRequest(id);
    requests.value = removeItemById(requests.value, id);
    return deletedRequest;
  };

  const byRequesterId = (requesterId: number) =>
    requests.value.filter((request) => request.requesterId === requesterId);
  const byReviewerId = (reviewedById: number) =>
    requests.value.filter((request) => request.reviewedById === reviewedById);
  const recent = (limit: number) =>
    [...requests.value]
      .sort(
        (left, right) => new Date(right.createdAt).getTime() - new Date(left.createdAt).getTime(),
      )
      .slice(0, limit);
  const reviewQueue = (limit: number) =>
    [...actionableRequests.value]
      .sort(
        (left, right) => new Date(left.createdAt).getTime() - new Date(right.createdAt).getTime(),
      )
      .slice(0, limit);
  const recentByRequester = (requesterId: number, limit: number) =>
    byRequesterId(requesterId).slice(0, limit);

  return {
    requests,
    count,
    countsByStatus,
    pendingRequests,
    actionableRequests,
    statusDistribution,
    isLoaded,
    isLoading,
    resetStoreState,
    fetchAll,
    fetchOne,
    createRequest,
    updateRequest,
    reviewRequest,
    fulfillRequest,
    deleteRequest,
    byRequesterId,
    byReviewerId,
    recent,
    reviewQueue,
    recentByRequester,
    replaceAll,
    upsert,
    findRequestById,
  };
});
