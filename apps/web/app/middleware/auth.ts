export default defineNuxtRouteMiddleware((to) => {
  const { currentUser, homePath, isAuthenticated } = useMockAuth();
  const guestRoutes = ['/login', '/register', '/forgot-password', '/reset-password'];

  if (to.path === '/') return navigateTo(homePath.value);

  if (guestRoutes.includes(to.path)) {
    if (isAuthenticated.value) return navigateTo(homePath.value);

    return;
  }

  if (!to.path.startsWith('/admin') && !to.path.startsWith('/app')) return;

  if (!isAuthenticated.value) return navigateTo('/login');

  if (to.path.startsWith('/admin') && currentUser.value?.role !== 'ADMIN')
    return navigateTo('/app/dashboard');

  if (to.path.startsWith('/app') && currentUser.value?.role !== 'USER')
    return navigateTo('/admin/dashboard');
});
