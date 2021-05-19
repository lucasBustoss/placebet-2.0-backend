import { format, parseISO } from 'date-fns';

import betfairApi from '../config/betfairApi';
import betfairLoginApi from '../config/betfairLoginApi';

import Bet from '../schemas/Bet';

class BetfairService {
  public async authenticate(): Promise<string> {
    const response = await betfairLoginApi.post('/localAuth', {
      username: 'xistzera',
      password: 'semSenha01@!',
    });

    return response.data;
  }

  public async integrate(): Promise<string> {
    const dateFilter = `2021-05-17`;
    const token = await this.authenticate();

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
        'X-Application': '4BggRlxO9IXQvJBo',
      },
    };

    const response = await betfairApi.post(
      '/betting/rest/v1.0/listClearedOrders/',
      body,
      config,
    );

    for (let index = 0; index < response.data.clearedOrders.length; index++) {
      const oldBet = response.data.clearedOrders[index];

      const existsBet = await Bet.findOne({
        marketId: oldBet.marketId,
      });

      if (!existsBet) {
        const method = oldBet.itemDescription.marketType.includes('FIRST_HALF')
          ? 'Under Limite HT'
          : 'Under Limite FT';

        await Bet.create({
          eventId: oldBet.eventId,
          marketId: oldBet.marketId,
          eventDescription: oldBet.itemDescription.eventDesc,
          marketDesc: oldBet.itemDescription.marketDesc,
          date: format(
            parseISO(oldBet.itemDescription.marketStartTime),
            'yyyy-MM-dd',
          ),
          startTime: format(
            parseISO(oldBet.itemDescription.marketStartTime),
            'yyyy-MM-dd HH:mm',
          ),
          method,
          profitLoss: Number(
            Number(oldBet.profit) - Number(oldBet.commission),
          ).toFixed(2),
        });
      }
    }

    return 'Entradas integradas com sucesso!';
  }
}

export default BetfairService;
