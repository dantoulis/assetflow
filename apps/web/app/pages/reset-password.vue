<template>
  <Card class="app-surface border-border/70 dark:border-white/10">
    <CardContent class="space-y-6 p-6 md:p-8">
      <div class="space-y-2">
        <div
          class="inline-flex rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Reset
        </div>
        <h1 class="text-3xl font-semibold tracking-[-0.05em]">Set a new password</h1>
        <p class="text-sm leading-6 text-muted-foreground">
          Choose a new password for your account. This link only works while the reset token is
          valid.
        </p>
      </div>

      <form class="space-y-4" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="next-password">New password</Label>
          <Input
            id="next-password"
            v-model="form.password"
            type="password"
            class="h-12 rounded-2xl"
            placeholder="Create a strong password"
          />
        </div>
        <div class="space-y-2">
          <Label for="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            v-model="form.confirmPassword"
            type="password"
            class="h-12 rounded-2xl"
            placeholder="Repeat the password"
          />
        </div>
        <Button type="submit" class="h-12 w-full rounded-2xl" :disabled="pending">
          {{ pending ? 'Saving new password...' : 'Reset password' }}
        </Button>
      </form>

      <Button variant="ghost" as-child class="rounded-2xl px-0">
        <NuxtLink to="/login">Return to login</NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { IFetchError } from 'ofetch';
import { toast } from 'vue-sonner';

definePageMeta({
  layout: 'public',
  middleware: 'reset-password',
});

useHead({
  title: 'Reset Password',
});

const route = useRoute();
const { resetPassword } = useAuth();

const form = reactive({
  password: '',
  confirmPassword: '',
});

const extractToken = (): string => {
  const rawToken = route.query.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  return typeof token === 'string' ? token : '';
};

const pending = ref(false);

const handleSubmit = async () => {
  const token = extractToken();

  if (!token) {
    await navigateTo('/login');
    return;
  }

  if (!form.password.trim()) {
    toast.error('Enter a new password first.');
    return;
  }

  if (form.password.length < 8) {
    toast.error('Use at least 8 characters for the new password.');
    return;
  }

  if (form.password !== form.confirmPassword) {
    toast.error('The passwords do not match.');
    return;
  }

  pending.value = true;

  try {
    await resetPassword({
      token,
      password: form.password,
    });

    toast.success('Password updated');
    await navigateTo('/login');
  } catch (error: unknown) {
    const resetError = error as IFetchError;
    const description =
      typeof resetError.data?.message === 'string'
        ? resetError.data.message
        : 'Request a new reset email and try again.';

    toast.error('Unable to reset password', {
      description,
    });
    await navigateTo('/login');
  } finally {
    pending.value = false;
  }
};
</script>
