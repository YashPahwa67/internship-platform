import { useState } from 'react';
import { Link as RouterLink, useNavigate, useLocation } from 'react-router-dom';
import {
  AppBar, Toolbar, Box, Button, IconButton, Drawer, List, ListItemButton,
  ListItemText, Container, Divider,
} from '@mui/material';
import Logo from '../ui/Logo';
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

  const isActive = (path: string) => location.pathname === path || location.pathname.startsWith(path + '/');

  return (
    <>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          bgcolor: scrolled
            ? (mode === 'light' ? 'rgba(255,255,255,0.88)' : 'rgba(10,10,11,0.88)')
            : 'transparent',
          backdropFilter: scrolled ? 'blur(20px) saturate(200%)' : 'none',
          borderBottom: scrolled ? `1px solid ${t.border}` : '1px solid transparent',
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
          boxShadow: scrolled ? t.shadowSm : 'none',
        }}
        className={scrolled ? 'glass-panel' : undefined}
      >
        <Container maxWidth="lg">
          <Toolbar disableGutters sx={{ minHeight: { xs: 60, md: 68 } }}>

            {/* Logo */}
            <Box sx={{ mr: { md: 4 } }}>
              <Logo size={30} textSx={{ display: { xs: 'none', sm: 'block' } }} />
            </Box>

            {/* Desktop nav links */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 0.5, alignItems: 'center' }}>
              {NAV_LINKS.map((link) => {
                const active = isActive(link.path);
                return (
                  <Button
                    key={link.path}
                    component={RouterLink}
                    to={link.path}
                    sx={{
                      color: active ? 'text.primary' : 'text.secondary',
                      fontWeight: active ? 600 : 500,
                      fontSize: '0.9375rem',
                      minWidth: 'auto',
                      px: 1.5,
                      bgcolor: active ? (mode === 'light' ? 'rgba(0,0,0,0.04)' : 'rgba(255,255,255,0.05)') : 'transparent',
                      borderRadius: '8px',
                      '&:hover': {
                        bgcolor: mode === 'light' ? 'rgba(0,0,0,0.05)' : 'rgba(255,255,255,0.06)',
                        color: 'text.primary',
                      },
                    }}
                  >
                    {link.label}
                  </Button>
                );
              })}
            </Box>

            <Box sx={{ flexGrow: 1 }} />

            {/* Theme toggle */}
            <IconButton
              onClick={toggle}
              aria-label="Toggle theme"
              size="small"
              sx={{
                mr: 0.5,
                width: 36, height: 36,
                border: `1px solid ${t.border}`,
                borderRadius: '10px',
                color: 'text.secondary',
                '&:hover': { borderColor: t.textMuted, color: 'text.primary' },
              }}
            >
              {mode === 'light'
                ? <DarkModeOutlinedIcon sx={{ fontSize: 17 }} />
                : <LightModeOutlinedIcon sx={{ fontSize: 17 }} />}
            </IconButton>

            {/* Desktop auth */}
            <Box sx={{ display: { xs: 'none', md: 'flex' }, gap: 1, alignItems: 'center' }}>
              {isAuth ? (
                <Button variant="contained" onClick={() => navigate(dashboardPath)} size="small" sx={{ px: 2.5 }}>
                  Dashboard
                </Button>
              ) : (
                <>
                  <Button
                    component={RouterLink}
                    to="/login"
                    sx={{ color: 'text.secondary', fontWeight: 500, '&:hover': { color: 'text.primary' } }}
                    size="small"
                  >
                    Log in
                  </Button>
                  <Button component={RouterLink} to="/register" variant="contained" size="small" sx={{ px: 2.5 }}>
                    Get started
                  </Button>
                </>
              )}
            </Box>

            {/* Mobile menu button */}
            <IconButton
              sx={{ display: { md: 'none' }, ml: 0.5 }}
              onClick={() => setMobileOpen(true)}
              aria-label="Menu"
              size="small"
            >
              <MenuIcon />
            </IconButton>
          </Toolbar>
        </Container>
      </AppBar>

      {/* Mobile drawer */}
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
        <Box sx={{ p: 2, display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <Logo size={28} />
          <IconButton onClick={() => setMobileOpen(false)} size="small"><CloseIcon fontSize="small" /></IconButton>
        </Box>

        <Divider sx={{ borderColor: t.border }} />

        <List sx={{ px: 1, py: 1.5 }}>
          {NAV_LINKS.map((link) => (
            <ListItemButton
              key={link.path}
              component={RouterLink}
              to={link.path}
              onClick={() => setMobileOpen(false)}
              selected={isActive(link.path)}
              sx={{ borderRadius: '10px', mb: 0.25 }}
            >
              <ListItemText primary={link.label} primaryTypographyProps={{ fontWeight: 500 }} />
            </ListItemButton>
          ))}
        </List>

        <Divider sx={{ borderColor: t.border, mx: 2 }} />

        <Box sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 1 }}>
          {isAuth ? (
            <Button
              variant="contained"
              fullWidth
              onClick={() => { navigate(dashboardPath); setMobileOpen(false); }}
            >
              Go to Dashboard
            </Button>
          ) : (
            <>
              <Button component={RouterLink} to="/login" onClick={() => setMobileOpen(false)} variant="outlined" fullWidth>
                Log in
              </Button>
              <Button component={RouterLink} to="/register" onClick={() => setMobileOpen(false)} variant="contained" fullWidth>
                Get started free
              </Button>
            </>
          )}
        </Box>
      </Drawer>
    </>
  );
}
