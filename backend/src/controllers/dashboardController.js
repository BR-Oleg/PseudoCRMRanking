const Sale = require('../models/Sale');
const User = require('../models/User');
const Achievement = require('../models/Achievement');
const mongoose = require('mongoose');

// Obter dados gerais do dashboard
const getDashboardOverview = async (req, res) => {
  try {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - now.getDay() * 24 * 60 * 60 * 1000);
    startOfWeek.setHours(0, 0, 0, 0);
    const startOfDay = new Date(now.getFullYear(), now.getMonth(), now.getDate());

    // Vendas do mês atual
    const monthSales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfMonth },
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalSales: { $sum: 1 },
          avgSaleAmount: { $avg: '$amount' }
        }
      }
    ]);

    // Vendas da semana
    const weekSales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfWeek },
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    // Vendas do dia
    const daySales = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfDay },
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: null,
          totalAmount: { $sum: '$amount' },
          totalSales: { $sum: 1 }
        }
      }
    ]);

    // Usuários ativos
    const activeUsers = await User.countDocuments({ isActive: true });
    const totalUsers = await User.countDocuments();

    // Conquistas do mês
    const monthAchievements = await Achievement.countDocuments({
      dateEarned: { $gte: startOfMonth }
    });

    // Top 5 vendedores do mês
    const topSellers = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startOfMonth },
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: '$seller',
          totalAmount: { $sum: '$amount' },
          totalSales: { $sum: 1 }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      { $sort: { totalAmount: -1 } },
      { $limit: 5 },
      {
        $project: {
          seller: {
            _id: 1,
            name: 1,
            avatar: 1,
            department: 1
          },
          totalAmount: 1,
          totalSales: 1
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          month: monthSales[0] || { totalAmount: 0, totalSales: 0, avgSaleAmount: 0 },
          week: weekSales[0] || { totalAmount: 0, totalSales: 0 },
          day: daySales[0] || { totalAmount: 0, totalSales: 0 },
          users: { active: activeUsers, total: totalUsers },
          achievements: monthAchievements
        },
        topSellers
      }
    });

  } catch (error) {
    console.error('Erro ao obter overview do dashboard:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter dados para gráfico de vendas por período
const getSalesChart = async (req, res) => {
  try {
    const { period = 'month', type = 'amount' } = req.query;
    
    let dateFormat, startDate, groupBy;
    const now = new Date();

    switch (period) {
      case 'week':
        // Últimos 7 dias
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        dateFormat = '%Y-%m-%d';
        groupBy = { $dateToString: { format: dateFormat, date: '$saleDate' } };
        break;
      case 'month':
        // Últimos 30 dias
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFormat = '%Y-%m-%d';
        groupBy = { $dateToString: { format: dateFormat, date: '$saleDate' } };
        break;
      case 'year':
        // Últimos 12 meses
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), 1);
        dateFormat = '%Y-%m';
        groupBy = { $dateToString: { format: dateFormat, date: '$saleDate' } };
        break;
      default:
        startDate = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);
        dateFormat = '%Y-%m-%d';
        groupBy = { $dateToString: { format: dateFormat, date: '$saleDate' } };
    }

    const aggregationField = type === 'count' ? 1 : '$amount';
    const aggregationOperator = type === 'count' ? '$sum' : '$sum';

    const salesData = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: groupBy,
          value: { [aggregationOperator]: aggregationField }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    res.json({
      success: true,
      data: {
        chartData: salesData,
        period,
        type,
        startDate
      }
    });

  } catch (error) {
    console.error('Erro ao obter dados do gráfico:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter dados para gráfico de vendas por categoria
const getSalesByCategory = async (req, res) => {
  try {
    const { period = 'month' } = req.query;
    
    let startDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const categoryData = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: '$product.category',
          totalAmount: { $sum: '$amount' },
          totalSales: { $sum: 1 },
          avgAmount: { $avg: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } },
      { $limit: 10 }
    ]);

    res.json({
      success: true,
      data: {
        categoryData,
        period
      }
    });

  } catch (error) {
    console.error('Erro ao obter vendas por categoria:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter estatísticas de performance dos vendedores
const getSellerPerformance = async (req, res) => {
  try {
    const { period = 'month', limit = 10 } = req.query;
    
    let startDate;
    const now = new Date();

    switch (period) {
      case 'week':
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case 'month':
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case 'year':
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
    }

    const performanceData = await Sale.aggregate([
      {
        $match: {
          saleDate: { $gte: startDate },
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: '$seller',
          totalAmount: { $sum: '$amount' },
          totalSales: { $sum: 1 },
          avgSaleAmount: { $avg: '$amount' },
          totalCommission: { $sum: '$commission.amount' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'seller'
        }
      },
      { $unwind: '$seller' },
      { $sort: { totalAmount: -1 } },
      { $limit: parseInt(limit) },
      {
        $project: {
          seller: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
            department: 1,
            salesTarget: 1
          },
          totalAmount: 1,
          totalSales: 1,
          avgSaleAmount: 1,
          totalCommission: 1,
          position: { $add: [{ $indexOfArray: [[]] }, 1] }
        }
      }
    ]);

    // Calcular progresso das metas para cada vendedor
    const performanceWithProgress = performanceData.map((seller, index) => {
      const target = period === 'month' ? seller.seller.salesTarget?.monthly || 0 : 
                    period === 'week' ? seller.seller.salesTarget?.weekly || 0 :
                    seller.seller.salesTarget?.daily || 0;
      
      const progressPercentage = target > 0 ? (seller.totalAmount / target) * 100 : 0;
      
      return {
        ...seller,
        position: index + 1,
        target,
        progressPercentage: Math.min(progressPercentage, 100)
      };
    });

    res.json({
      success: true,
      data: {
        performanceData: performanceWithProgress,
        period
      }
    });

  } catch (error) {
    console.error('Erro ao obter performance dos vendedores:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter dados para simulador de metas
const getGoalSimulator = async (req, res) => {
  try {
    const { userId } = req.params;
    const { targetAmount, targetPeriod = 'month' } = req.query;

    // Verificar permissões
    if (req.user.role !== 'Administrador' && 
        userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Obter histórico de vendas dos últimos 3 meses
    const threeMonthsAgo = new Date();
    threeMonthsAgo.setMonth(threeMonthsAgo.getMonth() - 3);

    const salesHistory = await Sale.find({
      seller: userId,
      saleDate: { $gte: threeMonthsAgo },
      status: { $ne: 'Cancelada' }
    }).sort({ saleDate: -1 });

    // Calcular estatísticas históricas
    const totalSales = salesHistory.length;
    const totalAmount = salesHistory.reduce((sum, sale) => sum + sale.amount, 0);
    const avgSaleAmount = totalSales > 0 ? totalAmount / totalSales : 0;
    
    // Calcular vendas por dia (média)
    const salesPerDay = totalSales / 90; // 3 meses ≈ 90 dias
    
    // Simular meta baseada no target fornecido
    let dailyTarget, weeklyTarget, monthlyTarget;
    const target = parseFloat(targetAmount) || user.salesTarget?.monthly || 10000;

    switch (targetPeriod) {
      case 'day':
        dailyTarget = target;
        weeklyTarget = target * 7;
        monthlyTarget = target * 30;
        break;
      case 'week':
        dailyTarget = target / 7;
        weeklyTarget = target;
        monthlyTarget = target * 4.3;
        break;
      case 'month':
      default:
        dailyTarget = target / 30;
        weeklyTarget = target / 4.3;
        monthlyTarget = target;
    }

    // Calcular vendas necessárias por dia
    const salesNeededPerDay = avgSaleAmount > 0 ? dailyTarget / avgSaleAmount : 0;
    
    // Probabilidade de sucesso baseada no histórico
    const currentDailyAvg = totalAmount / 90;
    const successProbability = Math.min((currentDailyAvg / dailyTarget) * 100, 100);

    // Sugestões para melhorar
    const suggestions = [];
    
    if (successProbability < 70) {
      suggestions.push('Aumente o número de prospecções diárias');
      suggestions.push('Foque em produtos com maior ticket médio');
      suggestions.push('Melhore a taxa de conversão de leads');
    }
    
    if (avgSaleAmount < monthlyTarget / 30) {
      suggestions.push('Trabalhe técnicas de upselling');
      suggestions.push('Identifique clientes com maior potencial de compra');
    }

    res.json({
      success: true,
      data: {
        simulation: {
          targetAmount: target,
          targetPeriod,
          dailyTarget,
          weeklyTarget,
          monthlyTarget,
          salesNeededPerDay: Math.ceil(salesNeededPerDay),
          successProbability: Math.round(successProbability)
        },
        currentPerformance: {
          totalSales,
          totalAmount,
          avgSaleAmount: Math.round(avgSaleAmount * 100) / 100,
          salesPerDay: Math.round(salesPerDay * 100) / 100,
          currentDailyAvg: Math.round(currentDailyAvg * 100) / 100
        },
        suggestions
      }
    });

  } catch (error) {
    console.error('Erro no simulador de metas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getDashboardOverview,
  getSalesChart,
  getSalesByCategory,
  getSellerPerformance,
  getGoalSimulator
};