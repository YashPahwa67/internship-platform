import { ReactNode } from 'react';
import { Box, BoxProps } from '@mui/material';
import { useScrollReveal } from '../../hooks/useScrollReveal';

type FadeInProps = BoxProps & {
  children: ReactNode;
  delay?: 0 | 1 | 2 | 3;
  as?: 'div' | 'section';
};

export default function FadeIn({ children, delay = 0, sx, ...props }: FadeInProps) {
  const { ref, visible } = useScrollReveal<HTMLDivElement>();

  return (
    <Box
      ref={ref}
      component="section"
      className={`reveal reveal-delay-${delay} ${visible ? 'visible' : ''}`}
      sx={sx}
      {...props}
    >
      {children}
    </Box>
  );
}
