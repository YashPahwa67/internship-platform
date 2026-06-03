import { useState } from 'react';
import { Container, Typography, TextField, Button, Alert, Box, Grid, CardContent } from '@mui/material';
import FadeIn from '../../components/ui/FadeIn';
import PremiumCard from '../../components/ui/PremiumCard';
import { useThemeMode } from '../../theme/ThemeProvider';
import { tokens } from '../../theme/designTokens';

export default function ContactPage() {
  const [sent, setSent] = useState(false);
  const { mode } = useThemeMode();
  const t = tokens[mode];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSent(true);
  };

  return (
    <Container maxWidth="md" sx={{ py: { xs: 6, md: 10 } }}>
      <FadeIn>
        <Typography variant="h3" fontWeight={700} letterSpacing="-0.03em" gutterBottom>
          Contact us
        </Typography>
        <Typography color="text.secondary" sx={{ mb: 4, maxWidth: 480 }}>
          Have questions? We&apos;d love to hear from you.
        </Typography>
      </FadeIn>
      <Grid container spacing={4}>
        <Grid item xs={12} md={7}>
          <FadeIn delay={1}>
            <PremiumCard hover={false}>
              <CardContent sx={{ p: { xs: 3, md: 4 } }}>
                {sent && <Alert severity="success" sx={{ mb: 3 }}>Message sent. We&apos;ll get back to you soon.</Alert>}
                <Box component="form" onSubmit={handleSubmit}>
                  <TextField fullWidth label="Name" margin="normal" required />
                  <TextField fullWidth label="Email" type="email" margin="normal" required />
                  <TextField fullWidth label="Subject" margin="normal" required />
                  <TextField fullWidth label="Message" multiline rows={4} margin="normal" required />
                  <Button type="submit" variant="contained" size="large" sx={{ mt: 2 }}>
                    Send message
                  </Button>
                </Box>
              </CardContent>
            </PremiumCard>
          </FadeIn>
        </Grid>
        <Grid item xs={12} md={5}>
          <FadeIn delay={2}>
            <Box sx={{ p: 3, borderRadius: 3, bgcolor: t.bgMuted, border: `1px solid ${t.border}` }}>
              <Typography variant="overline" color="text.secondary">Office</Typography>
              <Typography fontWeight={500} sx={{ mt: 1 }}>123 Tech Park</Typography>
              <Typography color="text.secondary">Bangalore, India</Typography>
              <Typography variant="overline" color="text.secondary" sx={{ display: 'block', mt: 3 }}>Email</Typography>
              <Typography fontWeight={500}>hello@imp.com</Typography>
            </Box>
          </FadeIn>
        </Grid>
      </Grid>
    </Container>
  );
}
