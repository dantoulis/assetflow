<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        class="h-auto rounded-2xl border-white/10 bg-background/60 px-2.5 py-2 backdrop-blur"
      >
        <Avatar class="size-9 border border-white/10">
          <AvatarFallback class="bg-primary/15 font-semibold text-primary">
            {{ currentUser?.initials }}
          </AvatarFallback>
        </Avatar>
        <div class="hidden text-left md:block">
          <p class="text-sm font-semibold leading-none">{{ currentUser?.name }}</p>
          <p class="mt-1 text-xs text-muted-foreground">
            {{ currentUser?.role === 'ADMIN' ? 'Admin demo' : 'User demo' }}
          </p>
        </div>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-64 rounded-2xl">
      <DropdownMenuLabel class="pb-2">
        <div class="space-y-1">
          <p class="font-semibold">{{ currentUser?.name }}</p>
          <p class="text-xs font-normal text-muted-foreground">{{ currentUser?.email }}</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem class="gap-2" @click="switchRole('ADMIN')">
        <ShieldCheck class="size-4 text-muted-foreground" />
        <span>Switch to admin demo</span>
      </DropdownMenuItem>
      <DropdownMenuItem class="gap-2" @click="switchRole('USER')">
        <UserRound class="size-4 text-muted-foreground" />
        <span>Switch to user demo</span>
      </DropdownMenuItem>
      <DropdownMenuItem
        class="gap-2"
        @click="toast.message('Backend wiring is intentionally disabled for this phase.')"
      >
        <ArrowRightLeft class="size-4 text-muted-foreground" />
        <span>Mock data only</span>
      </DropdownMenuItem>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        class="gap-2 text-destructive focus:text-destructive"
        @click="handleSignOut"
      >
        <LogOut class="size-4" />
        <span>Sign out</span>
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { ArrowRightLeft, LogOut, ShieldCheck, UserRound } from 'lucide-vue-next';
import { toast } from 'vue-sonner';

const { currentUser, signInDemo, signOut } = useMockAuth();

const switchRole = async (role: 'ADMIN' | 'USER') => {
  const user = await signInDemo(role);
  toast.success(`Switched to ${user.name}`, {
    description:
      role === 'ADMIN'
        ? 'Admin workspace loaded with global controls.'
        : 'User workspace loaded with personal assets only.',
  });
  await navigateTo(role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard');
};

const handleSignOut = async () => {
  signOut();
  toast.message('Demo session cleared');
  await navigateTo('/login');
};
</script>
