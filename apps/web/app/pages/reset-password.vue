<template>
  <Card class="app-surface border-border/70 dark:border-white/10">
    <CardContent class="space-y-6 p-6 md:p-8">
      <div class="space-y-2">
        <div
          class="inline-flex rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Reset
        </div>
        <h1 class="text-3xl font-semibold tracking-[-0.05em]">Password reset will land here</h1>
        <p class="text-sm leading-6 text-muted-foreground">
          The final flow will validate a reset token and save a new password from this screen. The
          route is already reserved so the auth experience will not need a redesign later.
        </p>
      </div>

      <form class="space-y-4">
        <div class="space-y-2">
          <Label for="next-password">New password</Label>
          <Input
            id="next-password"
            type="password"
            class="h-12 rounded-2xl"
            placeholder="Create a strong password"
          />
        </div>
        <div class="space-y-2">
          <Label for="confirm-password">Confirm password</Label>
          <Input
            id="confirm-password"
            type="password"
            class="h-12 rounded-2xl"
            placeholder="Repeat the password"
          />
        </div>
        <Button type="button" class="h-12 w-full rounded-2xl" disabled>Reset password</Button>
      </form>

      <Button variant="ghost" as-child class="rounded-2xl px-0">
        <NuxtLink to="/login">Return to login</NuxtLink>
      </Button>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public',
});

useHead({
  title: 'Reset Password',
});
</script>
