import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { CircularProgress, Box, Typography } from '@mui/material';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import { baseApi } from '../../api/baseApi';

const roleRedirect: Record<string, string> = {
  admin: '/admin/dashboard',
  company_hr: '/company/dashboard',
  mentor: '/mentor/dashboard',
  student: '/student/dashboard',
};

export default function OAuthCallbackPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  useEffect(() => {
    const hash = window.location.hash;
    const match = hash.match(/at=([^&]+)/);
    if (!match) {
      navigate('/login?error=oauth_failed', { replace: true });
      return;
    }

    const token = decodeURIComponent(match[1]);
    try {
      // JWT uses base64url — convert to standard base64 before atob
      const b64 = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
      const payload = JSON.parse(atob(b64));
      const user = {
        id: payload.sub,
        email: payload.email,
        role: payload.role,
        firstName: payload.firstName,
        lastName: payload.lastName,
        displayName: payload.displayName,
        status: payload.status,
      };
      dispatch(setCredentials({ user, accessToken: token }));
      baseApi.util.resetApiState();
      navigate(roleRedirect[user.role] || '/student/dashboard', { replace: true });
    } catch {
      navigate('/login?error=oauth_failed', { replace: true });
    }
  }, [dispatch, navigate]);

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '60vh', gap: 2 }}>
      <CircularProgress />
      <Typography color="text.secondary">Completing sign-in…</Typography>
    </Box>
  );
}
