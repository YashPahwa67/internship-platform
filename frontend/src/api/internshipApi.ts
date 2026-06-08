import { baseApi } from './baseApi';

export const internshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInternships: builder.query({
      query: (params) => ({ url: '/internships', params }),
      providesTags: (result) =>
        result?.data
          ? [
              ...result.data.map((job: { id: string }) => ({ type: 'Internships' as const, id: job.id })),
              { type: 'Internships', id: 'LIST' },
            ]
          : [{ type: 'Internships', id: 'LIST' }],
    }),
    getInternship: builder.query({
      query: (id) => `/internships/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Internships', id }],
    }),
    getCompanyInternship: builder.query({
      query: (id) => `/internships/company/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Internships', id }],
    }),
    getCompanyInternships: builder.query({
      query: () => '/internships/company/mine',
      providesTags: [{ type: 'Internships', id: 'COMPANY_LIST' }],
    }),
    createInternship: builder.mutation({
      query: (body) => ({ url: '/internships', method: 'POST', body }),
      invalidatesTags: [{ type: 'Internships', id: 'LIST' }, { type: 'Internships', id: 'COMPANY_LIST' }],
    }),
    updateInternship: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/internships/${id}`, method: 'PUT', body }),
      invalidatesTags: (_r, _e, { id }) => [
        { type: 'Internships', id },
        { type: 'Internships', id: 'LIST' },
        { type: 'Internships', id: 'COMPANY_LIST' },
      ],
    }),
    deleteInternship: builder.mutation({
      query: (id) => ({ url: `/internships/${id}`, method: 'DELETE' }),
      invalidatesTags: (_r, _e, id) => [
        { type: 'Internships', id },
        { type: 'Internships', id: 'LIST' },
        { type: 'Internships', id: 'COMPANY_LIST' },
      ],
    }),
    getPendingInternships: builder.query({
      query: () => '/internships/admin/pending',
      providesTags: ['Internships'],
    }),
    approveInternship: builder.mutation({
      query: ({ id, approved, rejectionReason }) => ({
        url: `/internships/${id}/approve`,
        method: 'POST',
        body: { approved, rejectionReason },
      }),
      invalidatesTags: [{ type: 'Internships', id: 'LIST' }, 'Internships'],
    }),
    saveApplicationForm: builder.mutation({
      query: ({ id, ...body }) => ({
        url: `/internships/${id}/form`,
        method: 'PATCH',
        body,
      }),
      invalidatesTags: (_r, _e, { id }) => [{ type: 'Internships', id }],
    }),
  }),
});

export const {
  useGetInternshipsQuery,
  useGetInternshipQuery,
  useGetCompanyInternshipQuery,
  useGetCompanyInternshipsQuery,
  useCreateInternshipMutation,
  useUpdateInternshipMutation,
  useDeleteInternshipMutation,
  useGetPendingInternshipsQuery,
  useApproveInternshipMutation,
  useSaveApplicationFormMutation,
} = internshipApi;
