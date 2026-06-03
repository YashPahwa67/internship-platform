import { Outlet, Link as RouterLink } from 'react-router-dom';
import { Box, Container, Typography, Link, Grid } from '@mui/material';
import AnimatedNavbar from './AnimatedNavbar';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

export default function PublicLayout() {
  const { mode } = useThemeMode();
  const t = tokens[mode];

  return (
    <Box sx={{ minHeight: '100vh', display: 'flex', flexDirection: 'column', bgcolor: 'background.default' }}>
      <AnimatedNavbar />
      <Box component="main" sx={{ flex: 1, pt: { xs: 8, md: 9 } }}>
        <Outlet />
      </Box>
      <Box
        component="footer"
        sx={{
          py: { xs: 6, md: 8 },
          bgcolor: t.bgMuted,
          borderTop: `1px solid ${t.border}`,
        }}
      >
        <Container maxWidth="lg">
          <Grid container spacing={4}>
            <Grid item xs={12} md={4}>
              <Typography variant="h6" fontWeight={700} letterSpacing="-0.02em" gutterBottom>
                IMP
              </Typography>
              <Typography variant="body2" color="text.secondary" sx={{ maxWidth: 280 }}>
                The modern platform connecting students, companies, and mentors for internship excellence.
              </Typography>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Product
              </Typography>
              <Link component={RouterLink} to="/internships" color="text.primary" underline="hover" display="block" sx={{ mb: 1, fontSize: '0.875rem' }}>Internships</Link>
              <Link component={RouterLink} to="/register" color="text.primary" underline="hover" display="block" sx={{ fontSize: '0.875rem' }}>Register</Link>
            </Grid>
            <Grid item xs={6} md={2}>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mb: 1.5 }}>
                Company
              </Typography>
              <Link component={RouterLink} to="/about" color="text.primary" underline="hover" display="block" sx={{ mb: 1, fontSize: '0.875rem' }}>About</Link>
              <Link component={RouterLink} to="/contact" color="text.primary" underline="hover" display="block" sx={{ fontSize: '0.875rem' }}>Contact</Link>
            </Grid>
          </Grid>
          <Typography variant="caption" color="text.secondary" sx={{ display: 'block', mt: 5, pt: 3, borderTop: `1px solid ${t.border}` }}>
            © 2026 Internship Management Platform. All rights reserved.
          </Typography>
        </Container>
      </Box>
    </Box>
  );
}
