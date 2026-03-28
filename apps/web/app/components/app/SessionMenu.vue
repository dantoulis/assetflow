<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        class="h-auto rounded-2xl border-border/70 bg-card/78 px-2.5 py-2 shadow-sm backdrop-blur transition hover:bg-card"
      >
        <Avatar class="size-9 border border-white/10">
          <AvatarFallback class="bg-primary/15 font-semibold text-primary">
            {{ initials }}
          </AvatarFallback>
        </Avatar>
        <div class="hidden space-y-1 text-left md:block">
          <p class="text-sm font-semibold leading-none">{{ displayName }}</p>
          <p class="text-xs text-muted-foreground">{{ currentUser?.email }}</p>
        </div>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-72 p-2.5">
      <DropdownMenuLabel class="rounded-2xl border border-border/70 bg-accent/45 px-3.5 py-3.5">
        <div class="flex items-start gap-3">
          <Avatar class="size-11 shrink-0 border border-white/10 shadow-sm">
            <AvatarFallback class="bg-primary/15 font-semibold text-primary">
              {{ initials }}
            </AvatarFallback>
          </Avatar>
          <div class="min-w-0 space-y-1">
            <p class="truncate text-sm font-semibold text-foreground">{{ displayName }}</p>
            <p class="truncate text-xs font-medium text-muted-foreground">
              {{ currentUser?.email }}
            </p>
            <p class="pt-1 text-[11px] font-semibold uppercase tracking-[0.22em] text-primary/85">
              {{ currentUser?.role === 'ADMIN' ? 'Administrator' : 'Team member' }}
            </p>
          </div>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="group px-3.5 py-3" @click="navigateTo(accountPath)">
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary transition group-focus:bg-primary/16"
        >
          <Icon name="lucide:shield-check" class="size-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-foreground">Account settings</p>
          <p class="truncate text-xs text-muted-foreground">View and update your profile</p>
        </div>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="group px-3.5 py-3 text-destructive focus:text-destructive"
        @click="handleSignOut"
      >
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-destructive/10 text-destructive transition group-focus:bg-destructive/16"
        >
          <Icon name="lucide:log-out" class="size-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold">Sign out</p>
          <p class="truncate text-xs text-destructive/80">End this session and return to login</p>
        </div>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { getDisplayName, getInitials } from '@/lib/app-formatters';

const route = useRoute();
const { currentUser, logout } = useAuth();

const accountPath = computed(() =>
  route.path.startsWith('/admin') ? '/admin/account' : '/app/account',
);
const displayName = computed(() => getDisplayName(currentUser.value));
const initials = computed(() => getInitials(currentUser.value));

const handleSignOut = async () => {
  await logout();
  await navigateTo('/login');
};
</script>
