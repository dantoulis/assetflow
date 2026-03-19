<template>
  <Card class="app-surface border-border/70 dark:border-white/10">
    <CardContent class="space-y-6 p-6 md:p-8">
      <div class="space-y-2">
        <div
          class="inline-flex rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Recovery
        </div>
        <h1 class="text-3xl font-semibold tracking-[-0.05em]">
          Password recovery is not enabled yet
        </h1>
        <p class="text-sm leading-6 text-muted-foreground">
          This route is reserved for the email recovery flow. Once reset tokens are introduced, the
          same screen will handle the recovery request without changing the rest of the auth layout.
        </p>
      </div>

      <div
        class="rounded-3xl border border-border/70 bg-muted/55 p-4 text-sm leading-6 text-muted-foreground dark:bg-background/55"
      >
        Until that backend flow is added, use the seeded workspace account you already have and
        return here once recovery is supported.
      </div>

      <div class="flex flex-wrap gap-3">
        <Button as-child class="rounded-2xl">
          <NuxtLink to="/login">Back to login</NuxtLink>
        </Button>
        <Button variant="outline" as-child class="rounded-2xl">
          <NuxtLink to="/reset-password">View reset route</NuxtLink>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public',
});

useHead({
  title: 'Forgot Password',
});
</script>
