import { Request, Response } from 'express';
import { PrismaClient } from '@prisma/client';
import { SignJWT } from 'jose';
import { z } from 'zod';
import { logger } from '../../utils/logger';
import { generateResetToken } from '../../utils/tokens';
import { hashData } from '../../utils/crypto';

const prisma = new PrismaClient();

const registerSchema = z.object({
  email: z.string().email(),
  password: z.string().min(8),
  name: z.string().min(1),
  securityQuestion: z.string().min(1),
  securityAnswer: z.string().min(1)
});

const loginSchema = z.object({
  email: z.string().email(),
  password: z.string()
});

const verifySecuritySchema = z.object({
  email: z.string().email(),
  securityAnswer: z.string()
});

export async function register(req: Request, res: Response) {
  try {
    const { email, password, name, securityQuestion, securityAnswer } = registerSchema.parse(req.body);

    const existingUser = await prisma.user.findUnique({ where: { email } });
    if (existingUser) {
      return res.status(409).json({ message: 'Email already exists' });
    }

    const user = await prisma.user.create({
      data: {
        email,
        name,
        passwordHash: password,
        securityQuestion,
        securityAnswer
      },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true
      }
    });

    const token = await new SignJWT({ sub: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    res.status(201).json({ user, token });
  } catch (error) {
    logger.error('Registration failed', { error });
    res.status(400).json({ message: 'Registration failed' });
  }
}

export async function login(req: Request, res: Response) {
  try {
    const { email, password } = loginSchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: {
        id: true,
        email: true,
        name: true,
        createdAt: true,
        passwordHash: true
      }
    });

    if (!user || user.passwordHash !== password) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    const token = await new SignJWT({ sub: user.id })
      .setProtectedHeader({ alg: 'HS256' })
      .setExpirationTime('24h')
      .sign(new TextEncoder().encode(process.env.JWT_SECRET));

    const { passwordHash, ...userWithoutPassword } = user;
    res.json({ user: userWithoutPassword, token });
  } catch (error) {
    logger.error('Login failed', { error });
    res.status(400).json({ message: 'Login failed' });
  }
}

export async function verifySecurityAnswer(req: Request, res: Response) {
  try {
    const { email, securityAnswer } = verifySecuritySchema.parse(req.body);

    const user = await prisma.user.findUnique({
      where: { email },
      select: { id: true, securityAnswer: true }
    });

    if (!user || user.securityAnswer !== securityAnswer) {
      return res.status(401).json({ message: 'Invalid email or security answer' });
    }

    const resetToken = await generateResetToken(user.id);
    res.json({ resetToken });
  } catch (error) {
    logger.error('Security verification failed', { error });
    res.status(400).json({ message: 'Security verification failed' });
  }
}

export async function resetPassword(req: Request, res: Response) {
  try {
    const { token, newPassword } = req.body;

    const user = await prisma.user.findFirst({
      where: {
        resetToken: token,
        resetTokenExpires: { gt: new Date() }
      }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset token' });
    }

    await prisma.user.update({
      where: { id: user.id },
      data: {
        passwordHash: newPassword,
        resetToken: null,
        resetTokenExpires: null
      }
    });

    res.json({ message: 'Password reset successful' });
  } catch (error) {
    logger.error('Password reset failed', { error });
    res.status(400).json({ message: 'Password reset failed' });
  }
}