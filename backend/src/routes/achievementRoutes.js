const express = require('express');
const router = express.Router();
const {
  getUserAchievements,
  getRecentAchievements,
  getAvailableAchievements,
  checkUserAchievements,
  getAchievementStats
} = require('../controllers/achievementController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// @route   GET /api/achievements/available
// @desc    Obter todas as conquistas disponíveis
// @access  Private
router.get('/available', authenticate, getAvailableAchievements);

// @route   GET /api/achievements/stats
// @desc    Obter estatísticas globais de conquistas (apenas admin)
// @access  Private (Admin only)
router.get('/stats', authenticate, requireAdmin, getAchievementStats);

// @route   GET /api/achievements/user/:userId
// @desc    Obter conquistas do usuário
// @access  Private
router.get('/user/:userId', authenticate, getUserAchievements);

// @route   GET /api/achievements/user/:userId/recent
// @desc    Obter conquistas recentes do usuário
// @access  Private
router.get('/user/:userId/recent', authenticate, getRecentAchievements);

// @route   POST /api/achievements/user/:userId/check
// @desc    Forçar verificação de conquistas (apenas admin)
// @access  Private (Admin only)
router.post('/user/:userId/check', authenticate, requireAdmin, checkUserAchievements);

module.exports = router;