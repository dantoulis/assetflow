import {
  guestOnlyRoutes,
  isAdminRoute,
  isProtectedRoute,
  isUserRoute,
  publicRoutes,
} from '~/lib/auth-routes';

export default defineNuxtRouteMiddleware(async (to) => {
  const { currentUser, isAuthenticated, isInitialized, isInitializing, refreshSession, homePath } =
    useAuth();

  if (isProtectedRoute(to.path)) {
    await refreshSession();
  } else if (!isInitialized.value && !isInitializing.value) {
    await refreshSession();
  }

  if (to.path === '/') {
    return navigateTo(isAuthenticated.value ? homePath.value : '/login');
  }

  if (publicRoutes.has(to.path)) {
    return;
  }

  if (guestOnlyRoutes.has(to.path)) {
    if (isAuthenticated.value) {
      return navigateTo(homePath.value);
    }

    return;
  }

  if (isAdminRoute(to.path)) {
    if (!isAuthenticated.value) {
      return navigateTo('/login');
    }

    if (currentUser.value?.role !== 'ADMIN') {
      return navigateTo('/app/dashboard');
    }

    return;
  }

  if (isUserRoute(to.path)) {
    if (!isAuthenticated.value) {
      return navigateTo('/login');
    }

    if (currentUser.value?.role !== 'USER') {
      return navigateTo('/admin/dashboard');
    }
  }
});
