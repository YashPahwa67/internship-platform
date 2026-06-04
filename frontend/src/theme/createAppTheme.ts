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
        main: t.accent,
        dark: t.accentDark,
        contrastText: '#FFFFFF',
      },
      secondary: {
        main: isLight ? '#0A0A0A' : '#F5F5F7',
        contrastText: isLight ? '#FFFFFF' : '#0A0A0A',
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
      success: { main: '#16A34A', light: '#22C55E', dark: '#15803D' },
      error: { main: isLight ? '#DC2626' : '#F87171' },
      warning: { main: '#D97706', light: '#F59E0B' },
      info: { main: t.accent },
    },
    typography: {
      fontFamily: '"Inter", -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif',
      h1: { fontWeight: 800, letterSpacing: '-0.04em', lineHeight: 1.08 },
      h2: { fontWeight: 700, letterSpacing: '-0.035em', lineHeight: 1.12 },
      h3: { fontWeight: 700, letterSpacing: '-0.028em', lineHeight: 1.2 },
      h4: { fontWeight: 700, letterSpacing: '-0.022em', lineHeight: 1.25 },
      h5: { fontWeight: 600, letterSpacing: '-0.015em' },
      h6: { fontWeight: 600, letterSpacing: '-0.01em' },
      subtitle1: { fontWeight: 500, lineHeight: 1.5 },
      subtitle2: { fontWeight: 500 },
      body1: { lineHeight: 1.65 },
      body2: { lineHeight: 1.6 },
      button: { fontWeight: 600, letterSpacing: '-0.01em' },
      overline: { fontWeight: 600, letterSpacing: '0.1em', fontSize: '0.7rem' },
      caption: { color: t.textMuted },
    },
    shape: { borderRadius: 12 },
    transitions: {
      duration: { shortest: 120, shorter: 180, short: 220, standard: 280 },
      easing: { easeInOut: motion.ease, easeOut: motion.easeOut },
    },
    components: {
      MuiCssBaseline: {
        styleOverrides: {
          html: { scrollBehavior: 'smooth', overflowX: 'hidden' },
          body: {
            backgroundColor: t.bg,
            color: t.text,
            overflowX: 'hidden',
            WebkitFontSmoothing: 'antialiased',
            MozOsxFontSmoothing: 'grayscale',
          },
          '::selection': {
            backgroundColor: alpha(t.accent, 0.18),
          },
        },
      },
      MuiButton: {
        defaultProps: { disableElevation: true },
        styleOverrides: {
          root: {
            textTransform: 'none',
            borderRadius: 10,
            padding: '9px 20px',
            fontWeight: 600,
            fontSize: '0.9375rem',
            transition: `all ${motion.duration} ${motion.easeOut}`,
            letterSpacing: '-0.01em',
          },
          sizeSmall: { padding: '6px 14px', fontSize: '0.8125rem', borderRadius: 8 },
          sizeLarge: { padding: '12px 28px', fontSize: '1rem', borderRadius: 12 },
          contained: {
            background: t.accentGradient,
            boxShadow: 'none',
            '&:hover': {
              background: t.accentGradient,
              boxShadow: t.shadowAccent,
              transform: 'translateY(-1px)',
            },
            '&:active': { transform: 'translateY(0)', boxShadow: 'none' },
          },
          containedSecondary: {
            background: isLight ? '#0A0A0A' : '#F5F5F7',
            '&:hover': {
              background: isLight ? '#262626' : '#E5E5E5',
              boxShadow: t.shadowMd,
            },
          },
          outlined: {
            borderColor: t.border,
            color: t.text,
            '&:hover': {
              borderColor: t.accent,
              backgroundColor: t.accentMuted,
              color: t.accent,
            },
          },
          text: {
            color: t.textSecondary,
            '&:hover': { backgroundColor: alpha(t.text, 0.05), color: t.text },
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
            transition: `all ${motion.durationMd} ${motion.easeOut}`,
          },
        },
      },
      MuiPaper: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
          elevation1: { boxShadow: t.shadowSm },
          elevation2: { boxShadow: t.shadowMd },
          elevation3: { boxShadow: t.shadowLg },
        },
      },
      MuiTextField: {
        styleOverrides: {
          root: {
            '& .MuiOutlinedInput-root': {
              borderRadius: 10,
              fontSize: '0.9375rem',
              transition: `border-color ${motion.duration} ${motion.ease}`,
              '& fieldset': { borderColor: t.border, transition: `border-color ${motion.duration}` },
              '&:hover fieldset': { borderColor: t.textMuted },
              '&.Mui-focused fieldset': { borderColor: t.accent, borderWidth: 1.5 },
            },
            '& .MuiInputLabel-root.Mui-focused': { color: t.accent },
          },
        },
      },
      MuiOutlinedInput: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiSelect: {
        styleOverrides: {
          root: { borderRadius: 10 },
        },
      },
      MuiChip: {
        styleOverrides: {
          root: {
            fontWeight: 500,
            borderRadius: 8,
            fontSize: '0.8125rem',
            transition: `all ${motion.duration} ${motion.easeOut}`,
          },
          filled: {
            backgroundColor: isLight ? t.bgSubtle : t.bgElevated,
            color: t.text,
            '&:hover': { backgroundColor: isLight ? '#EBEBEB' : '#212126' },
          },
          outlined: {
            borderColor: t.border,
            '&:hover': { borderColor: t.accent, backgroundColor: t.accentMuted, color: t.accent },
          },
          colorPrimary: {
            backgroundColor: t.accentMuted,
            color: t.accent,
            border: `1px solid ${alpha(t.accent, 0.2)}`,
          },
        },
      },
      MuiAppBar: {
        styleOverrides: {
          root: { backgroundImage: 'none' },
        },
      },
      MuiDrawer: {
        styleOverrides: {
          paper: { borderRight: `1px solid ${t.sidebarBorder}` },
        },
      },
      MuiListItemButton: {
        styleOverrides: {
          root: {
            borderRadius: 10,
            margin: '1px 8px',
            transition: `all ${motion.duration} ${motion.ease}`,
            '&.Mui-selected': {
              backgroundColor: isLight ? alpha(t.accent, 0.07) : alpha(t.accent, 0.12),
              color: t.accent,
              '& .MuiListItemIcon-root': { color: t.accent },
              '&:hover': {
                backgroundColor: isLight ? alpha(t.accent, 0.1) : alpha(t.accent, 0.15),
              },
            },
            '&:hover': {
              backgroundColor: isLight ? t.bgSubtle : alpha(t.text, 0.05),
            },
          },
        },
      },
      MuiListItemIcon: {
        styleOverrides: {
          root: { minWidth: 38, color: t.textMuted },
        },
      },
      MuiAlert: {
        styleOverrides: {
          root: { borderRadius: 12, fontSize: '0.9rem' },
          standardWarning: {
            backgroundColor: alpha('#D97706', 0.08),
            color: isLight ? '#92400E' : '#FCD34D',
          },
          standardError: {
            backgroundColor: alpha('#DC2626', 0.07),
            color: isLight ? '#991B1B' : '#FCA5A5',
          },
          standardSuccess: {
            backgroundColor: alpha('#16A34A', 0.07),
            color: isLight ? '#14532D' : '#86EFAC',
          },
        },
      },
      MuiDivider: {
        styleOverrides: {
          root: { borderColor: t.border },
        },
      },
      MuiTooltip: {
        styleOverrides: {
          tooltip: {
            borderRadius: 8,
            fontSize: '0.8125rem',
            padding: '6px 12px',
            backgroundColor: isLight ? '#1A1A1A' : '#F5F5F7',
            color: isLight ? '#FFFFFF' : '#0A0A0B',
          },
          arrow: { color: isLight ? '#1A1A1A' : '#F5F5F7' },
        },
      },
      MuiAvatar: {
        styleOverrides: {
          root: {
            background: t.accentGradient,
            color: '#FFFFFF',
            fontWeight: 700,
          },
        },
      },
      MuiBadge: {
        styleOverrides: {
          badge: {
            fontWeight: 700,
            fontSize: '0.65rem',
            minWidth: 17,
            height: 17,
            borderRadius: 9,
            border: `2px solid ${t.bg}`,
          },
        },
      },
      MuiLinearProgress: {
        styleOverrides: {
          root: {
            borderRadius: 99,
            backgroundColor: t.accentMuted,
            height: 6,
          },
          bar: {
            borderRadius: 99,
            background: t.accentGradient,
          },
        },
      },
      MuiSkeleton: {
        styleOverrides: {
          root: {
            borderRadius: 8,
            backgroundColor: isLight ? 'rgba(0,0,0,0.06)' : 'rgba(255,255,255,0.06)',
          },
        },
      },
      MuiTab: {
        styleOverrides: {
          root: {
            textTransform: 'none',
            fontWeight: 500,
            fontSize: '0.9375rem',
            letterSpacing: '-0.01em',
            minHeight: 48,
          },
        },
      },
      MuiTabs: {
        styleOverrides: {
          indicator: {
            height: 2,
            borderRadius: 2,
            background: t.accentGradient,
          },
        },
      },
      MuiTableHead: {
        styleOverrides: {
          root: {
            '& .MuiTableCell-root': {
              fontWeight: 600,
              fontSize: '0.8125rem',
              color: t.textSecondary,
              backgroundColor: isLight ? t.bgMuted : t.bgElevated,
              textTransform: 'uppercase',
              letterSpacing: '0.06em',
            },
          },
        },
      },
      MuiTableRow: {
        styleOverrides: {
          root: {
            '&:hover': { backgroundColor: isLight ? t.bgMuted : alpha(t.text, 0.03) },
            '& .MuiTableCell-root': { borderColor: t.borderSubtle },
          },
        },
      },
    },
  };

  return createTheme(themeOptions);
}
