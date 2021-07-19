import {
  format,
  startOfMonth,
  lastDayOfMonth,
  addDays,
  parseISO,
  endOfMonth,
  addMonths,
  startOfDay,
  endOfDay,
} from 'date-fns';
import { getRepository } from 'typeorm';

import BetModel from '../models/Bet';
import UserStatsModel from '../models/UserStats';

interface IntegrateBet {
  date: string;
  eventDescription: string;
  eventId: string;
  method_id: string;
  league_id: string;
  marketDesc: string;
  marketId: string;
  profitLoss: string;
  sport: string;
  stake: string;
  startTime: string;
  goalsScored: string;
  goalsConceded: string;
}

interface ResultPerDay {
  date: string;
  profitLoss: string;
  roi: string;
}

class BetService {
  public async find(user_id: string, date: string): Promise<BetModel[]> {
    const betsRepository = getRepository(BetModel);

    const bets = await betsRepository
      .createQueryBuilder()
      .select(
        `"Bet".id, "Bet".user_id, "eventId", "marketId", "eventDescription",
        "marketDesc", methods.name as method, date, "startTime", "profitLoss", "goalsScored",
        "goalsConceded", leagues.name as league, stake, sport`,
      )
      .leftJoin('leagues', 'leagues', `"Bet".league_id = leagues.id`)
      .leftJoin('methods', 'methods', `"Bet".method_id = methods.id`)
      .where(`"Bet".user_id = '${user_id}'`)
      .andWhere(
        `date BETWEEN '${format(
          startOfMonth(parseISO(date)),
          'yyyy-MM-dd',
        )}' AND '${format(endOfMonth(parseISO(date)), 'yyyy-MM-dd')}'`,
      )
      .orderBy(`"startTime"`, 'DESC')
      .getRawMany();

    for (let index = 0; index < bets.length; index++) {
      const bet = bets[index];

      bet.roi = Number(Number((bet.profitLoss / bet.stake) * 100).toFixed(2));
    }

    return bets;
  }

  public async create(user_id: string, bets: IntegrateBet[]): Promise<void> {
    const betsRepository = getRepository(BetModel);

    if (bets.length > 0) {
      const betsToSave = [];
      for (let index = 0; index < bets.length; index++) {
        const bet = bets[index];

        const newBet = betsRepository.create({
          user_id,
          eventId: bet.eventId,
          marketId: bet.marketId,
          eventDescription: bet.eventDescription,
          marketDesc: bet.marketDesc,
          method_id: bet.method_id,
          date: startOfDay(parseISO(bet.startTime)),
          startTime: bet.startTime,
          profitLoss: Number(Number(bet.profitLoss).toFixed(2)),
          goalsScored: bet.goalsScored ? Number(bet.goalsScored) : 0,
          goalsConceded: bet.goalsConceded ? Number(bet.goalsConceded) : 0,
          league_id: bet.league_id,
          stake: Number(Number(bet.stake).toFixed(2)),
          sport: bet.sport,
        });

        betsToSave.push(newBet);
      }

      await betsRepository.save(betsToSave);
    }
  }

  public async findResultsPerDate(
    user_id: string,
    date: string,
  ): Promise<ResultPerDay[]> {
    const betsRepository = getRepository(BetModel);
    const userStatsRepository = getRepository(UserStatsModel);

    let stake;

    const month = parseISO(date);

    const userStats = await userStatsRepository
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

    if (!userStats) {
      const previousMonth = addMonths(month, -1);

      const previousStats = await userStatsRepository
        .createQueryBuilder('userstats')
        .select()
        .where(`user_id = '${user_id}'`)
        .andWhere(
          `month BETWEEN '${format(
            startOfDay(previousMonth),
            'yyyy-MM-dd HH:mm:ss',
          )}' AND '${format(endOfDay(previousMonth), 'yyyy-MM-dd HH:mm:ss')}'`,
        )
        .getRawOne();

      if (!previousStats) {
        stake = 50;
      } else {
        stake = previousStats.userstats_stake;
      }
    } else {
      stake = userStats.userstats_stake;
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
    const lastDay = Number(format(lastDayOfMonth(parseISO(date)), 'dd'));

    for (let i = 0; i < lastDay; i++) {
      const day = format(
        addDays(startOfMonth(parseISO(date)), i),
        'dd/MM/yyyy',
      );

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

  public async updateBet(
    id: string,
    stake: number,
    league_id: string,
    method_id: string,
    goalsScored: number,
    goalsConceded: number,
  ): Promise<void> {
    const betsRepository = getRepository(BetModel);

    const bet = await betsRepository.findOne(id);

    bet.stake = stake;
    bet.method_id = method_id;
    bet.league_id = league_id;
    bet.goalsScored = goalsScored;
    bet.goalsConceded = goalsConceded;

    await betsRepository.save(bet);
  }

  public async deleteBet(id: string): Promise<string> {
    const betsRepository = getRepository(BetModel);

    const bet = await betsRepository.findOne({ id });

    if (bet) {
      await betsRepository.delete({
        id,
      });

      return 'Entrada deletada com sucesso.';
    }

    return 'Não existe uma entrada com o id informado';
  }
}

export default BetService;
