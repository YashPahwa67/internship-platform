import { ReactNode, lazy, Suspense } from 'react';
import { Box, CardContent, Typography, alpha } from '@mui/material';
import PremiumCard from './PremiumCard';
import FadeIn from './FadeIn';
import Logo from './Logo';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

// Ambient 3D particle field — only loaded when rendered
const AmbientCanvas = lazy(() => import('../3d/AmbientCanvas'));

const reducedMotion =
  typeof window !== 'undefined' &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  const { mode } = useThemeMode();
  const t = tokens[mode];
  const isDark = mode === 'dark';

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
        // In dark mode the canvas provides the BG; in light keep the gradient
        background: isDark ? 'transparent' : t.heroGradient,
        bgcolor: isDark ? '#0A0A0B' : undefined,
      }}
    >
      {/* 3D particle field in dark mode — absolute so it fills this container */}
      {isDark && !reducedMotion && (
        <Suspense fallback={null}>
          <AmbientCanvas mode="absolute" count={180} />
        </Suspense>
      )}

      {/* Ambient orbs — keep both modes looking good */}
      <Box
        sx={{
          position: 'absolute',
          width: 460, height: 460,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(t.accent, isDark ? 0.14 : 0.1)} 0%, transparent 70%)`,
          top: '-12%', right: '-8%',
          filter: 'blur(70px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />
      <Box
        sx={{
          position: 'absolute',
          width: 300, height: 300,
          borderRadius: '50%',
          background: `radial-gradient(circle, ${alpha(isDark ? '#A060F8' : t.accent, isDark ? 0.12 : 0.07)} 0%, transparent 70%)`,
          bottom: '5%', left: '-6%',
          filter: 'blur(60px)',
          pointerEvents: 'none',
          zIndex: 1,
        }}
      />

      {/* Grid pattern */}
      <Box className="hero-grid" sx={{ position: 'absolute', inset: 0, pointerEvents: 'none', zIndex: 1 }} />

      <FadeIn sx={{ width: '100%', maxWidth: 460, position: 'relative', zIndex: 2 }}>
        {/* Logo above card */}
        <Box sx={{ display: 'flex', justifyContent: 'center', mb: 3 }}>
          <Logo size={30} />
        </Box>

        <PremiumCard hover={false} glass sx={{ overflow: 'hidden' }}>
          {/* Gradient top bar */}
          <Box sx={{ height: 3, background: t.accentGradient }} />
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
