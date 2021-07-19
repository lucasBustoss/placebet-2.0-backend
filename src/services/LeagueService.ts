import { getRepository, IsNull } from 'typeorm';

import League from '../models/League';

class MethodService {
  public async find(user_id: string): Promise<League[]> {
    const leagueRepository = getRepository(League);

    const leagues = await leagueRepository.find({
      where: [{ user_id }, { user_id: IsNull() }],
    });

    return leagues;
  }
}

export default MethodService;
