import { parseISO, format } from 'date-fns';
import { getRepository } from 'typeorm';

import User from '../models/User';

class UserService {
  public async create(
    username: string,
    appKey: string,
    name: string,
    email: string,
    money: string,
    startBank: number,
    startBetfairBank: number,
    date: string,
    number: number,
    stake: number,
    visibility: number,
  ): Promise<User> {
    const userRepository = getRepository(User);

    const user = userRepository.create({
      loginBetfair: username,
      emailBetfair: email,
      appKey,
      name,
      currencyType: money,
      startBank,
      startBetfairBank,
      date: parseISO(date),
      moneyType: number,
      stake,
      visibility,
    });

    await userRepository.save(user);

    return user;
  }
}

export default UserService;
