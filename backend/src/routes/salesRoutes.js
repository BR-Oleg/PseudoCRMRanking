const express = require('express');
const router = express.Router();
const {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getRanking,
  getSalesStats
} = require('../controllers/salesController');
const { authenticate, requireAdmin, checkUserAccess } = require('../middleware/auth');
const {
  createSaleValidation,
  updateSaleValidation,
  getSalesValidation,
  getRankingValidation,
  getSalesStatsValidation
} = require('../validations/salesValidation');

// @route   POST /api/sales
// @desc    Criar nova venda
// @access  Private
router.post('/', authenticate, createSaleValidation, createSale);

// @route   GET /api/sales
// @desc    Listar vendas com filtros
// @access  Private
router.get('/', authenticate, getSalesValidation, getSales);

// @route   GET /api/sales/ranking
// @desc    Obter ranking de vendedores
// @access  Private
router.get('/ranking', authenticate, getRankingValidation, getRanking);

// @route   GET /api/sales/stats
// @desc    Obter estatísticas de vendas
// @access  Private
router.get('/stats', authenticate, getSalesStatsValidation, getSalesStats);

// @route   GET /api/sales/:id
// @desc    Obter venda por ID
// @access  Private
router.get('/:id', authenticate, getSaleById);

// @route   PUT /api/sales/:id
// @desc    Atualizar venda
// @access  Private
router.put('/:id', authenticate, updateSaleValidation, updateSale);

// @route   DELETE /api/sales/:id
// @desc    Deletar venda (apenas admin)
// @access  Private (Admin only)
router.delete('/:id', authenticate, requireAdmin, deleteSale);

module.exports = router;