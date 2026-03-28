export const useApiBase = (): string => {
  const config = useRuntimeConfig();
  const apiBase = import.meta.server ? config.apiBaseServer : config.public.apiBase;

  return apiBase.replace(/\/$/, '');
};

export const usePublicApiBase = (): string => {
  return useRuntimeConfig().public.apiBase.replace(/\/$/, '');
};
