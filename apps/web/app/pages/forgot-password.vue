<template>
  <Card class="app-surface border-border/70 dark:border-white/10">
    <CardContent class="space-y-6 p-6 md:p-8">
      <div class="space-y-2">
        <div
          class="inline-flex rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
        >
          Recovery
        </div>
        <h1 class="text-3xl font-semibold tracking-[-0.05em]">Password recovery comes later</h1>
        <p class="text-sm leading-6 text-muted-foreground">
          This page is intentionally present in the frontend pass so the auth flow feels complete.
          The actual email recovery mechanics will be wired once the API phase starts.
        </p>
      </div>

      <div
        class="rounded-3xl border border-border/70 bg-muted/55 p-4 text-sm leading-6 text-muted-foreground dark:bg-background/55"
      >
        For now, use one of the demo logins on the sign-in page. The reset path is already reserved
        in the UI and can be connected later without changing the visual structure.
      </div>

      <div class="flex flex-wrap gap-3">
        <Button as-child class="rounded-2xl">
          <NuxtLink to="/login">Back to login</NuxtLink>
        </Button>
        <Button variant="outline" as-child class="rounded-2xl">
          <NuxtLink to="/reset-password">Preview reset screen</NuxtLink>
        </Button>
      </div>
    </CardContent>
  </Card>
</template>

<script setup lang="ts">
definePageMeta({
  layout: 'public',
  middleware: 'auth',
});

useHead({
  title: 'Forgot Password',
});
</script>
