const mongoose = require('mongoose');

const connectDB = async () => {
  try {
    console.log('🔍 DEBUG: Tentando conectar ao MongoDB...');
    console.log('🔍 DEBUG: MONGODB_URI:', process.env.MONGODB_URI);
    console.log('🔍 DEBUG: NODE_ENV:', process.env.NODE_ENV);
    
    const conn = await mongoose.connect(process.env.MONGODB_URI, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });

    console.log(`MongoDB Connected: ${conn.connection.host}`);
    console.log(`🔍 DEBUG: Database name: ${conn.connection.name}`);
    
    // Verificar se existem usuários
    const User = require('../models/User');
    const userCount = await User.countDocuments();
    console.log(`🔍 DEBUG: Usuários no banco: ${userCount}`);
    
    if (userCount === 0) {
      console.log('⚠️  AVISO: Nenhum usuário encontrado no banco de dados!');
      console.log('💡 Execute npm run seed para criar usuários');
    } else {
      const users = await User.find({}).select('email isActive').limit(3);
      console.log('🔍 DEBUG: Primeiros usuários:');
      users.forEach(user => {
        console.log(`  - ${user.email} (ativo: ${user.isActive})`);
      });
    }
    
    // Event listeners para conexão
    mongoose.connection.on('connected', () => {
      console.log('Mongoose connected to MongoDB');
    });

    mongoose.connection.on('error', (err) => {
      console.error('Mongoose connection error:', err);
    });

    mongoose.connection.on('disconnected', () => {
      console.log('Mongoose disconnected from MongoDB');
    });

    // Graceful shutdown
    process.on('SIGINT', async () => {
      await mongoose.connection.close();
      console.log('MongoDB connection closed through app termination');
      process.exit(0);
    });

  } catch (error) {
    console.error('Database connection failed:', error.message);
    process.exit(1);
  }
};

module.exports = connectDB;