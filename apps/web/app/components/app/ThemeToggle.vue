<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        class="relative overflow-hidden rounded-2xl border-white/10 bg-background/60 backdrop-blur"
      >
        <Icon name="lucide:sun-medium" class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0"  />
        <Icon name="lucide:moon-star"
          class="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
         />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-56 rounded-2xl p-2.5">
      <DropdownMenuLabel class="rounded-2xl border border-border/70 bg-accent/40 px-3.5 py-3">
        <div class="space-y-1">
          <p class="text-sm font-semibold text-foreground">Appearance</p>
          <p class="text-xs text-muted-foreground">Choose how AssetFlow should look.</p>
        </div>
      </DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="item in modeItems"
        :key="item.value"
        class="group px-3.5 py-3"
        @click="colorMode.preference = item.value"
      >
        <span
          class="flex size-9 shrink-0 items-center justify-center rounded-xl bg-primary/10 text-primary/90 transition group-focus:bg-primary/16"
        >
          <Icon :name="item.icon" class="size-4" />
        </span>
        <div class="min-w-0 flex-1">
          <p class="text-sm font-semibold text-foreground">{{ item.label }}</p>
          <p class="text-xs text-muted-foreground">
            {{
              item.value === 'light'
                ? 'Bright interface'
                : item.value === 'dark'
                  ? 'Low-light workspace'
                  : 'Match your system'
            }}
          </p>
        </div>
        <Icon name="lucide:check"
          v-if="colorMode.preference === item.value"
          class="ml-2 size-4 shrink-0 text-primary"
         />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">

const colorMode = useColorMode();

type ColorModePreference = 'light' | 'dark' | 'system';
type ModeItem = {
  value: ColorModePreference;
  label: string;
  icon: string;
};

const modeItems: ModeItem[] = [
  { value: 'light', label: 'Light', icon: 'lucide:sun-medium' },
  { value: 'dark', label: 'Dark', icon: 'lucide:moon-star' },
  { value: 'system', label: 'System', icon: 'lucide:laptop-minimal' },
];
</script>

