import { getRepository } from 'typeorm';
import { format, parseISO } from 'date-fns';

import UserStatsModel from '../models/UserStats';

class StatsService {
  public async find(
    user_id: string,
    date: string,
  ): Promise<UserStatsModel | null> {
    const statsRepository = getRepository(UserStatsModel);
    const month = format(parseISO(date), 'MM-yyyy');

    const stats = await statsRepository.findOne({
      user_id,
      month,
    });

    if (stats) {
      return stats;
    }

    return null;
  }
}

export default StatsService;
