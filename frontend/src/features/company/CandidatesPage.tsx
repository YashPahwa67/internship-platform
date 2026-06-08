import { useState } from 'react';
import {
  Typography, CardContent, Box, Button, Dialog, DialogTitle,
  DialogContent, DialogActions, TextField, Chip, alpha,
} from '@mui/material';
import PersonOutlineIcon from '@mui/icons-material/PersonOutline';
import DragIndicatorIcon from '@mui/icons-material/DragIndicator';
import {
  DndContext, DragOverlay, PointerSensor, useSensor, useSensors,
  useDroppable, useDraggable, type DragEndEvent, type DragStartEvent,
} from '@dnd-kit/core';
import { useGetApplicationsQuery, useUpdateApplicationStatusMutation } from '../../api/applicationApi';
import { useCreateTaskMutation } from '../../api/taskApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import CandidateProfileView, { type CandidateProfile } from '../../components/company/CandidateProfileView';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

const COLUMNS: { id: string; label: string; color: string }[] = [
  { id: 'applied',              label: 'Applied',            color: '#6b7280' },
  { id: 'shortlisted',          label: 'Shortlisted',        color: '#3d63f8' },
  { id: 'interview_scheduled',  label: 'Interview',          color: '#8b5cf6' },
  { id: 'offered',              label: 'Offered',            color: '#f59e0b' },
  { id: 'rejected',             label: 'Rejected',           color: '#ef4444' },
];

const VALID_TRANSITIONS: Record<string, string[]> = {
  applied:             ['shortlisted', 'rejected'],
  shortlisted:         ['interview_scheduled', 'rejected'],
  interview_scheduled: ['offered', 'rejected'],
  offered:             ['rejected'],
};

type ApplicationRow = {
  id: string; status: string; coverLetter?: string;
  resumeAtApplication?: { url?: string; filename?: string };
  student?: CandidateProfile; internship?: { title: string };
};

// ── Droppable column ────────────────────────────────────────────────────────
function KanbanColumn({ col, cards, onViewProfile, onAssignTask, t, mode }: {
  col: typeof COLUMNS[0];
  cards: ApplicationRow[];
  onViewProfile: (id: string) => void;
  onAssignTask: (id: string, name: string) => void;
  t: (typeof tokens)[keyof typeof tokens];
  mode: string;
}) {
  const { setNodeRef, isOver } = useDroppable({ id: col.id });

  return (
    <Box
      ref={setNodeRef}
      sx={{
        minWidth: 260, width: 260, flexShrink: 0,
        bgcolor: isOver ? alpha(col.color, 0.06) : (mode === 'dark' ? 'rgba(255,255,255,0.025)' : '#f9fafb'),
        border: `1.5px solid ${isOver ? alpha(col.color, 0.35) : t.border}`,
        borderRadius: '14px',
        transition: 'all 0.15s',
        display: 'flex', flexDirection: 'column',
      }}
    >
      {/* Column header */}
      <Box sx={{ px: 2, pt: 2, pb: 1.5, display: 'flex', alignItems: 'center', gap: 1 }}>
        <Box sx={{ width: 8, height: 8, borderRadius: '50%', bgcolor: col.color, flexShrink: 0 }} />
        <Typography variant="subtitle2" fontWeight={700} sx={{ flex: 1, fontSize: '0.8125rem' }}>
          {col.label}
        </Typography>
        <Chip label={cards.length} size="small" sx={{ height: 20, fontSize: '0.7rem', fontWeight: 700 }} />
      </Box>

      {/* Cards */}
      <Box sx={{ px: 1.5, pb: 1.5, display: 'flex', flexDirection: 'column', gap: 1, minHeight: 80 }}>
        {cards.map((app) => (
          <DraggableCard
            key={app.id}
            app={app}
            onViewProfile={onViewProfile}
            onAssignTask={onAssignTask}
            t={t}
          />
        ))}
        {cards.length === 0 && (
          <Box sx={{ py: 4, textAlign: 'center', color: 'text.disabled', fontSize: '0.75rem' }}>
            Drop here
          </Box>
        )}
      </Box>
    </Box>
  );
}

// ── Draggable card ──────────────────────────────────────────────────────────
function DraggableCard({ app, onViewProfile, onAssignTask, t, isDragOverlay = false }: {
  app: ApplicationRow;
  onViewProfile: (id: string) => void;
  onAssignTask: (id: string, name: string) => void;
  t: (typeof tokens)[keyof typeof tokens];
  isDragOverlay?: boolean;
}) {
  const { attributes, listeners, setNodeRef, isDragging } = useDraggable({ id: app.id });
  const canDrag = VALID_TRANSITIONS[app.status]?.length > 0;

  return (
    <PremiumCard
      ref={!isDragOverlay ? setNodeRef : undefined}
      hover={false}
      sx={{
        opacity: isDragging ? 0.35 : 1,
        cursor: isDragOverlay ? 'grabbing' : (canDrag ? 'grab' : 'default'),
        transition: 'opacity 0.15s, box-shadow 0.15s',
        ...(isDragOverlay && { boxShadow: t.shadowLg, rotate: '2deg' }),
        userSelect: 'none',
      }}
    >
      <CardContent sx={{ p: 2, '&:last-child': { pb: 2 } }}>
        <Box sx={{ display: 'flex', alignItems: 'flex-start', gap: 0.75, mb: 1 }}>
          {canDrag && (
            <Box
              {...attributes}
              {...listeners}
              sx={{ color: 'text.disabled', mt: '1px', flexShrink: 0, touchAction: 'none', cursor: 'grab' }}
            >
              <DragIndicatorIcon sx={{ fontSize: 16 }} />
            </Box>
          )}
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="body2" fontWeight={700} sx={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {app.student?.name || 'Candidate'}
            </Typography>
            <Typography variant="caption" color="text.secondary" sx={{ display: 'block', overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
              {app.internship?.title || '—'}
            </Typography>
          </Box>
        </Box>

        {app.student?.college && (
          <Typography variant="caption" color="text.disabled" sx={{ display: 'block', mb: 1.25, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
            {app.student.college}
          </Typography>
        )}

        <Box sx={{ display: 'flex', gap: 0.75, flexWrap: 'wrap' }}>
          <Button
            size="small"
            variant="outlined"
            color="inherit"
            startIcon={<PersonOutlineIcon sx={{ fontSize: 13 }} />}
            onClick={() => onViewProfile(app.id)}
            sx={{ fontSize: '0.7rem', py: 0.3, px: 1, height: 26, minWidth: 'auto' }}
          >
            Profile
          </Button>
          {['offered', 'accepted', 'active'].includes(app.status) && (
            <Button
              size="small"
              variant="outlined"
              color="inherit"
              onClick={() => onAssignTask(app.id, app.student?.name || '')}
              sx={{ fontSize: '0.7rem', py: 0.3, px: 1, height: 26, minWidth: 'auto' }}
            >
              Assign task
            </Button>
          )}
        </Box>
      </CardContent>
    </PremiumCard>
  );
}

// ── Main page ───────────────────────────────────────────────────────────────
export default function CandidatesPage() {
  const { data, refetch, isFetching } = useGetApplicationsQuery({}, {
    refetchOnMountOrArgChange: true, refetchOnFocus: true, refetchOnReconnect: true,
  });
  const [updateStatus] = useUpdateApplicationStatusMutation();
  const [createTask] = useCreateTaskMutation();
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const [profileDialogId, setProfileDialogId] = useState<string | null>(null);
  const [taskDialog, setTaskDialog] = useState<{ applicationId: string; name: string } | null>(null);
  const [taskForm, setTaskForm] = useState({ title: '', description: '', deadline: '' });
  const [activeId, setActiveId] = useState<string | null>(null);

  const applications = (data?.data || []) as ApplicationRow[];
  const byColumn = Object.fromEntries(COLUMNS.map((c) => [c.id, applications.filter((a) => a.status === c.id)]));
  const activeApp = activeId ? applications.find((a) => a.id === activeId) : null;
  const profileDialog = profileDialogId ? applications.find((a) => a.id === profileDialogId) : null;

  const sensors = useSensors(
    useSensor(PointerSensor, { activationConstraint: { distance: 6 } })
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveId(active.id as string);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveId(null);
    if (!over) return;
    const app = applications.find((a) => a.id === active.id);
    if (!app) return;
    const targetCol = over.id as string;
    if (targetCol === app.status) return;
    const allowed = VALID_TRANSITIONS[app.status] || [];
    if (!allowed.includes(targetCol)) return;
    await updateStatus({ id: app.id, status: targetCol });
    refetch();
  };

  const handleCreateTask = async () => {
    if (!taskDialog) return;
    await createTask({
      applicationId: taskDialog.applicationId,
      title: taskForm.title,
      description: taskForm.description,
      deadline: taskForm.deadline || undefined,
    });
    setTaskDialog(null);
    setTaskForm({ title: '', description: '', deadline: '' });
  };

  return (
    <Box>
      <PageHeader
        title="Candidates"
        subtitle="Drag cards between columns to move candidates through the pipeline."
        action={
          <Button size="small" variant="outlined" color="inherit" onClick={() => refetch()} disabled={isFetching}>
            {isFetching ? 'Refreshing…' : 'Refresh'}
          </Button>
        }
      />

      {applications.length === 0 && !isFetching && (
        <Typography color="text.secondary" sx={{ py: 6, textAlign: 'center' }}>No applications yet.</Typography>
      )}

      <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
        <Box sx={{ display: 'flex', gap: 2, overflowX: 'auto', pb: 2, alignItems: 'flex-start' }}>
          {COLUMNS.map((col) => (
            <KanbanColumn
              key={col.id}
              col={col}
              cards={byColumn[col.id] || []}
              onViewProfile={(id) => setProfileDialogId(id)}
              onAssignTask={(id, name) => setTaskDialog({ applicationId: id, name })}
              t={t}
              mode={mode}
            />
          ))}
        </Box>

        <DragOverlay>
          {activeApp && (
            <DraggableCard
              app={activeApp}
              onViewProfile={() => {}}
              onAssignTask={() => {}}
              t={t}
              isDragOverlay
            />
          )}
        </DragOverlay>
      </DndContext>

      {/* Profile dialog */}
      <Dialog open={!!profileDialogId} onClose={() => setProfileDialogId(null)} maxWidth="md" fullWidth PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${t.border}` } }}>
        <DialogTitle fontWeight={600}>{profileDialog?.student?.name || 'Candidate profile'}</DialogTitle>
        <DialogContent dividers>
          {profileDialog && (
            <CandidateProfileView
              student={profileDialog.student}
              coverLetter={profileDialog.coverLetter}
              resumeAtApplication={profileDialog.resumeAtApplication}
            />
          )}
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setProfileDialogId(null)} color="inherit">Close</Button>
        </DialogActions>
      </Dialog>

      {/* Assign task dialog */}
      <Dialog open={!!taskDialog} onClose={() => setTaskDialog(null)} PaperProps={{ sx: { borderRadius: 3, border: `1px solid ${t.border}` } }}>
        <DialogTitle fontWeight={600}>Assign task — {taskDialog?.name}</DialogTitle>
        <DialogContent>
          <TextField fullWidth label="Title" value={taskForm.title} onChange={(e) => setTaskForm({ ...taskForm, title: e.target.value })} margin="normal" />
          <TextField fullWidth label="Description" multiline rows={3} value={taskForm.description} onChange={(e) => setTaskForm({ ...taskForm, description: e.target.value })} margin="normal" />
          <TextField fullWidth type="date" label="Deadline" InputLabelProps={{ shrink: true }} value={taskForm.deadline} onChange={(e) => setTaskForm({ ...taskForm, deadline: e.target.value })} margin="normal" />
        </DialogContent>
        <DialogActions sx={{ px: 3, pb: 2 }}>
          <Button onClick={() => setTaskDialog(null)} color="inherit">Cancel</Button>
          <Button variant="contained" onClick={handleCreateTask} disabled={!taskForm.title}>Create</Button>
        </DialogActions>
      </Dialog>
    </Box>
  );
}
