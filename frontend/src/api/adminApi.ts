import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => '/admin/analytics',
      providesTags: ['Admin'],
      keepUnusedDataFor: 0,
    }),
    getUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['Admin'],
      keepUnusedDataFor: 0,
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/users/${id}/status`, method: 'PATCH', body: { status } }),
      invalidatesTags: ['Admin'],
    }),
    deleteUser: builder.mutation({
      query: (id: string) => ({ url: `/admin/users/${id}`, method: 'DELETE' }),
      invalidatesTags: ['Admin'],
    }),
    restoreUser: builder.mutation({
      query: (id: string) => ({ url: `/admin/users/${id}/restore`, method: 'PATCH' }),
      invalidatesTags: ['Admin'],
    }),
    getPendingCompanies: builder.query({
      query: () => '/admin/companies/pending',
      providesTags: ['Admin'],
    }),
    approveCompany: builder.mutation({
      query: ({ id, approved }) => ({ url: `/admin/companies/${id}/approve`, method: 'POST', body: { approved } }),
      invalidatesTags: ['Admin'],
    }),
    getAuditLog: builder.query({
      query: (params) => ({ url: '/admin/audit-log', params }),
      providesTags: ['Admin'],
      keepUnusedDataFor: 0,
    }),
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useGetPendingCompaniesQuery,
  useApproveCompanyMutation,
  useGetAuditLogQuery,
} = adminApi;
