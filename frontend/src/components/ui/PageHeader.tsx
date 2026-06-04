import { ReactNode } from 'react';
import { Box, Typography, TypographyProps, Divider } from '@mui/material';
import FadeIn from './FadeIn';

type PageHeaderProps = {
  title: string;
  subtitle?: string;
  action?: ReactNode;
  titleVariant?: TypographyProps['variant'];
  divider?: boolean;
};

export default function PageHeader({
  title,
  subtitle,
  action,
  titleVariant = 'h4',
  divider = false,
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
          mb: divider ? 3 : 4,
        }}
      >
        <Box>
          <Typography
            variant={titleVariant}
            fontWeight={800}
            letterSpacing="-0.03em"
            gutterBottom={!!subtitle}
            sx={{ lineHeight: 1.2 }}
          >
            {title}
          </Typography>
          {subtitle && (
            <Typography variant="body1" color="text.secondary" sx={{ maxWidth: 540, lineHeight: 1.65 }}>
              {subtitle}
            </Typography>
          )}
        </Box>
        {action && <Box sx={{ flexShrink: 0 }}>{action}</Box>}
      </Box>
      {divider && <Divider sx={{ mb: 4 }} />}
    </FadeIn>
  );
}
