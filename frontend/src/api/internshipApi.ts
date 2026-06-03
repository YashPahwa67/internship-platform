import { baseApi } from './baseApi';

export const internshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getInternships: builder.query({
      query: (params) => ({ url: '/internships', params }),
      providesTags: ['Internships'],
    }),
    getInternship: builder.query({
      query: (id) => `/internships/${id}`,
      providesTags: (_r, _e, id) => [{ type: 'Internships', id }],
    }),
    getCompanyInternships: builder.query({
      query: () => '/internships/company/mine',
      providesTags: ['Internships'],
    }),
    createInternship: builder.mutation({
      query: (body) => ({ url: '/internships', method: 'POST', body }),
      invalidatesTags: ['Internships'],
    }),
    updateInternship: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/internships/${id}`, method: 'PUT', body }),
      invalidatesTags: ['Internships'],
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
      invalidatesTags: ['Internships'],
    }),
  }),
});

export const {
  useGetInternshipsQuery,
  useGetInternshipQuery,
  useGetCompanyInternshipsQuery,
  useCreateInternshipMutation,
  useUpdateInternshipMutation,
  useGetPendingInternshipsQuery,
  useApproveInternshipMutation,
} = internshipApi;
