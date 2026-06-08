import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Box, Link, Typography, Divider } from '@mui/material';
import { useLoginMutation } from '../../api/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import AuthCard from '../../components/ui/AuthCard';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

const roleRedirect: Record<string, string> = {
  admin: '/admin/dashboard',
  company_hr: '/company/dashboard',
  mentor: '/mentor/dashboard',
  student: '/student/dashboard',
};

const CONTACT_EMAIL = 'yashpahwa1209@gmail.com';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState<{ text: string; isBlocked?: boolean } | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      navigate(roleRedirect[res.data.user.role] || '/');
    } catch (err: unknown) {
      const e = err as { data?: { message?: string; error?: { code?: string } } };
      const code = e?.data?.error?.code;
      const message = e?.data?.message || 'Login failed';
      if (code === 'ACCOUNT_DELETED') {
        setError({ text: message, isBlocked: true });
      } else {
        setError({ text: message });
      }
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your IMP account">
      {error && (
        <Alert severity="error" sx={{ mb: 2 }}>
          {error.text}
          {error.isBlocked && (
            <>
              {' '}Contact{' '}
              <Link href={`mailto:${CONTACT_EMAIL}`} sx={{ color: 'inherit', fontWeight: 600 }}>
                {CONTACT_EMAIL}
              </Link>
            </>
          )}
        </Alert>
      )}

      <Box component="form" onSubmit={handleSubmit}>
        <TextField
          fullWidth label="Email" type="email"
          value={email} onChange={(e) => setEmail(e.target.value)}
          margin="normal" required
        />
        <TextField
          fullWidth label="Password" type="password"
          value={password} onChange={(e) => setPassword(e.target.value)}
          margin="normal" required
        />
        <Box sx={{ textAlign: 'right', mt: 0.5 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" color="text.secondary">
            Forgot password?
          </Link>
        </Box>
        <Button
          fullWidth type="submit" variant="contained" size="large"
          sx={{ mt: 2 }} disabled={isLoading}
        >
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>
      <Divider sx={{ my: 2 }}>
        <Typography variant="caption" color="text.disabled">or</Typography>
      </Divider>
      <Button
        fullWidth
        variant="outlined"
        color="inherit"
        size="large"
        onClick={() => { window.location.href = `${API_BASE}/auth/google`; }}
        sx={{ gap: 1.5, fontWeight: 500 }}
      >
        <Box
          component="img"
          src="https://www.gstatic.com/firebasejs/ui/2.0.0/images/auth/google.svg"
          alt="Google"
          sx={{ width: 18, height: 18 }}
        />
        Continue with Google
      </Button>
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/register" color="text.primary" fontWeight={600}>
          Register
        </Link>
      </Typography>
    </AuthCard>
  );
}
