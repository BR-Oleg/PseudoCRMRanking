import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { ThemeProvider } from '@mui/material/styles';
import { CssBaseline } from '@mui/material';
import { Toaster } from 'react-hot-toast';
import theme from './theme/theme';
import { AuthProvider } from './contexts/AuthContext';

// Components
import ProtectedRoute from './components/auth/ProtectedRoute';
import Layout from './components/layout/Layout';
import LoadingScreen from './components/common/LoadingScreen';

// Pages
import LoginPage from './pages/LoginPage';
import RegisterPage from './pages/RegisterPage';
import DashboardPage from './pages/DashboardPage';
import SalesPage from './pages/SalesPage';
import RankingPage from './pages/RankingPage';
import AchievementsPage from './pages/AchievementsPage';
import ProfilePage from './pages/ProfilePage';
import UsersPage from './pages/UsersPage';
import NotFoundPage from './pages/NotFoundPage';

function App() {
  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <AuthProvider>
        <Router>
          <div className="App">
            <Routes>
              {/* Rotas públicas */}
              <Route path="/login" element={<LoginPage />} />
              <Route path="/register" element={<RegisterPage />} />
              
              {/* Rotas protegidas */}
              <Route path="/" element={
                <ProtectedRoute>
                  <Layout />
                </ProtectedRoute>
              }>
                {/* Redirecionar / para /dashboard */}
                <Route index element={<Navigate to="/dashboard" replace />} />
                
                {/* Dashboard */}
                <Route path="dashboard" element={<DashboardPage />} />
                
                {/* Vendas */}
                <Route path="sales" element={<SalesPage />} />
                
                {/* Ranking */}
                <Route path="ranking" element={<RankingPage />} />
                
                {/* Conquistas */}
                <Route path="achievements" element={<AchievementsPage />} />
                
                {/* Perfil */}
                <Route path="profile" element={<ProfilePage />} />
                
                {/* Usuários (apenas admin) */}
                <Route path="users" element={
                  <ProtectedRoute adminOnly>
                    <UsersPage />
                  </ProtectedRoute>
                } />
              </Route>
              
              {/* Página 404 */}
              <Route path="*" element={<NotFoundPage />} />
            </Routes>
            
            {/* Toast notifications */}
            <Toaster
              position="top-right"
              toastOptions={{
                duration: 4000,
                style: {
                  background: '#363636',
                  color: '#fff',
                },
                success: {
                  duration: 3000,
                  iconTheme: {
                    primary: '#4caf50',
                    secondary: '#fff',
                  },
                },
                error: {
                  duration: 4000,
                  iconTheme: {
                    primary: '#f44336',
                    secondary: '#fff',
                  },
                },
              }}
            />
          </div>
        </Router>
      </AuthProvider>
    </ThemeProvider>
  );
}

export default App;
