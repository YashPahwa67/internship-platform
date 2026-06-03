import { Typography, Box, Button, ListItem, ListItemText } from '@mui/material';
import { useGetNotificationsQuery, useMarkReadMutation, useMarkAllReadMutation } from '../../api/notificationApi';
import PageHeader from '../../components/ui/PageHeader';
import PremiumCard from '../../components/ui/PremiumCard';
import FadeIn from '../../components/ui/FadeIn';

export default function NotificationsPage() {
  const { data, refetch } = useGetNotificationsQuery(undefined);
  const [markRead] = useMarkReadMutation();
  const [markAllRead] = useMarkAllReadMutation();
  const notifications = data?.data || [];
  const unread = data?.meta?.unreadCount ?? 0;

  return (
    <Box>
      <PageHeader
        title="Notifications"
        subtitle={unread > 0 ? `${unread} unread` : 'You are all caught up'}
        action={
          unread > 0 ? (
            <Button size="small" variant="outlined" color="inherit" onClick={() => markAllRead(undefined).then(() => refetch())}>
              Mark all read
            </Button>
          ) : undefined
        }
      />
      {notifications.map((n: { id: string; title: string; body: string; read: boolean; createdAt: string }, i: number) => (
        <FadeIn key={n.id} delay={(i % 3) as 0 | 1 | 2}>
          <PremiumCard hover={false} sx={{ mb: 1.5, opacity: n.read ? 0.65 : 1 }}>
            <ListItem
              secondaryAction={
                !n.read && (
                  <Button size="small" onClick={() => markRead(n.id).then(() => refetch())}>Mark read</Button>
                )
              }
              sx={{ py: 2, px: 3 }}
            >
              <ListItemText
                primary={n.title}
                secondary={`${n.body} · ${new Date(n.createdAt).toLocaleString()}`}
                primaryTypographyProps={{ fontWeight: n.read ? 400 : 600 }}
              />
            </ListItem>
          </PremiumCard>
        </FadeIn>
      ))}
      {notifications.length === 0 && (
        <Typography color="text.secondary" sx={{ py: 8, textAlign: 'center' }}>No notifications yet.</Typography>
      )}
    </Box>
  );
}
