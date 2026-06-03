import { useState } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Menu, MenuItem, Divider,
  useMediaQuery, useTheme, Container,
} from '@mui/material';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import { useAppSelector, useAppDispatch } from '../../app/hooks';
import { selectUser, logout } from '../../features/auth/authSlice';
import { useLogoutMutation } from '../../api/authApi';
import { useGetNotificationsQuery } from '../../api/notificationApi';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import { tokens } from '../../theme/designTokens';
import { baseApi } from '../../api/baseApi';

const DRAWER_WIDTH = 268;

type NavItem = { label: string; path: string; icon: React.ReactNode };

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'admin':
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
        { label: 'Users', path: '/admin/users', icon: <PeopleOutlineIcon fontSize="small" /> },
        { label: 'Moderation', path: '/admin/moderation', icon: <WorkOutlineIcon fontSize="small" /> },
        { label: 'Companies', path: '/admin/companies', icon: <AssignmentOutlinedIcon fontSize="small" /> },
      ];
    case 'company_hr':
      return [
        { label: 'Dashboard', path: '/company/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
        { label: 'Post internship', path: '/company/internships/new', icon: <PostAddOutlinedIcon fontSize="small" /> },
        { label: 'My internships', path: '/company/internships', icon: <WorkOutlineIcon fontSize="small" /> },
        { label: 'Candidates', path: '/company/candidates', icon: <PeopleOutlineIcon fontSize="small" /> },
      ];
    case 'mentor':
      return [
        { label: 'Dashboard', path: '/mentor/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
        { label: 'Tasks', path: '/mentor/tasks', icon: <TaskAltOutlinedIcon fontSize="small" /> },
      ];
    default:
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
        { label: 'Internships', path: '/student/internships', icon: <WorkOutlineIcon fontSize="small" /> },
        { label: 'Applications', path: '/student/applications', icon: <AssignmentOutlinedIcon fontSize="small" /> },
        { label: 'Tasks', path: '/student/tasks', icon: <TaskAltOutlinedIcon fontSize="small" /> },
        { label: 'Profile', path: '/student/profile', icon: <PersonOutlineIcon fontSize="small" /> },
      ];
  }
}

export default function DashboardLayout() {
  const user = useAppSelector(selectUser);
  const dispatch = useAppDispatch();
  const navigate = useNavigate();
  const location = useLocation();
  const muiTheme = useTheme();
  const isMobile = useMediaQuery(muiTheme.breakpoints.down('md'));
  const [mobileOpen, setMobileOpen] = useState(false);
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const { mode, toggle } = useThemeMode();
  const t = tokens[mode];
  const scrolled = useNavbarScroll(8);
  const [logoutApi] = useLogoutMutation();
  const { data: notifData } = useGetNotificationsQuery(undefined, { skip: !user?.id });
  const unread = notifData?.meta?.unreadCount ?? 0;

  const navItems = getNavItems(user?.role || 'student');

  const handleLogout = async () => {
    try { await logoutApi(undefined).unwrap(); } catch { /* ignore */ }
    dispatch(logout());
    baseApi.util.resetApiState();
    navigate('/login');
  };

  const drawer = (
    <Box sx={{ py: 2, px: 1 }}>
      <Typography
        component={RouterLink}
        to="/"
        sx={{
          display: 'block',
          px: 2,
          mb: 3,
          fontWeight: 700,
          fontSize: '1.125rem',
          letterSpacing: '-0.03em',
          color: 'text.primary',
          textDecoration: 'none',
        }}
      >
        IMP
      </Typography>
      <List disablePadding>
        {navItems.map((item) => (
          <ListItemButton
            key={item.path}
            component={RouterLink}
            to={item.path}
            selected={location.pathname === item.path}
            onClick={() => setMobileOpen(false)}
            sx={{
              py: 1.25,
              '& .MuiListItemIcon-root': { minWidth: 40, color: 'text.secondary' },
              '&.Mui-selected .MuiListItemIcon-root': { color: 'text.primary' },
            }}
          >
            <ListItemIcon>{item.icon}</ListItemIcon>
            <ListItemText primary={item.label} primaryTypographyProps={{ fontWeight: 500, fontSize: '0.9375rem' }} />
          </ListItemButton>
        ))}
      </List>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: scrolled ? (mode === 'light' ? 'rgba(255,255,255,0.9)' : 'rgba(10,10,10,0.9)') : 'background.default',
          backdropFilter: scrolled ? 'blur(16px)' : 'none',
          borderBottom: `1px solid ${scrolled ? t.border : 'transparent'}`,
          transition: 'all 0.35s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 64, md: 72 } }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} sx={{ mr: 1 }} aria-label="Open menu">
              <MenuIcon />
            </IconButton>
          )}
          <Typography variant="h6" sx={{ flexGrow: 1, fontWeight: 600, letterSpacing: '-0.02em' }}>
            {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
          </Typography>
          <IconButton onClick={toggle} aria-label="Toggle theme" size="small">
            {mode === 'light' ? <DarkModeOutlinedIcon fontSize="small" /> : <LightModeOutlinedIcon fontSize="small" />}
          </IconButton>
          <IconButton onClick={() => navigate('/notifications')} aria-label="Notifications" size="small" sx={{ mx: 0.5 }}>
            <Badge badgeContent={unread} color="error" sx={{ '& .MuiBadge-badge': { fontSize: 10, minWidth: 16, height: 16 } }}>
              <NotificationsOutlinedIcon fontSize="small" />
            </Badge>
          </IconButton>
          <IconButton onClick={(e) => setAnchorEl(e.currentTarget)} sx={{ p: 0.5, ml: 0.5 }}>
            <Avatar sx={{ width: 36, height: 36, bgcolor: 'primary.main', color: 'primary.contrastText', fontSize: 13, fontWeight: 600 }}>
              {user?.firstName?.[0]}{user?.lastName?.[0]}
            </Avatar>
          </IconButton>
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{ sx: { mt: 1, minWidth: 200, borderRadius: 2, border: `1px solid ${t.border}` } }}
          >
            <MenuItem disabled sx={{ opacity: 1 }}>
              <Typography variant="body2" color="text.secondary">{user?.email}</Typography>
            </MenuItem>
            <Divider />
            <MenuItem onClick={handleLogout}>
              <ListItemIcon><LogoutOutlinedIcon fontSize="small" /></ListItemIcon>
              Logout
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: t.bgMuted,
              borderRight: `1px solid ${t.border}`,
            },
          }}
        >
          {!isMobile && <Toolbar />}
          {drawer}
        </Drawer>
      </Box>

      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
        }}
      >
        <Toolbar />
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
          <Outlet />
        </Container>
      </Box>
    </Box>
  );
}
