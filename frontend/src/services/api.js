import axios from 'axios';
import toast from 'react-hot-toast';

// Configuração base da API
const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  timeout: 10000 // 10 segundos
});

// Interceptor para adicionar token de autenticação
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Interceptor para tratar respostas e erros
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    // Tratar diferentes tipos de erro
    if (error.response) {
      const { status, data } = error.response;
      
      switch (status) {
        case 401:
          // Token expirado ou inválido
          localStorage.removeItem('token');
          localStorage.removeItem('user');
          toast.error('Sessão expirada. Faça login novamente.');
          window.location.href = '/login';
          break;
          
        case 403:
          toast.error('Acesso negado. Você não tem permissão para esta ação.');
          break;
          
        case 404:
          toast.error('Recurso não encontrado.');
          break;
          
        case 422:
          // Erros de validação
          if (data.errors && Array.isArray(data.errors)) {
            data.errors.forEach(err => {
              toast.error(err.message || err.msg);
            });
          } else {
            toast.error(data.message || 'Dados inválidos.');
          }
          break;
          
        case 429:
          toast.error('Muitas tentativas. Tente novamente em alguns minutos.');
          break;
          
        case 500:
          toast.error('Erro interno do servidor. Tente novamente mais tarde.');
          break;
          
        default:
          toast.error(data.message || 'Ocorreu um erro inesperado.');
      }
    } else if (error.request) {
      // Erro de rede
      toast.error('Erro de conexão. Verifique sua internet.');
    } else {
      // Erro de configuração
      toast.error('Erro interno da aplicação.');
    }
    
    return Promise.reject(error);
  }
);

export default api;