import {
  format,
  startOfMonth,
  lastDayOfMonth,
  addDays,
  parseISO,
  endOfMonth,
  startOfYear,
  addMonths,
} from 'date-fns';
import { getRepository } from 'typeorm';

import BetModel from '../models/Bet';
import UserStatsModel from '../models/UserStats';

interface Bet {
  profitLoss: string;
  method: string;
  eventDescription: string;
  date: string;
}

interface ResultPerDay {
  date: string;
  profitLoss: string;
  roi: string;
}

class BetService {
  public async find(user_id: string, date: string): Promise<Bet[]> {
    const betsRepository = getRepository(BetModel);
    const userRepository = getRepository(UserStatsModel);

    let stake;

    const month = format(parseISO(date), 'MM-yyyy');

    const userStats = await userRepository.findOne({ user_id, month });

    if (!userStats) {
      const previousMonth = format(addMonths(parseISO(date), -1), 'MM-yyyy');
      const previousStats = await userRepository.findOne({
        user_id,
        month: previousMonth,
      });

      if (!previousStats) {
        stake = 50;
      } else {
        stake = previousStats.stake;
      }
    } else {
      stake = userStats.stake;
    }

    const bets = await betsRepository
      .createQueryBuilder()
      .select(
        `SUM("profitLoss") profitLoss, method, "eventDescription", "date"`,
      )
      .where(`user_id = '${user_id}'`)
      .andWhere(
        `date BETWEEN '${format(
          startOfMonth(parseISO(date)),
          'yyyy-MM-dd',
        )}' AND '${format(endOfMonth(parseISO(date)), 'yyyy-MM-dd')}'`,
      )
      .groupBy('method')
      .addGroupBy(`"eventDescription"`)
      .addGroupBy('date')
      .addGroupBy(`"startTime"`)
      .orderBy(`"startTime"`, 'DESC')
      .getRawMany();

    const newBets = bets.map(bet => {
      return {
        profitLoss: Number(bet.profitloss).toFixed(2),
        method: bet.method as string,
        eventDescription: bet.eventDescription as string,
        date: format(bet.date, 'dd/MM/yyyy'),
        roi: Number((Number(bet.profitloss) / stake) * 100).toFixed(2),
      };
    });

    return newBets;
  }

  public async findResultsPerDate(
    user_id: string,
    date: string,
  ): Promise<ResultPerDay[]> {
    const betsRepository = getRepository(BetModel);
    const userRepository = getRepository(UserStatsModel);

    let stake;

    const month = format(parseISO(date), 'MM-yyyy');

    const userStats = await userRepository.findOne({ user_id, month });

    if (!userStats) {
      const previousMonth = format(addMonths(parseISO(date), -1), 'MM-yyyy');
      const previousStats = await userRepository.findOne({
        user_id,
        month: previousMonth,
      });

      if (!previousStats) {
        stake = 50;
      } else {
        stake = previousStats.stake;
      }
    } else {
      stake = userStats.stake;
    }

    const bets = await betsRepository
      .createQueryBuilder()
      .select(`SUM("profitLoss") profitLoss, "date"`)
      .where(`user_id = '${user_id}'`)
      .andWhere(
        `date BETWEEN '${format(
          startOfMonth(parseISO(date)),
          'yyyy-MM-dd',
        )}' AND '${format(endOfMonth(parseISO(date)), 'yyyy-MM-dd')}'`,
      )
      .groupBy('date')
      .orderBy(`"date"`)
      .getRawMany();

    const newBets = [];
    const lastDay = Number(format(lastDayOfMonth(new Date()), 'dd'));

    for (let i = 0; i < lastDay; i++) {
      const day = format(addDays(startOfMonth(new Date()), i), 'dd/MM/yyyy');

      const results = bets.filter(bet => {
        return format(bet.date, 'dd/MM/yyyy') === day;
      });

      /* eslint-disable */
      const newBet = {
        date: day,
        profitLoss: Number(results.reduce((sum, result) => {
          return Number(sum) + Number(result.profitloss)
        }, 0)).toFixed(2),
        profitLossFormatted: 'R$ ' + Number(results.reduce((sum, result) => {
          return Number(sum) + Number(result.profitloss)
        }, 0)).toFixed(2),
        roi: Number(
          (results.reduce((sum, result) => {
            return Number(Number(sum) + Number(result.profitloss)).toFixed(2);
          }, 0) /
            stake) * 100,
        ).toFixed(2),
        roiFormatted: Number(
          (results.reduce((sum, result) => {
            return Number(Number(sum) + Number(result.profitloss)).toFixed(2);
          }, 0) /
            stake) * 100,
        ).toFixed(2) + '%',
      };
      /* eslint-enable */

      newBets.push(newBet);
    }

    return newBets;
  }

  public async updateStats(user_id: string): Promise<void> {
    const betsRepository = getRepository(BetModel);
    const userStatsRepository = getRepository(UserStatsModel);

    for (let index = 0; index < 12; index++) {
      const date = addMonths(startOfYear(new Date()), index);

      const existsBets = await betsRepository
        .createQueryBuilder()
        .select(`COUNT("eventDescription") "betCount"`)
        .where(`user_id = '${user_id}'`)
        .andWhere(`synchronized = false`)
        .andWhere(
          `date BETWEEN '${format(
            startOfMonth(date),
            'yyyy-MM-dd',
          )}' AND '${format(endOfMonth(date), 'yyyy-MM-dd')}'`,
        )
        .getRawOne();

      if (existsBets.betCount != null && existsBets.betCount > 0) {
        let userStats;

        const month = format(date, 'MM-yyyy');
        userStats = await userStatsRepository.findOne({ user_id, month });

        if (!userStats) {
          const previousMonth = format(addMonths(date, -1), 'MM-yyyy');

          const previousStats = await userStatsRepository.findOne({
            user_id,
            month: previousMonth,
          });

          userStats = userStatsRepository.create({
            user_id,
            month,
            stake: previousStats.stake,
            startBank: previousStats.finalBank,
            finalBank: previousStats.finalBank,
            startBankBetfair: previousStats.finalBankBetfair,
            finalBankBetfair: previousStats.finalBankBetfair,
            profitLoss: 0,
            roiBank: 0,
            roiStake: 0,
          });

          await userStatsRepository.save(userStats);
        }

        const result = await betsRepository
          .createQueryBuilder()
          .select(`SUM("profitLoss") "profitLoss"`)
          .where(`user_id = '${user_id}'`)
          .andWhere(`synchronized = false`)
          .andWhere(
            `date BETWEEN '${format(
              startOfMonth(date),
              'yyyy-MM-dd',
            )}' AND '${format(endOfMonth(date), 'yyyy-MM-dd')}'`,
          )
          .getRawOne();

        userStats.profitLoss = Number(Number(result.profitLoss).toFixed(2));
        userStats.finalBank = Number(
          Number(
            Number(userStats.startBank) + Number(result.profitLoss),
          ).toFixed(2),
        );
        userStats.finalBankBetfair = Number(
          Number(
            Number(userStats.startBankBetfair) + Number(result.profitLoss),
          ).toFixed(2),
        );
        userStats.roiBank = Number(
          Number(userStats.profitLoss / userStats.finalBank).toFixed(4),
        );
        userStats.roiStake = Number(
          Number(
            Number(userStats.profitLoss) / Number(userStats.stake),
          ).toFixed(4),
        );

        userStatsRepository.save(userStats);

        await betsRepository
          .createQueryBuilder()
          .update()
          .set({ synchronized: true })
          .where(`user_id = '${user_id}'`)
          .andWhere(`synchronized = false`)
          .andWhere(
            `date BETWEEN '${format(
              startOfMonth(date),
              'yyyy-MM-dd',
            )}' AND '${format(endOfMonth(date), 'yyyy-MM-dd')}'`,
          )
          .execute();
      }
    }
  }
}

export default BetService;
