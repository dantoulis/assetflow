<template>
  <div :class="embedded ? 'grid gap-5' : 'app-surface overflow-hidden'">
    <CardHeader :class="embedded ? 'gap-1 px-0 pt-0' : undefined">
      <CardTitle>{{ title }}</CardTitle>
      <CardDescription>{{ description }}</CardDescription>
    </CardHeader>
    <CardContent :class="embedded ? 'grid gap-5 px-0 pb-0' : 'space-y-5'">
      <div class="grid gap-4 md:grid-cols-2">
        <div class="space-y-2">
          <Label for="account-name">Full name</Label>
          <Input id="account-name" v-model="form.name" class="h-11 rounded-2xl" />
        </div>
        <div class="space-y-2">
          <Label for="account-username">Username</Label>
          <Input id="account-username" v-model="form.username" class="h-11 rounded-2xl" />
        </div>
        <div class="space-y-2">
          <Label for="account-email">Email</Label>
          <Input id="account-email" v-model="form.email" type="email" class="h-11 rounded-2xl" />
        </div>
        <div class="space-y-2">
          <Label for="account-phone">Phone</Label>
          <Input id="account-phone" v-model="form.phone" class="h-11 rounded-2xl" />
        </div>
        <div class="space-y-2">
          <Label for="account-team">Team</Label>
          <Input id="account-team" v-model="form.team" class="h-11 rounded-2xl" />
        </div>
        <div class="space-y-2">
          <Label for="account-location">Location</Label>
          <Input id="account-location" v-model="form.location" class="h-11 rounded-2xl" />
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
  }>(),
  {
    title: 'Account details',
    description: 'Update the contact and identity fields used across the workspace.',
    submitLabel: 'Save changes',
    saving: false,
    embedded: false,
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
  emit('submit', {
    name: form.name.trim() || null,
    username: form.username.trim(),
    email: form.email.trim(),
    phone: form.phone.trim() || null,
    team: form.team.trim() || null,
    location: form.location.trim() || null,
  });
};
</script>
