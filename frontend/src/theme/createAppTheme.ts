import { createTheme, alpha } from '@mui/material/styles';
import type { ThemeOptions } from '@mui/material/styles';
import { tokens, motion } from './designTokens';

type Mode = 'light' | 'dark';

export function createAppTheme(mode: Mode) {
  const t = tokens[mode];
  const isLight = mode === 'light';

  const themeOptions: ThemeOptions = {
    palette: {
      mode,
      primary: {
        main: isLight ? '#0A0A0A' : '#FAFAFA',
        contrastText: isLight ? '#FFFFFF' : '#0A0A0A',
      },
      secondary: {
        main: t.accent,
        contrastText: '#FFFFFF',
      },
      background: {
        default: t.bg,
        paper: isLight ? '#FFFFFF' : t.bgElevated,
      },
      text: {
        primary: t.text,
        secondary: t.textSecondary,
        disabled: t.textMuted,
      },
      divider: t.border,
      success: { main: isLight ? '#171717' : '#E5E5E5' },
      error: { main: isLight ? '#DC2626' : '#F87171' },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 700, letterSpacing: '-0.03em', lineHeight: 1.1 },
      h2: { fontWeight: 700, letterSpacing: '-0.025em', lineHeight: 1.15 },
      h3: { fontWeight: 600, letterSpacing: '-0.02em' },
      h4: { fontWeight: 600, letterSpacing: '-0.015em' },
      h5: { fontWeight: 600, letterSpacing: '-0.01em' },
      h6: { fontWeight: 600 },
      body1: { lineHeight: 1.6 },
      body2: { lineHeight: 1.55 },
      button: { fontWeight: 600, letterSpacing: '-0.01em' },
    },
    shape: { borderRadius: 12 },
    transitions: {
      duration: { shortest: 150, shorter: 200, short: 250, standard: 300 },
      easing: { easeInOut: motion.ease, easeOut: motion.easeOut },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollBehavior: 'smooth' },
          body: {
            backgroundColor: t.bg,
            color: t.text,
          },
          '::selection': {
            backgroundColor: alpha(t.accent, 0.2),
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            padding: '10px 20px',
            fontWeight: 600,
            transition: `all ${motion.duration} ${motion.easeOut}`,
          },
          contained: {
            boxShadow: 'none',
            '&:hover': {
              boxShadow: t.shadowMd,
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)' },
          },
          outlined: {
            borderColor: t.border,
            '&:hover': {
              borderColor: t.text,
              backgroundColor: alpha(t.text, 0.04),
            },
          },
          text: {
            '&:hover': { backgroundColor: alpha(t.text, 0.05) },
          },
        },
      },
      MuiCard: {
        styleOverrides: {
          root: {
            borderRadius: 16,
            border: `1px solid ${t.border}`,
            boxShadow: 'none',
            backgroundImage: 'none',
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              transition: `border-color ${motion.duration} ${motion.ease}`,
              '&:hover fieldset': { borderColor: t.textMuted },
              '&.Mui-focused fieldset': { borderColor: t.text, borderWidth: 1 },
            },
          },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 8,
          },
          filled: {
            backgroundColor: isLight ? t.bgMuted : t.bgElevated,
            color: t.text,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: {
            backgroundImage: 'none',
          },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: {
            borderRight: `1px solid ${t.border}`,
          },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '2px 8px',
            transition: `all ${motion.duration} ${motion.ease}`,
            '&.Mui-selected': {
              backgroundColor: isLight ? t.bgMuted : t.bgElevated,
              '&:hover': {
                backgroundColor: isLight ? t.bgMuted : t.bgElevated,
              },
            },
          },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12 },
        },
      },
    },
  };

  return createTheme(themeOptions);
}
