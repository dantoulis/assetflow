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
          <h1 class="text-3xl font-semibold tracking-[-0.05em]">Create a preview user profile</h1>
          <p class="text-sm leading-6 text-muted-foreground">
            Registration is intentionally mocked right now. The form exists to validate the flow and
            the UI density before any backend endpoint is implemented.
          </p>
        </div>
      </div>

      <div class="grid gap-3 md:grid-cols-2">
        <div class="rounded-3xl border border-border/70 bg-muted/55 p-4 dark:bg-background/55">
          <div class="mb-3 inline-flex rounded-2xl bg-primary/15 p-2 text-primary">
            <UserPlus class="size-4" />
          </div>
          <p class="font-semibold">What this preview covers</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Login, registration, route protection, profile shell, and the user-side asset and ticket
            experience.
          </p>
        </div>
        <div class="rounded-3xl border border-border/70 bg-muted/55 p-4 dark:bg-background/55">
          <div class="mb-3 inline-flex rounded-2xl bg-chart-2/18 p-2 text-chart-2">
            <Sparkles class="size-4" />
          </div>
          <p class="font-semibold">What comes later</p>
          <p class="mt-2 text-sm leading-6 text-muted-foreground">
            Password recovery, email verification, real validation, and the full API contract behind
            these screens.
          </p>
        </div>
      </div>

      <form class="space-y-5" @submit.prevent="handleRegister">
        <div class="space-y-2">
          <Label for="name">Full name</Label>
          <Input id="name" v-model="form.name" class="h-12 rounded-2xl" placeholder="Ava Morgan" />
        </div>
        <div class="space-y-2">
          <Label for="company">Company</Label>
          <Input
            id="company"
            v-model="form.company"
            class="h-12 rounded-2xl"
            placeholder="Northstar Labs"
          />
        </div>
        <div class="space-y-2">
          <Label for="email">Work email</Label>
          <Input
            id="email"
            v-model="form.email"
            type="email"
            class="h-12 rounded-2xl"
            placeholder="ava@northstar.io"
          />
        </div>
        <Button
          type="submit"
          class="h-12 w-full rounded-2xl text-sm font-semibold"
          :disabled="pending"
        >
          {{ pending ? 'Creating preview...' : 'Create preview account' }}
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
  middleware: 'auth',
});

useHead({
  title: 'Register',
});

const { registerPreview } = useMockAuth();

const form = reactive({
  name: '',
  company: '',
  email: '',
});

const pending = ref(false);

const handleRegister = async () => {
  pending.value = true;
  await registerPreview();
  pending.value = false;

  toast.success('Preview account created', {
    description: 'You are now seeing the mocked user workspace.',
  });

  await navigateTo('/app/dashboard');
};
</script>
