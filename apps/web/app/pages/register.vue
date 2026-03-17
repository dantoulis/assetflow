<template>
  <Card class="app-surface overflow-hidden border-border/70 dark:border-white/10">
    <CardContent class="space-y-8 p-6 md:p-8">
      <div class="space-y-3">
        <div
          class="inline-flex rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Register
        </div>
        <div class="space-y-2">
          <h1 class="text-3xl font-semibold tracking-[-0.05em]">Create an account</h1>
          <p class="text-sm leading-6 text-muted-foreground">
            Registration now talks to the backend. The app surfaces still use preview data until the
            rest of the real auth flow is finished.
          </p>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-3xl border border-border/70 bg-muted/55 p-4 dark:bg-background/55">
          <div class="mb-3 inline-flex rounded-2xl bg-primary/15 p-2 text-primary">
            <UserPlus class="size-4" />
          </div>
          <p class="font-semibold">What this phase covers</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Register, login, logout, and session hydration against the backend auth endpoints.
          </p>
        </div>
        <div class="rounded-3xl border border-border/70 bg-muted/55 p-4 dark:bg-background/55">
          <div class="mb-3 inline-flex rounded-2xl bg-chart-2/18 p-2 text-chart-2">
            <Sparkles class="size-4" />
          </div>
          <p class="font-semibold">What stays mocked</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Dashboard data, assets, tickets, and profile surfaces remain preview-only for now.
          </p>
        </div>
      </div>

      <form class="space-y-5" @submit.prevent="handleRegister">
        <div class="space-y-2">
          <Label for="username">Username</Label>
          <Input
            id="username"
            v-model="form.username"
            class="h-12 rounded-2xl"
            placeholder="ava.morgan"
          />
        </div>
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            class="h-12 rounded-2xl"
            placeholder="ava@assetflow.dev"
          />
        </div>
        <div class="space-y-2">
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
import { Sparkles, UserPlus } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

definePageMeta({
  layout: 'public',
});

useHead({
  title: 'Register',
});

const { register } = useAuth();

const form = reactive({
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
    await register({
      username: form.username.trim(),
      email: form.email.trim(),
      password: form.password,
    });

    toast.success('Account created');
    await navigateTo('/app/dashboard');
  } catch {
    toast.error('Unable to register', {
      description: 'Check the values and try again.',
    });
  } finally {
    pending.value = false;
  }
};
</script>
