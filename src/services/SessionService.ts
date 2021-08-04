import { getRepository } from 'typeorm';
import betfairLoginApi from '../config/betfairLoginApi';

import User from '../models/User';

interface UserAuth {
  token: string;
  user: User;
  appKey: string;
}

class SessionsService {
  public async auth(username: string, password: string): Promise<UserAuth> {
    try {
      const userRepository = getRepository(User);
      let shouldGetAppKey = true;

      const user = await userRepository.findOne({ loginBetfair: username });

      if (user) {
        shouldGetAppKey = !user.appKey;
      }

      const response = await betfairLoginApi.post('/localAuth', {
        username,
        password,
        shouldGetAppKey,
      });

      if (response.data && user) {
        if (!user.appKey) {
          this.updateAppKey(user.id, response.data.appKey);
        }
      }

      return {
        token: response.data.token,
        appKey: shouldGetAppKey ? response.data.appKey : user.appKey,
        user,
      };
    } catch (err) {
      console.log(err);
      throw new Error('Invalid username or password.');
    }
  }

  public async validate(token: string, appKey: string): Promise<void> {
    const response = await betfairLoginApi.post('/validate', {
      token,
      appKey,
    });

    return response.data;
  }

  public async updateAppKey(user_id: string, appKey: string): Promise<void> {
    const userRepository = getRepository(User);

    const user = await userRepository.findOne({ id: user_id });

    if (user) {
      user.appKey = appKey;

      await userRepository.save(user);
    }
  }
}

export default SessionsService;
