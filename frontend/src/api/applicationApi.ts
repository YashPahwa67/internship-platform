import { baseApi } from './baseApi';

export const applicationApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getApplications: builder.query({
      query: (params) => ({ url: '/applications', params }),
      providesTags: ['Applications'],
      keepUnusedDataFor: 0,
    }),
    getApplication: builder.query({
      query: (id) => `/applications/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Applications', id }],
    }),
    apply: builder.mutation({
      query: (body) => ({
        url: '/applications',
        method: 'POST',
        body,
        // RTK Query sets Content-Type automatically: omit for FormData so browser sets boundary
        ...(body instanceof FormData ? { formData: true } : {}),
      }),
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
    submitStudentReview: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/applications/${id}/student-review`, method: 'POST', body }),
      invalidatesTags: ['Applications'],
    }),
    submitCompanyReview: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/applications/${id}/company-review`, method: 'POST', body }),
      invalidatesTags: ['Applications'],
    }),
  }),
});

export const {
  useGetApplicationsQuery,
  useGetApplicationQuery,
  useApplyMutation,
  useUpdateApplicationStatusMutation,
  useWithdrawApplicationMutation,
  useSubmitStudentReviewMutation,
  useSubmitCompanyReviewMutation,
} = applicationApi;
