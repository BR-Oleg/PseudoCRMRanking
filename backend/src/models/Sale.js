const mongoose = require('mongoose');
const mongoosePaginate = require('mongoose-paginate-v2');

const saleSchema = new mongoose.Schema({
  seller: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: [true, 'Vendedor é obrigatório']
  },
  customer: {
    name: {
      type: String,
      required: [true, 'Nome do cliente é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome deve ter no máximo 100 caracteres']
    },
    email: {
      type: String,
      trim: true,
      lowercase: true,
      match: [/^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/, 'Email inválido']
    },
    phone: {
      type: String,
      trim: true,
      maxlength: [20, 'Telefone deve ter no máximo 20 caracteres']
    },
    company: {
      type: String,
      trim: true,
      maxlength: [100, 'Empresa deve ter no máximo 100 caracteres']
    }
  },
  product: {
    name: {
      type: String,
      required: [true, 'Nome do produto é obrigatório'],
      trim: true,
      maxlength: [100, 'Nome do produto deve ter no máximo 100 caracteres']
    },
    category: {
      type: String,
      trim: true,
      maxlength: [50, 'Categoria deve ter no máximo 50 caracteres']
    },
    description: {
      type: String,
      trim: true,
      maxlength: [500, 'Descrição deve ter no máximo 500 caracteres']
    }
  },
  amount: {
    type: Number,
    required: [true, 'Valor da venda é obrigatório'],
    min: [0.01, 'Valor deve ser maior que zero']
  },
  quantity: {
    type: Number,
    default: 1,
    min: [1, 'Quantidade deve ser pelo menos 1']
  },
  unitPrice: {
    type: Number,
    required: [true, 'Preço unitário é obrigatório'],
    min: [0.01, 'Preço unitário deve ser maior que zero']
  },
  discount: {
    type: Number,
    default: 0,
    min: [0, 'Desconto não pode ser negativo'],
    max: [100, 'Desconto não pode ser maior que 100%']
  },
  status: {
    type: String,
    enum: {
      values: ['Pendente', 'Confirmada', 'Cancelada', 'Reembolsada'],
      message: 'Status deve ser: Pendente, Confirmada, Cancelada ou Reembolsada'
    },
    default: 'Pendente'
  },
  paymentMethod: {
    type: String,
    enum: ['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto', 'Transferência'],
    required: [true, 'Método de pagamento é obrigatório']
  },
  commission: {
    rate: {
      type: Number,
      default: 5,
      min: [0, 'Taxa de comissão não pode ser negativa'],
      max: [50, 'Taxa de comissão não pode ser maior que 50%']
    },
    amount: {
      type: Number,
      default: 0
    }
  },
  saleDate: {
    type: Date,
    default: Date.now,
    required: [true, 'Data da venda é obrigatória']
  },
  notes: {
    type: String,
    trim: true,
    maxlength: [1000, 'Observações devem ter no máximo 1000 caracteres']
  },
  tags: [{
    type: String,
    trim: true,
    maxlength: [30, 'Tag deve ter no máximo 30 caracteres']
  }],
  location: {
    city: String,
    state: String,
    country: { type: String, default: 'Brasil' }
  }
}, {
  timestamps: true,
  toJSON: { virtuals: true },
  toObject: { virtuals: true }
});

// Virtual para calcular valor total com desconto
saleSchema.virtual('totalWithDiscount').get(function() {
  const discountAmount = (this.amount * this.discount) / 100;
  return this.amount - discountAmount;
});

// Índices para otimizar consultas
saleSchema.index({ seller: 1, saleDate: -1 });
saleSchema.index({ status: 1 });
saleSchema.index({ saleDate: -1 });
saleSchema.index({ 'customer.email': 1 });
saleSchema.index({ 'product.category': 1 });

// Middleware para calcular comissão antes de salvar
saleSchema.pre('save', function(next) {
  if (this.isModified('amount') || this.isModified('commission.rate')) {
    this.commission.amount = (this.amount * this.commission.rate) / 100;
  }
  next();
});

// Método estático para obter vendas por período
saleSchema.statics.getByPeriod = function(sellerId, startDate, endDate) {
  return this.find({
    seller: sellerId,
    saleDate: {
      $gte: startDate,
      $lte: endDate
    },
    status: { $ne: 'Cancelada' }
  }).sort({ saleDate: -1 });
};

// Método estático para calcular total de vendas por vendedor
saleSchema.statics.getTotalBySeller = function(sellerId, startDate, endDate) {
  const matchStage = {
    seller: new mongoose.Types.ObjectId(sellerId),
    status: { $ne: 'Cancelada' }
  };

  if (startDate && endDate) {
    matchStage.saleDate = {
      $gte: startDate,
      $lte: endDate
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$seller',
        totalAmount: { $sum: '$amount' },
        totalSales: { $sum: 1 },
        avgSaleAmount: { $avg: '$amount' },
        totalCommission: { $sum: '$commission.amount' }
      }
    }
  ]);
};

// Método estático para ranking de vendedores
saleSchema.statics.getRanking = function(startDate, endDate, limit = 10) {
  const matchStage = {
    status: { $ne: 'Cancelada' }
  };

  if (startDate && endDate) {
    matchStage.saleDate = {
      $gte: startDate,
      $lte: endDate
    };
  }

  return this.aggregate([
    { $match: matchStage },
    {
      $group: {
        _id: '$seller',
        totalAmount: { $sum: '$amount' },
        totalSales: { $sum: 1 },
        avgSaleAmount: { $avg: '$amount' }
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
    { $limit: limit },
    {
      $project: {
        _id: 1,
        totalAmount: 1,
        totalSales: 1,
        avgSaleAmount: 1,
        seller: {
          _id: 1,
          name: 1,
          email: 1,
          avatar: 1,
          department: 1
        }
      }
    }
  ]);
};

// Adicionar plugin de paginação
saleSchema.plugin(mongoosePaginate);

module.exports = mongoose.model('Sale', saleSchema);