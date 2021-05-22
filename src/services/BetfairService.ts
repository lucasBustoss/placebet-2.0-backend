import { parseISO, format } from 'date-fns';
import { getRepository } from 'typeorm';

import betfairApi from '../config/betfairApi';
import betfairLoginApi from '../config/betfairLoginApi';

import BetModel from '../models/Bet';

class BetfairService {
  public async authenticate(
    username: string,
    password: string,
  ): Promise<string> {
    const response = await betfairLoginApi.post('/localAuth', {
      username,
      password,
    });
    return response.data;
  }

  public async integrate(
    user_id: string,
    username: string,
    password: string,
  ): Promise<string> {
    const betsRepository = getRepository(BetModel);

    const dateFilter = `2021-05-01`;
    const token = await this.authenticate(username, password);

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
        'X-Application': 'wrUwCj4qZMgou6oz',
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
        const method = oldBet.itemDescription.marketType.includes('FIRST_HALF')
          ? 'Under Limite HT'
          : 'Under Limite FT';

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
          startTime: parseISO(oldBet.itemDescription.marketStartTime),
          method,
          profitLoss: Number(Number(oldBet.profit) - Number(oldBet.commission)),
        });

        await betsRepository.save(bet);
      }
    }

    return 'Entradas integradas com sucesso!';
  }
}

export default BetfairService;
