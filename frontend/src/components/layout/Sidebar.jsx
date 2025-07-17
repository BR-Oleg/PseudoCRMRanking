import {
  Box,
  List,
  ListItem,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Toolbar,
  Typography,
  Divider,
  Chip
} from '@mui/material';
import {
  Dashboard,
  TrendingUp,
  EmojiEvents,
  AccountCircle,
  People,
  Analytics,
  AttachMoney
} from '@mui/icons-material';
import { useLocation, useNavigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const Sidebar = ({ onClose }) => {
  const location = useLocation();
  const navigate = useNavigate();
  const { user, isAdmin } = useAuth();

  const menuItems = [
    {
      text: 'Dashboard',
      icon: <Dashboard />,
      path: '/dashboard',
      color: '#1976d2'
    },
    {
      text: 'Vendas',
      icon: <AttachMoney />,
      path: '/sales',
      color: '#4caf50'
    },
    {
      text: 'Ranking',
      icon: <Analytics />,
      path: '/ranking',
      color: '#ff9800'
    },
    {
      text: 'Conquistas',
      icon: <EmojiEvents />,
      path: '/achievements',
      color: '#9c27b0'
    },
    {
      text: 'Perfil',
      icon: <AccountCircle />,
      path: '/profile',
      color: '#2196f3'
    }
  ];

  // Adicionar item de usuários apenas para admin
  if (isAdmin()) {
    menuItems.push({
      text: 'Usuários',
      icon: <People />,
      path: '/users',
      color: '#f44336',
      adminOnly: true
    });
  }

  const handleNavigation = (path) => {
    navigate(path);
    if (onClose) {
      onClose();
    }
  };

  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
      {/* Header da sidebar */}
      <Toolbar sx={{ px: 3 }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <TrendingUp color="primary" sx={{ fontSize: 32 }} />
          <Box>
            <Typography variant="h6" fontWeight="bold" color="primary">
              Sales Game
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Versão 1.0
            </Typography>
          </Box>
        </Box>
      </Toolbar>

      <Divider />

      {/* Informações do usuário */}
      <Box sx={{ p: 2, bgcolor: 'grey.50' }}>
        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
          <Box
            sx={{
              width: 40,
              height: 40,
              borderRadius: '50%',
              bgcolor: 'primary.main',
              color: 'white',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontWeight: 'bold'
            }}
          >
            {user?.name?.charAt(0).toUpperCase()}
          </Box>
          <Box sx={{ flex: 1, minWidth: 0 }}>
            <Typography variant="subtitle2" fontWeight="bold" noWrap>
              {user?.name}
            </Typography>
            <Typography variant="caption" color="text.secondary" noWrap>
              {user?.department || 'Vendas'}
            </Typography>
            <Box sx={{ mt: 0.5 }}>
              <Chip
                size="small"
                label={user?.role}
                color={user?.role === 'Administrador' ? 'secondary' : 'primary'}
                sx={{ height: 20, fontSize: '0.6rem' }}
              />
            </Box>
          </Box>
        </Box>

        {/* Estatísticas rápidas */}
        <Box sx={{ mt: 2, display: 'flex', gap: 1 }}>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="primary" fontWeight="bold">
              {user?.level || 1}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Nível
            </Typography>
          </Box>
          <Box sx={{ flex: 1, textAlign: 'center' }}>
            <Typography variant="h6" color="success.main" fontWeight="bold">
              {user?.totalSales ? `R$ ${user.totalSales.toLocaleString()}` : 'R$ 0'}
            </Typography>
            <Typography variant="caption" color="text.secondary">
              Total
            </Typography>
          </Box>
        </Box>
      </Box>

      <Divider />

      {/* Menu de navegação */}
      <List sx={{ flex: 1, py: 1 }}>
        {menuItems.map((item) => (
          <ListItem key={item.path} disablePadding>
            <ListItemButton
              selected={location.pathname === item.path}
              onClick={() => handleNavigation(item.path)}
              sx={{
                mx: 1,
                borderRadius: 2,
                '&.Mui-selected': {
                  bgcolor: `${item.color}15`,
                  color: item.color,
                  '& .MuiListItemIcon-root': {
                    color: item.color
                  }
                },
                '&:hover': {
                  bgcolor: `${item.color}08`
                }
              }}
            >
              <ListItemIcon
                sx={{
                  color: location.pathname === item.path ? item.color : 'text.secondary',
                  minWidth: 40
                }}
              >
                {item.icon}
              </ListItemIcon>
              <ListItemText
                primary={item.text}
                primaryTypographyProps={{
                  fontWeight: location.pathname === item.path ? 600 : 400
                }}
              />
              {item.adminOnly && (
                <Chip
                  size="small"
                  label="Admin"
                  color="secondary"
                  sx={{ height: 18, fontSize: '0.6rem' }}
                />
              )}
            </ListItemButton>
          </ListItem>
        ))}
      </List>

      <Divider />

      {/* Footer da sidebar */}
      <Box sx={{ p: 2, textAlign: 'center' }}>
        <Typography variant="caption" color="text.secondary">
          © 2024 Sales Gamification
        </Typography>
      </Box>
    </Box>
  );
};

export default Sidebar;