import { useState } from 'react';
import {
  Typography, CardContent, Box, Button, Tabs, Tab, Chip, alpha,
  Checkbox, Collapse, Toolbar, Tooltip, IconButton,
} from '@mui/material';
import DeleteOutlineIcon from '@mui/icons-material/DeleteOutline';
import RestoreIcon from '@mui/icons-material/Restore';
import PersonOffOutlinedIcon from '@mui/icons-material/PersonOffOutlined';
import PauseCircleOutlineIcon from '@mui/icons-material/PauseCircleOutline';
import PlayCircleOutlineIcon from '@mui/icons-material/PlayCircleOutline';
import FileDownloadOutlinedIcon from '@mui/icons-material/FileDownloadOutlined';
import {
  useGetUsersQuery,
  useUpdateUserStatusMutation,
  useDeleteUserMutation,
  useRestoreUserMutation,
  useBulkUserActionMutation,
} from '../../api/adminApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import StatusChip from '../../components/ui/StatusChip';
import FadeIn from '../../components/ui/FadeIn';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';
import { useAppSelector } from '../../app/hooks';
import { selectAccessToken } from '../auth/authSlice';

const API_BASE = import.meta.env.VITE_API_URL || '/api/v1';

type User = {
  id: string;
  email: string;
  role: string;
  status: string;
  firstName?: string;
  lastName?: string;
  createdAt?: string;
  deletedAt?: string | null;
};

export default function AdminUsersPage() {
  const [tab, setTab] = useState(0);
  const { mode } = useThemeMode();
  const t = tokens[mode];
  const token = useAppSelector(selectAccessToken);

  const { data: activeData, refetch: refetchActive, isFetching: fetchingActive } = useGetUsersQuery({}, { refetchOnMountOrArgChange: true, refetchOnFocus: true });
  const { data: deletedData, refetch: refetchDeleted, isFetching: fetchingDeleted } = useGetUsersQuery({ status: 'deleted' }, { refetchOnMountOrArgChange: true, refetchOnFocus: true });
  const isFetching = fetchingActive || fetchingDeleted;

  const [updateStatus] = useUpdateUserStatusMutation();
  const [deleteUser] = useDeleteUserMutation();
  const [restoreUser] = useRestoreUserMutation();
  const [bulkAction, { isLoading: bulking }] = useBulkUserActionMutation();

  const [selected, setSelected] = useState<Set<string>>(new Set());

  const activeUsers = (activeData?.data || []) as User[];
  const deletedUsers = (deletedData?.data || []) as User[];

  const name = (u: User) => u.firstName || u.lastName ? `${u.firstName ?? ''} ${u.lastName ?? ''}`.trim() : u.email;

  const handleRefresh = () => { refetchActive(); refetchDeleted(); setSelected(new Set()); };

  const toggleSelect = (id: string) => {
    const next = new Set(selected);
    next.has(id) ? next.delete(id) : next.add(id);
    setSelected(next);
  };

  const toggleSelectAll = () => {
    if (selected.size === activeUsers.length) {
      setSelected(new Set());
    } else {
      setSelected(new Set(activeUsers.map((u) => u.id)));
    }
  };

  const handleBulk = async (action: 'suspend' | 'activate' | 'delete') => {
    const label = action === 'delete' ? 'delete' : action;
    if (!window.confirm(`${label.charAt(0).toUpperCase() + label.slice(1)} ${selected.size} user(s)?`)) return;
    await bulkAction({ ids: Array.from(selected), action });
    setSelected(new Set());
    refetchActive();
    refetchDeleted();
  };

  const handleToggleSuspend = async (id: string, current: string) => {
    await updateStatus({ id, status: current === 'active' ? 'suspended' : 'active' });
    refetchActive();
  };

  const handleDelete = async (u: User) => {
    if (!window.confirm(`Delete account for ${name(u)}?`)) return;
    await deleteUser(u.id);
    refetchActive();
    refetchDeleted();
  };

  const handleRestore = async (u: User) => {
    if (!window.confirm(`Restore account for ${name(u)}?`)) return;
    await restoreUser(u.id);
    refetchActive();
    refetchDeleted();
  };

  const handleExport = async (type: 'users' | 'applications') => {
    const url = type === 'users' ? `${API_BASE}/admin/users/export` : `${API_BASE}/admin/applications/export`;
    const res = await fetch(url, { headers: { Authorization: `Bearer ${token}` } });
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `${type}-${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(a.href);
  };

  return (
    <Box>
      <PageHeader
        title="User management"
        subtitle="Manage platform accounts and access."
        action={
          <Box sx={{ display: 'flex', gap: 1 }}>
            <Button size="small" variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} onClick={() => handleExport('users')}>
              Users CSV
            </Button>
            <Button size="small" variant="outlined" color="inherit" startIcon={<FileDownloadOutlinedIcon />} onClick={() => handleExport('applications')}>
              Apps CSV
            </Button>
            <Button size="small" variant="outlined" color="inherit" onClick={handleRefresh} disabled={isFetching}>
              {isFetching ? 'Refreshing…' : 'Refresh'}
            </Button>
          </Box>
        }
      />

      <Tabs value={tab} onChange={(_, v) => { setTab(v); setSelected(new Set()); }} sx={{ mb: 3, borderBottom: `1px solid ${t.border}` }}>
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Users {activeUsers.length > 0 && <Chip label={activeUsers.length} size="small" sx={{ height: 20, fontSize: '0.72rem', fontWeight: 600 }} />}</Box>} />
        <Tab label={<Box sx={{ display: 'flex', alignItems: 'center', gap: 1 }}>Deleted accounts {deletedUsers.length > 0 && <Chip label={deletedUsers.length} size="small" sx={{ height: 20, fontSize: '0.72rem', fontWeight: 700, bgcolor: alpha('#ef4444', 0.12), color: '#ef4444' }} />}</Box>} />
      </Tabs>

      {/* ── Active / suspended users ──────────────────────────────────── */}
      {tab === 0 && (
        <Box>
          {/* Bulk action toolbar */}
          <Collapse in={selected.size > 0}>
            <Toolbar
              sx={{
                mb: 2, borderRadius: 2, bgcolor: alpha(t.accent, 0.08),
                border: `1px solid ${alpha(t.accent, 0.25)}`, gap: 1,
              }}
            >
              <Typography variant="body2" fontWeight={600} sx={{ flex: 1 }}>
                {selected.size} selected
              </Typography>
              <Tooltip title="Suspend selected">
                <IconButton size="small" onClick={() => handleBulk('suspend')} disabled={bulking}>
                  <PauseCircleOutlineIcon fontSize="small" sx={{ color: 'warning.main' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Activate selected">
                <IconButton size="small" onClick={() => handleBulk('activate')} disabled={bulking}>
                  <PlayCircleOutlineIcon fontSize="small" sx={{ color: 'success.main' }} />
                </IconButton>
              </Tooltip>
              <Tooltip title="Delete selected">
                <IconButton size="small" onClick={() => handleBulk('delete')} disabled={bulking}>
                  <DeleteOutlineIcon fontSize="small" sx={{ color: 'error.main' }} />
                </IconButton>
              </Tooltip>
              <Button size="small" color="inherit" onClick={() => setSelected(new Set())}>Clear</Button>
            </Toolbar>
          </Collapse>

          {/* Select-all row */}
          {activeUsers.length > 0 && (
            <Box sx={{ display: 'flex', alignItems: 'center', mb: 0.5, pl: 0.5 }}>
              <Checkbox
                size="small"
                checked={selected.size === activeUsers.length && activeUsers.length > 0}
                indeterminate={selected.size > 0 && selected.size < activeUsers.length}
                onChange={toggleSelectAll}
              />
              <Typography variant="caption" color="text.secondary">Select all</Typography>
            </Box>
          )}

          {activeUsers.length === 0 && (
            <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>No users found.</Typography>
          )}
          {activeUsers.map((u, i) => (
            <FadeIn key={u.id} delay={(i % 3) as 0 | 1 | 2}>
              <PremiumCard hover={false} sx={{ mb: 1.5, outline: selected.has(u.id) ? `2px solid ${t.accent}` : 'none' }}>
                <CardContent sx={{
                  p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } },
                  display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2,
                }}>
                  <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, minWidth: 0 }}>
                    <Checkbox size="small" checked={selected.has(u.id)} onChange={() => toggleSelect(u.id)} />
                    <Box sx={{ minWidth: 0 }}>
                      <Typography fontWeight={600} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name(u)}</Typography>
                      <Typography variant="body2" color="text.secondary">{u.email}</Typography>
                      {u.createdAt && (
                        <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mt: 0.25 }}>
                          Joined {new Date(u.createdAt).toLocaleDateString()}
                        </Typography>
                      )}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexWrap: 'wrap', flexShrink: 0 }}>
                    <StatusChip status={u.role} />
                    <StatusChip status={u.status} />
                    <Button size="small" variant="outlined" color="inherit" onClick={() => handleToggleSuspend(u.id, u.status)}>
                      {u.status === 'active' ? 'Suspend' : 'Activate'}
                    </Button>
                    <Button
                      size="small" variant="outlined" color="error"
                      startIcon={<DeleteOutlineIcon sx={{ fontSize: 15 }} />}
                      onClick={() => handleDelete(u)}
                      sx={{ borderColor: alpha('#ef4444', 0.4), '&:hover': { borderColor: '#ef4444', bgcolor: alpha('#ef4444', 0.06) } }}
                    >
                      Delete
                    </Button>
                  </Box>
                </CardContent>
              </PremiumCard>
            </FadeIn>
          ))}
        </Box>
      )}

      {/* ── Deleted accounts ──────────────────────────────────────────── */}
      {tab === 1 && (
        <Box>
          {deletedUsers.length === 0 && (
            <Box sx={{ textAlign: 'center', py: 12 }}>
              <PersonOffOutlinedIcon sx={{ fontSize: 52, color: 'text.disabled', mb: 2 }} />
              <Typography variant="h6" fontWeight={600} color="text.secondary" gutterBottom>No deleted accounts</Typography>
              <Typography variant="body2" color="text.disabled">Accounts you delete will appear here and can be restored at any time.</Typography>
            </Box>
          )}
          {deletedUsers.map((u, i) => (
            <FadeIn key={u.id} delay={(i % 3) as 0 | 1 | 2}>
              <PremiumCard hover={false} sx={{ mb: 1.5, borderColor: alpha('#ef4444', 0.2), bgcolor: alpha('#ef4444', 0.025), opacity: 0.9 }}>
                <CardContent sx={{ p: { xs: 2, sm: 3 }, '&:last-child': { pb: { xs: 2, sm: 3 } }, display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: 2 }}>
                  <Box sx={{ minWidth: 0 }}>
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 0.25, flexWrap: 'wrap' }}>
                      <Typography fontWeight={600} sx={{ textDecoration: 'line-through', color: 'text.secondary', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{name(u)}</Typography>
                      <Chip label="Deleted" size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700, bgcolor: alpha('#ef4444', 0.1), color: '#ef4444', flexShrink: 0 }} />
                    </Box>
                    <Typography variant="body2" sx={{ color: 'text.disabled', textDecoration: 'line-through' }}>{u.email}</Typography>
                    <Box sx={{ display: 'flex', gap: 2.5, mt: 0.5, flexWrap: 'wrap' }}>
                      {u.createdAt && <Typography variant="caption" color="text.disabled">Joined {new Date(u.createdAt).toLocaleDateString()}</Typography>}
                      {u.deletedAt && <Typography variant="caption" sx={{ color: alpha('#ef4444', 0.65) }}>Deleted {new Date(u.deletedAt).toLocaleDateString()}</Typography>}
                    </Box>
                  </Box>
                  <Box sx={{ display: 'flex', gap: 1, alignItems: 'center', flexShrink: 0 }}>
                    <StatusChip status={u.role} />
                    <Button size="small" variant="outlined" startIcon={<RestoreIcon sx={{ fontSize: 15 }} />} onClick={() => handleRestore(u)}
                      sx={{ borderColor: alpha('#22c55e', 0.4), color: '#22c55e', '&:hover': { borderColor: '#22c55e', bgcolor: alpha('#22c55e', 0.07) } }}>
                      Restore
                    </Button>
                  </Box>
                </CardContent>
              </PremiumCard>
            </FadeIn>
          ))}
        </Box>
      )}
    </Box>
  );
}
