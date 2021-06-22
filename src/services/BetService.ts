import {
  format,
  startOfMonth,
  lastDayOfMonth,
  addDays,
  parseISO,
  endOfMonth,
  startOfYear,
  addMonths,
  startOfDay,
  endOfDay,
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
      .select(
        `SUM("profitLoss") "profitLoss", "eventId", method_id, (select name from methods where methods.id = method_id) as method, 
        "eventDescription", "date", SUM("goalsScored") "goalsScored", SUM("goalsConceded") "goalsConceded"`,
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
      .addGroupBy(`"eventId"`)
      .addGroupBy(`"method_id"`)
      .orderBy(`"startTime"`, 'DESC')
      .addOrderBy(`"method"`, 'ASC')
      .getRawMany();

    const newBets = [];

    for (let index = 0; index < bets.length; index++) {
      const bet = bets[index];

      const marketIds = await betsRepository
        .createQueryBuilder()
        .select(`"marketId"`)
        .where(`user_id = '${user_id}'`)
        .andWhere(`method_id = '${bet.method_id}'`)
        .andWhere(`"eventId" = '${bet.eventId}'`)
        .getRawMany();

      bet.marketIds = marketIds;
      bet.profitLoss = Number(bet.profitLoss).toFixed(2);
      bet.method = bet.method as string;
      bet.eventDescription = bet.eventDescription as string;
      bet.date = format(bet.date, 'dd/MM/yyyy');
      bet.roi = Number((Number(bet.profitLoss) / stake) * 100).toFixed(2);
      bet.goalsScored = bet.goalsScored as number;
      bet.goalsConceded = bet.goalsConceded as number;

      console.log(index);

      newBets.push(bet);
    }

    return newBets;
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

  public async updateBet(
    eventId: number,
    marketIds: Array<any>,
    method_id: string,
    goalsScored: number,
    goalsConceded: number,
  ): Promise<void> {
    const betsRepository = getRepository(BetModel);

    const ids = [];

    for (let index = 0; index < marketIds.length; index++) {
      const marketId = marketIds[index];

      ids.push(`'${marketId.marketId}'`);
    }

    const bets = await betsRepository
      .createQueryBuilder()
      .select()
      .where(`"eventId" = '${eventId}'`)
      .andWhere(`"marketId" IN (${ids.toString()})`)
      .getRawMany();

    for (let index = 0; index < bets.length; index++) {
      const oldBet = bets[index];
      const newBet = await betsRepository.findOne(oldBet.Bet_id);

      console.log(oldBet.Bet_id);

      newBet.method_id = method_id;

      if (index === 0) {
        newBet.goalsScored = goalsScored;
        newBet.goalsConceded = goalsConceded;
      }

      await betsRepository.save(newBet);
    }
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

        userStats = await userStatsRepository
          .createQueryBuilder('userstats')
          .select(`id`)
          .addSelect(`user_id`)
          .addSelect(`month`)
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
              startOfDay(date),
              'yyyy-MM-dd HH:mm:ss',
            )}' AND '${format(endOfDay(date), 'yyyy-MM-dd HH:mm:ss')}'`,
          )
          .getRawOne();

        if (!userStats) {
          const previousMonth = addMonths(date, -1);

          const previousStats = await userStatsRepository
            .createQueryBuilder('userstats')
            .select()
            .where(`user_id = '${user_id}'`)
            .andWhere(
              `month BETWEEN '${format(
                startOfDay(previousMonth),
                'yyyy-MM-dd HH:mm:ss',
              )}' AND '${format(
                endOfDay(previousMonth),
                'yyyy-MM-dd HH:mm:ss',
              )}'`,
            )
            .getRawOne();

          userStats = userStatsRepository.create({
            user_id,
            month: startOfMonth(date),
            stake: previousStats.userstats_stake,
            startBank: previousStats.userstats_finalBank,
            finalBank: previousStats.userstats_finalBank,
            startBankBetfair: previousStats.userstats_finalBankBetfair,
            finalBankBetfair: previousStats.userstats_finalBankBetfair,
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

        const statsId = userStats.id;

        const actualStats = await userStatsRepository.findOne({
          id: statsId,
        });

        /* eslint-disable */

        if (actualStats) {
          actualStats.startBank = userStats.startBank;
          actualStats.startBankBetfair = userStats.startBankBetfair;
          actualStats.profitLoss = Number(Number(
            Number(userStats.profitLoss) +
            Number(result.profitLoss),
          ).toFixed(2));
          actualStats.finalBank = Number(
            Number(
              Number(userStats.finalBank) + Number(result.profitLoss),
            ).toFixed(2),
          );
          actualStats.finalBankBetfair = Number(
            Number(
              Number(userStats.finalBankBetfair) +
              Number(result.profitLoss),
            ).toFixed(2),
          );
          actualStats.roiBank = Number(
            Number(
              (Number(userStats.profitLoss) + Number(result.profitLoss)) / userStats.finalBank,
            ).toFixed(4),
          );
          actualStats.roiStake = Number(
            Number(
              (Number(userStats.profitLoss) + Number(result.profitLoss)) /
              Number(userStats.stake),
            ).toFixed(4),
          );
          /* eslint-enable */

          userStatsRepository.save(actualStats);

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
}

export default BetService;
