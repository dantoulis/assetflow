<template>
  <div v-if="asset" class="space-y-6">
    <PageIntro
      eyebrow="Asset detail"
      :title="asset.title"
      description="Review ownership context, lifecycle dates, and linked ticket history for this asset."
    />

    <section class="grid gap-4 xl:grid-cols-[1.1fr_0.9fr]">
      <Card class="app-surface overflow-hidden">
        <CardContent class="space-y-6 p-6">
          <div class="flex flex-wrap items-center gap-2">
            <StatusBadge :status="asset.type" />
            <StatusBadge :status="asset.status" />
          </div>
          <div class="grid gap-4 md:grid-cols-2">
            <div class="app-inset-panel grid gap-1 p-4">
              <p class="text-sm text-muted-foreground">Vendor</p>
              <p class="font-semibold">{{ asset.vendor }}</p>
            </div>
            <div class="app-inset-panel grid gap-1 p-4">
              <p class="text-sm text-muted-foreground">Reference</p>
              <p class="font-semibold">{{ asset.reference }}</p>
            </div>
            <div class="app-inset-panel grid gap-1 p-4">
              <p class="text-sm text-muted-foreground">Owner</p>
              <p class="font-semibold">{{ ownerName }}</p>
            </div>
            <div class="app-inset-panel grid gap-1 p-4">
              <p class="text-sm text-muted-foreground">Billing cadence</p>
              <p class="font-semibold">
                {{ asset.billingCycle ? humanizeEnum(asset.billingCycle) : 'One-time' }}
              </p>
            </div>
          </div>
          <div class="app-inset-panel grid gap-2 p-4">
            <p class="text-sm text-muted-foreground">Notes</p>
            <p class="text-sm leading-6">
              {{ asset.notes || 'No notes recorded for this asset.' }}
            </p>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <MetricCard
          title="Next lifecycle date"
          :value="formatRelativeDate(getAssetNextDate(asset))"
          delta="Renewal or expiry"
          hint="The next operational date on this asset."
          tone="warning"
        >
          <template #icon><Icon name="lucide:calendar-clock" class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Linked tickets"
          :value="`${relatedTickets.length}`"
          delta="Support history"
          hint="Conversations already attached to this asset."
          tone="neutral"
        >
          <template #icon><Icon name="lucide:ticket" class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Assigned on"
          :value="formatDate(asset.assignedAt)"
          delta="Ownership timeline"
          hint="When this asset was assigned to the current owner."
          tone="success"
        >
          <template #icon><Icon name="lucide:repeat-2" class="size-5" /></template>
        </MetricCard>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[0.7fr_1.3fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Ownership context</CardTitle>
          <CardDescription
            >Dates and metadata the admin surface needs for decision-making.</CardDescription
          >
        </CardHeader>
        <CardContent class="space-y-4">
          <div class="app-inset-panel grid gap-1 p-4">
            <p class="text-sm text-muted-foreground">Purchased</p>
            <p class="font-semibold">{{ formatDate(asset.purchasedAt) }}</p>
          </div>
          <div class="app-inset-panel grid gap-2 p-4">
            <p class="text-sm text-muted-foreground">Owner profile</p>
            <p class="font-semibold">{{ ownerName }}</p>
            <p class="text-sm text-muted-foreground">{{ ownerMeta }}</p>
          </div>
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Linked tickets</CardTitle>
          <CardDescription>Support history connected to this asset.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="ticket in relatedTickets"
            :key="ticket.id"
            :to="`/admin/tickets/${ticket.id}`"
            class="app-list-item"
          >
            <div class="grid gap-3">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="ticket.priority" />
                <StatusBadge :status="ticket.status" />
              </div>
              <div class="space-y-1">
                <p class="font-semibold">{{ ticket.subject }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ humanizeEnum(ticket.category) }} | Updated
                  {{ formatRelativeDate(ticket.updatedAt) }}
                </p>
              </div>
            </div>
          </NuxtLink>

          <div v-if="!relatedTickets.length" class="app-empty-state">
            No support history is linked to this asset yet.
          </div>
        </CardContent>
      </Card>
    </section>

    <Card class="app-surface overflow-hidden">
      <CardHeader>
        <CardTitle>Manage asset</CardTitle>
        <CardDescription>
          Update lifecycle details for this user asset or remove it from the inventory.
        </CardDescription>
      </CardHeader>
      <CardContent class="space-y-6">
        <AssetEditor
          embedded
          submit-label="Save asset changes"
          :asset="asset"
          :fixed-user-id="asset.userId"
          :fixed-owner-label="ownerName"
          :saving="saving"
          @submit="saveAsset"
        />
        <div
          class="flex flex-wrap items-center justify-between gap-3 rounded-3xl border border-destructive/25 bg-destructive/6 px-4 py-4"
        >
          <div class="space-y-1">
            <p class="font-semibold text-foreground">Delete asset</p>
            <p class="text-sm text-muted-foreground">
              Remove this asset record from the user inventory permanently.
            </p>
          </div>
          <Button variant="destructive" class="rounded-2xl" @click="deleteDialogOpen = true">
            Delete asset
          </Button>
        </div>
      </CardContent>
    </Card>

    <Dialog v-model:open="deleteDialogOpen">
      <DialogContent class="rounded-3xl sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>Delete asset</DialogTitle>
          <DialogDescription>
            This will remove {{ asset.title }} from the inventory and from the user's current
            assets.
          </DialogDescription>
        </DialogHeader>
        <DialogFooter>
          <Button variant="outline" class="rounded-2xl" @click="deleteDialogOpen = false">
            Cancel
          </Button>
          <Button
            variant="destructive"
            class="rounded-2xl"
            :disabled="deleting"
            @click="deleteAsset"
          >
            {{ deleting ? 'Deleting...' : 'Delete asset' }}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  </div>
</template>

<script setup lang="ts">
import { toast } from 'vue-sonner';
import {
  formatDate,
  formatRelativeDate,
  getAssetNextDate,
  getDisplayName,
  humanizeEnum,
} from '@/lib/app-formatters';
import type { AssetCreatePayload } from '@/lib/app-types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const assetId = Number(route.params.id);
const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();
const usersStore = useUsersStore();

let assetValue;

try {
  assetValue = await assetsStore.fetchOne(assetId);
} catch {
  throw createError({ statusCode: 404, statusMessage: 'Asset not found' });
}

await Promise.all([usersStore.fetchAll(), ticketsStore.fetchAll()]);

const asset = computed(() => assetsStore.findAssetById(assetId) ?? assetValue);
const owner = computed(() => usersStore.findUserById(asset.value.userId));
const ownerName = computed(() => getDisplayName(owner.value));
const ownerMeta = computed(() =>
  owner.value
    ? `${owner.value.team || 'No team'} | ${owner.value.location || 'No location'}`
    : 'No owner metadata',
);
const relatedTickets = computed(() => ticketsStore.byAssetId(asset.value.id));
const saving = ref(false);
const deleting = ref(false);
const deleteDialogOpen = ref(false);

const saveAsset = async (payload: AssetCreatePayload) => {
  saving.value = true;

  try {
    await assetsStore.updateAsset(asset.value.id, {
      title: payload.title,
      type: payload.type,
      status: payload.status,
      vendor: payload.vendor,
      reference: payload.reference,
      billingCycle: payload.billingCycle,
      purchasedAt: payload.purchasedAt,
      renewalAt: payload.renewalAt,
      expiresAt: payload.expiresAt,
      seatCount: payload.seatCount,
      notes: payload.notes,
      tags: payload.tags,
    });
    toast.success('Asset updated');
  } catch {
    toast.error('Unable to update asset');
  } finally {
    saving.value = false;
  }
};

const deleteAsset = async () => {
  deleting.value = true;

  try {
    await assetsStore.deleteAsset(asset.value.id);
    deleteDialogOpen.value = false;
    toast.success('Asset deleted');
    await navigateTo('/admin/assets');
  } catch {
    toast.error('Unable to delete asset');
  } finally {
    deleting.value = false;
  }
};

useHead({
  title: asset.value.title,
});
</script>
