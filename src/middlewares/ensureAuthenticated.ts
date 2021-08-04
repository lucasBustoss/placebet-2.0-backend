import { Request, Response, NextFunction } from 'express';
import betfairLoginApi from '../config/betfairLoginApi';

export default async function ensureAuthenticated(
  request: Request,
  response: Response,
  next: NextFunction,
): Promise<void> {
  try {
    const authHeader = request.headers.authorization;
    const appKeyHeader = request.headers.appkey;
    const { user_id } = request.headers;

    if (!authHeader) {
      throw response.status(400).json({ error: 'Token is missing' });
    }

    if (!appKeyHeader) {
      throw response.status(400).json({ error: 'AppKey is missing' });
    }

    const tokenResponse = await betfairLoginApi.post('/validate', {
      token: authHeader,
      appKey: appKeyHeader,
    });

    if (tokenResponse.data === false) {
      throw response.status(400).json({
        error: 'Invalid token or appKey is not compatible with token!',
      });
    }

    if (user_id) {
      request.user = {
        id: user_id.toString(),
      };
    }

    return next();
  } catch (err) {
    throw new Error(err);
  }
}
