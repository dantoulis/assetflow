<template>
  <Card class="app-surface overflow-hidden border-border/70 dark:border-white/10 lg:h-full">
    <CardContent class="grid gap-8 p-6 md:p-8 lg:h-full lg:grid-rows-[auto_1fr_auto]">
      <div class="grid gap-3">
        <div
          class="inline-flex w-fit rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Register
        </div>
        <div class="grid gap-2">
          <h1 class="text-3xl font-semibold tracking-[-0.05em]">Create an account</h1>
          <p class="text-sm leading-6 text-muted-foreground">
            Set up your workspace identity so you can receive assets, open support tickets, and
            request new tools.
          </p>
        </div>
      </div>

      <form class="grid content-start gap-5" @submit.prevent="handleRegister">
        <div class="grid gap-2">
          <Label for="name">Full name</Label>
          <Input id="name" v-model="form.name" class="h-12 rounded-2xl" placeholder="Ava Morgan" />
        </div>
        <div class="grid gap-2">
          <Label for="username">Username</Label>
          <Input
            id="username"
            v-model="form.username"
            class="h-12 rounded-2xl"
            placeholder="ava.morgan"
          />
        </div>
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
        <div class="grid gap-2">
          <Label for="password">Password</Label>
          <Input
            id="password"
            v-model="form.password"
            type="password"
            class="h-12 rounded-2xl"
            placeholder="Choose a password"
          />
        </div>
        <Button
          type="submit"
          class="h-12 w-full rounded-2xl text-sm font-semibold"
          :disabled="pending"
        >
          {{ pending ? 'Creating account...' : 'Create account' }}
        </Button>
      </form>

      <SocialAuthOptions />

      <p class="text-center text-sm text-muted-foreground">
        Already exploring the product?
        <NuxtLink to="/login" class="font-semibold text-primary hover:underline"
          >Back to login</NuxtLink
        >
      </p>
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
  title: 'Register',
});

const { register } = useAuth();

const form = reactive({
  name: '',
  username: '',
  email: '',
  password: '',
});

const pending = ref(false);

const handleRegister = async () => {
  if (!form.username.trim() || !form.email.trim() || !form.password.trim()) {
    toast.error('Fill in username, email, and password first.');
    return;
  }

  pending.value = true;

  try {
    const user = await register({
      name: form.name.trim() || undefined,
      username: form.username.trim(),
      email: form.email.trim().toLowerCase(),
      password: form.password,
    });

    toast.success('Account created');
    await navigateTo(user.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard');
  } catch (error: unknown) {
    const createUserError = error as IFetchError;
    if (createUserError.statusCode === 409) {
      toast.error('Please use another email or username.', {
        description: createUserError.data?.message,
      });
      return;
    }

    toast.error('Unable to register', {
      description: 'Check the values and try again.',
    });
  } finally {
    pending.value = false;
  }
};
</script>
