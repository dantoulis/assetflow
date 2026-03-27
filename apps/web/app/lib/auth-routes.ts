export const guestOnlyRoutes = new Set(['/login', '/register']);
export const publicRoutes = new Set(['/', '/forgot-password', '/reset-password']);
export const resetPasswordRoute = '/reset-password';

export const isAdminRoute = (path: string) => path.startsWith('/admin');
export const isUserRoute = (path: string) => path.startsWith('/app');
export const isProtectedRoute = (path: string) => isAdminRoute(path) || isUserRoute(path);
