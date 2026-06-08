import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import { TextField, Button, Alert, Box, Link, Typography } from '@mui/material';
import BlockIcon from '@mui/icons-material/Block';
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

const CONTACT_EMAIL = 'yashpahwa1209@gmail.com';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [login, { isLoading }] = useLoginMutation();
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const [isDeleted, setIsDeleted] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setIsDeleted(false);
    try {
      const res = await login({ email, password }).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      navigate(roleRedirect[res.data.user.role] || '/');
    } catch (err: unknown) {
      const e = err as { data?: { error?: { code?: string; message?: string } } };
      const code = e?.data?.error?.code;
      const message = e?.data?.error?.message || 'Login failed';
      if (code === 'ACCOUNT_DELETED') {
        setIsDeleted(true);
      } else {
        setError(message);
      }
    }
  };

  return (
    <AuthCard title="Welcome back" subtitle="Sign in to your IMP account">
      {/* Deleted account banner */}
      {isDeleted && (
        <Box sx={{
          mb: 2, p: 2, borderRadius: '12px',
          bgcolor: 'rgba(239,68,68,0.07)',
          border: '1px solid rgba(239,68,68,0.25)',
          display: 'flex', gap: 1.5, alignItems: 'flex-start',
        }}>
          <BlockIcon sx={{ fontSize: 20, color: '#ef4444', flexShrink: 0, mt: '1px' }} />
          <Box>
            <Typography variant="body2" fontWeight={600} sx={{ color: '#ef4444', mb: 0.25 }}>
              Account removed from IMP
            </Typography>
            <Typography variant="body2" color="text.secondary" sx={{ lineHeight: 1.6 }}>
              This account has been deleted. To appeal or recover access, contact us at{' '}
              <Link
                href={`mailto:${CONTACT_EMAIL}`}
                sx={{ color: '#ef4444', fontWeight: 600, wordBreak: 'break-all' }}
              >
                {CONTACT_EMAIL}
              </Link>
            </Typography>
          </Box>
        </Box>
      )}

      {/* Generic error */}
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}

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
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
        Don&apos;t have an account?{' '}
        <Link component={RouterLink} to="/register" color="text.primary" fontWeight={600}>
          Register
        </Link>
      </Typography>
    </AuthCard>
  );
}
