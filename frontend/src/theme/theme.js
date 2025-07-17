import { createTheme } from '@mui/material/styles';

// Paleta de cores personalizada para gamificação
const primaryColor = '#1976d2'; // Azul principal
const secondaryColor = '#ff9800'; // Laranja para conquistas
const errorColor = '#f44336';
const warningColor = '#ff9800';
const infoColor = '#2196f3';
const successColor = '#4caf50';

// Cores para raridade de conquistas
export const rarityColors = {
  Comum: '#90a4ae',     // Cinza
  Raro: '#2196f3',      // Azul
  Épico: '#9c27b0',     // Roxo
  Lendário: '#ff9800'   // Dourado
};

// Cores para status de vendas
export const statusColors = {
  Pendente: '#ff9800',
  Confirmada: '#4caf50',
  Cancelada: '#f44336',
  Reembolsada: '#9c27b0'
};

const theme = createTheme({
  palette: {
    primary: {
      main: primaryColor,
      light: '#63a4ff',
      dark: '#004ba0',
      contrastText: '#ffffff'
    },
    secondary: {
      main: secondaryColor,
      light: '#ffcc02',
      dark: '#c66900',
      contrastText: '#000000'
    },
    error: {
      main: errorColor,
      light: '#ff7961',
      dark: '#ba000d'
    },
    warning: {
      main: warningColor,
      light: '#ffcc02',
      dark: '#c66900'
    },
    info: {
      main: infoColor,
      light: '#6ec6ff',
      dark: '#0069c0'
    },
    success: {
      main: successColor,
      light: '#80e27e',
      dark: '#087f23'
    },
    background: {
      default: '#f5f5f5',
      paper: '#ffffff'
    },
    text: {
      primary: '#212121',
      secondary: '#757575'
    }
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h1: {
      fontSize: '2.5rem',
      fontWeight: 600,
      lineHeight: 1.2
    },
    h2: {
      fontSize: '2rem',
      fontWeight: 600,
      lineHeight: 1.3
    },
    h3: {
      fontSize: '1.75rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h4: {
      fontSize: '1.5rem',
      fontWeight: 600,
      lineHeight: 1.4
    },
    h5: {
      fontSize: '1.25rem',
      fontWeight: 600,
      lineHeight: 1.5
    },
    h6: {
      fontSize: '1rem',
      fontWeight: 600,
      lineHeight: 1.6
    },
    subtitle1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.75
    },
    subtitle2: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.57
    },
    body1: {
      fontSize: '1rem',
      fontWeight: 400,
      lineHeight: 1.5
    },
    body2: {
      fontSize: '0.875rem',
      fontWeight: 400,
      lineHeight: 1.43
    },
    button: {
      fontSize: '0.875rem',
      fontWeight: 500,
      lineHeight: 1.75,
      textTransform: 'none'
    }
  },
  shape: {
    borderRadius: 8
  },
  spacing: 8,
  components: {
    MuiButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          textTransform: 'none',
          fontWeight: 500,
          boxShadow: 'none',
          '&:hover': {
            boxShadow: '0 2px 8px rgba(0,0,0,0.15)'
          }
        },
        contained: {
          '&:hover': {
            boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
          }
        }
      }
    },
    MuiCard: {
      styleOverrides: {
        root: {
          borderRadius: 12,
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
          '&:hover': {
            boxShadow: '0 4px 20px rgba(0,0,0,0.12)'
          },
          transition: 'box-shadow 0.3s ease-in-out'
        }
      }
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          borderRadius: 8
        },
        elevation1: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        },
        elevation2: {
          boxShadow: '0 4px 12px rgba(0,0,0,0.15)'
        }
      }
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            borderRadius: 8
          }
        }
      }
    },
    MuiChip: {
      styleOverrides: {
        root: {
          borderRadius: 16,
          fontWeight: 500
        }
      }
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          boxShadow: '0 2px 8px rgba(0,0,0,0.1)'
        }
      }
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          borderRadius: 0,
          borderRight: '1px solid rgba(0,0,0,0.12)'
        }
      }
    },
    MuiListItemButton: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '2px 8px',
          '&.Mui-selected': {
            backgroundColor: 'rgba(25, 118, 210, 0.08)',
            '&:hover': {
              backgroundColor: 'rgba(25, 118, 210, 0.12)'
            }
          }
        }
      }
    }
  }
});

export default theme;