const { body, query } = require('express-validator');

const createSaleValidation = [
  body('customer.name')
    .notEmpty()
    .withMessage('Nome do cliente é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do cliente deve ter entre 2 e 100 caracteres')
    .trim(),
  
  body('customer.email')
    .optional()
    .isEmail()
    .withMessage('Email do cliente inválido')
    .normalizeEmail(),
  
  body('customer.phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres')
    .trim(),
  
  body('customer.company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Empresa deve ter no máximo 100 caracteres')
    .trim(),
  
  body('product.name')
    .notEmpty()
    .withMessage('Nome do produto é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do produto deve ter entre 2 e 100 caracteres')
    .trim(),
  
  body('product.category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Categoria deve ter no máximo 50 caracteres')
    .trim(),
  
  body('product.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim(),
  
  body('amount')
    .isNumeric()
    .withMessage('Valor da venda deve ser um número')
    .isFloat({ min: 0.01 })
    .withMessage('Valor da venda deve ser maior que zero'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser pelo menos 1'),
  
  body('unitPrice')
    .isNumeric()
    .withMessage('Preço unitário deve ser um número')
    .isFloat({ min: 0.01 })
    .withMessage('Preço unitário deve ser maior que zero'),
  
  body('discount')
    .optional()
    .isNumeric()
    .withMessage('Desconto deve ser um número')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Desconto deve estar entre 0 e 100%'),
  
  body('status')
    .optional()
    .isIn(['Pendente', 'Confirmada', 'Cancelada', 'Reembolsada'])
    .withMessage('Status inválido'),
  
  body('paymentMethod')
    .notEmpty()
    .withMessage('Método de pagamento é obrigatório')
    .isIn(['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto', 'Transferência'])
    .withMessage('Método de pagamento inválido'),
  
  body('commission.rate')
    .optional()
    .isNumeric()
    .withMessage('Taxa de comissão deve ser um número')
    .isFloat({ min: 0, max: 50 })
    .withMessage('Taxa de comissão deve estar entre 0 e 50%'),
  
  body('saleDate')
    .optional()
    .isISO8601()
    .withMessage('Data da venda inválida')
    .toDate(),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações devem ter no máximo 1000 caracteres')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags devem ser um array'),
  
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Cada tag deve ter no máximo 30 caracteres')
    .trim(),
  
  body('location.city')
    .optional()
    .trim(),
  
  body('location.state')
    .optional()
    .trim(),
  
  body('location.country')
    .optional()
    .trim()
];

const updateSaleValidation = [
  body('customer.name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do cliente deve ter entre 2 e 100 caracteres')
    .trim(),
  
  body('customer.email')
    .optional()
    .isEmail()
    .withMessage('Email do cliente inválido')
    .normalizeEmail(),
  
  body('customer.phone')
    .optional()
    .isLength({ max: 20 })
    .withMessage('Telefone deve ter no máximo 20 caracteres')
    .trim(),
  
  body('customer.company')
    .optional()
    .isLength({ max: 100 })
    .withMessage('Empresa deve ter no máximo 100 caracteres')
    .trim(),
  
  body('product.name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome do produto deve ter entre 2 e 100 caracteres')
    .trim(),
  
  body('product.category')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Categoria deve ter no máximo 50 caracteres')
    .trim(),
  
  body('product.description')
    .optional()
    .isLength({ max: 500 })
    .withMessage('Descrição deve ter no máximo 500 caracteres')
    .trim(),
  
  body('amount')
    .optional()
    .isNumeric()
    .withMessage('Valor da venda deve ser um número')
    .isFloat({ min: 0.01 })
    .withMessage('Valor da venda deve ser maior que zero'),
  
  body('quantity')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Quantidade deve ser pelo menos 1'),
  
  body('unitPrice')
    .optional()
    .isNumeric()
    .withMessage('Preço unitário deve ser um número')
    .isFloat({ min: 0.01 })
    .withMessage('Preço unitário deve ser maior que zero'),
  
  body('discount')
    .optional()
    .isNumeric()
    .withMessage('Desconto deve ser um número')
    .isFloat({ min: 0, max: 100 })
    .withMessage('Desconto deve estar entre 0 e 100%'),
  
  body('status')
    .optional()
    .isIn(['Pendente', 'Confirmada', 'Cancelada', 'Reembolsada'])
    .withMessage('Status inválido'),
  
  body('paymentMethod')
    .optional()
    .isIn(['Dinheiro', 'Cartão de Crédito', 'Cartão de Débito', 'PIX', 'Boleto', 'Transferência'])
    .withMessage('Método de pagamento inválido'),
  
  body('commission.rate')
    .optional()
    .isNumeric()
    .withMessage('Taxa de comissão deve ser um número')
    .isFloat({ min: 0, max: 50 })
    .withMessage('Taxa de comissão deve estar entre 0 e 50%'),
  
  body('saleDate')
    .optional()
    .isISO8601()
    .withMessage('Data da venda inválida')
    .toDate(),
  
  body('notes')
    .optional()
    .isLength({ max: 1000 })
    .withMessage('Observações devem ter no máximo 1000 caracteres')
    .trim(),
  
  body('tags')
    .optional()
    .isArray()
    .withMessage('Tags devem ser um array'),
  
  body('tags.*')
    .optional()
    .isLength({ max: 30 })
    .withMessage('Cada tag deve ter no máximo 30 caracteres')
    .trim()
];

const getSalesValidation = [
  query('page')
    .optional()
    .isInt({ min: 1 })
    .withMessage('Página deve ser um número positivo'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 100 })
    .withMessage('Limite deve ser entre 1 e 100'),
  
  query('status')
    .optional()
    .isIn(['Pendente', 'Confirmada', 'Cancelada', 'Reembolsada'])
    .withMessage('Status inválido'),
  
  query('startDate')
    .optional()
    .isISO8601()
    .withMessage('Data inicial inválida')
    .toDate(),
  
  query('endDate')
    .optional()
    .isISO8601()
    .withMessage('Data final inválida')
    .toDate(),
  
  query('sellerId')
    .optional()
    .isMongoId()
    .withMessage('ID do vendedor inválido'),
  
  query('productCategory')
    .optional()
    .trim()
];

const getRankingValidation = [
  query('period')
    .optional()
    .isIn(['day', 'week', 'month', 'all'])
    .withMessage('Período deve ser: day, week, month ou all'),
  
  query('limit')
    .optional()
    .isInt({ min: 1, max: 50 })
    .withMessage('Limite deve ser entre 1 e 50')
];

const getSalesStatsValidation = [
  query('sellerId')
    .optional()
    .isMongoId()
    .withMessage('ID do vendedor inválido'),
  
  query('period')
    .optional()
    .isIn(['day', 'week', 'month'])
    .withMessage('Período deve ser: day, week ou month')
];

module.exports = {
  createSaleValidation,
  updateSaleValidation,
  getSalesValidation,
  getRankingValidation,
  getSalesStatsValidation
};