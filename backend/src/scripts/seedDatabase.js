require('dotenv').config();
const mongoose = require('mongoose');
const User = require('../models/User');
const Sale = require('../models/Sale');
const Achievement = require('../models/Achievement');

const connectDB = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    console.log('MongoDB conectado para seeding');
  } catch (error) {
    console.error('Erro ao conectar ao MongoDB:', error);
    process.exit(1);
  }
};

const seedUsers = async () => {
  try {
    // Limpar usuários existentes
    await User.deleteMany({});
    
    const users = [
      {
        name: 'Admin Demo',
        email: 'admin@demo.com',
        password: 'Admin123',
        role: 'Administrador',
        department: 'Administração',
        position: 'Administrador do Sistema',
        salesTarget: {
          daily: 1000,
          weekly: 5000,
          monthly: 20000
        },
        totalSales: 0,
        level: 1,
        experience: 0,
        isActive: true
      },
      {
        name: 'João Silva',
        email: 'vendedor@demo.com',
        password: 'Vendedor123',
        role: 'Colaborador',
        department: 'Vendas',
        position: 'Vendedor Sênior',
        salesTarget: {
          daily: 500,
          weekly: 2500,
          monthly: 10000
        },
        totalSales: 15000,
        level: 3,
        experience: 2500,
        isActive: true
      },
      {
        name: 'Maria Santos',
        email: 'maria@demo.com',
        password: 'Vendedor123',
        role: 'Colaborador',
        department: 'Vendas',
        position: 'Vendedora',
        salesTarget: {
          daily: 400,
          weekly: 2000,
          monthly: 8000
        },
        totalSales: 12000,
        level: 2,
        experience: 1800,
        isActive: true
      },
      {
        name: 'Pedro Costa',
        email: 'pedro@demo.com',
        password: 'Vendedor123',
        role: 'Colaborador',
        department: 'Vendas',
        position: 'Vendedor Júnior',
        salesTarget: {
          daily: 300,
          weekly: 1500,
          monthly: 6000
        },
        totalSales: 8500,
        level: 2,
        experience: 1200,
        isActive: true
      },
      {
        name: 'Ana Oliveira',
        email: 'ana@demo.com',
        password: 'Vendedor123',
        role: 'Colaborador',
        department: 'Vendas',
        position: 'Vendedora',
        salesTarget: {
          daily: 350,
          weekly: 1750,
          monthly: 7000
        },
        totalSales: 9800,
        level: 2,
        experience: 1500,
        isActive: true
      }
    ];

    const createdUsers = await User.insertMany(users);
    console.log('Usuários criados com sucesso!');
    return createdUsers;
  } catch (error) {
    console.error('Erro ao criar usuários:', error);
  }
};

const seedSales = async (users) => {
  try {
    // Limpar vendas existentes
    await Sale.deleteMany({});
    
    const sellers = users.filter(user => user.role === 'Colaborador');
    const sales = [];

    // Gerar vendas dos últimos 30 dias
    const today = new Date();
    
    for (let i = 0; i < 30; i++) {
      const saleDate = new Date(today);
      saleDate.setDate(today.getDate() - i);
      
      // Número aleatório de vendas por dia (0-5)
      const salesPerDay = Math.floor(Math.random() * 6);
      
      for (let j = 0; j < salesPerDay; j++) {
        const seller = sellers[Math.floor(Math.random() * sellers.length)];
        
        const products = [
          { name: 'Notebook Dell', category: 'Eletrônicos', basePrice: 2500 },
          { name: 'Smartphone Samsung', category: 'Eletrônicos', basePrice: 1200 },
          { name: 'Tablet iPad', category: 'Eletrônicos', basePrice: 1800 },
          { name: 'Monitor LG', category: 'Eletrônicos', basePrice: 800 },
          { name: 'Impressora HP', category: 'Eletrônicos', basePrice: 600 },
          { name: 'Software Office', category: 'Software', basePrice: 300 },
          { name: 'Antivírus Premium', category: 'Software', basePrice: 150 },
          { name: 'Suporte Técnico', category: 'Serviços', basePrice: 200 },
          { name: 'Consultoria TI', category: 'Serviços', basePrice: 500 }
        ];
        
        const product = products[Math.floor(Math.random() * products.length)];
        const quantity = Math.floor(Math.random() * 3) + 1;
        const unitPrice = product.basePrice + (Math.random() * 500 - 250); // Variação de preço
        const amount = unitPrice * quantity;
        const discount = Math.random() < 0.3 ? Math.floor(Math.random() * 10) : 0;
        
        const sale = {
          seller: seller._id,
          customer: {
            name: `Cliente ${Math.floor(Math.random() * 1000)}`,
            email: `cliente${Math.floor(Math.random() * 1000)}@email.com`,
            phone: `(11) 9${Math.floor(Math.random() * 10000)}-${Math.floor(Math.random() * 10000)}`,
            company: Math.random() < 0.7 ? `Empresa ${Math.floor(Math.random() * 100)}` : null
          },
          product: {
            name: product.name,
            category: product.category,
            description: `${product.name} - Produto de alta qualidade`
          },
          amount: amount,
          quantity: quantity,
          unitPrice: unitPrice,
          discount: discount,
          status: Math.random() < 0.9 ? 'Confirmada' : (Math.random() < 0.5 ? 'Pendente' : 'Cancelada'),
          paymentMethod: ['PIX', 'Cartão de Crédito', 'Cartão de Débito', 'Boleto'][Math.floor(Math.random() * 4)],
          saleDate: saleDate,
          commission: {
            rate: 5,
            amount: amount * 0.05
          },
          notes: Math.random() < 0.3 ? 'Venda realizada com desconto especial' : null,
          location: {
            city: 'São Paulo',
            state: 'SP',
            country: 'Brasil'
          }
        };
        
        sales.push(sale);
      }
    }

    await Sale.insertMany(sales);
    console.log(`${sales.length} vendas criadas com sucesso!`);
    
    // Atualizar total de vendas dos usuários
    for (const seller of sellers) {
      const totalSales = await Sale.aggregate([
        {
          $match: {
            seller: seller._id,
            status: { $ne: 'Cancelada' }
          }
        },
        {
          $group: {
            _id: null,
            total: { $sum: '$amount' }
          }
        }
      ]);
      
      const total = totalSales[0]?.total || 0;
      await User.findByIdAndUpdate(seller._id, { totalSales: total });
    }
    
    console.log('Totais de vendas atualizados!');
  } catch (error) {
    console.error('Erro ao criar vendas:', error);
  }
};

const seedAchievements = async (users) => {
  try {
    // Limpar conquistas existentes
    await Achievement.deleteMany({});
    
    const sellers = users.filter(user => user.role === 'Colaborador');
    const achievements = [];
    
    // Criar algumas conquistas para os vendedores
    for (const seller of sellers) {
      // Primeira venda
      achievements.push({
        user: seller._id,
        type: 'PRIMEIRA_VENDA',
        name: 'Primeira Venda',
        description: 'Parabéns pela sua primeira venda!',
        icon: '🎉',
        level: 1,
        rarity: 'Comum',
        experiencePoints: 100,
        criteria: { value: 1, metric: 'vendas', period: 'total' },
        color: '#4CAF50',
        dateEarned: new Date(Date.now() - Math.random() * 30 * 24 * 60 * 60 * 1000)
      });
      
      // Volume de vendas baseado no total atual
      if (seller.totalSales >= 10000) {
        achievements.push({
          user: seller._id,
          type: 'VENDAS_VOLUME',
          name: 'Vendedor Experiente',
          description: 'Realizou mais de R$ 10.000 em vendas',
          icon: '🏆',
          level: 2,
          rarity: 'Raro',
          experiencePoints: 500,
          criteria: { value: 10000, metric: 'valor', period: 'total' },
          color: '#FF9800',
          dateEarned: new Date(Date.now() - Math.random() * 15 * 24 * 60 * 60 * 1000)
        });
      }
      
      // Meta diária
      if (Math.random() < 0.6) {
        achievements.push({
          user: seller._id,
          type: 'META_DIARIA',
          name: 'Meta Diária Bronze',
          description: 'Atingiu a meta diária de vendas',
          icon: '🥉',
          level: 1,
          rarity: 'Comum',
          experiencePoints: 50,
          criteria: { value: 1, metric: 'vendas', period: 'dia' },
          color: '#CD7F32',
          dateEarned: new Date(Date.now() - Math.random() * 7 * 24 * 60 * 60 * 1000)
        });
      }
    }
    
    await Achievement.insertMany(achievements);
    console.log(`${achievements.length} conquistas criadas com sucesso!`);
  } catch (error) {
    console.error('Erro ao criar conquistas:', error);
  }
};

const seedDatabase = async () => {
  await connectDB();
  
  console.log('🌱 Iniciando seed do banco de dados...');
  
  const users = await seedUsers();
  await seedSales(users);
  await seedAchievements(users);
  
  console.log('✅ Seed do banco de dados concluído!');
  console.log('\n📋 Credenciais de acesso:');
  console.log('Admin: admin@demo.com / Admin123');
  console.log('Vendedor: vendedor@demo.com / Vendedor123');
  console.log('Maria: maria@demo.com / Vendedor123');
  console.log('Pedro: pedro@demo.com / Vendedor123');
  console.log('Ana: ana@demo.com / Vendedor123');
  
  process.exit(0);
};

// Executar seed se chamado diretamente
if (require.main === module) {
  seedDatabase();
}

module.exports = seedDatabase;