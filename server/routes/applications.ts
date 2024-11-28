import { Router } from 'express';
import { PrismaClient } from '@prisma/client';
import { z } from 'zod';

const router = Router();
const prisma = new PrismaClient();

const applicationSchema = z.object({
  company: z.string().min(1),
  position: z.string().min(1),
  status: z.enum(['applied', 'interviewing', 'offered', 'rejected', 'accepted']),
  dateApplied: z.string().transform(str => new Date(str)),
  location: z.string().min(1),
  salary: z.string().optional(),
  notes: z.string().optional(),
  contactPerson: z.string().optional(),
  contactEmail: z.string().email().optional(),
  nextFollowUp: z.string().transform(str => new Date(str)).optional(),
});

// Get all applications for user
router.get('/', async (req, res) => {
  const applications = await prisma.jobApplication.findMany({
    where: { userId: req.user.id },
    orderBy: { dateApplied: 'desc' },
  });
  res.json(applications);
});

// Create application
router.post('/', async (req, res) => {
  const data = applicationSchema.parse(req.body);
  const application = await prisma.jobApplication.create({
    data: {
      ...data,
      userId: req.user.id,
    },
  });
  res.status(201).json(application);
});

// Update application
router.put('/:id', async (req, res) => {
  const { id } = req.params;
  const data = applicationSchema.partial().parse(req.body);
  
  const application = await prisma.jobApplication.update({
    where: { 
      id,
      userId: req.user.id,
    },
    data,
  });
  
  res.json(application);
});

// Delete application
router.delete('/:id', async (req, res) => {
  const { id } = req.params;
  await prisma.jobApplication.delete({
    where: { 
      id,
      userId: req.user.id,
    },
  });
  res.status(204).send();
});

export { router as applicationsRouter };