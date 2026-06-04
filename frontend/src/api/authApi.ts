import { baseApi } from './baseApi';

export const authApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    login: builder.mutation({
      query: (body) => ({ url: '/auth/login', method: 'POST', body }),
    }),
    register: builder.mutation({
      query: (body) => ({ url: '/auth/register', method: 'POST', body }),
    }),
    me: builder.query({
      query: () => '/auth/me',
      providesTags: ['User'],
    }),
    logout: builder.mutation({
      query: () => ({ url: '/auth/logout', method: 'POST' }),
    }),
    verifyOtp: builder.mutation({
      query: (body: { email: string; otp: string }) => ({ url: '/auth/verify-otp', method: 'POST', body }),
    }),
    resendOtp: builder.mutation({
      query: (body: { email: string }) => ({ url: '/auth/resend-otp', method: 'POST', body }),
    }),
    changePassword: builder.mutation({
      query: (body: { oldPassword: string; newPassword: string }) => ({ url: '/auth/change-password', method: 'POST', body }),
    }),
    forgotPassword: builder.mutation({
      query: (body: { email: string }) => ({ url: '/auth/forgot-password', method: 'POST', body }),
    }),
    resetPassword: builder.mutation({
      query: (body: { email: string; otp: string; newPassword: string }) => ({ url: '/auth/reset-password', method: 'POST', body }),
    }),
    requestEmailChange: builder.mutation({
      query: (body: { newEmail: string }) => ({ url: '/auth/email-change/request', method: 'POST', body }),
    }),
    confirmEmailChange: builder.mutation({
      query: (body: { otp: string }) => ({ url: '/auth/email-change/confirm', method: 'POST', body }),
    }),
    deleteAccount: builder.mutation({
      query: () => ({ url: '/auth/account', method: 'DELETE' }),
    }),
  }),
});

export const {
  useLoginMutation,
  useRegisterMutation,
  useMeQuery,
  useLogoutMutation,
  useVerifyOtpMutation,
  useResendOtpMutation,
  useChangePasswordMutation,
  useForgotPasswordMutation,
  useResetPasswordMutation,
  useRequestEmailChangeMutation,
  useConfirmEmailChangeMutation,
  useDeleteAccountMutation,
} = authApi;
