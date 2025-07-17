const jwt = require('jsonwebtoken');
const User = require('../models/User');

// Middleware para verificar token JWT
const authenticate = async (req, res, next) => {
  try {
    const token = req.header('Authorization')?.replace('Bearer ', '');

    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Token de acesso não fornecido'
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    const user = await User.findById(decoded.id).select('-password');

    if (!user) {
      return res.status(401).json({
        success: false,
        message: 'Token inválido - usuário não encontrado'
      });
    }

    if (!user.isActive) {
      return res.status(401).json({
        success: false,
        message: 'Conta desativada'
      });
    }

    req.user = user;
    next();
  } catch (error) {
    if (error.name === 'JsonWebTokenError') {
      return res.status(401).json({
        success: false,
        message: 'Token inválido'
      });
    }

    if (error.name === 'TokenExpiredError') {
      return res.status(401).json({
        success: false,
        message: 'Token expirado'
      });
    }

    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Middleware para verificar permissões de administrador
const requireAdmin = (req, res, next) => {
  if (req.user.role !== 'Administrador') {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - permissões de administrador necessárias'
    });
  }
  next();
};

// Middleware para verificar se usuário pode acessar dados de outro usuário
const checkUserAccess = (req, res, next) => {
  const targetUserId = req.params.userId || req.params.id;
  
  // Administradores podem acessar dados de qualquer usuário
  if (req.user.role === 'Administrador') {
    return next();
  }

  // Usuários só podem acessar seus próprios dados
  if (req.user._id.toString() !== targetUserId) {
    return res.status(403).json({
      success: false,
      message: 'Acesso negado - você só pode acessar seus próprios dados'
    });
  }

  next();
};

// Função para gerar token JWT
const generateToken = (userId) => {
  return jwt.sign(
    { id: userId },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN }
  );
};

module.exports = {
  authenticate,
  requireAdmin,
  checkUserAccess,
  generateToken
};