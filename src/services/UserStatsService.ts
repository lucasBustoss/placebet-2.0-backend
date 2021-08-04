import { getRepository, getManager } from 'typeorm';
import {
  addMonths,
  endOfDay,
  endOfMonth,
  format,
  getMonth,
  parseISO,
  startOfDay,
  startOfMonth,
  startOfYear,
  addHours,
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
  avgStake: string;
  marketsCount: string;
  goalsScored: string;
  goalsConceded: string;
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
    const startMonth = parseISO(
      format(startOfMonth(parseISO(date)), 'yyyy-MM-dd'),
    );
    const endMonth = parseISO(format(endOfMonth(parseISO(date)), 'yyyy-MM-dd'));
    const entityManager = getManager();

    const existsUserStats = await statsRepository.findOne({
      user_id,
      month: format(startOfMonth(new Date()), 'yyyy-MM-dd'),
    });

    if (!existsUserStats) {
      const previousMonth = format(
        addMonths(startOfMonth(new Date()), -1),
        'yyyy-MM-dd',
      );

      const previousStats = await statsRepository.findOne({
        user_id,
        month: previousMonth,
      });

      if (!previousStats) {
        await this.create(
          user_id,
          format(addHours(startOfMonth(new Date()), 3), 'yyyy-MM-dd HH:mm:ss'),
          previousStats.startBank,
          previousStats.startBankBetfair,
          previousStats.stake,
        );
      }
    }

    /* eslint-disable */

    const marketStats = await entityManager.query(`
      SELECT 
        avg(bets.stake) "avgStake",
        count(bets."marketId") "marketsCount",
        sum("profitLoss") "profitLoss",
        sum("goalsScored") "goalsScored",
        sum("goalsConceded") "goalsConceded"
      FROM "bets" 
      WHERE bets.user_id = '${user_id}'  
      AND date BETWEEN '${format(startOfDay(startMonth),
      'yyyy-MM-dd HH:mm:ss',
    )}' AND '${format(endOfDay(endMonth), 'yyyy-MM-dd HH:mm:ss')}'
    `);

    /* eslint-enable */

    const stats = await statsRepository
      .createQueryBuilder('userstats')
      .select()
      .where(`user_id = '${user_id}'`)
      .andWhere(
        `month BETWEEN '${format(
          startOfDay(startMonth),
          'yyyy-MM-dd HH:mm:ss',
        )}' AND '${format(endOfDay(startMonth), 'yyyy-MM-dd HH:mm:ss')}'`,
      )
      .getRawOne();

    if (stats) {
      const profitLoss = Number(marketStats[0].profitLoss) || 0;
      const roiBank = Number(
        (profitLoss / Number(stats.userstats_startBank)) * 100,
      ).toFixed(2);
      const roiStake = Number(
        (profitLoss / Number(stats.userstats_stake)) * 100,
      ).toFixed(2);

      return {
        month: format(stats.userstats_month, 'MM-yyyy'),
        stake: stats.userstats_stake,
        startBank: stats.userstats_startBank,
        finalBank: stats.userstats_finalBank,
        startBankBetfair: stats.userstats_startBankBetfair,
        finalBankBetfair: stats.userstats_finalBankBetfair,
        profitLoss,
        roiBank,
        roiStake,
        avgStake: Number(marketStats[0].avgStake).toFixed(2),
        marketsCount: marketStats[0].marketsCount,
        goalsScored: marketStats[0].goalsScored,
        goalsConceded: marketStats[0].goalsConceded,
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
    const entityManager = getManager();

    let startBank;
    let finalBank;

    const stats = [];

    for (let index = 0; index < 12; index++) {
      const month = addMonths(initialDate, index);

      const marketStats = await entityManager.query(`
      SELECT 
        sum("profitLoss") "profitLoss"
      FROM "bets" 
      WHERE bets.user_id = '${user_id}'  
      AND date BETWEEN '${format(
        startOfMonth(month),
        'yyyy-MM-dd HH:mm:ss',
      )}' AND '${format(endOfMonth(month), 'yyyy-MM-dd HH:mm:ss')}'
    `);

      const stat = await userStatsRepository
        .createQueryBuilder('userstats')
        .select(`id`)
        .select(`user_id`)
        .select(`month`)
        .addSelect(`"startBank"`)
        .addSelect(`"bankDeposits"`)
        .addSelect(`"bankWithdraws"`)
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
        finalBank =
          Number(stat.startBank) +
          Number(marketStats[0].profitLoss) -
          Number(stat.bankWithdraws) +
          Number(stat.bankDeposits);

        stats.push({
          monthDescription: monthConverter.toString(getMonth(stat.month)),
          month: format(stat.month, 'MM-yyyy'),
          startBank,
          finalBank,
          profitLoss: Number(marketStats[0].profitLoss),
          bankDeposits: Number(stat.bankDeposits),
          bankWithdraws: Number(stat.bankWithdraws),
          roi: Number(
            (Number(marketStats[0].profitLoss) / startBank) * 100,
          ).toFixed(2),
        });
      } else {
        stats.push({
          monthDescription: monthConverter.toString(
            getMonth(startOfDay(month)),
          ),
          month: format(month, 'MM-yyyy'),
          startBank: finalBank || 0,
          finalBank: finalBank || 0,
          profitLoss: 0,
          bankDeposits: 0,
          bankWithdraws: 0,
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
    const entityManager = getManager();

    const initialDate = startOfYear(parseISO(date));

    let startBankBetfair;
    let finalBankBetfair;

    const stats = [];

    for (let index = 0; index < 12; index++) {
      const month = addMonths(initialDate, index);

      const marketStats = await entityManager.query(`
      SELECT 
        sum("profitLoss") "profitLoss"
      FROM "bets" 
      WHERE bets.user_id = '${user_id}'  
      AND date BETWEEN '${format(
        startOfMonth(month),
        'yyyy-MM-dd HH:mm:ss',
      )}' AND '${format(endOfMonth(month), 'yyyy-MM-dd HH:mm:ss')}'
    `);

      const stat = await userStatsRepository
        .createQueryBuilder('userstats')
        .select(`id`)
        .select(`user_id`)
        .select(`month`)
        .addSelect(`"startBankBetfair"`)
        .addSelect(`"finalBankBetfair"`)
        .addSelect(`"betfairDeposits"`)
        .addSelect(`"betfairWithdraws"`)
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
        finalBankBetfair =
          Number(stat.startBankBetfair) +
          Number(marketStats[0].profitLoss) -
          Number(stat.betfairWithdraws) +
          Number(stat.betfairDeposits);

        stats.push({
          monthDescription: monthConverter.toString(getMonth(stat.month)),
          month: format(stat.month, 'MM-yyyy'),
          startBankBetfair,
          finalBankBetfair,
          profitLoss: Number(marketStats[0].profitLoss),
          betfairDeposits: Number(stat.betfairDeposits),
          betfairWithdraws: Number(stat.betfairWithdraws),
        });
      } else {
        stats.push({
          monthDescription: monthConverter.toString(
            getMonth(startOfDay(month)),
          ),
          month: format(month, 'MM-yyyy'),
          startBankBetfair: finalBankBetfair || 0,
          finalBankBetfair: finalBankBetfair || 0,
          profitLoss: 0,
          betfairDeposits: 0,
          betfairWithdraws: 0,
        });
      }
    }

    return stats;
  }

  private async create(
    user_id: string,
    month: string,
    startBank: number,
    startBankBetfair: number,
    stake: number,
  ): Promise<void> {
    if (startBank && startBankBetfair && stake) {
      const usRepository = getRepository(UserStatsModel);

      const userStats = usRepository.create({
        user_id,
        month,
        stake,
        startBank,
        finalBank: startBank,
        startBankBetfair,
        finalBankBetfair: startBankBetfair,
        profitLoss: 0,
        roiBank: 0,
        roiStake: 0,
      });

      await usRepository.save(userStats);
    }
  }
}

export default StatsService;
