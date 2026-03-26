<template>
  <Card class="app-surface overflow-hidden border-border/70 py-0 dark:border-white/10">
    <CardContent class="grid gap-8 p-6 md:p-8">
      <div class="grid gap-3">
        <div
          class="inline-flex w-fit rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Sign in
        </div>
        <div class="grid gap-2">
          <h1 class="text-3xl font-semibold tracking-[-0.05em]">Sign in to AssetFlow</h1>
          <p class="text-sm leading-6 text-muted-foreground">
            Use your workspace credentials to access assigned assets, support tickets, and request
            workflows.
          </p>
        </div>
      </div>

      <form class="grid gap-5" @submit.prevent="handleSubmit">
        <div class="grid gap-2">
          <Label for="username">Username</Label>
          <Input
            id="username"
            v-model="form.username"
            placeholder="your.username"
            class="h-12 rounded-2xl"
          />
        </div>
        <div class="grid gap-2">
          <div class="flex items-center justify-between">
            <Label for="password">Password</Label>
            <NuxtLink to="/forgot-password" class="text-sm font-medium text-primary hover:underline"
              >Forgot password?</NuxtLink
            >
          </div>
          <div class="relative">
            <LockKeyhole
              class="pointer-events-none absolute left-4 top-1/2 size-4 -translate-y-1/2 text-muted-foreground"
            />
            <Input
              id="password"
              v-model="form.password"
              type="password"
              placeholder="Password"
              class="h-12 rounded-2xl pl-11"
            />
          </div>
        </div>
        <Button
          type="submit"
          class="h-12 w-full rounded-2xl text-sm font-semibold"
          :disabled="pending"
        >
          {{ pending ? 'Opening workspace...' : 'Enter workspace' }}
        </Button>
      </form>

      <SocialAuthOptions />

      <p class="text-center text-sm text-muted-foreground">
        New to AssetFlow?
        <NuxtLink to="/register" class="font-semibold text-primary hover:underline"
          >Create account</NuxtLink
        >
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { LockKeyhole } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({
  layout: 'public',
});

useHead({
  title: 'Login',
});

const { login } = useAuth();

const form = reactive({
  username: '',
  password: '',
});

const pending = ref(false);

const handleSubmit = async () => {
  if (!form.username.trim() || !form.password.trim()) {
    toast.error('Enter your username and password.');
    return;
  }

  pending.value = true;

  try {
    const user = await login({
      username: form.username.trim(),
      password: form.password,
    });

    toast.success(`Signed in as ${user.username}`);
    await navigateTo(user.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard');
  } catch {
    toast.error('Unable to sign in', {
      description: 'Check your username and password and try again.',
    });
  } finally {
    pending.value = false;
  }
};
</script>
