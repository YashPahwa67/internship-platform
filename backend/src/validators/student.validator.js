import Joi from 'joi';

const urlOptional = Joi.string().uri().allow('', null);

const educationItem = Joi.object({
  institution: Joi.string().trim().max(200).required(),
  degree: Joi.string().trim().max(120),
  fieldOfStudy: Joi.string().trim().max(120),
  startYear: Joi.number().integer().min(1990).max(2040),
  endYear: Joi.number().integer().min(1990).max(2040),
  grade: Joi.string().trim().max(50),
  description: Joi.string().max(500),
});

const projectItem = Joi.object({
  title: Joi.string().trim().max(200).required(),
  description: Joi.string().max(1000),
  url: urlOptional,
  technologies: Joi.array().items(Joi.string().trim().max(50)).max(20),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
});

const experienceItem = Joi.object({
  company: Joi.string().trim().max(200).required(),
  role: Joi.string().trim().max(200).required(),
  description: Joi.string().max(1000),
  startDate: Joi.date().iso(),
  endDate: Joi.date().iso(),
  current: Joi.boolean(),
});

const certificationItem = Joi.object({
  name: Joi.string().trim().max(200).required(),
  issuer: Joi.string().trim().max(200),
  issueDate: Joi.date().iso(),
  expiryDate: Joi.date().iso(),
  credentialUrl: urlOptional,
});

export const updateProfileSchema = Joi.object({
  fullName: Joi.string().trim().max(120),
  phone: Joi.string().trim().max(20).pattern(/^[+\d\s()-]*$/),
  college: Joi.string().trim().max(200),
  university: Joi.string().trim().max(200),
  degree: Joi.string().trim().max(120),
  skills: Joi.array().items(Joi.string().trim().max(50)).max(30),
  bio: Joi.string().max(2000).allow(''),
  linkedIn: urlOptional,
  github: urlOptional,
  portfolio: urlOptional,
  location: Joi.string().trim().max(120),
  graduationYear: Joi.number().integer().min(1990).max(2040),
  education: Joi.array().items(educationItem).max(10),
  projects: Joi.array().items(projectItem).max(20),
  experience: Joi.array().items(experienceItem).max(20),
  certifications: Joi.array().items(certificationItem).max(20),
}).min(1);
