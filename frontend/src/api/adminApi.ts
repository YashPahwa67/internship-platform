import { baseApi } from './baseApi';

export const adminApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getAnalytics: builder.query({
      query: () => '/admin/analytics',
      providesTags: ['Admin'],
    }),
    getUsers: builder.query({
      query: (params) => ({ url: '/admin/users', params }),
      providesTags: ['Admin'],
    }),
    updateUserStatus: builder.mutation({
      query: ({ id, status }) => ({ url: `/admin/users/${id}/status`, method: 'PATCH', body: { status } }),
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
  }),
});

export const {
  useGetAnalyticsQuery,
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useGetPendingCompaniesQuery,
  useApproveCompanyMutation,
} = adminApi;
