import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Box, Link, Typography } from '@mui/material';
import { useLoginMutation } from '../../api/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import AuthCard from '../../components/ui/AuthCard';

const roleRedirect: Record<string, string> = {
  admin: '/admin/dashboard',
  company_hr: '/company/dashboard',
  mentor: '/mentor/dashboard',
  student: '/student/dashboard',
};

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      navigate(roleRedirect[res.data.user.role] || '/');
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string } } };
      setError(e?.data?.error?.message || 'Login failed');
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your IMP account">
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField fullWidth label="Email" type="email" value={email} onChange={(e) => setEmail(e.target.value)} margin="normal" required />
        <TextField fullWidth label="Password" type="password" value={password} onChange={(e) => setPassword(e.target.value)} margin="normal" required />
        <Box sx={{ textAlign: 'right', mt: 0.5 }}>
          <Link component={RouterLink} to="/forgot-password" variant="body2" color="text.secondary">
            Forgot password?
          </Link>
        </Box>
        <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 2 }} disabled={isLoading}>
          {isLoading ? 'Signing in...' : 'Sign in'}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/register" color="text.primary" fontWeight={600}>Register</Link>
      </Typography>
    </AuthCard>
  );
}
