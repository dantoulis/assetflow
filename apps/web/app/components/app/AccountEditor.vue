<template>
  <div :class="embedded ? 'grid gap-6 py-2' : 'app-surface overflow-hidden'">
    <CardHeader :class="embedded ? 'gap-1 px-0 pt-0' : 'px-6 pt-6'">
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent :class="embedded ? 'grid gap-5 px-0 pb-0' : 'space-y-5 px-6 pb-6'">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label for="account-name">Full name</Label>
          <Input
            id="account-name"
            v-model="form.name"
            class="h-11 rounded-2xl"
            :disabled="isDisabled('name')"
          />
        </div>
        <div class="space-y-2">
          <Label for="account-username">Username</Label>
          <Input
            id="account-username"
            v-model="form.username"
            class="h-11 rounded-2xl"
            :disabled="isDisabled('username')"
          />
        </div>
        <div class="space-y-2">
          <Label for="account-email">Email</Label>
          <Input
            id="account-email"
            v-model="form.email"
            type="email"
            class="h-11 rounded-2xl"
            :disabled="isDisabled('email')"
          />
        </div>
        <div class="space-y-2">
          <Label for="account-phone">Phone</Label>
          <Input
            id="account-phone"
            v-model="form.phone"
            class="h-11 rounded-2xl"
            :disabled="isDisabled('phone')"
          />
        </div>
        <div class="space-y-2">
          <Label for="account-team">Team</Label>
          <Input
            id="account-team"
            v-model="form.team"
            class="h-11 rounded-2xl"
            :disabled="isDisabled('team')"
          />
        </div>
        <div class="space-y-2">
          <Label for="account-location">Location</Label>
          <Input
            id="account-location"
            v-model="form.location"
            class="h-11 rounded-2xl"
            :disabled="isDisabled('location')"
          />
        </div>
      </div>

      <div class="flex flex-wrap justify-end gap-3">
        <Button variant="outline" class="rounded-2xl" :disabled="saving" @click="resetForm">
          Reset
        </Button>
        <Button class="rounded-2xl" :disabled="saving" @click="submitForm">
          {{ saving ? 'Saving...' : submitLabel }}
        </Button>
      </div>
    </CardContent>
  </div>
</template>

<script setup lang="ts">
import type { AppUser, UserUpdatePayload } from '@/lib/app-types';

const props = withDefaults(
  defineProps<{
    user: AppUser;
    title?: string;
    description?: string;
    submitLabel?: string;
    saving?: boolean;
    embedded?: boolean;
    disabledFields?: Array<keyof UserUpdatePayload>;
  }>(),
  {
    title: 'Account details',
    description: 'Update the contact and identity fields used across the workspace.',
    submitLabel: 'Save changes',
    saving: false,
    embedded: false,
    disabledFields: () => [],
  },
);

const emit = defineEmits<{
  submit: [payload: UserUpdatePayload];
}>();

const form = reactive({
  name: '',
  username: '',
  email: '',
  phone: '',
  team: '',
  location: '',
});

const disabledFieldSet = computed(() => new Set(props.disabledFields));
const isDisabled = (field: keyof UserUpdatePayload) => disabledFieldSet.value.has(field);

const syncForm = () => {
  form.name = props.user.name ?? '';
  form.username = props.user.username;
  form.email = props.user.email;
  form.phone = props.user.phone ?? '';
  form.team = props.user.team ?? '';
  form.location = props.user.location ?? '';
};

watch(
  () => props.user,
  () => {
    syncForm();
  },
  { immediate: true, deep: true },
);

const resetForm = () => {
  syncForm();
};

const submitForm = () => {
  const payload: UserUpdatePayload = {};

  if (!isDisabled('name')) {
    payload.name = form.name.trim() || null;
  }

  if (!isDisabled('username')) {
    payload.username = form.username.trim();
  }

  if (!isDisabled('email')) {
    payload.email = form.email.trim();
  }

  if (!isDisabled('phone')) {
    payload.phone = form.phone.trim() || null;
  }

  if (!isDisabled('team')) {
    payload.team = form.team.trim() || null;
  }

  if (!isDisabled('location')) {
    payload.location = form.location.trim() || null;
  }

  emit('submit', payload);
};
</script>
