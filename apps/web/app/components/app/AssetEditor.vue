<template>
  <div :class="embedded ? 'grid gap-5' : 'space-y-5'">
    <div class="grid gap-4 md:grid-cols-2">
      <div class="space-y-2 md:col-span-2">
        <Label for="asset-title">Title</Label>
        <Input
          id="asset-title"
          v-model="form.title"
          class="h-11 rounded-2xl"
          placeholder="MacBook Pro 16, Figma Enterprise seat, Adobe CC license"
        />
      </div>

      <div class="space-y-2">
        <Label for="asset-type">Type</Label>
        <AppSelectField
          id="asset-type"
          v-model="form.type"
          :options="typeOptions"
          :disabled="Boolean(lockedType)"
          placeholder="Choose asset type"
        />
      </div>

      <div class="space-y-2">
        <Label for="asset-status">Status</Label>
        <AppSelectField
          id="asset-status"
          v-model="form.status"
          :options="statusOptions"
          placeholder="Choose asset status"
        />
      </div>

      <div v-if="showOwnerSelect" class="space-y-2 md:col-span-2">
        <Label for="asset-owner">Assigned user</Label>
        <AppSelectField
          id="asset-owner"
          v-model="form.userId"
          :options="ownerOptions"
          placeholder="Choose a user"
        />
      </div>

      <div v-else-if="fixedOwnerLabel" class="space-y-2 md:col-span-2">
        <Label>Assigned user</Label>
        <div class="app-inset-panel rounded-2xl px-4 py-3 text-sm">
          {{ fixedOwnerLabel }}
        </div>
      </div>

      <div class="space-y-2">
        <Label for="asset-vendor">Vendor</Label>
        <Input
          id="asset-vendor"
          v-model="form.vendor"
          class="h-11 rounded-2xl"
          placeholder="Apple, Adobe, Lenovo"
        />
      </div>

      <div class="space-y-2">
        <Label for="asset-reference">Reference</Label>
        <Input
          id="asset-reference"
          v-model="form.reference"
          class="h-11 rounded-2xl"
          placeholder="Serial number, invoice ID, or license key"
        />
      </div>

      <div class="space-y-2">
        <Label for="asset-billing-cycle">Billing cadence</Label>
        <AppSelectField
          id="asset-billing-cycle"
          v-model="form.billingCycle"
          :options="billingCycleOptions"
          placeholder="Choose a cadence"
        />
      </div>

      <div class="space-y-2">
        <Label for="asset-seat-count">Seat count</Label>
        <Input
          id="asset-seat-count"
          v-model="form.seatCount"
          type="number"
          min="0"
          class="h-11 rounded-2xl"
          placeholder="1"
        />
      </div>

      <div class="space-y-2">
        <Label for="asset-purchased-at">Purchased on</Label>
        <DatePicker
          id="asset-purchased-at"
          v-model="form.purchasedAt"
          placeholder="Select purchase date"
          helper-text="Use the date this asset was bought or provisioned."
        />
      </div>

      <div class="space-y-2">
        <Label for="asset-renewal-at">Renewal date</Label>
        <DatePicker
          id="asset-renewal-at"
          v-model="form.renewalAt"
          placeholder="Select renewal date"
          helper-text="Pick the next renewal milestone for this asset."
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label for="asset-expires-at">Expiry date</Label>
        <DatePicker
          id="asset-expires-at"
          v-model="form.expiresAt"
          placeholder="Select expiry date"
          helper-text="Pick the date when the asset becomes unavailable."
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label for="asset-tags">Tags</Label>
        <Input
          id="asset-tags"
          v-model="form.tags"
          class="h-11 rounded-2xl"
          placeholder="hardware, engineering, priority"
        />
      </div>

      <div class="space-y-2 md:col-span-2">
        <Label for="asset-notes">Notes</Label>
        <Textarea
          id="asset-notes"
          v-model="form.notes"
          class="min-h-28 rounded-3xl"
          placeholder="Add procurement, lifecycle, or support context..."
        />
      </div>
    </div>

    <div class="flex flex-wrap justify-end gap-3">
      <Button
        variant="outline"
        class="rounded-2xl"
        :disabled="saving"
        @click="handleSecondaryAction"
      >
        {{ secondaryActionLabel }}
      </Button>
      <Button class="rounded-2xl" :disabled="saving || !canSubmit" @click="submitForm">
        {{ saving ? 'Saving...' : submitLabel }}
      </Button>
    </div>
  </div>
</template>

<script setup lang="ts">
import type {
  AppAsset,
  AssetCreatePayload,
  AssetStatus,
  AssetType,
  BillingCycle,
} from '@/lib/app-types';
import { humanizeEnum } from '@/lib/app-formatters';

const props = withDefaults(
  defineProps<{
    asset?: Partial<AppAsset> | null;
    ownerOptions?: Array<{ label: string; value: number }>;
    submitLabel?: string;
    saving?: boolean;
    embedded?: boolean;
    showOwnerSelect?: boolean;
    fixedUserId?: number | null;
    fixedOwnerLabel?: string | null;
    lockedType?: AssetType | null;
    secondaryActionLabel?: string;
    secondaryActionMode?: 'reset' | 'close';
  }>(),
  {
    asset: null,
    ownerOptions: () => [],
    submitLabel: 'Save asset',
    saving: false,
    embedded: false,
    showOwnerSelect: false,
    fixedUserId: null,
    fixedOwnerLabel: null,
    lockedType: null,
    secondaryActionLabel: 'Reset',
    secondaryActionMode: 'reset',
  },
);

const emit = defineEmits<{
  submit: [payload: AssetCreatePayload];
  cancel: [];
}>();

const assetTypes: AssetType[] = ['LAPTOP', 'SUBSCRIPTION', 'LICENSE', 'PERIPHERAL'];
const assetStatuses: AssetStatus[] = ['ACTIVE', 'EXPIRING_SOON', 'EXPIRED', 'IN_REPAIR'];
const billingCycles: Array<BillingCycle | 'NONE'> = ['NONE', 'MONTHLY', 'YEARLY', 'ONCE'];

const typeOptions = assetTypes.map((type) => ({
  label: humanizeEnum(type),
  value: type,
}));
const statusOptions = assetStatuses.map((status) => ({
  label: humanizeEnum(status),
  value: status,
}));
const billingCycleOptions = billingCycles.map((cycle) => ({
  label: cycle === 'NONE' ? 'No billing cadence' : humanizeEnum(cycle),
  value: cycle,
}));

const form = reactive({
  title: '',
  type: 'LAPTOP' as AssetType,
  status: 'ACTIVE' as AssetStatus,
  userId: null as number | null,
  vendor: '',
  reference: '',
  billingCycle: 'NONE' as BillingCycle | 'NONE',
  purchasedAt: '',
  renewalAt: '',
  expiresAt: '',
  seatCount: '',
  notes: '',
  tags: '',
});

const toDateInput = (value?: string | null) => {
  if (!value) {
    return '';
  }

  return new Date(value).toISOString().slice(0, 10);
};

const toIsoDate = (value: string) => {
  if (!value) {
    return null;
  }

  return new Date(`${value}T00:00:00.000Z`).toISOString();
};

const syncForm = () => {
  const asset = props.asset;

  form.title = asset?.title ?? '';
  form.type = props.lockedType ?? asset?.type ?? 'LAPTOP';
  form.status = asset?.status ?? 'ACTIVE';
  form.userId = props.fixedUserId ?? asset?.userId ?? null;
  form.vendor = asset?.vendor ?? '';
  form.reference = asset?.reference ?? '';
  form.billingCycle = asset?.billingCycle ?? 'NONE';
  form.purchasedAt = toDateInput(asset?.purchasedAt);
  form.renewalAt = toDateInput(asset?.renewalAt);
  form.expiresAt = toDateInput(asset?.expiresAt);
  form.seatCount = asset?.seatCount?.toString() ?? '';
  form.notes = asset?.notes ?? '';
  form.tags = asset?.tags?.join(', ') ?? '';
};

watch(
  () => [props.asset, props.fixedUserId, props.lockedType],
  () => {
    syncForm();
  },
  { immediate: true, deep: true },
);

const resolvedUserId = computed(() => props.fixedUserId ?? form.userId);
const canSubmit = computed(() =>
  Boolean(
    form.title.trim() &&
    form.vendor.trim() &&
    form.reference.trim() &&
    form.type &&
    form.status &&
    resolvedUserId.value,
  ),
);

const handleSecondaryAction = () => {
  if (props.secondaryActionMode === 'close') {
    emit('cancel');
    return;
  }

  syncForm();
};

const submitForm = () => {
  const userId = resolvedUserId.value;

  if (!userId) {
    return;
  }

  emit('submit', {
    title: form.title.trim(),
    type: props.lockedType ?? form.type,
    status: form.status,
    userId,
    vendor: form.vendor.trim(),
    reference: form.reference.trim(),
    billingCycle: form.billingCycle === 'NONE' ? null : form.billingCycle,
    purchasedAt: toIsoDate(form.purchasedAt),
    renewalAt: toIsoDate(form.renewalAt),
    expiresAt: toIsoDate(form.expiresAt),
    seatCount: form.seatCount === '' ? null : Number(form.seatCount),
    notes: form.notes.trim() || null,
    tags: form.tags
      .split(',')
      .map((tag) => tag.trim())
      .filter(Boolean),
  });
};
</script>
