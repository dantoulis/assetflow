import { defineStore } from 'pinia';
import { computed, ref } from 'vue';
import { getUserCountsByTeam } from '@/lib/app-analytics';
import type { AppUser, UserRoleUpdatePayload, UserUpdatePayload } from '@/lib/app-types';
import { hasValue, removeItemById } from './store-helpers';

export const useUsersStore = defineStore('users', () => {
  const getApi = () => useAssetFlowApi();

  const users = ref<AppUser[]>([]);
  const isLoaded = ref(false);
  const isLoading = ref(false);

  const count = computed(() => users.value.length);
  const admins = computed(() => users.value.filter((user) => user.role === 'ADMIN'));
  const managedUsers = computed(() => users.value.filter((user) => user.role === 'USER'));
  const teams = computed(() => {
    const uniqueTeams = new Set<string>();

    for (const user of managedUsers.value) {
      if (hasValue(user.team)) {
        uniqueTeams.add(user.team);
      }
    }

    return [...uniqueTeams];
  });
  const teamCounts = computed(() => getUserCountsByTeam(managedUsers.value));

  const resetStoreState = () => {
    users.value = [];
    isLoaded.value = false;
    isLoading.value = false;
  };

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
    users.value = removeItemById(users.value, id);
  };

  const findUserById = (id: number) => users.value.find((user) => user.id === id) ?? null;

  const fetchAll = async (force = false) => {
    if (isLoaded.value && !force) {
      return users.value;
    }

    const api = getApi();
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
    const cachedUser = findUserById(id);

    if (cachedUser && !force) {
      return cachedUser;
    }

    const api = getApi();
    const user = await api.fetchUser(id);
    return upsert(user);
  };

  const updateUser = async (id: number, payload: UserUpdatePayload) => {
    const api = getApi();
    const updatedUser = await api.updateUser(id, payload);
    return upsert(updatedUser);
  };

  const updateRole = async (id: number, payload: UserRoleUpdatePayload) => {
    const api = getApi();
    const updatedUser = await api.updateUserRole(id, payload);
    return upsert(updatedUser);
  };

  const deleteUser = async (id: number) => {
    const api = getApi();
    const deletedUser = await api.deleteUser(id);
    removeFromState(id);
    return deletedUser;
  };

  return {
    users,
    count,
    admins,
    managedUsers,
    teams,
    teamCounts,
    isLoaded,
    isLoading,
    resetStoreState,
    fetchAll,
    fetchOne,
    updateUser,
    updateRole,
    deleteUser,
    replaceAll,
    upsert,
    findUserById,
  };
});
