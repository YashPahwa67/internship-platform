import { Chip, ChipProps } from '@mui/material';

const statusStyles: Record<string, ChipProps['variant']> = {
  applied: 'outlined',
  shortlisted: 'filled',
  published: 'filled',
  active: 'filled',
};

export default function StatusChip({ status, ...props }: { status: string } & ChipProps) {
  const label = status.replace(/_/g, ' ');
  const isPositive = ['shortlisted', 'offered', 'accepted', 'active', 'completed', 'published', 'approved'].includes(status);
  const isNegative = ['rejected', 'withdrawn', 'suspended'].includes(status);

  return (
    <Chip
      label={label}
      size="small"
      variant={statusStyles[status] || 'outlined'}
      sx={{
        fontWeight: 500,
        textTransform: 'capitalize',
        ...(isPositive && { bgcolor: 'action.selected' }),
        ...(isNegative && { opacity: 0.85 }),
      }}
      {...props}
    />
  );
}
