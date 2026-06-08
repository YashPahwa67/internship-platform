import { Box, Typography } from '@mui/material';
import { Link as RouterLink } from 'react-router-dom';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';
import LogoMark from './LogoMark';

interface LogoProps {
  /** Size of the gradient badge box in px */
  size?: number;
  showText?: boolean;
  /** Extra sx applied to the text container — use to control responsive display */
  textSx?: object;
  to?: string;
  /** Force white text regardless of theme — for dark hero backgrounds */
  light?: boolean;
}

export default function Logo({ size = 32, showText = true, textSx, to = '/', light = false }: LogoProps) {
  const { mode } = useThemeMode();
  const t = tokens[mode];
  const radius = Math.round(size * 0.275);
  const iconSize = Math.round(size * 0.68);

  return (
    <Box
      component={RouterLink}
      to={to}
      sx={{ display: 'inline-flex', alignItems: 'center', gap: 1.25, textDecoration: 'none' }}
    >
      {/* Gradient badge */}
      <Box
        sx={{
          width: size,
          height: size,
          borderRadius: `${radius}px`,
          background: t.accentGradient,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          flexShrink: 0,
          boxShadow: `0 2px 10px rgba(61, 99, 248, 0.28)`,
        }}
      >
        <LogoMark size={iconSize} />
      </Box>

      {showText && (
        <Box sx={{ lineHeight: 1, ...textSx }}>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontWeight: 700,
              fontSize: '0.9375rem',
              lineHeight: 1.25,
              color: light ? 'white' : 'text.primary',
              letterSpacing: '-0.025em',
            }}
          >
            Internship
          </Typography>
          <Typography
            component="span"
            sx={{
              display: 'block',
              fontSize: '0.6875rem',
              lineHeight: 1.3,
              color: light ? 'rgba(255,255,255,0.48)' : 'text.disabled',
              letterSpacing: '0.01em',
            }}
          >
            Platform
          </Typography>
        </Box>
      )}
    </Box>
  );
}
