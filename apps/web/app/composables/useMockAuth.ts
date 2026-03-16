import type { AppRole, MockUser } from '@/lib/mock-data';
import { demoAccounts, getUserByEmail, getUserById } from '@/lib/mock-data';

interface MockSession {
  userId: string;
  role: AppRole;
}

const SESSION_COOKIE = 'assetflow_demo_session';

export const useMockAuth = () => {
  const session = useCookie<MockSession | null>(SESSION_COOKIE, {
    default: () => null,
    sameSite: 'lax',
    maxAge: 60 * 60 * 8,
  });

  const currentUser = computed(() => (session.value ? getUserById(session.value.userId) : null));
  const isAuthenticated = computed(() => Boolean(currentUser.value));
  const homePath = computed(() => {
    if (!currentUser.value) return '/login';

    return currentUser.value.role === 'ADMIN' ? '/admin/dashboard' : '/app/dashboard';
  });

  const setSession = (user: MockUser) => {
    session.value = {
      userId: user.id,
      role: user.role,
    };
  };

  const signIn = async (email: string) => {
    const user = getUserByEmail(email);

    if (!user) {
      return {
        ok: false as const,
        message: 'This email is not part of the current demo dataset.',
      };
    }

    setSession(user);

    return {
      ok: true as const,
      user,
    };
  };

  const signInDemo = async (role: AppRole) => {
    const account = demoAccounts.find((item) => item.role === role);

    if (!account) throw new Error(`Missing demo account for role ${role}`);

    const result = await signIn(account.email);

    if (!result.ok) throw new Error(result.message);

    return result.user;
  };

  const registerPreview = async () => {
    return signInDemo('USER');
  };

  const signOut = () => {
    session.value = null;
  };

  return {
    session,
    currentUser,
    homePath,
    isAuthenticated,
    isAdmin: computed(() => currentUser.value?.role === 'ADMIN'),
    isUser: computed(() => currentUser.value?.role === 'USER'),
    signIn,
    signInDemo,
    registerPreview,
    signOut,
    demoAccounts,
  };
};
