<template>
  <div class="relative min-h-svh overflow-hidden px-4 py-5 md:px-6 lg:px-8">
    <div
      class="mx-auto grid min-h-[calc(100svh-2rem)] max-w-7xl items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(30rem,34rem)] xl:gap-8"
    >
      <section
        class="app-surface app-shell-mask hidden max-w-3xl flex-col gap-8 self-center overflow-hidden p-7 lg:flex xl:p-8"
      >
        <div class="space-y-8">
          <AppWordmark />
          <div class="space-y-4">
            <div
              class="inline-flex rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
            >
              Frontend preview
            </div>
            <div class="space-y-4">
              <h1
                class="max-w-xl text-5xl font-semibold leading-none tracking-[-0.06em] text-balance"
              >
                Asset operations, tickets, and renewals in one control layer.
              </h1>
              <p class="max-w-lg text-base leading-7 text-muted-foreground">
                This phase is UI-first. Admin and user experiences are fully mocked so we can
                validate flows, hierarchy, and theming before any API contract is locked in.
              </p>
            </div>
          </div>
        </div>

        <div class="grid gap-3">
          <Card class="border-border/70 bg-white/72 dark:border-white/10 dark:bg-white/[0.03]">
            <CardContent class="grid gap-3 p-4">
              <div class="flex items-center justify-between">
                <div>
                  <p class="text-sm font-medium text-muted-foreground">What is already modeled</p>
                  <p class="mt-1 text-2xl font-semibold tracking-[-0.04em]">
                    Admin + User surfaces
                  </p>
                </div>
                <div
                  class="rounded-2xl bg-primary/15 px-3 py-2 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
                >
                  mocked
                </div>
              </div>
              <div class="grid gap-2.5 text-sm text-muted-foreground">
                <div
                  class="rounded-2xl border border-border/70 bg-card/80 px-4 py-2.5 dark:border-white/10 dark:bg-background/55"
                >
                  Role-based shells and route guards
                </div>
                <div
                  class="rounded-2xl border border-border/70 bg-card/80 px-4 py-2.5 dark:border-white/10 dark:bg-background/55"
                >
                  Asset lists, user drilldowns, ticket threads
                </div>
                <div
                  class="rounded-2xl border border-border/70 bg-card/80 px-4 py-2.5 dark:border-white/10 dark:bg-background/55"
                >
                  Light and dark theme tokens ready for later swaps
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </section>

      <section class="flex justify-center lg:justify-end">
        <div class="w-full max-w-xl space-y-5">
          <div class="flex items-center justify-between lg:hidden">
            <AppWordmark />
            <ThemeToggle />
          </div>
          <div class="flex justify-end max-lg:hidden">
            <ThemeToggle />
          </div>
          <slot />
        </div>
      </section>
    </div>
  </div>
</template>
