import { ReactNode } from 'react';
import { Box, CardContent, Typography, alpha } from '@mui/material';
import PremiumCard from './PremiumCard';
import FadeIn from './FadeIn';
import Logo from './Logo';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 68px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        overflow: 'hidden',
        py: 6,
        px: 2,
        background: t.heroGradient,
      }}
    >
      {/* Ambient orbs */}
      <Box
        sx={{
          position: 'absolute',
          width: 400, height: 400,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(t.accent, 0.1)} 0%, transparent 70%)`,
          top: '-10%', right: '-5%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 280, height: 280,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(t.accent, 0.07)} 0%, transparent 70%)`,
          bottom: '5%', left: '-5%',
          filter: 'blur(50px)',
          pointerEvents: 'none',
        }}
      />

      {/* Grid pattern */}
      <Box className="hero-grid" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none' }} />

      <FadeIn sx={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 1 }}>
        {/* Logo above card */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Logo size={30} />
        </Box>

        <PremiumCard hover={false} glass sx={{ overflow: 'hidden' }}>
          {/* Gradient top bar */}
          <Box
            sx={{
              height: 3,
              background: t.accentGradient,
            }}
          />
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography
              variant="h4"
              fontWeight={800}
              letterSpacing="-0.03em"
              gutterBottom
              sx={{ lineHeight: 1.2 }}
            >
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3.5, lineHeight: 1.65 }}>
                {subtitle}
              </Typography>
            )}
            {children}
          </CardContent>
        </PremiumCard>
      </FadeIn>
    </Box>
  );
}
