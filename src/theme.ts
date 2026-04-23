import { createTheme, alpha } from '@mui/material/styles';

const M3 = {
  primary: '#6750A4',
  onPrimary: '#FFFFFF',
  primaryContainer: '#EADDFF',
  onPrimaryContainer: '#21005D',

  secondary: '#625B71',
  onSecondary: '#FFFFFF',
  secondaryContainer: '#E8DEF8',
  onSecondaryContainer: '#1D192B',

  tertiary: '#7D5260',
  onTertiary: '#FFFFFF',
  tertiaryContainer: '#FFD8E4',
  onTertiaryContainer: '#31111D',

  error: '#B3261E',
  onError: '#FFFFFF',
  errorContainer: '#F9DEDC',
  onErrorContainer: '#410E0B',

  background: '#FEF7FF',
  onBackground: '#1D1B20',
  surface: '#FEF7FF',
  onSurface: '#1D1B20',
  surfaceVariant: '#E7E0EC',
  onSurfaceVariant: '#49454F',
  surfaceContainerLow: '#F7F2FA',
  surfaceContainer: '#F3EDF7',
  surfaceContainerHigh: '#ECE6F0',
  surfaceContainerHighest: '#E6E0E9',
  outline: '#79747E',
  outlineVariant: '#CAC4D0',
};

export const theme = createTheme({
  shape: { borderRadius: 16 },
  palette: {
    mode: 'light',
    primary: {
      main: M3.primary,
      contrastText: M3.onPrimary,
      light: M3.primaryContainer,
      dark: M3.onPrimaryContainer,
    },
    secondary: {
      main: M3.secondary,
      contrastText: M3.onSecondary,
      light: M3.secondaryContainer,
      dark: M3.onSecondaryContainer,
    },
    error: {
      main: M3.error,
      contrastText: M3.onError,
      light: M3.errorContainer,
      dark: M3.onErrorContainer,
    },
    background: {
      default: M3.background,
      paper: M3.surfaceContainerLow,
    },
    text: {
      primary: M3.onSurface,
      secondary: M3.onSurfaceVariant,
    },
    divider: M3.outlineVariant,
  },
  typography: {
    fontFamily:
      'Roboto, -apple-system, BlinkMacSystemFont, "Segoe UI", Helvetica, Arial, sans-serif',
    h4: { fontWeight: 500, letterSpacing: 0 },
    h5: { fontWeight: 500, letterSpacing: 0 },
    h6: { fontWeight: 500, letterSpacing: 0.15 },
    button: { textTransform: 'none', fontWeight: 500, letterSpacing: 0.1 },
  },
  components: {
    MuiPaper: {
      defaultProps: { elevation: 0 },
      styleOverrides: {
        root: {
          backgroundImage: 'none',
          backgroundColor: M3.surfaceContainerLow,
          border: `1px solid ${M3.outlineVariant}`,
        },
      },
    },
    MuiCard: {
      styleOverrides: {
        root: {
          backgroundColor: M3.surfaceContainer,
          border: `1px solid ${M3.outlineVariant}`,
          borderRadius: 16,
        },
      },
    },
    MuiButton: {
      defaultProps: { disableElevation: true },
      styleOverrides: {
        root: { borderRadius: 100, paddingInline: 20, minHeight: 40 },
      },
    },
    MuiIconButton: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiTextField: {
      defaultProps: { variant: 'outlined', size: 'small' },
    },
    MuiOutlinedInput: {
      styleOverrides: {
        root: { borderRadius: 12 },
      },
    },
    MuiChip: {
      styleOverrides: {
        root: { borderRadius: 8 },
      },
    },
    MuiTabs: {
      styleOverrides: {
        root: {
          minHeight: 48,
          borderBottom: `1px solid ${M3.outlineVariant}`,
        },
        indicator: { height: 3, borderRadius: '3px 3px 0 0' },
      },
    },
    MuiTab: {
      styleOverrides: {
        root: {
          minHeight: 48,
          textTransform: 'none',
          fontWeight: 500,
          '&.Mui-selected': { color: M3.primary },
        },
      },
    },
    MuiToggleButtonGroup: {
      styleOverrides: {
        root: {
          gap: 8,
          flexWrap: 'wrap',
        },
        grouped: {
          borderRadius: 100,
          border: `1px solid ${M3.outline}`,
          marginLeft: 0,
          '&:not(:first-of-type)': {
            borderTopLeftRadius: 100,
            borderBottomLeftRadius: 100,
            borderLeft: `1px solid ${M3.outline}`,
          },
          '&:not(:last-of-type)': {
            borderTopRightRadius: 100,
            borderBottomRightRadius: 100,
          },
        },
      },
    },
    MuiToggleButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 100,
          border: `1px solid ${M3.outline}`,
          paddingInline: 16,
          minHeight: 36,
          '&.Mui-selected': {
            backgroundColor: M3.secondaryContainer,
            color: M3.onSecondaryContainer,
            '&:hover': {
              backgroundColor: alpha(M3.secondaryContainer, 0.8),
            },
          },
        },
      },
    },
    MuiAppBar: {
      defaultProps: { elevation: 0, color: 'transparent' },
      styleOverrides: {
        root: {
          backgroundColor: M3.surface,
          borderBottom: `1px solid ${M3.outlineVariant}`,
        },
      },
    },
    MuiSlider: {
      styleOverrides: {
        root: { height: 4 },
        thumb: {
          width: 20,
          height: 20,
          '&::before': { display: 'none' },
        },
      },
    },
  },
});
