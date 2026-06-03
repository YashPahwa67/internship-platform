import Joi from 'joi';
import { ROLES } from '../constants/roles.js';

export const registerSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().min(8).pattern(/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)/).required()
    .messages({ 'string.pattern.base': 'Password must contain upper, lower, and digit' }),
  role: Joi.string().valid(ROLES.STUDENT, ROLES.COMPANY_HR).required(),
  firstName: Joi.string().min(1).max(100).required(),
  lastName: Joi.string().min(1).max(100).required(),
  companyName: Joi.when('role', { is: ROLES.COMPANY_HR, then: Joi.string().min(2).required(), otherwise: Joi.forbidden() }),
});

export const loginSchema = Joi.object({
  email: Joi.string().email().required(),
  password: Joi.string().required(),
});
