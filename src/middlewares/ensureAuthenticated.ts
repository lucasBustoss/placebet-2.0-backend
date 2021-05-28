import { Request, Response, NextFunction } from 'express';
import betfairLoginApi from '../config/betfairLoginApi';

export default async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;

    if (!authHeader) {
      throw response.status(400).json({ error: 'Token is missing' });
    }

    const tokenResponse = await betfairLoginApi.post('/validate', {
      token: authHeader,
    });

    if (tokenResponse.data === false) {
      throw response.status(400).json({ error: 'Invalid Token!' });
    }

    return next();
  } catch (err) {
    throw new Error(err);
  }
}
