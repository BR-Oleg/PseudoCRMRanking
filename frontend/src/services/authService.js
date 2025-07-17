import api from './api';

const authService = {
  // Login
  async login(credentials) {
    try {
      const response = await api.post('/auth/login', credentials);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Salvar token e dados do usuário no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user, token };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao fazer login' 
      };
    }
  },

  // Registro
  async register(userData) {
    try {
      const response = await api.post('/auth/register', userData);
      
      if (response.data.success) {
        const { token, user } = response.data.data;
        
        // Salvar token e dados do usuário no localStorage
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        
        return { success: true, user, token };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao criar conta' 
      };
    }
  },

  // Logout
  logout() {
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    window.location.href = '/login';
  },

  // Obter dados do usuário atual
  async getCurrentUser() {
    try {
      const response = await api.get('/auth/me');
      
      if (response.data.success) {
        const user = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao obter dados do usuário' 
      };
    }
  },

  // Atualizar perfil
  async updateProfile(profileData) {
    try {
      const response = await api.put('/auth/profile', profileData);
      
      if (response.data.success) {
        const user = response.data.data.user;
        localStorage.setItem('user', JSON.stringify(user));
        return { success: true, user };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao atualizar perfil' 
      };
    }
  },

  // Alterar senha
  async changePassword(passwordData) {
    try {
      const response = await api.put('/auth/change-password', passwordData);
      
      if (response.data.success) {
        return { success: true, message: response.data.message };
      }
      
      return { success: false, message: response.data.message };
    } catch (error) {
      return { 
        success: false, 
        message: error.response?.data?.message || 'Erro ao alterar senha' 
      };
    }
  },

  // Verificar se o usuário está autenticado
  isAuthenticated() {
    const token = localStorage.getItem('token');
    const user = localStorage.getItem('user');
    return !!(token && user);
  },

  // Obter dados do usuário do localStorage
  getStoredUser() {
    const user = localStorage.getItem('user');
    return user ? JSON.parse(user) : null;
  },

  // Obter token do localStorage
  getToken() {
    return localStorage.getItem('token');
  },

  // Verificar se o usuário é administrador
  isAdmin() {
    const user = this.getStoredUser();
    return user?.role === 'Administrador';
  }
};

export default authService;