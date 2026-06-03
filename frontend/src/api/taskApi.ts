import { baseApi } from './baseApi';

export const taskApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getTasks: builder.query({
      query: (params) => ({ url: '/tasks', params }),
      providesTags: ['Tasks'],
    }),
    createTask: builder.mutation({
      query: (body) => ({ url: '/tasks', method: 'POST', body }),
      invalidatesTags: ['Tasks'],
    }),
    submitTask: builder.mutation({
      query: ({ id, notes }) => ({ url: `/tasks/${id}/submit`, method: 'POST', body: { notes } }),
      invalidatesTags: ['Tasks'],
    }),
    reviewTask: builder.mutation({
      query: ({ id, ...body }) => ({ url: `/tasks/${id}/review`, method: 'POST', body }),
      invalidatesTags: ['Tasks'],
    }),
  }),
});

export const {
  useGetTasksQuery,
  useCreateTaskMutation,
  useSubmitTaskMutation,
  useReviewTaskMutation,
} = taskApi;
