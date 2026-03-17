import { guestOnlyRoutes, isAdminRoute, isProtectedRoute, isUserRoute } from '~/lib/auth-routes';

export default defineNuxtPlugin(async () => {
  const { currentUser, homePath, isAuthenticated, refreshSession } = useAuth();
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
    const path = router.currentRoute.value.path;

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

  window.addEventListener('pageshow', () => {
    void syncRouteAccess(true);
  });
});
