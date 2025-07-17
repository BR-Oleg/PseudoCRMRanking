const express = require('express');
const router = express.Router();
const {
  getDashboardOverview,
  getSalesChart,
  getSalesByCategory,
  getSellerPerformance,
  getGoalSimulator
} = require('../controllers/dashboardController');
const { authenticate, requireAdmin } = require('../middleware/auth');

// @route   GET /api/dashboard/overview
// @desc    Obter dados gerais do dashboard
// @access  Private
router.get('/overview', authenticate, getDashboardOverview);

// @route   GET /api/dashboard/sales-chart
// @desc    Obter dados para gráfico de vendas por período
// @access  Private
router.get('/sales-chart', authenticate, getSalesChart);

// @route   GET /api/dashboard/sales-by-category
// @desc    Obter dados para gráfico de vendas por categoria
// @access  Private
router.get('/sales-by-category', authenticate, getSalesByCategory);

// @route   GET /api/dashboard/seller-performance
// @desc    Obter estatísticas de performance dos vendedores
// @access  Private
router.get('/seller-performance', authenticate, getSellerPerformance);

// @route   GET /api/dashboard/goal-simulator/:userId
// @desc    Obter dados para simulador de metas
// @access  Private
router.get('/goal-simulator/:userId', authenticate, getGoalSimulator);

module.exports = router;