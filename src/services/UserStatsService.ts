import { getRepository } from 'typeorm';
import { format, parseISO } from 'date-fns';

import UserStatsModel from '../models/UserStats';

interface UserStats {
  month: string;
  stake: number;
  startBank: number;
  finalBank: number;
  startBankBetfair: number;
  finalBankBetfair: number;
  profitLoss: number;
  roiBank: string;
  roiStake: string;
}

class StatsService {
  public async find(user_id: string, date: string): Promise<UserStats | null> {
    const statsRepository = getRepository(UserStatsModel);
    const month = format(parseISO(date), 'MM-yyyy');

    const stats = await statsRepository.findOne({
      user_id,
      month,
    });

    if (stats) {
      return {
        month: stats.month,
        stake: stats.stake,
        startBank: stats.startBank,
        finalBank: stats.finalBank,
        startBankBetfair: stats.startBankBetfair,
        finalBankBetfair: stats.finalBankBetfair,
        profitLoss: stats.profitLoss,
        roiBank: Number(stats.roiBank * 100).toFixed(2),
        roiStake: Number(stats.roiStake * 100).toFixed(2),
      };
    }

    return null;
  }
}

export default StatsService;
