import { baseApi } from './baseApi';

export interface StudentProfile {
  id: string;
  userId: string;
  email?: string;
  fullName?: string;
  phone?: string;
  college?: string;
  degree?: string;
  skills: string[];
  bio?: string;
  linkedIn?: string;
  github?: string;
  portfolio?: string;
  location?: string;
  profilePicture?: {
    url: string;
    filename: string;
    uploadedAt?: string;
  };
  resume?: {
    url: string;
    filename: string;
    uploadedAt?: string;
  };
  education?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
  experience?: Array<Record<string, unknown>>;
  certifications?: Array<Record<string, unknown>>;
  graduationYear?: number;
}

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<{ success: boolean; data: StudentProfile }, void>({
      query: () => '/students/profile',
      providesTags: ['User'],
    }),
    updateProfile: builder.mutation({
      query: (body) => ({ url: '/students/profile', method: 'PUT', body }),
      invalidatesTags: ['User'],
    }),
    uploadProfilePicture: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/students/profile/picture', method: 'POST', body: formData };
      },
      invalidatesTags: ['User'],
    }),
    uploadResume: builder.mutation({
      query: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/students/profile/resume', method: 'POST', body: formData };
      },
      invalidatesTags: ['User'],
    }),
    deleteProfilePicture: builder.mutation({
      query: () => ({ url: '/students/profile/picture', method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
    deleteResume: builder.mutation({
      query: () => ({ url: '/students/profile/resume', method: 'DELETE' }),
      invalidatesTags: ['User'],
    }),
  }),
});

export const {
  useGetProfileQuery,
  useUpdateProfileMutation,
  useUploadProfilePictureMutation,
  useUploadResumeMutation,
  useDeleteProfilePictureMutation,
  useDeleteResumeMutation,
} = studentApi;
