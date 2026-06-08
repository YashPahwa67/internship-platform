import { baseApi } from './baseApi';

export const mentorshipApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    listMentors: builder.query({
      query: () => '/mentorships/mentors',
      providesTags: ['Mentorships'],
    }),
    requestMentorship: builder.mutation({
      query: (body) => ({ url: '/mentorships/request', method: 'POST', body }),
      invalidatesTags: ['Mentorships'],
    }),
    listMyMentorships: builder.query({
      query: () => '/mentorships/mine',
      providesTags: ['Mentorships'],
      keepUnusedDataFor: 0,
    }),
    respondToMentorship: builder.mutation({
      query: ({ id, accept }) => ({ url: `/mentorships/${id}/respond`, method: 'PATCH', body: { accept } }),
      invalidatesTags: ['Mentorships'],
    }),
    addSessionNote: builder.mutation({
      query: ({ id, content }) => ({ url: `/mentorships/${id}/session-note`, method: 'POST', body: { content } }),
      invalidatesTags: ['Mentorships'],
    }),
    addProgressEntry: builder.mutation({
      query: ({ id, entry }) => ({ url: `/mentorships/${id}/progress`, method: 'POST', body: { entry } }),
      invalidatesTags: ['Mentorships'],
    }),
  }),
});

export const {
  useListMentorsQuery,
  useRequestMentorshipMutation,
  useListMyMentorshipsQuery,
  useRespondToMentorshipMutation,
  useAddSessionNoteMutation,
  useAddProgressEntryMutation,
} = mentorshipApi;
