import type { AppUser } from '@/lib/app-types';

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

export const useAuth = () => {
  const config = useRuntimeConfig();
  const apiBase = config.public.apiBase;
  const request = async <T>(path: string, options: Parameters<typeof $fetch<T>>[1] = {}) => {
    const cookieHeaders = process.server ? useRequestHeaders(['cookie']) : undefined;

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

  const refreshSession = async () => {
    if (isInitializing.value) return currentUser.value;

    isInitializing.value = true;

    try {
      const user = await request<AppUser>('/auth/me');

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
    const user = await request<AppUser>('/auth/login', {
      method: 'POST',
      body: payload,
    });

    currentUser.value = user;
    isInitialized.value = true;
    return user;
  };

  const register = async (payload: RegisterPayload) => {
    const user = await request<AppUser>('/auth/register', {
      method: 'POST',
      body: payload,
    });

    currentUser.value = user;
    isInitialized.value = true;
    return user;
  };

  const logout = async () => {
    await request('/auth/logout', {
      method: 'POST',
    });

    currentUser.value = null;
    isInitialized.value = true;
  };

  const setCurrentUser = (user: AppUser | null) => {
    currentUser.value = user;
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
    setCurrentUser,
  };
};
