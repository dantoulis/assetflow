<template>
  <div v-if="user" class="space-y-6">
    <PageIntro
      eyebrow="User detail"
      :title="getDisplayName(user)"
      description="Review ownership, support history, and update the account role when needed."
    />

    <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card class="app-surface overflow-hidden">
        <CardContent class="grid gap-6 p-6">
          <div class="flex flex-col gap-6 md:flex-row md:items-center md:justify-between">
            <div class="flex items-center gap-4">
              <Avatar class="size-16 border border-white/10">
                <AvatarFallback class="bg-primary/12 text-xl font-semibold text-primary">
                  {{ getInitials(user) }}
                </AvatarFallback>
              </Avatar>
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <StatusBadge :status="user.role" />
                </div>
                <div>
                  <p class="text-2xl font-semibold tracking-[-0.04em]">
                    {{ getDisplayName(user) }}
                  </p>
                  <p class="text-sm text-muted-foreground">
                    {{ user.team || 'No team' }} | {{ user.location || 'No location' }}
                  </p>
                </div>
              </div>
            </div>
            <div class="grid gap-3 text-sm text-muted-foreground">
              <p><span class="font-semibold text-foreground">Email:</span> {{ user.email }}</p>
              <p>
                <span class="font-semibold text-foreground">Phone:</span>
                {{ user.phone || 'Not set' }}
              </p>
              <p>
                <span class="font-semibold text-foreground">Joined:</span>
                {{ formatDate(user.joinedAt) }}
              </p>
            </div>
          </div>

          <div class="h-px bg-border/70" />

          <AccountEditor
            embedded
            :user="user"
            :saving="savingDetails"
            title="Edit user details"
            description="Update this account's identity and contact fields without leaving the detail view."
            submit-label="Save user"
            @submit="saveDetails"
          />

          <div class="h-px bg-border/70" />

          <div class="grid gap-4 lg:grid-cols-2">
            <div class="rounded-3xl border border-border/70 bg-background p-5">
              <div class="grid gap-4">
                <div class="grid gap-1">
                  <p class="text-sm font-semibold text-foreground">Role access</p>
                  <p class="text-sm leading-6 text-muted-foreground">
                    Promote this account to grant admin visibility across users, assets, tickets,
                    and requests. Once an account becomes an admin, that role is permanent in the
                    current permission model.
                  </p>
                </div>

                <div class="grid gap-2">
                  <Label for="user-role">Role</Label>
                  <AppSelectField
                    id="user-role"
                    v-model="selectedRole"
                    :options="roleOptions"
                    placeholder="Choose role"
                    :disabled="roleLocked"
                  />
                </div>

                <div
                  class="rounded-2xl border border-border/70 bg-muted/45 px-4 py-3 text-sm text-muted-foreground"
                >
                  <span class="font-semibold text-foreground">Admin access:</span>
                  once granted, it cannot be removed. Use this promotion carefully because it
                  immediately changes what data and actions this person can access.
                </div>

                <div class="flex justify-end">
                  <Button
                    class="rounded-2xl"
                    :disabled="savingRole || roleLocked || !roleChanged"
                    @click="saveRole"
                  >
                    {{ savingRole ? 'Saving...' : roleLocked ? 'Role locked' : 'Save role' }}
                  </Button>
                </div>
              </div>
            </div>

            <div class="rounded-3xl border border-destructive/30 bg-destructive/6 p-5">
              <div class="grid gap-4">
                <div class="grid gap-1">
                  <p class="text-sm font-semibold text-foreground">Danger zone</p>
                  <p class="text-sm leading-6 text-muted-foreground">
                    Deleting this account removes the user record from the workspace. This action
                    should only be used for accounts that should no longer exist in the system.
                  </p>
                </div>

                <div
                  class="rounded-2xl border border-destructive/25 bg-background px-4 py-3 text-sm text-muted-foreground"
                >
                  <span class="font-semibold text-foreground">Important:</span>
                  admin accounts cannot be deleted. Once promoted, they remain admins in the current
                  permission model.
                </div>

                <div class="flex justify-end">
                  <Dialog v-model:open="deleteDialogOpen">
                    <DialogTrigger as-child>
                      <Button variant="destructive" class="rounded-2xl" :disabled="!canDeleteUser">
                        Delete account
                      </Button>
                    </DialogTrigger>
                    <DialogContent class="rounded-3xl sm:max-w-md">
                      <DialogHeader>
                        <DialogTitle>Delete user account</DialogTitle>
                        <DialogDescription>
                          This will permanently remove {{ getDisplayName(user) }} from the
                          workspace. This action cannot be undone.
                        </DialogDescription>
                      </DialogHeader>
                      <DialogFooter>
                        <Button
                          variant="outline"
                          class="rounded-2xl"
                          @click="deleteDialogOpen = false"
                        >
                          Cancel
                        </Button>
                        <Button
                          variant="destructive"
                          class="rounded-2xl"
                          :disabled="deletingUser"
                          @click="deleteUser"
                        >
                          {{ deletingUser ? 'Deleting...' : 'Delete account' }}
                        </Button>
                      </DialogFooter>
                    </DialogContent>
                  </Dialog>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div class="grid gap-4">
        <MetricCard
          title="Assigned assets"
          :value="`${ownedAssets.length}`"
          delta="Current footprint"
          hint="Assets currently attributed to this user."
        >
          <template #icon><Boxes class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Open tickets"
          :value="`${openTickets.length}`"
          delta="Support load"
          hint="Active support conversations for this user."
          tone="warning"
        >
          <template #icon><Ticket class="size-5" /></template>
        </MetricCard>
        <MetricCard
          title="Asset requests"
          :value="`${userRequests.length}`"
          delta="Procurement history"
          hint="Requests this user has opened with the admin team."
          tone="success"
        >
          <template #icon><ClipboardList class="size-5" /></template>
        </MetricCard>
      </div>
    </section>

    <section class="grid gap-4 xl:grid-cols-[1.2fr_0.8fr]">
      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Assigned assets</CardTitle>
          <CardDescription>
            Ownership, lifecycle pressure, and current state for this user.
          </CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="asset in ownedAssets"
            :key="asset.id"
            :to="`/admin/assets/${asset.id}`"
            class="app-list-item"
          >
            <div class="flex flex-wrap items-start justify-between gap-3">
              <div class="space-y-2">
                <div class="flex flex-wrap gap-2">
                  <StatusBadge :status="asset.type" />
                  <StatusBadge :status="asset.status" />
                </div>
                <div>
                  <p class="font-semibold">{{ asset.title }}</p>
                  <p class="text-sm text-muted-foreground">
                    {{ asset.vendor }} | {{ formatRelativeDate(getAssetNextDate(asset)) }}
                  </p>
                </div>
              </div>
              <span class="text-xs text-muted-foreground">{{ asset.reference }}</span>
            </div>
          </NuxtLink>
        </CardContent>
      </Card>

      <Card class="app-surface overflow-hidden">
        <CardHeader>
          <CardTitle>Recent ticket history</CardTitle>
          <CardDescription>Support conversations associated with this user.</CardDescription>
        </CardHeader>
        <CardContent class="space-y-3">
          <NuxtLink
            v-for="ticket in userTickets"
            :key="ticket.id"
            :to="`/admin/tickets/${ticket.id}`"
            class="app-list-item"
          >
            <div class="grid gap-3">
              <div class="flex flex-wrap gap-2">
                <StatusBadge :status="ticket.priority" />
                <StatusBadge :status="ticket.status" />
              </div>
              <div class="space-y-1">
                <p class="font-semibold">{{ ticket.subject }}</p>
                <p class="text-sm text-muted-foreground">
                  {{ humanizeEnum(ticket.category) }} | Updated
                  {{ formatRelativeDate(ticket.updatedAt) }}
                </p>
              </div>
            </div>
          </NuxtLink>
        </CardContent>
      </Card>
    </section>
  </div>
</template>

<script setup lang="ts">
import { Boxes, ClipboardList, Ticket } from 'lucide-vue-next';
import { toast } from 'vue-sonner';
import {
  formatDate,
  formatRelativeDate,
  getAssetNextDate,
  getDisplayName,
  getInitials,
  humanizeEnum,
} from '@/lib/app-formatters';
import type { AppRole, UserUpdatePayload } from '@/lib/app-types';

definePageMeta({
  layout: 'admin',
});

const route = useRoute();
const userId = Number(route.params.id);
const assetRequestsStore = useAssetRequestsStore();
const assetsStore = useAssetsStore();
const ticketsStore = useTicketsStore();
const usersStore = useUsersStore();

let userValue;

try {
  userValue = await usersStore.fetchOne(userId);
} catch {
  throw createError({ statusCode: 404, statusMessage: 'User not found' });
}

await Promise.all([assetsStore.fetchAll(), ticketsStore.fetchAll(), assetRequestsStore.fetchAll()]);

const user = computed(() => usersStore.findUserById(userId) ?? userValue);
const ownedAssets = computed(() => assetsStore.byUserId(user.value.id));
const userTickets = computed(() => ticketsStore.byRequesterId(user.value.id));
const openTickets = computed(() =>
  userTickets.value.filter((ticket) => ticket.status !== 'RESOLVED'),
);
const userRequests = computed(() => assetRequestsStore.byRequesterId(user.value.id));
const selectedRole = ref<AppRole>(user.value.role);
const savingRole = ref(false);
const savingDetails = ref(false);
const deleteDialogOpen = ref(false);
const deletingUser = ref(false);
const roleOptions: Array<{ label: string; value: AppRole }> = [
  { label: 'User', value: 'USER' },
  { label: 'Admin', value: 'ADMIN' },
];
const canDeleteUser = computed(() => user.value.role !== 'ADMIN');
const roleLocked = computed(() => user.value.role === 'ADMIN');
const roleChanged = computed(() => selectedRole.value !== user.value.role);

useHead({
  title: computed(() => getDisplayName(user.value)),
});

watch(
  () => user.value.role,
  (role) => {
    selectedRole.value = role;
  },
  { immediate: true },
);

const saveRole = async () => {
  if (roleLocked.value || !roleChanged.value) {
    return;
  }

  savingRole.value = true;

  try {
    await usersStore.updateRole(user.value.id, { role: selectedRole.value });
    toast.success('Role updated');
  } catch {
    toast.error('Unable to update role');
  } finally {
    savingRole.value = false;
  }
};

const saveDetails = async (payload: UserUpdatePayload) => {
  savingDetails.value = true;

  try {
    await usersStore.updateUser(user.value.id, payload);
    toast.success('User details updated');
  } catch {
    toast.error('Unable to update user details');
  } finally {
    savingDetails.value = false;
  }
};

const deleteUser = async () => {
  if (!canDeleteUser.value) {
    toast.error('Admin accounts cannot be deleted');
    return;
  }

  deletingUser.value = true;

  try {
    await usersStore.deleteUser(user.value.id);
    deleteDialogOpen.value = false;
    toast.success('User account deleted');
    await navigateTo('/admin/users');
  } catch {
    toast.error('Unable to delete user account');
  } finally {
    deletingUser.value = false;
  }
};
</script>
