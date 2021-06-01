import { getRepository } from 'typeorm';
import betfairLoginApi from '../config/betfairLoginApi';

import User from '../models/User';

interface UserAuth {
  token: string;
  user_id: string;
}

class SessionsService {
  public async auth(username: string, password: string): Promise<UserAuth> {
    try {
      const userRepository = getRepository(User);
      let user_id;

      const response = await betfairLoginApi.post('/localAuth', {
        username,
        password,
      });

      if (response.data) {
        const user = await userRepository.findOne({ loginBetfair: username });

        if (user) user_id = user.id;
      }

      return {
        token: response.data,
        user_id,
      };
    } catch {
      throw new Error('Invalid username or password.');
    }
  }

  public async validate(token: string): Promise<void> {
    const response = await betfairLoginApi.post('/validate', {
      token,
    });

    return response.data;
  }
}

export default SessionsService;
