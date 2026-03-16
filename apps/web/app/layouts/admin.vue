<template>
  <SidebarProvider class="min-h-svh">
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader class="border-b border-sidebar-border/70 px-3 py-4">
        <AppWordmark :compact="false" />
      </SidebarHeader>
      <SidebarContent class="px-2 py-4">
        <SidebarGroup v-for="section in sections" :key="section.label">
          <SidebarGroupLabel>{{ section.label }}</SidebarGroupLabel>
          <SidebarGroupContent>
            <SidebarMenu>
              <SidebarMenuItem v-for="item in section.items" :key="item.to">
                <SidebarMenuButton as-child :is-active="isActive(item.to)" :tooltip="item.label">
                  <NuxtLink :to="item.to">
                    <component :is="item.icon" />
                    <span>{{ item.label }}</span>
                  </NuxtLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
      <SidebarFooter class="border-t border-sidebar-border/70 p-3">
        <div
          class="rounded-2xl border border-sidebar-border/70 bg-sidebar-accent/40 p-3 text-sm leading-6 text-sidebar-foreground/78"
        >
          Backend calls are intentionally disabled. This shell is the contract preview for the later
          Nest + Prisma phase.
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header
        class="sticky top-0 z-20 border-b border-border/60 bg-background/70 px-4 py-4 backdrop-blur md:px-6"
      >
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-3">
            <SidebarTrigger class="-ml-1" />
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                Admin surface
              </p>
              <p class="text-sm text-muted-foreground">{{ todayLabel }}</p>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-2">
            <Badge
              variant="outline"
              class="rounded-full border-primary/15 bg-primary/10 px-3 py-1 text-primary"
            >
              Frontend preview
            </Badge>
            <ThemeToggle />
            <SessionMenu />
          </div>
        </div>
      </header>

      <main class="flex flex-1 flex-col gap-6 px-4 py-5 md:px-6 md:py-6">
        <slot />
      </main>
    </SidebarInset>
  </SidebarProvider>
</template>

<script setup lang="ts">
import { Boxes, ChartColumnBig, MessageSquareMore, UsersRound } from 'lucide-vue-next';

const route = useRoute();
const todayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date('2026-03-14T12:00:00.000Z'));

const sections = [
  {
    label: 'Control center',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: ChartColumnBig },
      { label: 'Users', to: '/admin/users', icon: UsersRound },
      { label: 'Assets', to: '/admin/assets', icon: Boxes },
      { label: 'Tickets', to: '/admin/tickets', icon: MessageSquareMore },
    ],
  },
];

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`);
};
</script>
