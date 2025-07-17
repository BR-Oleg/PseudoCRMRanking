const express = require('express');
const router = express.Router();
const {
  register,
  login,
  getMe,
  updateProfile,
  changePassword
} = require('../controllers/authController');
const { authenticate } = require('../middleware/auth');
const {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
} = require('../validations/authValidation');

// @route   POST /api/auth/register
// @desc    Registrar novo usuário
// @access  Public
router.post('/register', registerValidation, register);

// @route   POST /api/auth/login
// @desc    Login de usuário
// @access  Public
router.post('/login', loginValidation, login);

// @route   GET /api/auth/me
// @desc    Obter dados do usuário atual
// @access  Private
router.get('/me', authenticate, getMe);

// @route   PUT /api/auth/profile
// @desc    Atualizar perfil do usuário
// @access  Private
router.put('/profile', authenticate, updateProfileValidation, updateProfile);

// @route   PUT /api/auth/change-password
// @desc    Alterar senha do usuário
// @access  Private
router.put('/change-password', authenticate, changePasswordValidation, changePassword);

module.exports = router;