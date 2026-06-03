import { ReactNode } from 'react';
import { Box, CardContent, Typography } from '@mui/material';
import PremiumCard from './PremiumCard';
import FadeIn from './FadeIn';

type AuthCardProps = {
  title: string;
  subtitle?: string;
  children: ReactNode;
};

export default function AuthCard({ title, subtitle, children }: AuthCardProps) {
  return (
    <Box
      sx={{
        minHeight: 'calc(100vh - 120px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        py: 6,
        px: 2,
      }}
    >
      <FadeIn sx={{ width: '100%', maxWidth: 440 }}>
        <PremiumCard hover={false} glass sx={{ overflow: 'hidden' }}>
          <CardContent sx={{ p: { xs: 3, sm: 4 } }}>
            <Typography variant="h5" fontWeight={700} letterSpacing="-0.02em" gutterBottom>
              {title}
            </Typography>
            {subtitle && (
              <Typography variant="body2" color="text.secondary" sx={{ mb: 3 }}>
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
