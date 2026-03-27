import {
  guestOnlyRoutes,
  isAdminRoute,
  isProtectedRoute,
  isUserRoute,
  resetPasswordRoute,
} from '~/lib/auth-routes';

export default defineNuxtPlugin(async () => {
  const { currentUser, homePath, isAuthenticated, refreshSession, validatePasswordResetToken } =
    useAuth();
  const router = useRouter();

  const replaceWith = async (path: string, hardRedirect: boolean) => {
    const target = router.resolve(path).fullPath;

    if (hardRedirect) {
      window.location.replace(target);
      return;
    }

    await router.replace(target);
  };

  const syncRouteAccess = async (hardRedirect = false) => {
    const currentRoute = router.currentRoute.value;
    const path = currentRoute.path;

    if (path === resetPasswordRoute) {
      if (!hardRedirect) {
        return;
      }

      const rawToken = currentRoute.query.token;
      const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

      if (!token) {
        await replaceWith('/login', hardRedirect);
        return;
      }

      try {
        await validatePasswordResetToken(token);
      } catch {
        await replaceWith('/login', hardRedirect);
      }

      return;
    }

    if (path === '/' || guestOnlyRoutes.has(path) || isProtectedRoute(path)) {
      await refreshSession();
    }

    if (path === '/') {
      await replaceWith(isAuthenticated.value ? homePath.value : '/login', hardRedirect);
      return;
    }

    if (guestOnlyRoutes.has(path)) {
      if (isAuthenticated.value) {
        await replaceWith(homePath.value, hardRedirect);
      }

      return;
    }

    if (isAdminRoute(path)) {
      if (!isAuthenticated.value) {
        await replaceWith('/login', hardRedirect);
        return;
      }

      if (currentUser.value?.role !== 'ADMIN') {
        await replaceWith('/app/dashboard', hardRedirect);
      }

      return;
    }

    if (isUserRoute(path)) {
      if (!isAuthenticated.value) {
        await replaceWith('/login', hardRedirect);
        return;
      }

      if (currentUser.value?.role !== 'USER') {
        await replaceWith('/admin/dashboard', hardRedirect);
      }
    }
  };

  await syncRouteAccess();

  window.addEventListener('pageshow', (event) => {
    if (!event.persisted) {
      return;
    }

    void syncRouteAccess(true);
  });
});
