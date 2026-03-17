type AuthRole = 'ADMIN' | 'USER';

interface AuthUser {
  id: number;
  email: string;
  username: string;
  role: AuthRole;
}

interface LoginPayload {
  username: string;
  password: string;
}

interface RegisterPayload {
  username: string;
  email: string;
  password: string;
}

export const useAuth = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;

  const currentUser = useState<AuthUser | null>('auth.current-user', () => null);
  const isInitialized = useState('auth.is-initialized', () => false);
  const isInitializing = useState('auth.is-initializing', () => false);

  const homePath = computed(() => {
    if (!currentUser.value) return '/login';

    return currentUser.value.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard';
  });

  const isAuthenticated = computed(() => Boolean(currentUser.value));

  const refreshSession = async () => {
    if (isInitializing.value) return currentUser.value;

    isInitializing.value = true;

    try {
      const user = await $fetch<AuthUser>('/auth/me', {
        baseURL: apiBase,
        credentials: 'include',
      });

      currentUser.value = user;
      return user;
    } catch {
      currentUser.value = null;
      return null;
    } finally {
      isInitialized.value = true;
      isInitializing.value = false;
    }
  };

  const login = async (payload: LoginPayload) => {
    const user = await $fetch<AuthUser>('/auth/login', {
      method: 'POST',
      baseURL: apiBase,
      credentials: 'include',
      body: payload,
    });

    currentUser.value = user;
    isInitialized.value = true;
    return user;
  };

  const register = async (payload: RegisterPayload) => {
    const user = await $fetch<AuthUser>('/auth/register', {
      method: 'POST',
      baseURL: apiBase,
      credentials: 'include',
      body: payload,
    });

    currentUser.value = user;
    isInitialized.value = true;
    return user;
  };

  const logout = async () => {
    await $fetch('/auth/logout', {
      method: 'POST',
      baseURL: apiBase,
      credentials: 'include',
    });

    currentUser.value = null;
    isInitialized.value = true;
  };

  return {
    currentUser,
    homePath,
    isInitialized,
    isInitializing,
    isAuthenticated,
    login,
    logout,
    refreshSession,
    register,
  };
};
