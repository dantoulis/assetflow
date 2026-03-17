<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        class="h-auto rounded-2xl border-white/10 bg-background/60 px-2.5 py-2 backdrop-blur"
      >
        <Avatar class="size-9 border border-white/10">
          <AvatarFallback class="bg-primary/15 font-semibold text-primary">
            {{ menuUser.initials }}
          </AvatarFallback>
        </Avatar>
        <div class="hidden text-left md:block">
          <p class="text-sm font-semibold leading-none">{{ menuUser.name }}</p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ isAuthenticated ? 'Authenticated session' : 'Preview data mode' }}
          </p>
        </div>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-64 rounded-2xl">
      <DropdownMenuLabel class="pb-2">
        <div class="space-y-1">
          <p class="font-semibold">{{ menuUser.name }}</p>
          <p class="text-xs font-normal text-muted-foreground">{{ menuUser.email }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="gap-2"
        @click="
          toast.message(
            isAuthenticated
              ? 'Backend auth is active while the dashboards still render preview data.'
              : 'Route access is open while the real auth flow is being wired.',
          )
        "
      >
        <ShieldCheck class="size-4 text-muted-foreground" />
        <span>{{ isAuthenticated ? 'Signed in' : 'Preview mode' }}</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-if="isAuthenticated"
        class="gap-2 text-destructive focus:text-destructive"
        @click="handleSignOut"
      >
        <LogOut class="size-4" />
        <span>Sign out</span>
      </DropdownMenuItem>
      <DropdownMenuItem v-else class="gap-2" @click="navigateTo('/login')">
        <LogIn class="size-4 text-muted-foreground" />
        <span>Go to login</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { LogIn, LogOut, ShieldCheck } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import { getUserByEmail, previewAdminUser, previewUser } from '@/lib/mock-data';

const route = useRoute();
const { currentUser, isAuthenticated, logout } = useAuth();

const previewContextUser = computed(() => {
  return route.path.startsWith('/admin') ? previewAdminUser : previewUser;
});

const menuUser = computed(() => {
  if (!currentUser.value) return previewContextUser.value;

  const matchedUser = getUserByEmail(currentUser.value.email);

  if (matchedUser) return matchedUser;

  return {
    initials: currentUser.value.username.slice(0, 2).toUpperCase(),
    name: currentUser.value.username,
    email: currentUser.value.email,
    role: currentUser.value.role,
  };
});

const handleSignOut = async () => {
  await logout();
  toast.success('Signed out');
  await navigateTo('/login');
};
</script>
