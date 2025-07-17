const Achievement = require('../models/Achievement');
const User = require('../models/User');
const { validationResult } = require('express-validator');

// Obter conquistas do usuário
const getUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const { page = 1, limit = 20 } = req.query;

    // Verificar permissões
    if (req.user.role !== 'Administrador' && 
        userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    const achievements = await Achievement.find({ 
      user: userId,
      isVisible: true 
    })
    .sort({ dateEarned: -1 })
    .skip(skip)
    .limit(parseInt(limit));

    const totalAchievements = await Achievement.countDocuments({ 
      user: userId,
      isVisible: true 
    });

    // Estatísticas de conquistas
    const stats = await Achievement.aggregate([
      { $match: { user: userId, isVisible: true } },
      {
        $group: {
          _id: '$rarity',
          count: { $sum: 1 },
          totalExperience: { $sum: '$experiencePoints' }
        }
      }
    ]);

    const rarityStats = {
      Comum: 0,
      Raro: 0,
      Épico: 0,
      Lendário: 0
    };

    let totalExperience = 0;
    stats.forEach(stat => {
      rarityStats[stat._id] = stat.count;
      totalExperience += stat.totalExperience;
    });

    res.json({
      success: true,
      data: {
        achievements,
        pagination: {
          currentPage: parseInt(page),
          totalPages: Math.ceil(totalAchievements / parseInt(limit)),
          totalAchievements,
          hasNextPage: skip + achievements.length < totalAchievements,
          hasPrevPage: parseInt(page) > 1
        },
        stats: {
          total: totalAchievements,
          totalExperience,
          byRarity: rarityStats
        }
      }
    });

  } catch (error) {
    console.error('Erro ao obter conquistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter conquistas recentes do usuário
const getRecentAchievements = async (req, res) => {
  try {
    const { userId } = req.params;
    const { limit = 5 } = req.query;

    // Verificar permissões
    if (req.user.role !== 'Administrador' && 
        userId !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: 'Acesso negado'
      });
    }

    const achievements = await Achievement.find({ 
      user: userId,
      isVisible: true 
    })
    .sort({ dateEarned: -1 })
    .limit(parseInt(limit));

    res.json({
      success: true,
      data: { achievements }
    });

  } catch (error) {
    console.error('Erro ao obter conquistas recentes:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter todas as conquistas disponíveis (templates)
const getAvailableAchievements = async (req, res) => {
  try {
    const availableAchievements = Achievement.createPredefinedAchievements();

    // Se for usuário específico, marcar quais ele já possui
    if (req.query.userId) {
      const userId = req.query.userId;

      // Verificar permissões
      if (req.user.role !== 'Administrador' && 
          userId !== req.user._id.toString()) {
        return res.status(403).json({
          success: false,
          message: 'Acesso negado'
        });
      }

      const userAchievements = await Achievement.find({ 
        user: userId 
      }).select('type level');

      const userAchievementMap = {};
      userAchievements.forEach(achievement => {
        const key = `${achievement.type}_${achievement.level}`;
        userAchievementMap[key] = true;
      });

      availableAchievements.forEach(achievement => {
        const key = `${achievement.type}_${achievement.level}`;
        achievement.earned = !!userAchievementMap[key];
      });
    }

    res.json({
      success: true,
      data: { availableAchievements }
    });

  } catch (error) {
    console.error('Erro ao obter conquistas disponíveis:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Forçar verificação de conquistas (apenas admin)
const checkUserAchievements = async (req, res) => {
  try {
    const { userId } = req.params;

    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'Usuário não encontrado'
      });
    }

    // Verificar e conceder conquistas
    const newAchievements = await Achievement.checkAndAwardAchievements(userId, {
      metaDiariaAtingida: true // Simulação
    });

    res.json({
      success: true,
      message: 'Verificação de conquistas concluída',
      data: {
        newAchievements,
        totalNewAchievements: newAchievements.length
      }
    });

  } catch (error) {
    console.error('Erro ao verificar conquistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

// Obter estatísticas globais de conquistas (apenas admin)
const getAchievementStats = async (req, res) => {
  try {
    const totalAchievements = await Achievement.countDocuments();
    const totalUsers = await User.countDocuments({ isActive: true });

    // Conquistas por raridade
    const achievementsByRarity = await Achievement.aggregate([
      {
        $group: {
          _id: '$rarity',
          count: { $sum: 1 }
        }
      }
    ]);

    // Conquistas mais populares
    const popularAchievements = await Achievement.aggregate([
      {
        $group: {
          _id: { type: '$type', level: '$level' },
          count: { $sum: 1 },
          name: { $first: '$name' },
          icon: { $first: '$icon' },
          rarity: { $first: '$rarity' }
        }
      },
      { $sort: { count: -1 } },
      { $limit: 10 }
    ]);

    // Usuários com mais conquistas
    const topAchievers = await Achievement.aggregate([
      {
        $group: {
          _id: '$user',
          achievementCount: { $sum: 1 },
          totalExperience: { $sum: '$experiencePoints' }
        }
      },
      {
        $lookup: {
          from: 'users',
          localField: '_id',
          foreignField: '_id',
          as: 'user'
        }
      },
      { $unwind: '$user' },
      { $sort: { achievementCount: -1 } },
      { $limit: 10 },
      {
        $project: {
          _id: 1,
          achievementCount: 1,
          totalExperience: 1,
          user: {
            _id: 1,
            name: 1,
            email: 1,
            avatar: 1,
            department: 1
          }
        }
      }
    ]);

    res.json({
      success: true,
      data: {
        overview: {
          totalAchievements,
          totalUsers,
          averageAchievementsPerUser: totalUsers > 0 ? totalAchievements / totalUsers : 0
        },
        achievementsByRarity,
        popularAchievements,
        topAchievers
      }
    });

  } catch (error) {
    console.error('Erro ao obter estatísticas de conquistas:', error);
    res.status(500).json({
      success: false,
      message: 'Erro interno do servidor',
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
};

module.exports = {
  getUserAchievements,
  getRecentAchievements,
  getAvailableAchievements,
  checkUserAchievements,
  getAchievementStats
};