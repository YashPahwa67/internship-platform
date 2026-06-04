import { ReactNode } from 'react';
import { Box, Typography, alpha } from '@mui/material';
import PremiumCard from './PremiumCard';
import FadeIn from './FadeIn';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delay?: 0 | 1 | 2 | 3;
  trend?: 'up' | 'down' | 'neutral';
  trendLabel?: string;
};

export default function StatCard({ label, value, icon, delay = 0, trend, trendLabel }: StatCardProps) {
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <FadeIn delay={delay}>
      <PremiumCard hover sx={{ height: '100%', overflow: 'hidden', position: 'relative' }}>
        {/* Accent top border */}
        <Box
          sx={{
            position: 'absolute',
            top: 0, left: 0, right: 0,
            height: 2,
            background: t.accentGradient,
          }}
        />
        <Box sx={{ p: 3 }}>
          {/* Icon */}
          {icon && (
            <Box
              sx={{
                width: 38, height: 38,
                borderRadius: '10px',
                display: 'flex', alignItems: 'center', justifyContent: 'center',
                bgcolor: t.accentMuted,
                color: t.accent,
                mb: 2.5,
                '& svg': { fontSize: 20 },
              }}
            >
              {icon}
            </Box>
          )}

          <Typography
            variant="h3"
            fontWeight={800}
            letterSpacing="-0.03em"
            sx={{
              fontSize: { xs: '1.75rem', md: '2.1rem' },
              lineHeight: 1,
              mb: 0.5,
              background: `linear-gradient(135deg, ${t.text} 0%, ${alpha(t.text, 0.7)} 100%)`,
              backgroundClip: 'text',
              WebkitBackgroundClip: 'text',
              WebkitTextFillColor: 'transparent',
            }}
          >
            {value}
          </Typography>

          <Typography
            variant="body2"
            sx={{ color: 'text.secondary', fontWeight: 500, fontSize: '0.875rem' }}
          >
            {label}
          </Typography>

          {trend && trendLabel && (
            <Box
              sx={{
                display: 'inline-flex', alignItems: 'center', gap: 0.5,
                mt: 1.5, px: 1, py: 0.25, borderRadius: '6px',
                fontSize: '0.75rem', fontWeight: 600,
                bgcolor: trend === 'up' ? alpha('#16A34A', 0.08) : trend === 'down' ? alpha('#DC2626', 0.08) : alpha(t.accent, 0.08),
                color: trend === 'up' ? '#16A34A' : trend === 'down' ? '#DC2626' : t.accent,
              }}
            >
              {trend === 'up' ? '↑' : trend === 'down' ? '↓' : '→'} {trendLabel}
            </Box>
          )}
        </Box>
      </PremiumCard>
    </FadeIn>
  );
}
