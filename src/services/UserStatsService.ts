import { getRepository } from 'typeorm';
import {
  addMonths,
  endOfDay,
  format,
  getMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
} from 'date-fns';

import UserStatsModel from '../models/UserStats';
import MonthConverter from '../helpers/MonthConverter';

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
  month: Date;
  startBank: number;
  finalBank: number;
  profitLoss: number;
  withdraws: number;
  deposits: number;
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
  ): Promise<BankByYear[]> {
    const userStatsRepository = getRepository(UserStatsModel);
    const monthConverter = new MonthConverter();
    const initialDate = startOfYear(parseISO(date));

    let startBank;
    let finalBank;

    const stats = [];

    for (let index = 0; index < 12; index++) {
      const month = addMonths(initialDate, index);

      const stat = await userStatsRepository
        .createQueryBuilder('userstats')
        .select(`id`)
        .select(`user_id`)
        .select(`month`)
        .addSelect(`"startBank"`)
        .addSelect(`"finalBank"`)
        .addSelect(`"profitLoss"`)
        .addSelect(`"roiBank"`)
        .where(`user_id = '${user_id}'`)
        .andWhere(
          `month BETWEEN '${format(
            startOfDay(month),
            'yyyy-MM-dd HH:mm:ss',
          )}' AND '${format(endOfDay(month), 'yyyy-MM-dd HH:mm:ss')}'`,
        )
        .getRawOne();

      if (stat) {
        startBank = Number(stat.startBank);
        finalBank = Number(stat.finalBank);

        stats.push({
          month: monthConverter.toString(getMonth(stat.month)),
          startBank,
          finalBank,
          profitLoss: Number(stat.profitLoss),
          withdraws: 0,
          deposits: 0,
          roi: Number(Number(stat.roiBank) * 100).toFixed(2),
        });
      } else {
        stats.push({
          month: monthConverter.toString(getMonth(startOfDay(month))),
          startBank: finalBank || 0,
          finalBank: finalBank || 0,
          profitLoss: 0,
          withdraws: 0,
          deposits: 0,
          roi: 0,
        });
      }
    }

    return stats;
  }

  public async findBetfairBankByYear(
    user_id: string,
    date: string,
  ): Promise<BetfairBankByYear[] | null> {
    const userStatsRepository = getRepository(UserStatsModel);
    const monthConverter = new MonthConverter();

    const initialDate = startOfYear(parseISO(date));

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
        .addSelect(`"startBankBetfair"`)
        .addSelect(`"finalBankBetfair"`)
        .addSelect(`"profitLoss"`)
        .where(`user_id = '${user_id}'`)
        .andWhere(
          `month BETWEEN '${format(
            startOfDay(month),
            'yyyy-MM-dd HH:mm:ss',
          )}' AND '${format(endOfDay(month), 'yyyy-MM-dd HH:mm:ss')}'`,
        )
        .getRawOne();

      if (stat) {
        startBankBetfair = Number(stat.startBankBetfair);
        finalBankBetfair = Number(stat.finalBankBetfair);

        stats.push({
          month: monthConverter.toString(getMonth(stat.month)),
          startBankBetfair,
          finalBankBetfair,
          profitLoss: Number(stat.profitLoss),
          withdraws: 0,
          deposits: 0,
        });
      } else {
        stats.push({
          month: monthConverter.toString(getMonth(startOfDay(month))),
          startBankBetfair: finalBankBetfair || 0,
          finalBankBetfair: finalBankBetfair || 0,
          profitLoss: 0,
          withdraws: 0,
          deposits: 0,
        });
      }
    }

    return stats;
  }
}

export default StatsService;
