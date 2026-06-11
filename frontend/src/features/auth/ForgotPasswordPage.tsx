import { useRef, useState, KeyboardEvent } from 'react';
import { Link as RouterLink, useNavigate } from 'react-router-dom';
import {
  Box, TextField, Button, Alert, Typography, Link, CircularProgress,
} from '@mui/material';
import RefreshIcon from '@mui/icons-material/Refresh';
import AuthCard from '../../components/ui/AuthCard';
import { useForgotPasswordMutation, useResetPasswordMutation } from '../../api/authApi';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

type Step = 'email' | 'otp';

const OTP_LENGTH = 6;

export default function ForgotPasswordPage() {
  const navigate = useNavigate();
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const [step, setStep] = useState<Step>('email');
  const [email, setEmail] = useState('');
  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [resendCooldown, setResendCooldown] = useState(0);
  const [forgotPassword, { isLoading: sending }] = useForgotPasswordMutation();
  const [resetPassword, { isLoading: resetting }] = useResetPasswordMutation();

  const handleSendOtp = async () => {
    setError('');
    try {
      await forgotPassword({ email }).unwrap();
      setStep('otp');
      setDigits(Array(OTP_LENGTH).fill(''));
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setError(e?.data?.message || 'Failed to send code');
    }
  };

  const handleResend = async () => {
    if (resendCooldown > 0) return;
    setError('');
    try {
      await forgotPassword({ email }).unwrap();
      setDigits(Array(OTP_LENGTH).fill(''));
      setResendCooldown(60);
      const timer = setInterval(() => {
        setResendCooldown((c) => { if (c <= 1) { clearInterval(timer); return 0; } return c - 1; });
      }, 1000);
      setTimeout(() => inputRefs.current[0]?.focus(), 100);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setError(e?.data?.message || 'Failed to resend code');
    }
  };

  const handleOtpChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');
    if (digit && index < OTP_LENGTH - 1) inputRefs.current[index + 1]?.focus();
  };

  const handleOtpKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) { const next = [...digits]; next[index] = ''; setDigits(next); }
      else inputRefs.current[index - 1]?.focus();
    }
  };

  const handleReset = async () => {
    setError('');
    if (newPassword !== confirmPassword) { setError('Passwords do not match'); return; }
    try {
      await resetPassword({ email, otp: digits.join(''), newPassword }).unwrap();
      setSuccess(true);
      setTimeout(() => navigate('/login'), 2500);
    } catch (err: unknown) {
      const e = err as { data?: { message?: string } };
      setError(e?.data?.message || 'Invalid code or request');
      setDigits(Array(OTP_LENGTH).fill(''));
      setTimeout(() => inputRefs.current[0]?.focus(), 50);
    }
  };

  if (success) {
    return (
      <AuthCard title="Password reset!" subtitle="Redirecting you to sign in…">
        <Alert severity="success">Your password has been updated. Redirecting…</Alert>
      </AuthCard>
    );
  }

  if (step === 'email') {
    return (
      <AuthCard title="Forgot password?" subtitle="Enter your email and we'll send a verification code.">
        {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
        <TextField
          fullWidth label="Email" type="email" value={email}
          onChange={(e) => { setEmail(e.target.value); setError(''); }}
          margin="normal" autoFocus
          onKeyDown={(e) => e.key === 'Enter' && email && handleSendOtp()}
        />
        <Button
          fullWidth variant="contained" size="large" sx={{ mt: 2 }}
          onClick={handleSendOtp}
          disabled={!email || sending}
          startIcon={sending ? <CircularProgress size={18} color="inherit" /> : null}
        >
          {sending ? 'Sending…' : 'Send code'}
        </Button>
        <Typography variant="body2" sx={{ mt: 3, textAlign: 'center' }} color="text.secondary">
          Remembered it?{' '}
          <Link component={RouterLink} to="/login" color="text.primary" fontWeight={600}>Sign in</Link>
        </Typography>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Enter code & new password" subtitle="">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: -1 }}>
        Code sent to{' '}
        <Box component="span" fontWeight={600} color="text.primary">{email}</Box>
      </Typography>

      {/* 6-box OTP */}
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 1.5 }}>
        {digits.map((d, i) => (
          <Box
            key={i}
            component="input"
            ref={(el: HTMLInputElement | null) => { inputRefs.current[i] = el; }}
            type="text" inputMode="numeric" maxLength={1} value={d}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleOtpChange(i, e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleOtpKeyDown(i, e)}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            sx={{
              width: 48, height: 56, textAlign: 'center',
              fontSize: '1.5rem', fontWeight: 700, fontFamily: 'monospace',
              border: '2px solid', borderColor: error ? 'error.main' : d ? 'primary.main' : t.border,
              borderRadius: 2, outline: 'none', bgcolor: 'transparent', color: 'text.primary',
              caretColor: 'transparent', cursor: 'pointer',
              '&:focus': { borderColor: error ? 'error.main' : 'primary.main',
                boxShadow: `0 0 0 3px ${mode === 'dark' ? 'rgba(107,154,196,0.2)' : 'rgba(59,111,160,0.12)'}` },
            }}
          />
        ))}
      </Box>

      {/* Resend row */}
      <Box sx={{ display: 'flex', alignItems: 'center', justifyContent: 'flex-end', mb: 2 }}>
        <Button
          size="small" variant="text" color="primary"
          startIcon={sending ? <CircularProgress size={14} color="inherit" /> : <RefreshIcon sx={{ fontSize: 16 }} />}
          onClick={handleResend}
          disabled={resendCooldown > 0 || sending}
          sx={{ fontSize: '0.8rem', textTransform: 'none', minWidth: 0 }}
        >
          {resendCooldown > 0 ? `Resend in ${resendCooldown}s` : 'Resend code'}
        </Button>
      </Box>

      <TextField fullWidth type="password" label="New password" value={newPassword}
        onChange={(e) => { setNewPassword(e.target.value); setError(''); }}
        margin="normal" helperText="Min 8 chars with upper, lower, and digit"
        autoComplete="new-password" />
      <TextField fullWidth type="password" label="Confirm new password" value={confirmPassword}
        onChange={(e) => { setConfirmPassword(e.target.value); setError(''); }}
        margin="normal" autoComplete="new-password" />

      {error && <Alert severity="error" sx={{ mt: 1 }}>{error}</Alert>}

      <Button
        fullWidth variant="contained" size="large" sx={{ mt: 2 }}
        onClick={handleReset}
        disabled={digits.some(d => !d) || !newPassword || !confirmPassword || resetting}
        startIcon={resetting ? <CircularProgress size={18} color="inherit" /> : null}
      >
        {resetting ? 'Resetting…' : 'Reset password'}
      </Button>

      <Button fullWidth variant="text" color="inherit" sx={{ mt: 1 }}
        onClick={() => { setStep('email'); setError(''); }}>
        Use a different email
      </Button>
    </AuthCard>
  );
}
