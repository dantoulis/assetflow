<template>
  <Card class="app-surface overflow-hidden border-border/70 py-0 dark:border-white/10">
    <CardContent class="grid gap-8 p-6 md:p-8">
      <div class="space-y-2">
        <div
          class="inline-flex w-fit rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Recovery
        </div>
        <h1 class="text-3xl font-semibold tracking-[-0.05em]">Reset your password</h1>
        <p class="text-sm leading-6 text-muted-foreground">
          Enter the email address tied to your account. If it exists, we will send a reset link to
          your inbox.
        </p>
      </div>

      <form class="grid gap-5" @submit.prevent="handleSubmit">
        <div class="grid gap-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            class="h-12 rounded-2xl"
            placeholder="ava@assetflow.dev"
          />
        </div>

        <div
          v-if="submitted"
          class="rounded-3xl border border-primary/20 bg-primary/8 p-4 text-sm leading-6 text-muted-foreground"
        >
          If an account exists for that email, a password reset link has been sent.
        </div>

        <Button
          type="submit"
          class="h-12 w-full rounded-2xl text-sm font-semibold"
          :disabled="pending"
        >
          {{ pending ? 'Sending reset link...' : 'Send reset link' }}
        </Button>
      </form>

      <Button variant="ghost" as-child class="w-fit rounded-2xl px-0">
        <NuxtLink to="/login">Back to login</NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import type { IFetchError } from 'ofetch';
import { toast } from 'vue-sonner';

definePageMeta({
  layout: 'public',
});

useHead({
  title: 'Forgot Password',
});

const { forgotPassword } = useAuth();

const form = reactive({
  email: '',
});

const pending = ref(false);
const submitted = ref(false);

const handleSubmit = async () => {
  if (!form.email.trim()) {
    toast.error('Enter your email address first.');
    return;
  }

  pending.value = true;

  try {
    await forgotPassword({
      email: form.email.trim().toLowerCase(),
    });

    submitted.value = true;
    toast.success('If the account exists, the reset email is on the way.');
  } catch (error: unknown) {
    const forgotPasswordError = error as IFetchError;
    const description =
      typeof forgotPasswordError.data?.message === 'string'
        ? forgotPasswordError.data.message
        : 'Try again in a moment.';

    toast.error('Unable to send reset email', {
      description,
    });
  } finally {
    pending.value = false;
    form.email = '';
  }
};
</script>
