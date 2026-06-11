import { useState, useEffect } from 'react';
import { Outlet, useNavigate, useLocation, Link as RouterLink } from 'react-router-dom';
import PageTransition from '../ui/PageTransition';
import {
  Box, Drawer, List, ListItemButton, ListItemIcon, ListItemText,
  AppBar, Toolbar, Typography, IconButton, Badge, Avatar, Menu, MenuItem, Divider,
  useMediaQuery, useTheme, Container, Tooltip,
} from '@mui/material';
import Logo from '../ui/Logo';
import MenuIcon from '@mui/icons-material/Menu';
import DashboardOutlinedIcon from '@mui/icons-material/DashboardOutlined';
import WorkOutlineIcon from '@mui/icons-material/WorkOutline';
import AssignmentOutlinedIcon from '@mui/icons-material/AssignmentOutlined';
import TaskAltOutlinedIcon from '@mui/icons-material/TaskAltOutlined';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import GroupsOutlinedIcon from '@mui/icons-material/GroupsOutlined';
import HistoryOutlinedIcon from '@mui/icons-material/HistoryOutlined';
import PeopleOutlineIcon from '@mui/icons-material/PeopleOutline';
import NotificationsOutlinedIcon from '@mui/icons-material/NotificationsOutlined';
import LogoutOutlinedIcon from '@mui/icons-material/LogoutOutlined';
import PostAddOutlinedIcon from '@mui/icons-material/PostAddOutlined';
import DarkModeOutlinedIcon from '@mui/icons-material/DarkModeOutlined';
import LightModeOutlinedIcon from '@mui/icons-material/LightModeOutlined';
import AccountCircleOutlinedIcon from '@mui/icons-material/AccountCircleOutlined';
import { useAppDispatch } from '../../app/hooks';
import { patchUser, syncFromStudentProfile, logout } from '../../features/auth/authSlice';
import { useLogoutMutation, useMeQuery } from '../../api/authApi';
import { useDisplayUser } from '../../hooks/useDisplayUser';
import { useGetNotificationsQuery } from '../../api/notificationApi';
import { useSSE } from '../../hooks/useSSE';
import { useThemeMode } from '../../theme/ThemeProvider';
import { useNavbarScroll } from '../../hooks/useNavbarScroll';
import { tokens } from '../../theme/designTokens';
import { baseApi } from '../../api/baseApi';

const DRAWER_WIDTH = 260;

type NavItem = { label: string; path: string; icon: React.ReactNode };

function getNavItems(role: string): NavItem[] {
  switch (role) {
    case 'admin':
      return [
        { label: 'Dashboard', path: '/admin/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
        { label: 'Users', path: '/admin/users', icon: <PeopleOutlineIcon fontSize="small" /> },
        { label: 'Moderation', path: '/admin/moderation', icon: <WorkOutlineIcon fontSize="small" /> },
        { label: 'Companies', path: '/admin/companies', icon: <AssignmentOutlinedIcon fontSize="small" /> },
        { label: 'Audit log', path: '/admin/audit-log', icon: <HistoryOutlinedIcon fontSize="small" /> },
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
        { label: 'Mentorship', path: '/mentor/mentorship', icon: <GroupsOutlinedIcon fontSize="small" /> },
      ];
    default:
      return [
        { label: 'Dashboard', path: '/student/dashboard', icon: <DashboardOutlinedIcon fontSize="small" /> },
        { label: 'Internships', path: '/student/internships', icon: <WorkOutlineIcon fontSize="small" /> },
        { label: 'Applications', path: '/student/applications', icon: <AssignmentOutlinedIcon fontSize="small" /> },
        { label: 'Tasks', path: '/student/tasks', icon: <TaskAltOutlinedIcon fontSize="small" /> },
        { label: 'Mentorship', path: '/student/mentorship', icon: <GroupsOutlinedIcon fontSize="small" /> },
        { label: 'Profile', path: '/student/profile', icon: <PersonOutlineIcon fontSize="small" /> },
      ];
  }
}

export default function DashboardLayout() {
  const { user, displayName, avatarUrl, initials } = useDisplayUser();
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
  const { data: meData } = useMeQuery(undefined, { skip: !user?.id });
  const { data: notifData } = useGetNotificationsQuery(undefined, { skip: !user?.id });
  useSSE(); // real-time notification push via Server-Sent Events

  useEffect(() => {
    const me = meData?.data;
    if (!me?.user) return;
    dispatch(
      patchUser({
        firstName: me.user.firstName,
        lastName: me.user.lastName,
        displayName: me.user.displayName,
        profilePictureUrl: me.user.profilePictureUrl,
        company: me.user.company,
      })
    );
    if (me.profile && user?.role === 'student') {
      dispatch(
        syncFromStudentProfile({
          fullName: me.profile.fullName,
          user: me.profile.user,
          profilePicture: me.profile.profilePicture ?? null,
        })
      );
    }
  }, [meData, dispatch, user?.role]);
  const unread = notifData?.meta?.unreadCount ?? 0;

  const navItems = getNavItems(user?.role || 'student');

  const handleLogout = async () => {
    try { await logoutApi(undefined).unwrap(); } catch { /* ignore */ }
    dispatch(logout());
    baseApi.util.resetApiState();
    navigate('/login');
  };

  const roleLabel: Record<string, string> = {
    admin: 'Administrator',
    company_hr: 'Company',
    mentor: 'Mentor',
    student: 'Student',
  };

  const drawer = (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Brand */}
      <Box sx={{ px: 2, pt: 2.5, pb: 2 }}>
        <Logo size={32} />
      </Box>

      <Divider sx={{ borderColor: t.borderSubtle, mx: 2 }} />

      {/* Role label */}
      <Box sx={{ px: 2.5, pt: 1.5, pb: 0.5 }}>
        <Typography variant="overline" sx={{ color: 'text.disabled', fontSize: '0.6875rem', letterSpacing: '0.1em' }}>
          {roleLabel[user?.role || 'student']} Portal
        </Typography>
      </Box>

      {/* Nav */}
      <List disablePadding sx={{ px: 1.5, flexGrow: 1 }}>
        {navItems.map((item) => {
          const active = location.pathname === item.path;
          return (
            <ListItemButton
              key={item.path}
              component={RouterLink}
              to={item.path}
              selected={active}
              onClick={() => setMobileOpen(false)}
              sx={{
                py: 1.1,
                borderRadius: '10px',
                mb: 0.25,
                position: 'relative',
                overflow: 'hidden',
                '& .MuiListItemIcon-root': {
                  minWidth: 36,
                  color: active ? t.accent : 'text.disabled',
                  transition: 'color 0.2s',
                },
              }}
            >
              {active && (
                <Box
                  sx={{
                    position: 'absolute',
                    left: 0, top: '18%', bottom: '18%',
                    width: 3, borderRadius: '0 3px 3px 0',
                    background: t.accentGradient,
                  }}
                />
              )}
              <ListItemIcon>{item.icon}</ListItemIcon>
              <ListItemText
                primary={item.label}
                primaryTypographyProps={{
                  fontWeight: active ? 600 : 500,
                  fontSize: '0.9rem',
                  color: active ? 'text.primary' : 'text.secondary',
                }}
              />
            </ListItemButton>
          );
        })}
      </List>

      {/* User section at bottom */}
      <Box sx={{ p: 2, mt: 'auto' }}>
        <Divider sx={{ borderColor: t.borderSubtle, mb: 1.5 }} />
        <Box
          sx={{
            display: 'flex', alignItems: 'center', gap: 1.5,
            p: 1.25, borderRadius: '10px',
            border: `1px solid ${t.border}`,
            bgcolor: mode === 'light' ? t.bgSubtle : t.bgElevated,
            cursor: 'pointer',
            transition: 'all 0.2s',
            '&:hover': { borderColor: t.accent, bgcolor: t.accentMuted },
          }}
          onClick={(e: React.MouseEvent<HTMLDivElement>) => setAnchorEl(e.currentTarget as HTMLElement)}
        >
          <Avatar
            src={avatarUrl}
            sx={{ width: 32, height: 32, fontSize: 12, fontWeight: 700 }}
          >
            {initials}
          </Avatar>
          <Box sx={{ minWidth: 0, flex: 1 }}>
            <Typography sx={{ fontWeight: 600, fontSize: '0.875rem', lineHeight: 1.3 }} noWrap>
              {displayName}
            </Typography>
            <Typography variant="caption" color="text.disabled" noWrap sx={{ display: 'block', fontSize: '0.72rem' }}>
              {user?.email}
            </Typography>
          </Box>
        </Box>
      </Box>
    </Box>
  );

  return (
    <Box sx={{ display: 'flex', minHeight: '100vh', bgcolor: 'background.default' }}>
      {/* Top AppBar */}
      <AppBar
        position="fixed"
        elevation={0}
        sx={{
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          ml: { md: `${DRAWER_WIDTH}px` },
          bgcolor: scrolled
            ? (mode === 'light' ? 'rgba(255,255,255,0.92)' : 'rgba(10,10,11,0.92)')
            : 'background.default',
          backdropFilter: scrolled ? 'blur(20px) saturate(200%)' : 'none',
          borderBottom: `1px solid ${scrolled ? t.border : t.borderSubtle}`,
          transition: 'all 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, md: 64 }, gap: 1 }}>
          {isMobile && (
            <IconButton edge="start" onClick={() => setMobileOpen(true)} size="small" aria-label="Open menu">
              <MenuIcon fontSize="small" />
            </IconButton>
          )}
          <Typography
            variant="h6"
            sx={{ flexGrow: 1, fontWeight: 700, letterSpacing: '-0.02em', fontSize: '1rem' }}
          >
            {navItems.find((n) => n.path === location.pathname)?.label || 'Dashboard'}
          </Typography>

          {/* Theme toggle */}
          <Tooltip title={`Switch to ${mode === 'light' ? 'dark' : 'light'} mode`}>
            <IconButton
              onClick={toggle}
              size="small"
              sx={{
                width: 34, height: 34,
                border: `1px solid ${t.border}`,
                borderRadius: '9px',
                color: 'text.secondary',
                '&:hover': { borderColor: t.textMuted },
              }}
            >
              {mode === 'light'
                ? <DarkModeOutlinedIcon sx={{ fontSize: 16 }} />
                : <LightModeOutlinedIcon sx={{ fontSize: 16 }} />}
            </IconButton>
          </Tooltip>

          {/* Notifications */}
          <Tooltip title="Notifications">
            <IconButton
              onClick={() => navigate('/notifications')}
              size="small"
              sx={{
                width: 34, height: 34,
                border: `1px solid ${t.border}`,
                borderRadius: '9px',
                color: 'text.secondary',
                '&:hover': { borderColor: t.textMuted },
              }}
            >
              <Badge
                badgeContent={unread}
                color="error"
                sx={{ '& .MuiBadge-badge': { fontSize: '0.6rem', minWidth: 15, height: 15, p: '0 3px' } }}
              >
                <NotificationsOutlinedIcon sx={{ fontSize: 16 }} />
              </Badge>
            </IconButton>
          </Tooltip>

          {/* Avatar */}
          <IconButton
            onClick={(e: React.MouseEvent<HTMLButtonElement>) => setAnchorEl(e.currentTarget)}
            sx={{ p: 0.25 }}
          >
            <Avatar
              src={avatarUrl}
              sx={{ width: 34, height: 34, fontSize: 12, fontWeight: 700 }}
            >
              {initials}
            </Avatar>
          </IconButton>

          {/* User menu */}
          <Menu
            anchorEl={anchorEl}
            open={!!anchorEl}
            onClose={() => setAnchorEl(null)}
            transformOrigin={{ horizontal: 'right', vertical: 'top' }}
            anchorOrigin={{ horizontal: 'right', vertical: 'bottom' }}
            PaperProps={{
              sx: {
                mt: 0.5, minWidth: 220, borderRadius: '12px',
                border: `1px solid ${t.border}`,
                boxShadow: t.shadowLg,
              },
            }}
          >
            <Box sx={{ px: 2, py: 1.5 }}>
              <Typography variant="body2" fontWeight={700}>{displayName}</Typography>
              <Typography variant="caption" color="text.secondary" display="block">{user?.email}</Typography>
            </Box>
            <Divider sx={{ borderColor: t.border }} />
            <MenuItem
              onClick={() => { setAnchorEl(null); navigate(navItems.find((n) => n.label === 'Profile')?.path || '#'); }}
              sx={{ gap: 1.5, py: 1 }}
            >
              <AccountCircleOutlinedIcon fontSize="small" sx={{ color: 'text.secondary' }} />
              <Typography variant="body2">Profile</Typography>
            </MenuItem>
            <MenuItem onClick={handleLogout} sx={{ gap: 1.5, py: 1, color: 'error.main' }}>
              <LogoutOutlinedIcon fontSize="small" />
              <Typography variant="body2">Log out</Typography>
            </MenuItem>
          </Menu>
        </Toolbar>
      </AppBar>

      {/* Sidebar */}
      <Box component="nav" sx={{ width: { md: DRAWER_WIDTH }, flexShrink: { md: 0 } }}>
        <Drawer
          variant={isMobile ? 'temporary' : 'permanent'}
          open={isMobile ? mobileOpen : true}
          onClose={() => setMobileOpen(false)}
          sx={{
            '& .MuiDrawer-paper': {
              width: DRAWER_WIDTH,
              boxSizing: 'border-box',
              bgcolor: mode === 'light'
                ? t.bgMuted
                : 'rgba(10, 10, 12, 0.82)',
              backdropFilter: mode === 'dark' ? 'blur(20px) saturate(160%)' : 'none',
              WebkitBackdropFilter: mode === 'dark' ? 'blur(20px) saturate(160%)' : 'none',
              borderRight: `1px solid ${mode === 'dark' ? 'rgba(255,255,255,0.055)' : t.sidebarBorder}`,
            },
          }}
        >
          {!isMobile && <Toolbar sx={{ minHeight: '0 !important', p: '0 !important' }} />}
          {drawer}
        </Drawer>
      </Box>

      {/* Main content */}
      <Box
        component="main"
        sx={{
          flexGrow: 1,
          width: { md: `calc(100% - ${DRAWER_WIDTH}px)` },
          minHeight: '100vh',
          bgcolor: 'background.default',
        }}
      >
        <Toolbar sx={{ minHeight: { xs: 60, md: 64 } }} />
        <Container maxWidth="lg" sx={{ py: { xs: 3, md: 4 }, px: { xs: 2, sm: 3 } }}>
          <PageTransition>
            <Outlet />
          </PageTransition>
        </Container>
      </Box>
    </Box>
  );
}
