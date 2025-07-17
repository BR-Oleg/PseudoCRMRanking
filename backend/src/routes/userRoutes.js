const express = require('express');
const router = express.Router();
const {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  resetUserPassword
} = require('../controllers/userController');
const { authenticate, requireAdmin } = require('../middleware/auth');
const { registerValidation } = require('../validations/authValidation');

// @route   GET /api/users
// @desc    Listar todos os usuários (apenas admin)
// @access  Private (Admin only)
router.get('/', authenticate, requireAdmin, getUsers);

// @route   GET /api/users/:id
// @desc    Obter usuário por ID
// @access  Private (Admin only)
router.get('/:id', authenticate, requireAdmin, getUserById);

// @route   POST /api/users
// @desc    Criar novo usuário (apenas admin)
// @access  Private (Admin only)
router.post('/', authenticate, requireAdmin, registerValidation, createUser);

// @route   PUT /api/users/:id
// @desc    Atualizar usuário (apenas admin)
// @access  Private (Admin only)
router.put('/:id', authenticate, requireAdmin, updateUser);

// @route   PATCH /api/users/:id/toggle-status
// @desc    Desativar/ativar usuário (apenas admin)
// @access  Private (Admin only)
router.patch('/:id/toggle-status', authenticate, requireAdmin, toggleUserStatus);

// @route   DELETE /api/users/:id
// @desc    Deletar usuário (apenas admin)
// @access  Private (Admin only)
router.delete('/:id', authenticate, requireAdmin, deleteUser);

// @route   POST /api/users/:id/reset-password
// @desc    Redefinir senha do usuário (apenas admin)
// @access  Private (Admin only)
router.post('/:id/reset-password', authenticate, requireAdmin, resetUserPassword);

module.exports = router;