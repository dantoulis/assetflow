<template>
  <div class="space-y-6">
    <PageIntro
      eyebrow="Asset requests"
      title="Request new tools and hardware."
      description="Track every request you have opened with the admin team and create new ones when you need access."
    >
      <template #actions>
        <Dialog v-model:open="dialogOpen">
          <DialogTrigger as-child>
            <Button class="rounded-2xl">
              <ClipboardPlus class="size-4" />
              New request
            </Button>
          </DialogTrigger>
          <DialogContent class="rounded-3xl sm:max-w-xl">
            <DialogHeader>
              <DialogTitle>Create asset request</DialogTitle>
              <DialogDescription>
                Tell the admin team what you need and why you need it.
              </DialogDescription>
            </DialogHeader>
            <div class="grid gap-4 py-2">
              <div class="space-y-2">
                <Label for="request-title">Title</Label>
                <Input id="request-title" v-model="draft.title" class="h-11 rounded-2xl" />
              </div>
              <div class="space-y-2">
                <Label for="request-type">Requested type</Label>
                <AppSelectField
                  id="request-type"
                  v-model="draft.assetType"
                  :options="requestTypeOptions"
                  placeholder="Choose a type"
                />
              </div>
              <div class="space-y-2">
                <Label for="request-vendor">Preferred vendor</Label>
                <Input id="request-vendor" v-model="draft.vendor" class="h-11 rounded-2xl" />
              </div>
              <div class="space-y-2">
                <Label for="request-justification">Justification</Label>
                <Textarea
                  id="request-justification"
                  v-model="draft.justification"
                  class="min-h-32 rounded-3xl"
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" class="rounded-2xl" @click="dialogOpen = false">
                Cancel
              </Button>
              <Button class="rounded-2xl" :disabled="creating" @click="submitRequest">
                {{ creating ? 'Submitting...' : 'Submit request' }}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </template>
    </PageIntro>

    <section class="grid gap-4 xl:grid-cols-3">
      <MetricCard
        title="All requests"
        :value="`${requests.length}`"
        delta="History"
        hint="Every asset request on your account."
      >
        <template #icon><ClipboardList class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Pending"
        :value="`${countsByStatus.PENDING}`"
        delta="Awaiting review"
        hint="Requests the admin team has not decided yet."
        tone="warning"
      >
        <template #icon><Clock3 class="size-5" /></template>
      </MetricCard>
      <MetricCard
        title="Fulfilled"
        :value="`${countsByStatus.FULFILLED}`"
        delta="Delivered"
        hint="Requests already turned into assigned assets."
        tone="success"
      >
        <template #icon><CircleCheckBig class="size-5" /></template>
      </MetricCard>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>Request history</CardTitle>
        <CardDescription>
          Review outcomes, vendors, and the latest status of each request.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-3">
        <div v-for="request in requests" :key="request.id" class="app-list-item">
          <div class="flex flex-wrap items-start justify-between gap-3">
            <div class="space-y-2">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="request.status" />
                <StatusBadge v-if="request.assetType" :status="request.assetType" />
              </div>
              <div>
                <p class="font-semibold">{{ request.title }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ request.vendor || 'No preferred vendor' }} | Opened
                  {{ formatDate(request.createdAt) }}
                </p>
              </div>
              <p class="text-sm leading-6 text-muted-foreground">
                {{ request.justification || 'No justification provided.' }}
              </p>
              <div
                v-if="request.status === 'REJECTED' && request.rejectionReason"
                class="rounded-2xl border border-destructive/25 bg-destructive/6 px-4 py-3 text-sm text-muted-foreground"
              >
                <span class="font-semibold text-foreground">Why it was rejected:</span>
                {{ request.rejectionReason }}
              </div>
            </div>
            <div class="text-right text-xs text-muted-foreground">
              <p v-if="request.reviewedAt">Reviewed {{ formatDate(request.reviewedAt) }}</p>
              <p v-if="request.fulfilledAssetId">Asset #{{ request.fulfilledAssetId }}</p>
            </div>
          </div>
        </div>

        <div
          v-if="!requests.length"
          class="rounded-3xl border border-dashed border-border/70 bg-background/35 p-6 text-sm text-muted-foreground"
        >
          You have not created an asset request yet.
        </div>
      </CardContent>
    </Card>
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { CircleCheckBig, ClipboardList, ClipboardPlus, Clock3 } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { formatDate, humanizeEnum } from '@/lib/app-formatters';
import type { AssetRequestCreatePayload, AssetType } from '@/lib/app-types';

definePageMeta({
  layout: 'user',
});

useHead({
  title: 'Requests',
});

const assetRequestsStore = useAssetRequestsStore();

await assetRequestsStore.fetchAll();

const { countsByStatus, requests } = storeToRefs(assetRequestsStore);
const assetTypes: AssetType[] = ['LAPTOP', 'SUBSCRIPTION', 'LICENSE', 'PERIPHERAL'];
const requestTypeOptions = [
  { label: 'No preference', value: 'NONE' },
  ...assetTypes.map((type) => ({ label: humanizeEnum(type), value: type })),
] as Array<{ label: string; value: AssetType | 'NONE' }>;
const dialogOpen = ref(false);
const creating = ref(false);
const draft = reactive({
  title: '',
  assetType: 'NONE' as AssetType | 'NONE',
  vendor: '',
  justification: '',
});

const resetDraft = () => {
  draft.title = '';
  draft.assetType = 'NONE';
  draft.vendor = '';
  draft.justification = '';
};

const submitRequest = async () => {
  if (!draft.title.trim()) {
    toast.error('Add a request title first.');
    return;
  }

  creating.value = true;

  try {
    const payload: AssetRequestCreatePayload = {
      title: draft.title.trim(),
      ...(draft.assetType !== 'NONE' ? { assetType: draft.assetType as AssetType } : {}),
      ...(draft.vendor.trim() ? { vendor: draft.vendor.trim() } : {}),
      ...(draft.justification.trim() ? { justification: draft.justification.trim() } : {}),
    };

    await assetRequestsStore.createRequest(payload);
    dialogOpen.value = false;
    resetDraft();
    toast.success('Asset request submitted');
  } catch {
    toast.error('Unable to create asset request');
  } finally {
    creating.value = false;
  }
};
</script>
