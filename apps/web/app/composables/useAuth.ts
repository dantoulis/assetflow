import type { AppUser } from '@/lib/app-types';
import { useAssetsStore } from '../stores/assets';
import { useTicketsStore } from '../stores/tickets';
import { useAssetRequestsStore } from '../stores/assetRequests';
import { useUsersStore } from '../stores/users';

interface LoginPayload {
  username: string;
  password: string;
}

interface RegisterPayload {
  name?: string;
  username: string;
  email: string;
  password: string;
}

interface ForgotPasswordPayload {
  email: string;
}

interface ResetPasswordPayload {
  token: string;
  password: string;
}

export const useAuth = () => {
  const apiBase = useApiBase();
  const request = async <T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
    const cookieHeaders = import.meta.server ? useRequestHeaders(['cookie']) : undefined;

    return $fetch<T>(path, {
      baseURL: apiBase,
      credentials: 'include',
      headers: {
        ...(cookieHeaders ?? {}),
        ...(options.headers ?? {}),
      },
      ...options,
    });
  };

  const currentUser = useState<AppUser | null>('auth.current-user', () => null);
  const isInitialized = useState('auth.is-initialized', () => false);
  const isInitializing = useState('auth.is-initializing', () => false);

  const homePath = computed(() => {
    if (!currentUser.value) return '/login';

    return currentUser.value.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard';
  });

  const isAuthenticated = computed(() => Boolean(currentUser.value));

  const resetPiniaState = () => {
    const usersStore = useUsersStore();
    const ticketsStore = useTicketsStore();
    const assetRequestsStore = useAssetRequestsStore();
    const assetsStore = useAssetsStore();

    usersStore.resetStoreState();
    ticketsStore.resetStoreState();
    assetRequestsStore.resetStoreState();
    assetsStore.resetStoreState();
  };

  const refreshSession = async () => {
    if (isInitializing.value) return currentUser.value;

    isInitializing.value = true;

    try {
      const user = await request<AppUser | null>('/auth/me');
      const currentUserId = currentUser.value?.id;

      setCurrentUser(user);

      if (!user) {
        resetPiniaState();
        return null;
      }

      if (user.id !== currentUserId) {
        resetPiniaState();
      }

      return user;
    } catch {
      setCurrentUser(null);
      resetPiniaState();
      return null;
    } finally {
      isInitialized.value = true;
      isInitializing.value = false;
    }
  };

  const login = async (payload: LoginPayload) => {
    const user = await request<AppUser>('/auth/login', {
      method: 'POST',
      body: payload,
    });

    await refreshSession();
    return user;
  };

  const register = async (payload: RegisterPayload) => {
    const user = await request<AppUser>('/auth/register', {
      method: 'POST',
      body: payload,
    });

    await refreshSession();
    return user;
  };

  const logout = async () => {
    await request('/auth/logout', {
      method: 'POST',
    });

    await refreshSession();
  };

  const forgotPassword = async (payload: ForgotPasswordPayload) => {
    return request<{ success: true }>('/auth/forgot-password', {
      method: 'POST',
      body: payload,
    });
  };

  const resetPassword = async (payload: ResetPasswordPayload) => {
    return request<{ success: true }>('/auth/reset-password', {
      method: 'POST',
      body: payload,
    });
  };

  const validatePasswordResetToken = async (token: string) => {
    await request<{ valid: true }>('/auth/reset-password/validate', {
      query: { token },
    });
  };

  const setCurrentUser = (user: AppUser | null) => {
    currentUser.value = user;
  };

  return {
    currentUser,
    forgotPassword,
    homePath,
    isInitialized,
    isInitializing,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    register,
    resetPassword,
    setCurrentUser,
    validatePasswordResetToken,
  };
};
