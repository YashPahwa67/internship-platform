import { Box, Typography } from '@mui/material';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';
import LogoMark from './LogoMark';

export default function LoadingScreen() {
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <Box
      sx={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        bgcolor: 'background.default',
        gap: 3,
      }}
    >
      {/* Animated logo badge */}
      <Box
        sx={{
          width: 52, height: 52,
          borderRadius: '14px',
          background: t.accentGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          boxShadow: `0 4px 20px rgba(61, 99, 248, 0.35)`,
          animation: 'pulse-soft 1.8s ease-in-out infinite',
        }}
      >
        <LogoMark size={34} />
      </Box>

      {/* Spinner ring */}
      <Box
        sx={{
          width: 24, height: 24,
          borderRadius: '50%',
          border: `2px solid ${t.border}`,
          borderTopColor: t.accent,
          animation: 'spin 0.75s linear infinite',
          '@keyframes spin': { to: { transform: 'rotate(360deg)' } },
        }}
      />

      <Typography
        variant="caption"
        color="text.disabled"
        letterSpacing="0.06em"
        sx={{ fontSize: '0.75rem', textTransform: 'uppercase' }}
      >
        Loading
      </Typography>
    </Box>
  );
}
