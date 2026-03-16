<template>
  <Badge
    variant="outline"
    :class="
      cn(
        'rounded-full px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em]',
        config.class,
      )
    "
  >
    {{ config.label }}
  </Badge>
</template>

<script setup lang="ts">
import { cn } from '@/lib/utils';

const props = defineProps<{
  status: string;
}>();

const config = computed(() => {
  const map: Record<string, { label: string; class: string }> = {
    ADMIN: {
      label: 'Admin',
      class:
        'border-primary/25 bg-primary/18 text-primary dark:border-primary/20 dark:bg-primary/12',
    },
    USER: {
      label: 'User',
      class:
        'border-slate-300/90 bg-slate-100 text-slate-700 dark:border-border dark:bg-muted/80 dark:text-foreground/80',
    },
    ACTIVE: {
      label: 'Active',
      class:
        'border-emerald-500/25 bg-emerald-500/18 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/12 dark:text-emerald-300',
    },
    TRIAL: {
      label: 'Trial',
      class:
        'border-amber-500/25 bg-amber-500/18 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-300',
    },
    SUSPENDED: {
      label: 'Suspended',
      class:
        'border-rose-500/25 bg-rose-500/18 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/12 dark:text-rose-300',
    },
    EXPIRING_SOON: {
      label: 'Expiring soon',
      class:
        'border-amber-500/25 bg-amber-500/18 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-300',
    },
    EXPIRED: {
      label: 'Expired',
      class:
        'border-rose-500/25 bg-rose-500/18 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/12 dark:text-rose-300',
    },
    UNASSIGNED: {
      label: 'Unassigned',
      class:
        'border-slate-300/90 bg-slate-100 text-slate-700 dark:border-border dark:bg-muted/80 dark:text-muted-foreground',
    },
    IN_REPAIR: {
      label: 'In repair',
      class:
        'border-fuchsia-500/25 bg-fuchsia-500/18 text-fuchsia-800 dark:border-fuchsia-500/20 dark:bg-fuchsia-500/12 dark:text-fuchsia-300',
    },
    OPEN: {
      label: 'Open',
      class:
        'border-sky-500/25 bg-sky-500/18 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/12 dark:text-sky-300',
    },
    PENDING_ADMIN: {
      label: 'Pending admin',
      class:
        'border-amber-500/25 bg-amber-500/18 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-300',
    },
    PENDING_USER: {
      label: 'Pending user',
      class:
        'border-violet-500/25 bg-violet-500/18 text-violet-800 dark:border-violet-500/20 dark:bg-violet-500/12 dark:text-violet-300',
    },
    RESOLVED: {
      label: 'Resolved',
      class:
        'border-emerald-500/25 bg-emerald-500/18 text-emerald-800 dark:border-emerald-500/20 dark:bg-emerald-500/12 dark:text-emerald-300',
    },
    LOW: {
      label: 'Low',
      class:
        'border-slate-300/90 bg-slate-100 text-slate-700 dark:border-border dark:bg-muted/80 dark:text-muted-foreground',
    },
    MEDIUM: {
      label: 'Medium',
      class:
        'border-sky-500/25 bg-sky-500/18 text-sky-800 dark:border-sky-500/20 dark:bg-sky-500/12 dark:text-sky-300',
    },
    HIGH: {
      label: 'High',
      class:
        'border-amber-500/25 bg-amber-500/18 text-amber-800 dark:border-amber-500/20 dark:bg-amber-500/12 dark:text-amber-300',
    },
    URGENT: {
      label: 'Urgent',
      class:
        'border-rose-500/25 bg-rose-500/18 text-rose-800 dark:border-rose-500/20 dark:bg-rose-500/12 dark:text-rose-300',
    },
    LAPTOP: {
      label: 'Laptop',
      class:
        'border-chart-2/28 bg-chart-2/18 text-slate-800 dark:border-chart-2/20 dark:bg-chart-2/12 dark:text-foreground',
    },
    SUBSCRIPTION: {
      label: 'Subscription',
      class:
        'border-primary/25 bg-primary/18 text-primary dark:border-primary/20 dark:bg-primary/12',
    },
    LICENSE: {
      label: 'License',
      class:
        'border-chart-4/28 bg-chart-4/18 text-slate-800 dark:border-chart-4/20 dark:bg-chart-4/12 dark:text-foreground',
    },
    PERIPHERAL: {
      label: 'Peripheral',
      class:
        'border-chart-5/28 bg-chart-5/18 text-slate-800 dark:border-chart-5/20 dark:bg-chart-5/12 dark:text-foreground',
    },
  };

  return (
    map[props.status] ?? {
      label: props.status.replaceAll('_', ' '),
      class:
        'border-slate-300/90 bg-slate-100 text-slate-700 dark:border-border dark:bg-muted/80 dark:text-muted-foreground',
    }
  );
});
</script>
