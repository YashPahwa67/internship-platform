import { baseApi } from './baseApi';

export const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query({
      query: (params) => ({ url: '/applications', params }),
      providesTags: ['Applications'],
    }),
    apply: builder.mutation({
      query: (body) => ({ url: '/applications', method: 'POST', body }),
      invalidatesTags: ['Applications', 'Internships'],
    }),
    updateApplicationStatus: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/applications/${id}/status`, method: 'PATCH', body }),
      invalidatesTags: ['Applications'],
    }),
    withdrawApplication: builder.mutation({
      query: (id) => ({ url: `/applications/${id}/withdraw`, method: 'POST' }),
      invalidatesTags: ['Applications'],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useApplyMutation,
  useUpdateApplicationStatusMutation,
  useWithdrawApplicationMutation,
} = applicationApi;
