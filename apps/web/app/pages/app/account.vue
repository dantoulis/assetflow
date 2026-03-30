<template>
  <div v-if="viewer" class="space-y-6">
    <PageIntro
      eyebrow="Account"
      title="Your account settings."
      description="Keep your contact details and workspace identity up to date."
    />

    <section class="grid auto-rows-fr gap-4 md:grid-cols-2">
      <Card class="app-surface h-full overflow-hidden">
        <CardContent class="flex h-full flex-col justify-between gap-6 p-6">
          <div class="space-y-5">
            <div class="flex items-center gap-4">
              <Avatar class="size-16 border border-white/10">
                <AvatarFallback class="bg-primary/12 text-xl font-semibold text-primary">
                  {{ initials }}
                </AvatarFallback>
              </Avatar>
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <StatusBadge :status="viewer.role" />
                </div>
                <div>
                  <p class="text-2xl font-semibold tracking-[-0.04em]">{{ displayName }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ viewer.team || 'No team set' }} | {{ viewer.location || 'No location set' }}
                  </p>
                </div>
              </div>
            </div>

            <div class="grid gap-3 text-sm text-muted-foreground">
              <p>
                <span class="font-semibold text-foreground">Username:</span> {{ viewer.username }}
              </p>
              <p><span class="font-semibold text-foreground">Email:</span> {{ viewer.email }}</p>
              <p>
                <span class="font-semibold text-foreground">Phone:</span>
                {{ viewer.phone || 'Not set' }}
              </p>
              <p>
                <span class="font-semibold text-foreground">Joined:</span>
                {{ formatDate(viewer.joinedAt) }}
              </p>
            </div>
          </div>

          <div class="app-inset-panel rounded-2xl px-4 py-3 text-sm text-muted-foreground">
            Keep these details current so ticket history, asset ownership, and request handling stay
            aligned.
          </div>
        </CardContent>
      </Card>

      <MetricCard
        class="h-full"
        title="Assigned assets"
        :value="`${assets.length}`"
        delta="Current footprint"
        hint="All assets currently attached to your account."
      >
        <template #icon><Icon name="lucide:folder-kanban" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        class="h-full"
        title="Open tickets"
        :value="`${openTickets.length}`"
        delta="Needs follow-up"
        hint="Support threads that are still active."
        tone="warning"
      >
        <template #icon><Icon name="lucide:messages-square" class="size-5" /></template>
      </MetricCard>
      <MetricCard
        class="h-full"
        title="Asset requests"
        :value="`${assetRequests.length}`"
        delta="Request history"
        hint="Requests you opened with the admin team."
        tone="success"
      >
        <template #icon><Icon name="lucide:clipboard-list" class="size-5" /></template>
      </MetricCard>
    </section>

    <AccountEditor
      :user="viewer"
      :saving="saving"
      :disabled-fields="['username']"
      description="These fields are used across tickets, asset ownership, and admin operations."
      @submit="handleSubmit"
    />
  </div>
</template>

<script setup lang="ts">
import { storeToRefs } from 'pinia';
import { toast } from 'vue-sonner';
import { getApiErrorMessage } from '@/lib/api-errors';
import { formatDate, getDisplayName, getInitials } from '@/lib/app-formatters';
import type { UserUpdatePayload } from '@/lib/app-types';

definePageMeta({
  layout: 'user',
});

useHead({
  title: 'Account',
});

const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();
const assetRequestsStore = useAssetRequestsStore();
const usersStore = useUsersStore();
const { currentUser, refreshSession, setCurrentUser } = useAuth();

if (!currentUser.value) {
  await refreshSession();
}

const viewer = computed(() => currentUser.value);

if (!viewer.value) {
  throw createError({ statusCode: 401, statusMessage: 'Authentication required' });
}

await Promise.all([assetsStore.fetchAll(), ticketsStore.fetchAll(), assetRequestsStore.fetchAll()]);

const { assets } = storeToRefs(assetsStore);
const { openTickets } = storeToRefs(ticketsStore);
const { requests: assetRequests } = storeToRefs(assetRequestsStore);
const displayName = computed(() => getDisplayName(viewer.value));
const initials = computed(() => getInitials(viewer.value));
const saving = ref(false);

const handleSubmit = async (payload: UserUpdatePayload) => {
  if (!viewer.value) return;

  saving.value = true;

  try {
    const updatedUser = await usersStore.updateUser(viewer.value.id, payload);
    setCurrentUser(updatedUser);
    toast.success('Account updated');
  } catch (error: unknown) {
    toast.error('Unable to save account changes', {
      description: getApiErrorMessage(error),
    });
  } finally {
    saving.value = false;
  }
};
</script>
