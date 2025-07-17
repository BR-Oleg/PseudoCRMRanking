const User = require('../models/User');
const Sale = require('../models/Sale');
const Achievement = require('../models/Achievement');
const { validationResult } = require('express-validator');

// Listar todos os usuários (apenas admin)
const getUsers = async (req, res) => {
  try {
    const {
      page = 1,
      limit = 10,
      role,
      department,
      isActive,
      search
    } = req.query;

    // Construir filtros
    const filters = {};

    if (role) {
      filters.role = role;
    }

    if (department) {
      filters.department = new RegExp(department, 'i');
    }

    if (isActive !== undefined) {
      filters.isActive = isActive === 'true';
    }

    if (search) {
      filters.$or = [
        { name: new RegExp(search, 'i') },
        { email: new RegExp(search, 'i') }
      ];
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const users = await User.find(filters)
      .select('-password')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const totalUsers = await User.countDocuments(filters);

    // Adicionar estatísticas de vendas para cada usuário
    const usersWithStats = await Promise.all(users.map(async (user) => {
      const salesStats = await Sale.aggregate([
        {
          $match: {
            seller: user._id,
            status: { $ne: 'Cancelada' }
          }
        },
        {
          $group: {
            _id: null,
            totalSales: { $sum: 1 },
            totalAmount: { $sum: '$amount' },
            avgAmount: { $avg: '$amount' }
          }
        }
      ]);

      const achievementsCount = await Achievement.countDocuments({
        user: user._id
      });

      return {
        ...user.toObject(),
        stats: {
          totalSales: salesStats[0]?.totalSales || 0,
          totalAmount: salesStats[0]?.totalAmount || 0,
          avgSaleAmount: salesStats[0]?.avgAmount || 0,
          achievementsCount
        }
      };
    }));

    res.json({
      success: true,
      data: {
        users: usersWithStats,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalUsers / parseInt(limit)),
          totalUsers,
          hasNextPage: skip + users.length < totalUsers,
          hasPrevPage: parseInt(page) > 1
        }
      }
    });

  } catch (error) {
    console.error('Erro ao listar usuários:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter usuário por ID
const getUserById = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Obter estatísticas completas do usuário
    const salesStats = await Sale.aggregate([
      {
        $match: {
          seller: user._id,
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: null,
          totalSales: { $sum: 1 },
          totalAmount: { $sum: '$amount' },
          avgAmount: { $avg: '$amount' },
          totalCommission: { $sum: '$commission.amount' }
        }
      }
    ]);

    // Vendas por mês (últimos 6 meses)
    const sixMonthsAgo = new Date();
    sixMonthsAgo.setMonth(sixMonthsAgo.getMonth() - 6);

    const monthlySales = await Sale.aggregate([
      {
        $match: {
          seller: user._id,
          saleDate: { $gte: sixMonthsAgo },
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: {
            year: { $year: '$saleDate' },
            month: { $month: '$saleDate' }
          },
          totalAmount: { $sum: '$amount' },
          totalSales: { $sum: 1 }
        }
      },
      { $sort: { '_id.year': 1, '_id.month': 1 } }
    ]);

    // Conquistas recentes
    const recentAchievements = await Achievement.find({
      user: user._id
    })
    .sort({ dateEarned: -1 })
    .limit(5);

    // Posição no ranking geral
    const userRanking = await Sale.aggregate([
      {
        $match: {
          status: { $ne: 'Cancelada' }
        }
      },
      {
        $group: {
          _id: '$seller',
          totalAmount: { $sum: '$amount' }
        }
      },
      { $sort: { totalAmount: -1 } }
    ]);

    const userPosition = userRanking.findIndex(
      seller => seller._id.toString() === user._id.toString()
    ) + 1;

    res.json({
      success: true,
      data: {
        user: {
          ...user.toObject(),
          stats: {
            ...salesStats[0] || {
              totalSales: 0,
              totalAmount: 0,
              avgAmount: 0,
              totalCommission: 0
            },
            rankingPosition: userPosition,
            achievementsCount: recentAchievements.length
          },
          monthlySales,
          recentAchievements
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Criar novo usuário (apenas admin)
const createUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { name, email, password, role, department, position, salesTarget } = req.body;

    // Verificar se usuário já existe
    const existingUser = await User.findOne({ email: email.toLowerCase() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Usuário já existe com este email'
      });
    }

    const user = new User({
      name,
      email: email.toLowerCase(),
      password,
      role: role || 'Colaborador',
      department,
      position,
      salesTarget: salesTarget || {
        daily: 0,
        weekly: 0,
        monthly: 0
      }
    });

    await user.save();

    res.status(201).json({
      success: true,
      message: 'Usuário criado com sucesso',
      data: {
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
          role: user.role,
          department: user.department,
          position: user.position,
          salesTarget: user.salesTarget,
          isActive: user.isActive,
          createdAt: user.createdAt
        }
      }
    });

  } catch (error) {
    console.error('Erro ao criar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Atualizar usuário (apenas admin)
const updateUser = async (req, res) => {
  try {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({
        success: false,
        message: 'Dados inválidos',
        errors: errors.array()
      });
    }

    const { id } = req.params;
    const allowedUpdates = [
      'name', 'role', 'department', 'position', 
      'salesTarget', 'isActive'
    ];

    const updates = {};
    Object.keys(req.body).forEach(key => {
      if (allowedUpdates.includes(key)) {
        updates[key] = req.body[key];
      }
    });

    const user = await User.findByIdAndUpdate(
      id,
      updates,
      { new: true, runValidators: true }
    ).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    res.json({
      success: true,
      message: 'Usuário atualizado com sucesso',
      data: { user }
    });

  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Desativar/ativar usuário (apenas admin)
const toggleUserStatus = async (req, res) => {
  try {
    const { id } = req.params;

    const user = await User.findById(id).select('-password');

    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    user.isActive = !user.isActive;
    await user.save();

    res.json({
      success: true,
      message: `Usuário ${user.isActive ? 'ativado' : 'desativado'} com sucesso`,
      data: { user }
    });

  } catch (error) {
    console.error('Erro ao alterar status do usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Deletar usuário (apenas admin)
const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;

    // Verificar se usuário existe
    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar se usuário tem vendas associadas
    const userSales = await Sale.countDocuments({ seller: id });
    if (userSales > 0) {
      return res.status(400).json({
        success: false,
        message: 'Não é possível deletar usuário com vendas associadas. Desative-o em vez disso.'
      });
    }

    // Deletar conquistas do usuário
    await Achievement.deleteMany({ user: id });

    // Deletar usuário
    await User.findByIdAndDelete(id);

    res.json({
      success: true,
      message: 'Usuário deletado com sucesso'
    });

  } catch (error) {
    console.error('Erro ao deletar usuário:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Redefinir senha do usuário (apenas admin)
const resetUserPassword = async (req, res) => {
  try {
    const { id } = req.params;
    const { newPassword } = req.body;

    if (!newPassword || newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Nova senha deve ter no mínimo 6 caracteres'
      });
    }

    const user = await User.findById(id);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    user.password = newPassword;
    await user.save();

    res.json({
      success: true,
      message: 'Senha redefinida com sucesso'
    });

  } catch (error) {
    console.error('Erro ao redefinir senha:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUsers,
  getUserById,
  createUser,
  updateUser,
  toggleUserStatus,
  deleteUser,
  resetUserPassword
};