import { Request, Response, NextFunction } from 'express';
import { jwtVerify } from 'jose';

declare global {
  namespace Express {
    interface Request {
      user: { id: string };
    }
  }
}

export async function authenticate(req: Request, res: Response, next: NextFunction) {
  const authHeader = req.headers.authorization;
  if (!authHeader?.startsWith('Bearer ')) {
    return res.status(401).json({ message: 'Unauthorized' });
  }

  const token = authHeader.split(' ')[1];
  try {
    const { payload } = await jwtVerify(
      token,
      new TextEncoder().encode(process.env.JWT_SECRET)
    );
    
    req.user = { id: payload.sub as string };
    next();
  } catch {
    res.status(401).json({ message: 'Invalid token' });
  }
}