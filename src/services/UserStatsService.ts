import { getRepository } from 'typeorm';
import {
  addMonths,
  endOfDay,
  format,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
  startOfYesterday,
} from 'date-fns';

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

interface BankByYear {
  month: string;
  startBank: number;
  profitLoss: number;
  withdraws: number;
  deposits: number;
  finalBank: number;
  roi: number;
}

interface BetfairBankByYear {
  month: string;
  startBank: number;
  profitLoss: number;
  withdraws: number;
  deposits: number;
  finalBank: number;
}

class StatsService {
  public async find(user_id: string, date: string): Promise<UserStats | null> {
    const statsRepository = getRepository(UserStatsModel);
    const month = parseISO(format(startOfMonth(parseISO(date)), 'yyyy-MM-dd'));

    const stats = await statsRepository
      .createQueryBuilder('userstats')
      .select()
      .where(`user_id = '${user_id}'`)
      .andWhere(
        `month BETWEEN '${format(
          startOfDay(month),
          'yyyy-MM-dd HH:mm:ss',
        )}' AND '${format(endOfDay(month), 'yyyy-MM-dd HH:mm:ss')}'`,
      )
      .getRawOne();

    // const stats = await statsRepository.findOne({
    //   user_id,
    //   month,
    // });

    if (stats) {
      return {
        month: format(stats.userstats_month, 'MM-yyyy'),
        stake: stats.userstats_stake,
        startBank: stats.userstats_startBank,
        finalBank: stats.userstats_finalBank,
        startBankBetfair: stats.userstats_startBankBetfair,
        finalBankBetfair: stats.userstats_finalBankBetfair,
        profitLoss: stats.userstats_profitLoss,
        roiBank: Number(stats.userstats_roiBank * 100).toFixed(2),
        roiStake: Number(stats.userstats_roiStake * 100).toFixed(2),
      };
    }

    return null;
  }

  public async findBankByYear(
    user_id: string,
    date: string,
  ): Promise<BankByYear | null> {
    const userStatsRepository = getRepository(UserStatsModel);

    const initialDate = startOfYear(parseISO(date));

    let stake;
    let startBank;
    let finalBank;
    let startBankBetfair;
    let finalBankBetfair;

    const stats = [];

    for (let index = 0; index < 12; index++) {
      const month = addMonths(initialDate, index);

      const stat = await userStatsRepository
        .createQueryBuilder('userstats')
        .select(`id`)
        .select(`user_id`)
        .select(`month`)
        .addSelect(`stake`)
        .addSelect(`"startBank"`)
        .addSelect(`"finalBank"`)
        .addSelect(`"startBankBetfair"`)
        .addSelect(`"finalBankBetfair"`)
        .addSelect(`"profitLoss"`)
        .addSelect(`"roiBank"`)
        .addSelect(`"roiStake"`)
        .where(`user_id = '${user_id}'`)
        .andWhere(
          `month BETWEEN '${format(
            startOfDay(month),
            'yyyy-MM-dd HH:mm:ss',
          )}' AND '${format(endOfDay(month), 'yyyy-MM-dd HH:mm:ss')}'`,
        )
        .getRawOne();

      if (stat) {
        stake = stat.stake;
        startBank = stat.startBank;
        finalBank = stat.finalBank;
        startBankBetfair = stat.startBankBetfair;
        finalBankBetfair = stat.finalBankBetfair;

        stats.push({
          month: stat.month,
          stake,
          startBank,
          finalBank,
          startBankBetfair,
          finalBankBetfair,
          profitLoss: stat.profitLoss,
          roiBank: stat.roiBank,
          roiStake: stat.roiStake,
        });
      } else {
        stats.push({
          month: startOfDay(month),
          stake: stake || 0,
          startBank: startBank || 0,
          finalBank: finalBank || 0,
          startBankBetfair: startBankBetfair || 0,
          finalBankBetfair: finalBankBetfair || 0,
          profitLoss: 0,
          roiBank: 0,
          roiStake: 0,
        });
      }
    }

    return stats;
  }

  public async findBetfairBankByYear(
    user_id: string,
    date: string,
  ): Promise<BetfairBankByYear | null> { }
}

export default StatsService;
