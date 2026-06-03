import { ReactNode } from 'react';
import { CardContent, Typography, Box } from '@mui/material';
import PremiumCard from './PremiumCard';
import FadeIn from './FadeIn';

type StatCardProps = {
  label: string;
  value: string | number;
  icon?: ReactNode;
  delay?: 0 | 1 | 2 | 3;
};

export default function StatCard({ label, value, icon, delay = 0 }: StatCardProps) {
  return (
    <FadeIn delay={delay}>
      <PremiumCard hover sx={{ height: '100%' }}>
        <CardContent sx={{ py: 3 }}>
          {icon && (
            <Box sx={{ mb: 1.5, color: 'text.secondary', opacity: 0.85 }}>{icon}</Box>
          )}
          <Typography variant="h4" fontWeight={700} letterSpacing="-0.02em">
            {value}
          </Typography>
          <Typography variant="body2" color="text.secondary" sx={{ mt: 0.5 }}>
            {label}
          </Typography>
        </CardContent>
      </PremiumCard>
    </FadeIn>
  );
}
