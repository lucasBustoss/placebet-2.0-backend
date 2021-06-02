import { parseISO, format, addHours } from 'date-fns';
import { getRepository } from 'typeorm';
import betfairApi from '../config/betfairApi';

import Bet from '../models/Bet';
import Method from '../models/Method';

import BetService from './BetService';

class BetfairService {
  public async integrate(user_id: string, token: string): Promise<string> {
    const betsRepository = getRepository(Bet);
    const methodRepository = getRepository(Method);

    const betService = new BetService();

    const dateFilter = `2021-05-01`;

    const body = {
      betStatus: 'SETTLED',
      includeItemDescription: true,
      groupBy: 'MARKET',
      settledDateRange: {
        from: dateFilter,
      },
    };

    const config = {
      headers: {
        'content-type': 'application/json',
        'X-Authentication': token,
        'X-Application': process.env.BETFAIR_APIKEY,
      },
    };

    const response = await betfairApi.post(
      '/betting/rest/v1.0/listClearedOrders/',
      body,
      config,
    );

    for (let index = 0; index < response.data.clearedOrders.length; index++) {
      const oldBet = response.data.clearedOrders[index];

      const existsBet = await betsRepository.findOne({
        marketId: oldBet.marketId,
      });

      if (!existsBet) {
        const periodType = oldBet.itemDescription.marketType.includes(
          'FIRST_HALF',
        )
          ? 1
          : 2;

        const methods = await methodRepository.find({ user_id, periodType });

        const method_id = methods.length === 1 ? methods[0].id : null;

        const bet = betsRepository.create({
          user_id,
          eventId: oldBet.eventId,
          marketId: oldBet.marketId,
          eventDescription: oldBet.itemDescription.eventDesc,
          marketDesc: oldBet.itemDescription.marketDesc,
          date: parseISO(
            format(
              parseISO(oldBet.itemDescription.marketStartTime),
              'yyyy-MM-dd',
            ),
          ),
          startTime: addHours(
            parseISO(oldBet.itemDescription.marketStartTime),
            -3,
          ),
          method_id,
          profitLoss: Number(Number(oldBet.profit) - Number(oldBet.commission)),
          synchronized: false,
        });

        await betsRepository.save(bet);
      }
    }

    await betService.updateStats(user_id);

    return 'Entradas integradas com sucesso!';
  }
}

export default BetfairService;
