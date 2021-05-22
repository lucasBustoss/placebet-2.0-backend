import {
  format,
  startOfMonth,
  lastDayOfMonth,
  addDays,
  parseISO,
  endOfMonth,
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

    const month = format(parseISO(date), 'MM-yyyy');

    const userStats = await userRepository.findOne({ user_id, month });

    const { stake } = userStats;

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

    const month = format(parseISO(date), 'MM-yyyy');

    const userStats = await userRepository.findOne({ user_id, month });

    const { stake } = userStats;

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
        profitLossFormatted: '$ ' + Number(results.reduce((sum, result) => {
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
}

export default BetService;
