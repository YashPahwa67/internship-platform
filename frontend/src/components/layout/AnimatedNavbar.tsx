import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItemButton,
  ListItemText, Container, Typography,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import CloseIcon from '@mui/icons-material/Close';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import { useAppSelector } from '../../app/hooks';
import { selectIsAuthenticated, selectUser } from '../../features/auth/authSlice';
import { tokens } from '../../theme/designTokens';

const NAV_LINKS = [
  { label: 'Internships', path: '/internships' },
  { label: 'About', path: '/about' },
  { label: 'Contact', path: '/contact' },
];

export default function AnimatedNavbar() {
  const scrolled = useNavbarScroll();
  const { mode, toggle } = useThemeMode();
  const t = tokens[mode];
  const isAuth = useAppSelector(selectIsAuthenticated);
  const user = useAppSelector(selectUser);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);

  const dashboardPath =
    user?.role === 'admin' ? '/admin/dashboard'
    : user?.role === 'company_hr' ? '/company/dashboard'
    : user?.role === 'mentor' ? '/mentor/dashboard'
    : '/student/dashboard';

  const navLinkSx = {
    color: 'text.primary',
    fontWeight: 500,
    fontSize: '0.9375rem',
    minWidth: 'auto',
    px: 1.5,
    '&:hover': { bgcolor: 'transparent', color: 'text.primary' },
  };

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled ? (mode === 'light' ? 'rgba(255,255,255,0.85)' : 'rgba(10,10,10,0.85)') : 'transparent',
          backdropFilter: scrolled ? 'blur(16px) saturate(180%)' : 'none',
          borderBottom: scrolled ? `1px solid ${t.border}` : '1px solid transparent',
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
        className={scrolled ? 'glass-panel' : undefined}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 64, md: 72 } }}>
            <Typography
              component={RouterLink}
              to="/"
              sx={{
                fontWeight: 700,
                fontSize: '1.25rem',
                letterSpacing: '-0.03em',
                color: 'text.primary',
                textDecoration: 'none',
                mr: { md: 6 },
              }}
            >
              IMP
            </Typography>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
              {NAV_LINKS.map((link) => (
                <Button
                  key={link.path}
                  component={RouterLink}
                  to={link.path}
                  className={`nav-link ${location.pathname === link.path ? 'active' : ''}`}
                  sx={navLinkSx}
                >
                  {link.label}
                </Button>
              ))}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            <IconButton onClick={toggle} aria-label="Toggle theme" sx={{ mr: 0.5 }}>
              {mode === 'light' ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
            </IconButton>

            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
              {isAuth ? (
                <Button variant="contained" onClick={() => navigate(dashboardPath)}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button component={RouterLink} to="/login" sx={navLinkSx}>Login</Button>
                  <Button component={RouterLink} to="/register" variant="contained">
                    Get started
                  </Button>
                </>
              )}
            </Box>

            <IconButton sx={{ display: { md: 'none' } }} onClick={() => setMobileOpen(true)} aria-label="Menu">
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      <Drawer
        anchor="right"
        open={mobileOpen}
        onClose={() => setMobileOpen(false)}
        PaperProps={{
          sx: {
            width: 280,
            bgcolor: 'background.paper',
            borderLeft: `1px solid ${t.border}`,
          },
        }}
      >
        <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end' }}>
          <IconButton onClick={() => setMobileOpen(false)}><CloseIcon /></IconButton>
        </Box>
        <List>
          {NAV_LINKS.map((link) => (
            <ListItemButton
              key={link.path}
              component={RouterLink}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              selected={location.pathname === link.path}
            >
              <ListItemText primary={link.label} />
            </ListItemButton>
          ))}
          <ListItemButton component={RouterLink} to="/login" onClick={() => setMobileOpen(false)}>
            <ListItemText primary="Login" />
          </ListItemButton>
          <ListItemButton
            component={RouterLink}
            to="/register"
            onClick={() => setMobileOpen(false)}
            sx={{ mt: 1, mx: 2, borderRadius: 2, bgcolor: 'primary.main', color: 'primary.contrastText', '&:hover': { bgcolor: 'primary.main', opacity: 0.9 } }}
          >
            <ListItemText primary="Get started" primaryTypographyProps={{ fontWeight: 600, textAlign: 'center' }} />
          </ListItemButton>
        </List>
      </Drawer>
    </>
  );
}
