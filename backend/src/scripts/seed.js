import mongoose from 'mongoose';
import dotenv from 'dotenv';
import { User } from '../models/User.js';
import { Company } from '../models/Company.js';
import { Student } from '../models/Student.js';
import { Internship } from '../models/Internship.js';
import { ROLES } from '../constants/roles.js';

dotenv.config();

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/internship_platform';

async function seed() {
  await mongoose.connect(MONGODB_URI);
  console.log('Seeding database...');

  await Promise.all([
    User.deleteMany({}),
    Company.deleteMany({}),
    Student.deleteMany({}),
    Internship.deleteMany({}),
  ]);

  const adminHash = await User.hashPassword('Admin123!');
  const admin = await User.create({
    email: 'admin@imp.com',
    passwordHash: adminHash,
    role: ROLES.ADMIN,
    firstName: 'Platform',
    lastName: 'Admin',
    status: 'active',
  });

  const company = await Company.create({
    name: 'Acme Corp',
    slug: 'acme-corp',
    description: 'Leading technology company building the future of work.',
    website: 'https://acme.example.com',
    industry: 'Technology',
    approvalStatus: 'approved',
    approvedAt: new Date(),
  });

  const hrHash = await User.hashPassword('Company123!');
  const hr = await User.create({
    email: 'hr@acme.com',
    passwordHash: hrHash,
    role: ROLES.COMPANY_HR,
    firstName: 'Bob',
    lastName: 'HR',
    companyId: company._id,
    status: 'active',
  });

  const studentHash = await User.hashPassword('Student123!');
  const studentUser = await User.create({
    email: 'student@university.edu',
    passwordHash: studentHash,
    role: ROLES.STUDENT,
    firstName: 'Jane',
    lastName: 'Doe',
    status: 'active',
  });

  await Student.create({
    userId: studentUser._id,
    fullName: 'Jane Doe',
    college: 'MIT',
    university: 'MIT',
    degree: 'B.S. Computer Science',
    graduationYear: 2027,
    phone: '+91 9876543210',
    skills: ['React', 'Node.js', 'TypeScript', 'MongoDB'],
    bio: 'Passionate full-stack developer seeking internship opportunities.',
    location: 'Bangalore, India',
    linkedIn: 'https://linkedin.com/in/janedoe',
    github: 'https://github.com/janedoe',
    education: [
      {
        institution: 'MIT',
        degree: 'Bachelor of Science',
        fieldOfStudy: 'Computer Science',
        startYear: 2023,
        endYear: 2027,
      },
    ],
    projects: [
      {
        title: 'IMP Portfolio',
        description: 'Internship platform built with MERN stack',
        technologies: ['React', 'Node.js', 'MongoDB'],
      },
    ],
  });

  const internships = [
    {
      title: 'Frontend Developer Intern',
      slug: 'frontend-developer-intern',
      description: 'Join our product team to build modern React applications. You will work with senior engineers on real customer features.',
      requirements: ['React experience', 'JavaScript/TypeScript', 'Git basics'],
      skills: ['React', 'TypeScript', 'CSS'],
      type: 'remote',
      location: 'Remote',
      stipend: { min: 15000, max: 25000, currency: 'INR' },
      durationWeeks: 12,
      openings: 3,
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'Backend Developer Intern',
      slug: 'backend-developer-intern',
      description: 'Build scalable APIs with Node.js and MongoDB. Learn microservices patterns and cloud deployment.',
      requirements: ['Node.js', 'REST APIs', 'Database fundamentals'],
      skills: ['Node.js', 'MongoDB', 'Express'],
      type: 'hybrid',
      location: 'Bangalore',
      stipend: { min: 18000, max: 28000, currency: 'INR' },
      durationWeeks: 12,
      openings: 2,
      status: 'published',
      publishedAt: new Date(),
    },
    {
      title: 'Data Science Intern',
      slug: 'data-science-intern',
      description: 'Analyze user behavior data and build ML models for recommendation systems.',
      requirements: ['Python', 'Statistics', 'Pandas/NumPy'],
      skills: ['Python', 'Machine Learning', 'SQL'],
      type: 'onsite',
      location: 'Mumbai',
      stipend: { min: 20000, max: 30000, currency: 'INR' },
      durationWeeks: 16,
      openings: 1,
      status: 'published',
      publishedAt: new Date(),
    },
  ];

  for (const data of internships) {
    await Internship.create({
      ...data,
      companyId: company._id,
      createdBy: hr._id,
      applicationDeadline: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
    });
  }

  console.log('\nSeed complete! Demo accounts:\n');
  console.log('  Admin:   admin@imp.com / Admin123!');
  console.log('  HR:      hr@acme.com / Company123!');
  console.log('  Student: student@university.edu / Student123!\n');

  await mongoose.disconnect();
}

seed().catch((e) => {
  console.error(e);
  process.exit(1);
});
