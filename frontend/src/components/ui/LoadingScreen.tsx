import { Box, Typography } from '@mui/material';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

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
        gap: 2,
      }}
    >
      <Box
        sx={{
          width: 40,
          height: 40,
          borderRadius: '50%',
          border: `2px solid ${t.border}`,
          borderTopColor: t.text,
          animation: 'spin 0.8s linear infinite',
          '@keyframes spin': {
            to: { transform: 'rotate(360deg)' },
          },
        }}
      />
      <Typography variant="body2" color="text.secondary" sx={{ animation: 'pulse-soft 1.5s ease infinite' }}>
        Loading...
      </Typography>
    </Box>
  );
}
