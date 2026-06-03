import { createApi, fetchBaseQuery } from '@reduxjs/toolkit/query/react';
import type { BaseQueryFn, FetchArgs, FetchBaseQueryError } from '@reduxjs/toolkit/query';
import type { RootState } from '../app/store';
import { setCredentials, logout, type AuthUser } from '../features/auth/authSlice';

const rawBaseQuery = fetchBaseQuery({
  baseUrl: '/api/v1',
  credentials: 'include',
  prepareHeaders: (headers, { getState }) => {
    const token = (getState() as RootState).auth.accessToken;
    if (token) headers.set('Authorization', `Bearer ${token}`);
    return headers;
  },
});

function getRequestUrl(args: string | FetchArgs): string {
  return typeof args === 'string' ? args : args.url;
}

function shouldSkipTokenRefresh(args: string | FetchArgs): boolean {
  const url = getRequestUrl(args);
  return (
    url.includes('/auth/refresh-token') ||
    url.includes('/auth/login') ||
    url.includes('/auth/register')
  );
}

const baseQueryWithReauth: BaseQueryFn<string | FetchArgs, unknown, FetchBaseQueryError> = async (
  args,
  api,
  extraOptions
) => {
  let result = await rawBaseQuery(args, api, extraOptions);

  const isRetry =
    typeof args === 'object' && args !== null && '_retry' in args && (args as FetchArgs & { _retry?: boolean })._retry;

  if (result.error?.status === 401 && !shouldSkipTokenRefresh(args) && !isRetry) {
    const refresh = await rawBaseQuery(
      { url: '/auth/refresh-token', method: 'POST' },
      api,
      extraOptions
    );

    const payload = refresh.data as { success?: boolean; data?: { accessToken: string; user: AuthUser } };
    if (payload?.data?.accessToken) {
      api.dispatch(
        setCredentials({
          accessToken: payload.data.accessToken,
          user: payload.data.user,
        })
      );

      const retryArgs: FetchArgs & { _retry?: boolean } =
        typeof args === 'string' ? { url: args, _retry: true } : { ...args, _retry: true };
      result = await rawBaseQuery(retryArgs, api, extraOptions);
    } else {
      api.dispatch(logout());
    }
  }

  return result;
};

export const baseApi = createApi({
  reducerPath: 'api',
  baseQuery: baseQueryWithReauth,
  tagTypes: ['User', 'Internships', 'Applications', 'Tasks', 'Notifications', 'Admin'],
  endpoints: () => ({}),
});
