import { ReactNode } from 'react';
import { Box, Typography, TypographyProps } from '@mui/material';
import FadeIn from './FadeIn';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  titleVariant?: TypographyProps['variant'];
};

export default function PageHeader({
  title,
  subtitle,
  action,
  titleVariant = 'h4',
}: PageHeaderProps) {
  return (
    <FadeIn>
      <Box
        sx={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'flex-start',
          flexWrap: 'wrap',
          gap: 2,
          mb: 4,
        }}
      >
        <Box>
          <Typography
            variant={titleVariant}
            fontWeight={700}
            letterSpacing="-0.02em"
            gutterBottom={!!subtitle}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 560 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action}
      </Box>
    </FadeIn>
  );
}
