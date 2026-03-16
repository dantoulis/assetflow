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
          You only see assets and conversations attached to your demo profile.
        </div>
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>

    <SidebarInset>
      <header
        class="sticky top-0 z-20 border-b border-border/60 bg-background/72 px-4 py-4 backdrop-blur md:px-6"
      >
        <div class="flex flex-wrap items-center gap-3">
          <div class="flex items-center gap-3">
            <SidebarTrigger class="-ml-1" />
            <div>
              <p class="text-xs font-semibold uppercase tracking-[0.18em] text-primary">
                User surface
              </p>
              <p class="text-sm text-muted-foreground">
                Your assigned assets, renewals, and support conversations.
              </p>
            </div>
          </div>
          <div class="ml-auto flex items-center gap-2">
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
import { ChartColumnBig, FolderKanban, MessagesSquare, UserRound } from 'lucide-vue-next';

const route = useRoute();

const sections = [
  {
    label: 'Workspace',
    items: [
      { label: 'Dashboard', to: '/app/dashboard', icon: ChartColumnBig },
      { label: 'My Assets', to: '/app/assets', icon: FolderKanban },
      { label: 'Tickets', to: '/app/tickets', icon: MessagesSquare },
      { label: 'Profile', to: '/app/profile', icon: UserRound },
    ],
  },
];

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`);
};
</script>
