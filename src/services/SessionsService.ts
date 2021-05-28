import betfairLoginApi from '../config/betfairLoginApi';

class SessionsService {
  public async auth(username: string, password: string): Promise<void> {
    try {
      const response = await betfairLoginApi.post('/localAuth', {
        username,
        password,
      });

      return response.data;
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
