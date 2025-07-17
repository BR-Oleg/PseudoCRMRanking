const mongoose = require('mongoose');

const achievementSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Usuário é obrigatório']
  },
  type: {
    type: String,
    enum: {
      values: [
        'PRIMEIRA_VENDA',
        'VENDAS_CONSECUTIVAS',
        'META_DIARIA',
        'META_SEMANAL', 
        'META_MENSAL',
        'TOP_VENDEDOR',
        'CLIENTE_SATISFEITO',
        'VENDAS_VOLUME',
        'EXPERIENCIA_NIVEL',
        'TEMPO_SERVICO',
        'MELHOR_VENDEDOR_MES',
        'CRESCIMENTO_VENDAS'
      ],
      message: 'Tipo de conquista inválido'
    },
    required: [true, 'Tipo da conquista é obrigatório']
  },
  name: {
    type: String,
    required: [true, 'Nome da conquista é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  description: {
    type: String,
    required: [true, 'Descrição da conquista é obrigatória'],
    trim: true,
    maxlength: [300, 'Descrição deve ter no máximo 300 caracteres']
  },
  icon: {
    type: String,
    required: [true, 'Ícone da conquista é obrigatório'],
    trim: true
  },
  level: {
    type: Number,
    default: 1,
    min: [1, 'Nível deve ser pelo menos 1'],
    max: [10, 'Nível máximo é 10']
  },
  rarity: {
    type: String,
    enum: {
      values: ['Comum', 'Raro', 'Épico', 'Lendário'],
      message: 'Raridade deve ser: Comum, Raro, Épico ou Lendário'
    },
    default: 'Comum'
  },
  experiencePoints: {
    type: Number,
    default: 0,
    min: [0, 'Pontos de experiência não podem ser negativos']
  },
  criteria: {
    value: {
      type: Number,
      required: [true, 'Valor do critério é obrigatório'],
      min: [1, 'Valor deve ser pelo menos 1']
    },
    period: {
      type: String,
      enum: ['dia', 'semana', 'mês', 'ano', 'total'],
      default: 'total'
    },
    metric: {
      type: String,
      enum: ['vendas', 'valor', 'clientes', 'dias', 'nivel'],
      required: [true, 'Métrica é obrigatória']
    }
  },
  dateEarned: {
    type: Date,
    default: Date.now
  },
  isVisible: {
    type: Boolean,
    default: true
  },
  color: {
    type: String,
    default: '#FFD700' // Cor dourada por padrão
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Índices para otimizar consultas
achievementSchema.index({ user: 1, dateEarned: -1 });
achievementSchema.index({ type: 1, level: 1 });
achievementSchema.index({ rarity: 1 });

// Virtual para calcular tempo desde a conquista
achievementSchema.virtual('timeAgo').get(function() {
  const now = new Date();
  const diffTime = Math.abs(now - this.dateEarned);
  const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  
  if (diffDays === 1) return 'Hoje';
  if (diffDays <= 7) return `${diffDays} dias atrás`;
  if (diffDays <= 30) return `${Math.ceil(diffDays / 7)} semanas atrás`;
  return `${Math.ceil(diffDays / 30)} meses atrás`;
});

// Método estático para criar conquistas predefinidas
achievementSchema.statics.createPredefinedAchievements = function() {
  const achievements = [
    // Primeira Venda
    {
      type: 'PRIMEIRA_VENDA',
      name: 'Primeira Venda',
      description: 'Parabéns pela sua primeira venda!',
      icon: '🎉',
      level: 1,
      rarity: 'Comum',
      experiencePoints: 100,
      criteria: { value: 1, metric: 'vendas', period: 'total' },
      color: '#4CAF50'
    },
    
    // Metas Diárias
    {
      type: 'META_DIARIA',
      name: 'Meta Diária Bronze',
      description: 'Atingiu a meta diária de vendas',
      icon: '🥉',
      level: 1,
      rarity: 'Comum',
      experiencePoints: 50,
      criteria: { value: 1, metric: 'vendas', period: 'dia' },
      color: '#CD7F32'
    },
    {
      type: 'META_DIARIA',
      name: 'Meta Diária Prata',
      description: 'Atingiu a meta diária por 5 dias consecutivos',
      icon: '🥈',
      level: 2,
      rarity: 'Raro',
      experiencePoints: 200,
      criteria: { value: 5, metric: 'dias', period: 'total' },
      color: '#C0C0C0'
    },
    {
      type: 'META_DIARIA',
      name: 'Meta Diária Ouro',
      description: 'Atingiu a meta diária por 10 dias consecutivos',
      icon: '🥇',
      level: 3,
      rarity: 'Épico',
      experiencePoints: 500,
      criteria: { value: 10, metric: 'dias', period: 'total' },
      color: '#FFD700'
    },
    
    // Volume de Vendas
    {
      type: 'VENDAS_VOLUME',
      name: 'Vendedor Iniciante',
      description: 'Realizou 10 vendas',
      icon: '💼',
      level: 1,
      rarity: 'Comum',
      experiencePoints: 200,
      criteria: { value: 10, metric: 'vendas', period: 'total' },
      color: '#2196F3'
    },
    {
      type: 'VENDAS_VOLUME',
      name: 'Vendedor Experiente',
      description: 'Realizou 50 vendas',
      icon: '🏆',
      level: 2,
      rarity: 'Raro',
      experiencePoints: 500,
      criteria: { value: 50, metric: 'vendas', period: 'total' },
      color: '#FF9800'
    },
    {
      type: 'VENDAS_VOLUME',
      name: 'Vendedor Master',
      description: 'Realizou 100 vendas',
      icon: '👑',
      level: 3,
      rarity: 'Épico',
      experiencePoints: 1000,
      criteria: { value: 100, metric: 'vendas', period: 'total' },
      color: '#9C27B0'
    },
    
    // Top Vendedor
    {
      type: 'TOP_VENDEDOR',
      name: 'Top 5 do Mês',
      description: 'Ficou entre os 5 melhores vendedores do mês',
      icon: '⭐',
      level: 1,
      rarity: 'Raro',
      experiencePoints: 300,
      criteria: { value: 5, metric: 'vendas', period: 'mês' },
      color: '#E91E63'
    },
    {
      type: 'TOP_VENDEDOR',
      name: 'Vendedor do Mês',
      description: 'Foi o melhor vendedor do mês',
      icon: '🌟',
      level: 2,
      rarity: 'Lendário',
      experiencePoints: 1000,
      criteria: { value: 1, metric: 'vendas', period: 'mês' },
      color: '#FFD700'
    }
  ];

  return achievements;
};

// Método estático para verificar e conceder conquistas
achievementSchema.statics.checkAndAwardAchievements = async function(userId, saleData) {
  const User = mongoose.model('User');
  const Sale = mongoose.model('Sale');
  
  const user = await User.findById(userId);
  if (!user) return [];

  const newAchievements = [];
  const predefinedAchievements = this.createPredefinedAchievements();

  for (const achievementTemplate of predefinedAchievements) {
    // Verificar se o usuário já possui esta conquista
    const existingAchievement = await this.findOne({
      user: userId,
      type: achievementTemplate.type,
      level: achievementTemplate.level
    });

    if (existingAchievement) continue;

    let shouldAward = false;

    // Lógica para verificar critérios
    switch (achievementTemplate.type) {
      case 'PRIMEIRA_VENDA':
        const totalSales = await Sale.countDocuments({ 
          seller: userId, 
          status: { $ne: 'Cancelada' } 
        });
        shouldAward = totalSales >= achievementTemplate.criteria.value;
        break;

      case 'VENDAS_VOLUME':
        const volumeSales = await Sale.countDocuments({ 
          seller: userId, 
          status: { $ne: 'Cancelada' } 
        });
        shouldAward = volumeSales >= achievementTemplate.criteria.value;
        break;

      case 'META_DIARIA':
        // Implementar lógica específica para metas diárias
        // Esta é uma implementação simplificada
        shouldAward = saleData && saleData.metaDiariaAtingida;
        break;
    }

    if (shouldAward) {
      const achievement = new this({
        user: userId,
        ...achievementTemplate
      });

      await achievement.save();
      
      // Adicionar experiência ao usuário
      await user.addExperience(achievementTemplate.experiencePoints);
      
      newAchievements.push(achievement);
    }
  }

  return newAchievements;
};

module.exports = mongoose.model('Achievement', achievementSchema);