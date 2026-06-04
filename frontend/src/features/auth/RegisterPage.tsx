import { useState } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  TextField, Button, Alert, Box, Link, Typography, ToggleButton, ToggleButtonGroup,
} from '@mui/material';
import { useRegisterMutation } from '../../api/authApi';
import AuthCard from '../../components/ui/AuthCard';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

export default function RegisterPage() {
  const [role, setRole] = useState<'student' | 'company_hr'>('student');
  const [form, setForm] = useState({ email: '', password: '', firstName: '', lastName: '', companyName: '' });
  const [register, { isLoading }] = useRegisterMutation();
  const navigate = useNavigate();
  const [error, setError] = useState('');
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const payload = {
        email: form.email,
        password: form.password,
        firstName: form.firstName,
        lastName: form.lastName,
        role,
        ...(role === 'company_hr' ? { companyName: form.companyName } : {}),
      };
      await register(payload).unwrap();
      navigate('/verify-otp', { state: { email: form.email } });
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string; details?: { message: string }[] } } };
      setError(e?.data?.error?.details?.[0]?.message || e?.data?.error?.message || 'Registration failed');
    }
  };

  return (
    <AuthCard title="Create account" subtitle="Join thousands of students and companies on IMP">
      <ToggleButtonGroup
        value={role}
        exclusive
        onChange={(_, v) => v && setRole(v)}
        fullWidth
        sx={{
          mb: 3,
          '& .MuiToggleButton-root': {
            flex: 1,
            py: 1.25,
            fontWeight: 500,
            borderColor: t.border,
            '&.Mui-selected': { bgcolor: 'primary.main', color: 'primary.contrastText' },
          },
        }}
      >
        <ToggleButton value="student">Student</ToggleButton>
        <ToggleButton value="company_hr">Company HR</ToggleButton>
      </ToggleButtonGroup>
      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      <Box component="form" onSubmit={handleSubmit}>
        <TextField fullWidth label="First name" value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} margin="normal" required />
        <TextField fullWidth label="Last name" value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} margin="normal" required />
        <TextField fullWidth label="Email" type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} margin="normal" required />
        <TextField fullWidth label="Password" type="password" helperText="Min 8 chars with upper, lower, and digit" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} margin="normal" required />
        {role === 'company_hr' && (
          <TextField fullWidth label="Company name" value={form.companyName} onChange={(e) => setForm({ ...form, companyName: e.target.value })} margin="normal" required />
        )}
        <Button fullWidth type="submit" variant="contained" size="large" sx={{ mt: 3 }} disabled={isLoading}>
          {isLoading ? 'Creating...' : 'Create account'}
        </Button>
      </Box>
      <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
        Already have an account?{' '}
        <Link component={RouterLink} to="/login" color="text.primary" fontWeight={600}>Sign in</Link>
      </Typography>
    </AuthCard>
  );
}
