const Sale = require('../models/Sale');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const { validationResult } = require('express-validator');

// Criar nova venda
const createSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const saleData = {
      ...req.body,
      seller: req.user._id
    };

    const sale = new Sale(saleData);
    await sale.save();

    // Atualizar total de vendas do usuário
    const user = await User.findById(req.user._id);
    user.totalSales += sale.amount;
    await user.save();

    // Verificar e conceder conquistas
    const newAchievements = await Achievement.checkAndAwardAchievements(
      req.user._id, 
      { metaDiariaAtingida: true }
    );

    await sale.populate('seller', 'name email department');

    res.status(201).json({
      success: true,
      message: 'Venda criada com sucesso',
      data: {
        sale,
        newAchievements: newAchievements.length > 0 ? newAchievements : undefined
      }
    });

  } catch (error) {
    console.error('Erro ao criar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Listar vendas com filtros
const getSales = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      status,
      startDate,
      endDate,
      sellerId,
      productCategory
    } = req.query;

    // Construir filtros
    const filters = {};

    // Se não for administrador, mostrar apenas suas vendas
    if (req.user.role !== 'Administrador') {
      filters.seller = req.user._id;
    } else if (sellerId) {
      filters.seller = sellerId;
    }

    if (status) {
      filters.status = status;
    }

    if (startDate || endDate) {
      filters.saleDate = {};
      if (startDate) {
        filters.saleDate.$gte = new Date(startDate);
      }
      if (endDate) {
        filters.saleDate.$lte = new Date(endDate);
      }
    }

    if (productCategory) {
      filters['product.category'] = productCategory;
    }

    // Opções de paginação
    const options = {
      page: parseInt(page),
      limit: parseInt(limit),
      sort: { saleDate: -1 },
      populate: {
        path: 'seller',
        select: 'name email department avatar'
      }
    };

    const sales = await Sale.paginate(filters, options);

    res.json({
      success: true,
      data: {
        sales: sales.docs,
        pagination: {
          currentPage: sales.page,
          totalPages: sales.totalPages,
          totalSales: sales.totalDocs,
          hasNextPage: sales.hasNextPage,
          hasPrevPage: sales.hasPrevPage
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar vendas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter venda por ID
const getSaleById = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id)
      .populate('seller', 'name email department avatar');

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'Administrador' && 
        sale.seller._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    res.json({
      success: true,
      data: { sale }
    });

  } catch (error) {
    console.error('Erro ao obter venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Atualizar venda
const updateSale = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Verificar permissões
    if (req.user.role !== 'Administrador' && 
        sale.seller.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const oldAmount = sale.amount;
    const oldStatus = sale.status;

    // Atualizar venda
    Object.keys(req.body).forEach(key => {
      sale[key] = req.body[key];
    });

    await sale.save();

    // Atualizar total de vendas do usuário se valor mudou
    if (oldAmount !== sale.amount || oldStatus !== sale.status) {
      const user = await User.findById(sale.seller);
      
      // Subtrair valor antigo
      if (oldStatus !== 'Cancelada') {
        user.totalSales -= oldAmount;
      }
      
      // Adicionar novo valor se não cancelada
      if (sale.status !== 'Cancelada') {
        user.totalSales += sale.amount;
      }
      
      await user.save();
    }

    await sale.populate('seller', 'name email department avatar');

    res.json({
      success: true,
      message: 'Venda atualizada com sucesso',
      data: { sale }
    });

  } catch (error) {
    console.error('Erro ao atualizar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Deletar venda
const deleteSale = async (req, res) => {
  try {
    const sale = await Sale.findById(req.params.id);

    if (!sale) {
      return res.status(404).json({
        success: false,
        message: 'Venda não encontrada'
      });
    }

    // Verificar permissões (apenas administradores podem deletar)
    if (req.user.role !== 'Administrador') {
      return res.status(403).json({
        success: false,
        message: 'Apenas administradores podem deletar vendas'
      });
    }

    // Atualizar total de vendas do usuário
    if (sale.status !== 'Cancelada') {
      const user = await User.findById(sale.seller);
      user.totalSales -= sale.amount;
      await user.save();
    }

    await Sale.findByIdAndDelete(req.params.id);

    res.json({
      success: true,
      message: 'Venda deletada com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar venda:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter ranking de vendedores
const getRanking = async (req, res) => {
  try {
    const { period = 'month', limit = 10 } = req.query;
    
    let startDate, endDate;
    const now = new Date();

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
      default:
        startDate = null;
        endDate = null;
    }

    const ranking = await Sale.getRanking(startDate, endDate, parseInt(limit));

    res.json({
      success: true,
      data: {
        ranking,
        period,
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Erro ao obter ranking:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter estatísticas de vendas
const getSalesStats = async (req, res) => {
  try {
    const { sellerId, period = 'month' } = req.query;
    
    const targetSellerId = sellerId || req.user._id;

    // Verificar permissões
    if (req.user.role !== 'Administrador' && 
        targetSellerId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const now = new Date();
    let startDate, endDate;

    switch (period) {
      case 'day':
        startDate = new Date(now.getFullYear(), now.getMonth(), now.getDate());
        endDate = new Date(startDate.getTime() + 24 * 60 * 60 * 1000);
        break;
      case 'week':
        const dayOfWeek = now.getDay();
        startDate = new Date(now.getTime() - dayOfWeek * 24 * 60 * 60 * 1000);
        startDate.setHours(0, 0, 0, 0);
        endDate = new Date(startDate.getTime() + 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        endDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
        break;
    }

    const stats = await Sale.getTotalBySeller(targetSellerId, startDate, endDate);
    const user = await User.findById(targetSellerId);

    // Calcular progresso das metas
    const currentStats = stats[0] || {
      totalAmount: 0,
      totalSales: 0,
      avgSaleAmount: 0
    };

    let targetMeta = 0;
    switch (period) {
      case 'day':
        targetMeta = user.salesTarget.daily;
        break;
      case 'week':
        targetMeta = user.salesTarget.weekly;
        break;
      case 'month':
        targetMeta = user.salesTarget.monthly;
        break;
    }

    const progressPercentage = targetMeta > 0 
      ? Math.min((currentStats.totalAmount / targetMeta) * 100, 100)
      : 0;

    res.json({
      success: true,
      data: {
        stats: currentStats,
        target: targetMeta,
        progressPercentage,
        period,
        startDate,
        endDate
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  createSale,
  getSales,
  getSaleById,
  updateSale,
  deleteSale,
  getRanking,
  getSalesStats
};