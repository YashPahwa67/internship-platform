import { Card, CardProps } from '@mui/material';
import { tokens } from '../../theme/designTokens';
import { useThemeMode } from '../../theme/ThemeProvider';

type PremiumCardProps = CardProps & {
  hover?: boolean;
  glass?: boolean;
  accentBorder?: boolean;
};

export default function PremiumCard({
  children,
  hover = true,
  glass = false,
  accentBorder = false,
  sx,
  className,
  ...props
}: PremiumCardProps) {
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <Card
      className={[hover ? 'premium-card' : '', glass ? 'glass-panel' : '', className].filter(Boolean).join(' ')}
      sx={{
        bgcolor: glass ? 'transparent' : 'background.paper',
        border: `1px solid ${glass ? t.glassBorder : accentBorder ? t.accent : t.border}`,
        ...(glass && { background: t.glass }),
        ...(hover && {
          '&:hover': {
            boxShadow: t.shadowHover,
            borderColor: mode === 'light' ? '#C8C8C8' : '#3A3A3E',
          },
        }),
        ...sx,
      }}
      {...props}
    >
      {children}
    </Card>
  );
}
