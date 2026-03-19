import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { getUserCountsByTeam } from '@/lib/app-analytics';
import type { AppUser, UserRoleUpdatePayload, UserUpdatePayload } from '@/lib/app-types';

export const useUsersStore = defineStore('users', () => {
  const api = useAssetFlowApi();

  const users = ref<AppUser[]>([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  const byId = computed(
    () => Object.fromEntries(users.value.map((user) => [user.id, user])) as Record<number, AppUser>,
  );
  const count = computed(() => users.value.length);
  const admins = computed(() => users.value.filter((user) => user.role === 'ADMIN'));
  const managedUsers = computed(() => users.value.filter((user) => user.role === 'USER'));
  const teams = computed(
    () => [...new Set(managedUsers.value.map((user) => user.team).filter(Boolean))] as string[],
  );
  const teamCounts = computed(() => getUserCountsByTeam(managedUsers.value));

  const replaceAll = (nextUsers: AppUser[]) => {
    users.value = nextUsers;
    isLoaded.value = true;
  };

  const upsert = (user: AppUser) => {
    const index = users.value.findIndex((entry) => entry.id === user.id);

    if (index === -1) {
      users.value = [user, ...users.value];
      return user;
    }

    users.value[index] = user;
    users.value = [...users.value];
    return user;
  };

  const removeFromState = (id: number) => {
    users.value = users.value.filter((user) => user.id !== id);
  };

  const fetchAll = async (force = false) => {
    if (isLoaded.value && !force) {
      return users.value;
    }

    isLoading.value = true;

    try {
      const nextUsers = await api.fetchUsers();
      replaceAll(nextUsers);
      return users.value;
    } finally {
      isLoading.value = false;
    }
  };

  const fetchOne = async (id: number, force = false) => {
    const cachedUser = byId.value[id];

    if (cachedUser && !force) {
      return cachedUser;
    }

    const user = await api.fetchUser(id);
    return upsert(user);
  };

  const updateUser = async (id: number, payload: UserUpdatePayload) => {
    const updatedUser = await api.updateUser(id, payload);
    return upsert(updatedUser);
  };

  const updateRole = async (id: number, payload: UserRoleUpdatePayload) => {
    const updatedUser = await api.updateUserRole(id, payload);
    return upsert(updatedUser);
  };

  const deleteUser = async (id: number) => {
    const deletedUser = await api.deleteUser(id);
    removeFromState(id);
    return deletedUser;
  };

  return {
    users,
    byId,
    count,
    admins,
    managedUsers,
    teams,
    teamCounts,
    isLoaded,
    isLoading,
    fetchAll,
    fetchOne,
    updateUser,
    updateRole,
    deleteUser,
    replaceAll,
    upsert,
  };
});
