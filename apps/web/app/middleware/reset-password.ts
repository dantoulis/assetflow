export default defineNuxtRouteMiddleware(async (to) => {
  const rawToken = to.query.token;
  const token = Array.isArray(rawToken) ? rawToken[0] : rawToken;

  if (!token) {
    return navigateTo('/login', { replace: true });
  }

  const { validatePasswordResetToken } = useAuth();

  try {
    await validatePasswordResetToken(token);
  } catch {
    return navigateTo('/login', { replace: true });
  }
});
