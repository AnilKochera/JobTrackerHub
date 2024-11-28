import { Router } from 'express';
import { register, login, verifySecurityAnswer, resetPassword } from './controllers';
import { checkRateLimit } from '../../utils/rateLimit';

const router = Router();

router.post('/register', async (req, res, next) => {
  const canProceed = await checkRateLimit(`register:${req.ip}`);
  if (!canProceed) {
    return res.status(429).json({ message: 'Too many registration attempts' });
  }
  next();
}, register);

router.post('/login', async (req, res, next) => {
  const canProceed = await checkRateLimit(`login:${req.ip}`);
  if (!canProceed) {
    return res.status(429).json({ message: 'Too many login attempts' });
  }
  next();
}, login);

router.post('/verify-security', async (req, res, next) => {
  const canProceed = await checkRateLimit(`verify:${req.ip}`);
  if (!canProceed) {
    return res.status(429).json({ message: 'Too many verification attempts' });
  }
  next();
}, verifySecurityAnswer);

router.post('/reset-password', async (req, res, next) => {
  const canProceed = await checkRateLimit(`reset:${req.ip}`);
  if (!canProceed) {
    return res.status(429).json({ message: 'Too many reset attempts' });
  }
  next();
}, resetPassword);

export { router as authRouter };