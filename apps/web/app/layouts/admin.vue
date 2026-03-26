<template>
  <SidebarProvider class="min-h-svh">
    <Sidebar variant="inset" collapsible="offcanvas">
      <SidebarHeader class="flex h-20 items-center border-b border-sidebar-border/70 px-4 py-4">
        <AppWordmark :compact="false" />
      </SidebarHeader>
      <SidebarContent class="px-3 py-4">
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
      <SidebarFooter class="px-3 pb-4 pt-0">
        <SidebarMenu>
          <SidebarMenuItem>
            <SidebarMenuButton @click="handleSignOut">
              <LogOut />
              <span>Sign out</span>
            </SidebarMenuButton>
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>

    <SidebarInset>
      <header
        class="sticky top-0 z-20 flex h-20 items-center border-b border-border/60 bg-background/70 px-4 py-4 backdrop-blur md:top-2 md:px-6"
      >
        <div class="flex w-full flex-wrap items-center gap-3">
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
              Live data
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
import {
  Boxes,
  ChartColumnBig,
  ClipboardList,
  LogOut,
  MessageSquareMore,
  UserRound,
  UsersRound,
} from 'lucide-vue-next';

const route = useRoute();
const { logout } = useAuth();
const todayLabel = new Intl.DateTimeFormat('en-US', {
  weekday: 'long',
  month: 'long',
  day: 'numeric',
}).format(new Date());

const sections = [
  {
    label: 'Control center',
    items: [
      { label: 'Dashboard', to: '/admin/dashboard', icon: ChartColumnBig },
      { label: 'Users', to: '/admin/users', icon: UsersRound },
      { label: 'Assets', to: '/admin/assets', icon: Boxes },
      { label: 'Tickets', to: '/admin/tickets', icon: MessageSquareMore },
      { label: 'Requests', to: '/admin/requests', icon: ClipboardList },
      { label: 'Account', to: '/admin/account', icon: UserRound },
    ],
  },
];

const isActive = (path: string) => {
  return route.path === path || route.path.startsWith(`${path}/`);
};

const handleSignOut = async () => {
  await logout();
  await navigateTo('/login');
};
</script>
