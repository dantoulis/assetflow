<template>
  <Card class="app-surface overflow-hidden border-border/70 dark:border-white/10">
    <CardContent class="space-y-8 p-6 md:p-8">
      <div class="space-y-3">
        <div
          class="inline-flex rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Sign in
        </div>
        <div class="space-y-2">
          <h1 class="text-3xl font-semibold tracking-[-0.05em]">Preview the product surfaces</h1>
          <p class="text-sm leading-6 text-muted-foreground">
            Authentication is mocked for this phase. Use one of the demo accounts or submit the form
            with one of the listed emails.
          </p>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <button
          class="rounded-3xl border border-border/70 bg-card/80 p-4 text-left transition hover:border-primary/35 hover:bg-primary/7 dark:bg-background/70 dark:hover:bg-primary/5"
          @click="handleDemo('ADMIN')"
        >
          <div class="mb-3 inline-flex rounded-2xl bg-primary/15 p-2 text-primary">
            <ShieldCheck class="size-4" />
          </div>
          <p class="font-semibold">Admin demo</p>
          <p class="mt-1 text-sm text-muted-foreground">
            Bird's-eye dashboard, all users, all assets, all tickets.
          </p>
        </button>
        <button
          class="rounded-3xl border border-border/70 bg-card/80 p-4 text-left transition hover:border-primary/35 hover:bg-primary/7 dark:bg-background/70 dark:hover:bg-primary/5"
          @click="handleDemo('USER')"
        >
          <div class="mb-3 inline-flex rounded-2xl bg-chart-2/20 p-2 text-chart-2">
            <UserRound class="size-4" />
          </div>
          <p class="font-semibold">User demo</p>
          <p class="mt-1 text-sm text-muted-foreground">
            Personal assets, renewal visibility, and support threads.
          </p>
        </button>
      </div>

      <form class="space-y-5" @submit.prevent="handleSubmit">
        <div class="space-y-2">
          <Label for="email">Email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            placeholder="you@company.com"
            class="h-12 rounded-2xl"
          />
        </div>
        <div class="space-y-2">
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
              class="h-12 rounded-2xl pl-11"
            />
          </div>
          <p class="text-xs text-muted-foreground">
            Demo password: <span class="font-semibold text-foreground">{{ demoPassword }}</span>
          </p>
        </div>
        <Button
          type="submit"
          class="h-12 w-full rounded-2xl text-sm font-semibold"
          :disabled="pending"
        >
          {{ pending ? 'Opening workspace...' : 'Enter workspace' }}
        </Button>
      </form>

      <div class="rounded-3xl border border-border/70 bg-muted/55 p-4 dark:bg-background/55">
        <p class="text-xs font-semibold uppercase tracking-[0.18em] text-muted-foreground">
          Demo emails
        </p>
        <div class="mt-3 grid gap-2 text-sm">
          <div
            v-for="account in demoAccounts"
            :key="account.email"
            class="flex items-center justify-between rounded-2xl border border-border/70 bg-card/85 px-3 py-2 dark:border-white/10 dark:bg-background/70"
          >
            <span>{{ account.email }}</span>
            <StatusBadge :status="account.role" />
          </div>
        </div>
      </div>

      <p class="text-center text-sm text-muted-foreground">
        Need a fresh preview account?
        <NuxtLink to="/register" class="font-semibold text-primary hover:underline"
          >Create a mocked user session</NuxtLink
        >
      </p>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
import { LockKeyhole, ShieldCheck, UserRound } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { demoAccounts, demoPassword } from '@/lib/mock-data';

definePageMeta({
  layout: 'public',
  middleware: 'auth',
});

useHead({
  title: 'Login',
});

const { signIn, signInDemo } = useMockAuth();
const defaultDemoEmail = demoAccounts.find((account) => account.role === 'USER')?.email ?? '';

const form = reactive({
  email: defaultDemoEmail,
  password: demoPassword,
});

const pending = ref(false);

const handleSubmit = async () => {
  pending.value = true;

  const result = await signIn(form.email);

  pending.value = false;

  if (!result.ok) {
    toast.error('Demo account not found', {
      description: result.message,
    });
    return;
  }

  toast.success(`Signed in as ${result.user.name}`);
  await navigateTo(result.user.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard');
};

const handleDemo = async (role: 'ADMIN' | 'USER') => {
  const user = await signInDemo(role);
  toast.success(`Loaded ${user.role === 'ADMIN' ? 'admin' : 'user'} workspace`);
  await navigateTo(role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard');
};
</script>
