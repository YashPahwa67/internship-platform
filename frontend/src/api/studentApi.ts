import { baseApi } from './baseApi';
import { syncProfileToAuth } from '../utils/syncProfileToAuth';

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
  user?: {
    firstName?: string;
    lastName?: string;
    email?: string;
  };
  profilePicture?: {
    url: string;
    filename: string;
    uploadedAt?: string;
  } | null;
  resume?: {
    url: string;
    filename: string;
    uploadedAt?: string;
  } | null;
  education?: Array<Record<string, unknown>>;
  projects?: Array<Record<string, unknown>>;
  experience?: Array<Record<string, unknown>>;
  certifications?: Array<Record<string, unknown>>;
  rollNo?: string;
  cgpa?: number;
  graduationYear?: number;
}

export const studentApi = baseApi.injectEndpoints({
  endpoints: (builder) => ({
    getProfile: builder.query<{ success: boolean; data: StudentProfile }, void>({
      query: () => '/students/profile',
      providesTags: ['User', 'Applications'],
    }),
    updateProfile: builder.mutation<{ success: boolean; data: StudentProfile }, Record<string, unknown>>({
      query: (body) => ({ url: '/students/profile', method: 'PUT', body }),
      invalidatesTags: ['User', 'Applications'],
      async onQueryStarted(_arg, { dispatch, queryFulfilled }) {
        try {
          const { data } = await queryFulfilled;
          syncProfileToAuth(dispatch, data?.data);
        } catch {
          /* mutation failed */
        }
      },
    }),
    uploadProfilePicture: builder.mutation<{ success: boolean; data: StudentProfile }, File>({
      query: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/students/profile/picture', method: 'POST', body: formData };
      },
      invalidatesTags: ['User', 'Applications'],
    }),
    uploadResume: builder.mutation<{ success: boolean; data: StudentProfile }, File>({
      query: (file: File) => {
        const formData = new FormData();
        formData.append('file', file);
        return { url: '/students/profile/resume', method: 'POST', body: formData };
      },
      invalidatesTags: ['User', 'Applications'],
    }),
    deleteProfilePicture: builder.mutation<{ success: boolean; data: StudentProfile }, void>({
      query: () => ({ url: '/students/profile/picture', method: 'DELETE' }),
      invalidatesTags: ['User', 'Applications'],
    }),
    deleteResume: builder.mutation<{ success: boolean; data: StudentProfile }, void>({
      query: () => ({ url: '/students/profile/resume', method: 'DELETE' }),
      invalidatesTags: ['User', 'Applications'],
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
