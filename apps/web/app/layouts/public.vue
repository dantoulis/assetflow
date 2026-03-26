<template>
  <div class="relative min-h-svh overflow-hidden px-4 py-5 md:px-6 lg:px-8">
    <div class="mx-auto flex min-h-[calc(100svh-2rem)] max-w-7xl items-center">
      <div
        class="grid w-full items-center gap-6 lg:grid-cols-[minmax(0,1fr)_minmax(30rem,34rem)] xl:gap-8"
      >
        <section
          class="app-surface app-shell-mask hidden max-w-3xl gap-8 overflow-hidden p-7 lg:grid xl:p-8"
        >
          <div class="space-y-8">
            <AppWordmark />
            <div class="space-y-4">
              <div
                class="inline-flex rounded-full border border-primary/20 bg-primary/12 px-3 py-1 text-xs font-semibold uppercase tracking-[0.18em] text-primary"
              >
                Secure workspace
              </div>
              <div class="space-y-4">
                <h1
                  class="max-w-xl text-5xl font-semibold leading-none tracking-[-0.06em] text-balance"
                >
                  Asset operations, tickets, and renewals in one control layer.
                </h1>
                <p class="max-w-lg text-base leading-7 text-muted-foreground">
                  Sign in to manage assigned inventory, support conversations, and asset requests
                  from one shared workspace.
                </p>
              </div>
            </div>
          </div>

          <div class="grid gap-3">
            <Card class="border-border/70 bg-white/72 dark:border-white/10 dark:bg-white/[0.03]">
              <CardContent class="grid gap-3 p-4">
                <div class="grid gap-1">
                  <p class="text-sm font-medium text-muted-foreground">App highlights</p>
                  <p class="text-2xl font-semibold tracking-[-0.04em]">
                    Built for day-to-day asset operations
                  </p>
                </div>
                <div class="grid gap-2.5 text-sm text-muted-foreground">
                  <div
                    class="rounded-2xl border border-border/70 bg-card/80 px-4 py-2.5 dark:border-white/10 dark:bg-background/55"
                  >
                    Clear role-based workspaces for admins and end users
                  </div>
                  <div
                    class="rounded-2xl border border-border/70 bg-card/80 px-4 py-2.5 dark:border-white/10 dark:bg-background/55"
                  >
                    Live asset visibility, renewal tracking, and account context
                  </div>
                  <div
                    class="rounded-2xl border border-border/70 bg-card/80 px-4 py-2.5 dark:border-white/10 dark:bg-background/55"
                  >
                    Ticket conversations and request flows from one shared surface
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </section>

        <section class="flex justify-center lg:justify-end">
          <div class="flex w-full max-w-xl flex-col gap-5 lg:h-full">
            <div class="flex items-center justify-between lg:hidden">
              <AppWordmark />
              <ThemeToggle />
            </div>
            <div class="hidden justify-end lg:flex">
              <ThemeToggle />
            </div>
            <div class="lg:flex lg:flex-1 lg:items-center">
              <slot />
            </div>
          </div>
        </section>
      </div>
    </div>
  </div>
</template>
