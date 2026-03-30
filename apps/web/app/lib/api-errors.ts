import type { IFetchError } from 'ofetch';

export const getApiErrorMessage = (
  error: unknown,
  fallback = 'Something went wrong, try again.',
): string => {
  const fetchError = error as IFetchError<{ message?: string }>;

  if (typeof fetchError.data?.message === 'string' && fetchError.data.message.length > 0) {
    return fetchError.data.message;
  }

  if (typeof fetchError.statusMessage === 'string' && fetchError.statusMessage.length > 0) {
    return fetchError.statusMessage;
  }

  if (error instanceof Error && error.message.length > 0) {
    return error.message;
  }

  return fallback;
};
