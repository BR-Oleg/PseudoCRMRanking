const { body } = require('express-validator');

const registerValidation = [
  body('name')
    .notEmpty()
    .withMessage('Nome é obrigatório')
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim(),
  
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail()
    .isLength({ max: 255 })
    .withMessage('Email muito longo'),
  
  body('password')
    .isLength({ min: 6 })
    .withMessage('Senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número'),
  
  body('role')
    .optional()
    .isIn(['Administrador', 'Colaborador'])
    .withMessage('Perfil deve ser Administrador ou Colaborador'),
  
  body('department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Departamento deve ter no máximo 50 caracteres')
    .trim(),
  
  body('position')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Cargo deve ter no máximo 50 caracteres')
    .trim()
];

const loginValidation = [
  body('email')
    .isEmail()
    .withMessage('Email inválido')
    .normalizeEmail(),
  
  body('password')
    .notEmpty()
    .withMessage('Senha é obrigatória')
];

const updateProfileValidation = [
  body('name')
    .optional()
    .isLength({ min: 2, max: 100 })
    .withMessage('Nome deve ter entre 2 e 100 caracteres')
    .trim(),
  
  body('department')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Departamento deve ter no máximo 50 caracteres')
    .trim(),
  
  body('position')
    .optional()
    .isLength({ max: 50 })
    .withMessage('Cargo deve ter no máximo 50 caracteres')
    .trim(),
  
  body('salesTarget.daily')
    .optional()
    .isNumeric()
    .withMessage('Meta diária deve ser um número')
    .isFloat({ min: 0 })
    .withMessage('Meta diária não pode ser negativa'),
  
  body('salesTarget.weekly')
    .optional()
    .isNumeric()
    .withMessage('Meta semanal deve ser um número')
    .isFloat({ min: 0 })
    .withMessage('Meta semanal não pode ser negativa'),
  
  body('salesTarget.monthly')
    .optional()
    .isNumeric()
    .withMessage('Meta mensal deve ser um número')
    .isFloat({ min: 0 })
    .withMessage('Meta mensal não pode ser negativa')
];

const changePasswordValidation = [
  body('currentPassword')
    .notEmpty()
    .withMessage('Senha atual é obrigatória'),
  
  body('newPassword')
    .isLength({ min: 6 })
    .withMessage('Nova senha deve ter no mínimo 6 caracteres')
    .matches(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/)
    .withMessage('Nova senha deve conter pelo menos uma letra minúscula, uma maiúscula e um número')
];

module.exports = {
  registerValidation,
  loginValidation,
  updateProfileValidation,
  changePasswordValidation
};