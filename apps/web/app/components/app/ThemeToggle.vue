<template>
  <DropdownMenu>
    <DropdownMenuTrigger as-child>
      <Button
        variant="outline"
        size="icon"
        class="relative overflow-hidden rounded-2xl border-white/10 bg-background/60 backdrop-blur"
      >
        <SunMedium class="size-4 rotate-0 scale-100 transition-all dark:-rotate-90 dark:scale-0" />
        <MoonStar
          class="absolute size-4 rotate-90 scale-0 transition-all dark:rotate-0 dark:scale-100"
        />
        <span class="sr-only">Toggle theme</span>
      </Button>
    </DropdownMenuTrigger>
    <DropdownMenuContent align="end" class="w-44 rounded-2xl">
      <DropdownMenuLabel>Appearance</DropdownMenuLabel>
      <DropdownMenuSeparator />
      <DropdownMenuItem
        v-for="item in modeItems"
        :key="item.value"
        class="gap-2"
        @click="colorMode.preference = item.value"
      >
        <component :is="item.icon" class="size-4 text-muted-foreground" />
        <span>{{ item.label }}</span>
        <Check v-if="colorMode.preference === item.value" class="ml-auto size-4 text-primary" />
      </DropdownMenuItem>
    </DropdownMenuContent>
  </DropdownMenu>
</template>

<script setup lang="ts">
import { Check, LaptopMinimal, MoonStar, SunMedium } from 'lucide-vue-next';

const colorMode = useColorMode();

const modeItems = [
  { value: 'light', label: 'Light', icon: SunMedium },
  { value: 'dark', label: 'Dark', icon: MoonStar },
  { value: 'system', label: 'System', icon: LaptopMinimal },
] as const;
</script>
