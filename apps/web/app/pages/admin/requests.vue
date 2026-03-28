<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Asset requests"
      title="Review incoming demand and fulfill approved requests."
      description="This queue connects user demand with instant provisioning once you approve."
    />

    <section class="grid gap-4 xl:grid-cols-4">
      <MetricCard
        title="All requests"
        :value="`${requests.length}`"
        delta="Total queue"
        hint="Every asset request in the system."
      >
        <template #icon><Icon name="lucide:clipboard-list" class="size-5"  /></template>
      </MetricCard>
      <MetricCard
        title="Pending"
        :value="`${countsByStatus.PENDING}`"
        delta="Needs review"
        hint="Requests still waiting for a decision."
        tone="warning"
      >
        <template #icon><Icon name="lucide:clock-3" class="size-5"  /></template>
      </MetricCard>
      <MetricCard
        title="Approved"
        :value="`${countsByStatus.APPROVED}`"
        delta="Waiting on follow-through"
        hint="Requests approved before provisioning completed."
        tone="success"
      >
        <template #icon><Icon name="lucide:badge-check" class="size-5"  /></template>
      </MetricCard>
      <MetricCard
        title="Fulfilled"
        :value="`${countsByStatus.FULFILLED}`"
        delta="Delivered"
        hint="Requests already linked to a real asset."
        tone="neutral"
      >
        <template #icon><Icon name="lucide:circle-check-big" class="size-5"  /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>Review queue</CardTitle>
        <CardDescription>
          Approve or reject requests directly from the admin surface.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-4">
        <div
          v-for="request in requests"
          :key="request.id"
          class="rounded-3xl border border-border/70 bg-background/55 p-4"
        >
          <div class="flex flex-col gap-4 xl:flex-row xl:items-start xl:justify-between">
            <div class="space-y-3">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="request.status" />
                <StatusBadge v-if="request.assetType" :status="request.assetType" />
              </div>
              <div>
                <p class="font-semibold">{{ request.title }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ userName(request.requesterId) }} |
                  {{ request.vendor || 'No preferred vendor' }}
                </p>
              </div>
              <p class="text-sm leading-6 text-muted-foreground">
                {{ request.justification || 'No justification provided.' }}
              </p>
              <div
                v-if="request.status === 'REJECTED' && request.rejectionReason"
                class="rounded-2xl border border-destructive/25 bg-destructive/6 px-4 py-3 text-sm text-muted-foreground"
              >
                <span class="font-semibold text-foreground">Rejection reason:</span>
                {{ request.rejectionReason }}
              </div>
            </div>

            <div class="flex flex-wrap gap-2 xl:max-w-sm xl:justify-end">
              <Button
                v-if="request.status === 'PENDING'"
                variant="outline"
                class="rounded-2xl"
                :disabled="workingId === request.id"
                @click="reviewRequest(request.id, 'APPROVED')"
              >
                Approve
              </Button>
              <Button
                v-if="request.status === 'PENDING'"
                variant="outline"
                class="rounded-2xl"
                :disabled="workingId === request.id"
                @click="openRejectDialog(request)"
              >
                Reject
              </Button>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>

    <Dialog v-model:open="rejectDialogOpen">
      <DialogContent class="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Reject asset request</DialogTitle>
          <DialogDescription>
            Add a clear reason so the requester knows why this request was declined.
          </DialogDescription>
        </DialogHeader>
        <div class="grid gap-3 py-2">
          <div class="grid gap-1">
            <p class="text-sm font-semibold text-foreground">
              {{ rejectTarget?.title }}
            </p>
            <p class="text-sm text-muted-foreground">
              {{ rejectTarget ? userName(rejectTarget.requesterId) : '' }}
            </p>
          </div>
          <div class="space-y-2">
            <Label for="rejection-reason">Reason for rejection</Label>
            <Textarea
              id="rejection-reason"
              v-model="rejectionReason"
              class="min-h-32 rounded-3xl"
              placeholder="Explain why this request cannot be approved right now..."
            />
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" class="rounded-2xl" @click="rejectDialogOpen = false">
            Cancel
          </Button>
          <Button
            variant="destructive"
            class="rounded-2xl"
            :disabled="workingId === rejectTarget?.id"
            @click="submitRejection"
          >
            {{ workingId === rejectTarget?.id ? 'Rejecting...' : 'Reject request' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>

  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import type { AppAssetRequest, AssetCreatePayload, AssetRequestReviewPayload } from '@/lib/app-types';

definePageMeta({
  layout: 'admin',
});

useHead({
  title: 'Asset Requests',
});

const assetRequestsStore = useAssetRequestsStore();
const assetsStore = useAssetsStore();
const usersStore = useUsersStore();

await Promise.all([assetRequestsStore.fetchAll(), usersStore.fetchAll(), assetsStore.fetchAll()]);

const { countsByStatus, requests } = storeToRefs(assetRequestsStore);
const workingId = ref<number | null>(null);
const rejectDialogOpen = ref(false);
const rejectTarget = ref<AppAssetRequest | null>(null);
const rejectionReason = ref('');

const userName = (userId: number) => {
  const user = usersStore.findUserById(userId);
  return user?.name || user?.username || 'Unknown user';
};
const openRejectDialog = (request: AppAssetRequest) => {
  rejectTarget.value = request;
  rejectionReason.value = '';
  rejectDialogOpen.value = true;
};
const buildProvisionedAssetPayload = (request: AppAssetRequest): AssetCreatePayload => {
  const now = new Date();
  const referenceDate = now.toISOString().slice(0, 10).replaceAll('-', '');

  return {
    title: request.title.trim(),
    type: request.assetType ?? 'LAPTOP',
    status: 'ACTIVE',
    userId: request.requesterId,
    vendor: request.vendor?.trim() || 'Internal procurement',
    reference: `REQ-${request.id}-${referenceDate}`,
    notes: request.justification?.trim() || null,
    tags: ['request-fulfilled'],
  };
};

const reviewRequest = async (id: number, status: AssetRequestReviewPayload['status']) => {
  const request = requests.value.find((entry) => entry.id === id);

  if (!request) {
    toast.error('Unable to find the selected request.');
    return;
  }

  workingId.value = id;

  try {
    if (status === 'APPROVED') {
      await assetRequestsStore.reviewRequest(id, { status });
      const createdAsset = await assetsStore.createAsset(buildProvisionedAssetPayload(request));
      await assetRequestsStore.fulfillRequest(id, { fulfilledAssetId: createdAsset.id });
      await assetsStore.fetchAll(true);
      toast.success('Request approved and asset assigned');
      return;
    }

    await assetRequestsStore.reviewRequest(id, { status });
    toast.success(`Request ${status.toLowerCase()}`);
  } catch {
    await assetRequestsStore.fetchAll(true);
    toast.error(
      status === 'APPROVED'
        ? 'Unable to approve and provision the asset'
        : 'Unable to review request',
    );
  } finally {
    workingId.value = null;
  }
};

const submitRejection = async () => {
  const target = rejectTarget.value;

  if (!target) {
    return;
  }

  if (!rejectionReason.value.trim()) {
    toast.error('Add a rejection reason first.');
    return;
  }

  workingId.value = target.id;

  try {
    await assetRequestsStore.reviewRequest(target.id, {
      status: 'REJECTED',
      rejectionReason: rejectionReason.value.trim(),
    });
    rejectDialogOpen.value = false;
    rejectTarget.value = null;
    rejectionReason.value = '';
    toast.success('Request rejected');
  } catch {
    toast.error('Unable to review request');
  } finally {
    workingId.value = null;
  }
};
</script>

