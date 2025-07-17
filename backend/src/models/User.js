const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Nome é obrigatório'],
    trim: true,
    maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
  },
  email: {
    type: String,
    required: [true, 'Email é obrigatório'],
    unique: true,
    lowercase: true,
    trim: true,
    match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
  },
  password: {
    type: String,
    required: [true, 'Senha é obrigatória'],
    minlength: [6, 'Senha deve ter no mínimo 6 caracteres'],
    select: false
  },
  role: {
    type: String,
    enum: ['Administrador', 'Colaborador'],
    default: 'Colaborador'
  },
  avatar: {
    type: String,
    default: null
  },
  department: {
    type: String,
    trim: true,
    maxlength: [50, 'Departamento deve ter no máximo 50 caracteres']
  },
  position: {
    type: String,
    trim: true,
    maxlength: [50, 'Cargo deve ter no máximo 50 caracteres']
  },
  hireDate: {
    type: Date,
    default: Date.now
  },
  isActive: {
    type: Boolean,
    default: true
  },
  salesTarget: {
    daily: { type: Number, default: 0 },
    weekly: { type: Number, default: 0 },
    monthly: { type: Number, default: 0 }
  },
  level: {
    type: Number,
    default: 1,
    min: 1
  },
  experience: {
    type: Number,
    default: 0,
    min: 0
  },
  totalSales: {
    type: Number,
    default: 0,
    min: 0
  },
  lastLogin: {
    type: Date,
    default: null
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular ranking position
userSchema.virtual('rankingPosition').get(function() {
  return this._rankingPosition || 0;
});

// Virtual para calcular badges
userSchema.virtual('badges', {
  ref: 'Achievement',
  localField: '_id',
  foreignField: 'user',
  justOne: false
});

// Índices para otimizar consultas
userSchema.index({ email: 1 });
userSchema.index({ role: 1 });
userSchema.index({ totalSales: -1 });
userSchema.index({ isActive: 1 });

// Middleware para hash da senha antes de salvar
userSchema.pre('save', async function(next) {
  if (!this.isModified('password')) return next();
  
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (error) {
    next(error);
  }
});

// Método para comparar senhas
userSchema.methods.comparePassword = async function(candidatePassword) {
  return await bcrypt.compare(candidatePassword, this.password);
};

// Método para calcular nível baseado na experiência
userSchema.methods.calculateLevel = function() {
  // Cada 1000 pontos de experiência = 1 nível
  this.level = Math.floor(this.experience / 1000) + 1;
  return this.level;
};

// Método para adicionar experiência
userSchema.methods.addExperience = function(points) {
  this.experience += points;
  this.calculateLevel();
  return this.save();
};

// Método para atualizar último login
userSchema.methods.updateLastLogin = function() {
  this.lastLogin = new Date();
  return this.save({ validateBeforeSave: false });
};

module.exports = mongoose.model('User', userSchema);