import { useRef, useState, useEffect, KeyboardEvent, ClipboardEvent } from 'react';
import { useLocation, useNavigate, Link as RouterLink } from 'react-router-dom';
import {
  Box, Typography, Button, Alert, CircularProgress, Link,
} from '@mui/material';
import AuthCard from '../../components/ui/AuthCard';
import { useVerifyOtpMutation, useResendOtpMutation } from '../../api/authApi';
import { useAppDispatch } from '../../app/hooks';
import { setCredentials } from './authSlice';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

const OTP_LENGTH = 6;

export default function VerifyOtpPage() {
  const location = useLocation();
  const email = (location.state as { email?: string })?.email || '';
  const navigate = useNavigate();
  const dispatch = useAppDispatch();
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const [digits, setDigits] = useState<string[]>(Array(OTP_LENGTH).fill(''));
  const [error, setError] = useState('');
  const [resendMsg, setResendMsg] = useState('');
  const [cooldown, setCooldown] = useState(0);
  const inputRefs = useRef<(HTMLInputElement | null)[]>([]);

  const [verifyOtp, { isLoading: verifying }] = useVerifyOtpMutation();
  const [resendOtp, { isLoading: resending }] = useResendOtpMutation();

  // Auto-focus first box on mount
  useEffect(() => { inputRefs.current[0]?.focus(); }, []);

  // Redirect to register if no email in state
  useEffect(() => {
    if (!email) navigate('/register', { replace: true });
  }, [email, navigate]);

  const focusAt = (i: number) => inputRefs.current[Math.max(0, Math.min(OTP_LENGTH - 1, i))]?.focus();

  const handleChange = (index: number, value: string) => {
    const digit = value.replace(/\D/g, '').slice(-1);
    const next = [...digits];
    next[index] = digit;
    setDigits(next);
    setError('');
    if (digit && index < OTP_LENGTH - 1) focusAt(index + 1);
    if (next.every(Boolean)) submitOtp(next.join(''));
  };

  const handleKeyDown = (index: number, e: KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Backspace') {
      if (digits[index]) {
        const next = [...digits];
        next[index] = '';
        setDigits(next);
      } else {
        focusAt(index - 1);
      }
    } else if (e.key === 'ArrowLeft') focusAt(index - 1);
    else if (e.key === 'ArrowRight') focusAt(index + 1);
  };

  const handlePaste = (e: ClipboardEvent<HTMLInputElement>) => {
    e.preventDefault();
    const pasted = e.clipboardData.getData('text').replace(/\D/g, '').slice(0, OTP_LENGTH);
    if (!pasted) return;
    const next = [...digits];
    pasted.split('').forEach((d, i) => { next[i] = d; });
    setDigits(next);
    focusAt(Math.min(pasted.length, OTP_LENGTH - 1));
    if (pasted.length === OTP_LENGTH) submitOtp(pasted);
  };

  const submitOtp = async (otp: string) => {
    if (otp.length !== OTP_LENGTH) return;
    setError('');
    try {
      const res = await verifyOtp({ email, otp }).unwrap();
      dispatch(setCredentials({ user: res.data.user, accessToken: res.data.accessToken }));
      const role = res.data.user.role;
      navigate(role === 'student' ? '/student/dashboard' : '/company/dashboard', { replace: true });
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string } } };
      setError(e?.data?.error?.message || 'Invalid code. Please try again.');
      setDigits(Array(OTP_LENGTH).fill(''));
      focusAt(0);
    }
  };

  const handleResend = async () => {
    if (cooldown > 0 || !email) return;
    setResendMsg('');
    setError('');
    try {
      await resendOtp({ email }).unwrap();
      setResendMsg('New code sent! Check your inbox.');
      setDigits(Array(OTP_LENGTH).fill(''));
      focusAt(0);
      let s = 60;
      setCooldown(s);
      const t = setInterval(() => { s -= 1; setCooldown(s); if (s <= 0) clearInterval(t); }, 1000);
    } catch (err: unknown) {
      const e = err as { data?: { error?: { message?: string } } };
      setError(e?.data?.error?.message || 'Could not resend. Try again.');
    }
  };

  const otp = digits.join('');

  return (
    <AuthCard title="Enter verification code" subtitle="">
      <Typography variant="body2" color="text.secondary" sx={{ mb: 3, mt: -1 }}>
        We sent a 6-digit code to{' '}
        <Box component="span" fontWeight={600} color="text.primary">{email}</Box>
      </Typography>

      {/* 6-box OTP input */}
      <Box sx={{ display: 'flex', gap: 1.5, justifyContent: 'center', mb: 3 }}>
        {digits.map((d, i) => (
          <Box
            key={i}
            component="input"
            ref={(el: HTMLInputElement | null) => { inputRefs.current[i] = el; }}
            type="text"
            inputMode="numeric"
            maxLength={1}
            value={d}
            onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleChange(i, e.target.value)}
            onKeyDown={(e: KeyboardEvent<HTMLInputElement>) => handleKeyDown(i, e)}
            onPaste={handlePaste}
            onFocus={(e: React.FocusEvent<HTMLInputElement>) => e.target.select()}
            sx={{
              width: 48,
              height: 56,
              textAlign: 'center',
              fontSize: '1.5rem',
              fontWeight: 700,
              fontFamily: 'monospace',
              border: `2px solid`,
              borderColor: error ? 'error.main' : d ? 'primary.main' : t.border,
              borderRadius: 2,
              outline: 'none',
              bgcolor: 'transparent',
              color: 'text.primary',
              caretColor: 'transparent',
              cursor: 'pointer',
              transition: 'border-color 0.15s',
              '&:focus': { borderColor: error ? 'error.main' : 'primary.main', boxShadow: `0 0 0 3px ${mode === 'dark' ? 'rgba(107,154,196,0.2)' : 'rgba(59,111,160,0.12)'}` },
            }}
          />
        ))}
      </Box>

      {error && <Alert severity="error" sx={{ mb: 2 }}>{error}</Alert>}
      {resendMsg && !error && <Alert severity="success" sx={{ mb: 2 }}>{resendMsg}</Alert>}

      <Button
        variant="contained"
        fullWidth
        size="large"
        onClick={() => submitOtp(otp)}
        disabled={otp.length !== OTP_LENGTH || verifying}
        startIcon={verifying ? <CircularProgress size={18} color="inherit" /> : null}
        sx={{ mb: 2, fontWeight: 600 }}
      >
        {verifying ? 'Verifying…' : 'Verify'}
      </Button>

      <Box sx={{ textAlign: 'center' }}>
        <Typography variant="body2" color="text.secondary" component="span">
          Didn't receive it?{' '}
        </Typography>
        <Button
          variant="text"
          size="small"
          onClick={handleResend}
          disabled={cooldown > 0 || resending}
          sx={{ fontWeight: 600, minWidth: 0, p: 0, textTransform: 'none' }}
        >
          {cooldown > 0 ? `Resend in ${cooldown}s` : 'Resend code'}
        </Button>
      </Box>

      <Typography variant="body2" color="text.secondary" sx={{ textAlign: 'center', mt: 2 }}>
        <Link component={RouterLink} to="/register" color="text.secondary">
          Use a different email
        </Link>
      </Typography>
    </AuthCard>
  );
}
