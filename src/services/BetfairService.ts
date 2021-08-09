import { v4 as uuidv4 } from 'uuid';
import { parseISO, format, addHours } from 'date-fns';
import { getRepository } from 'typeorm';
import betfairApi from '../config/betfairApi';

import EventTypeConverter from '../helpers/EventTypeConverter';

import Bet from '../models/Bet';
import User from '../models/User';

class BetfairService {
  public async integrate(user_id: string, token: string): Promise<any> {
    const eventTypeConverter = new EventTypeConverter();
    const betsRepository = getRepository(Bet);
    const userRepository = getRepository(User);
    const bets = [];

    const user = await userRepository.findOne({ id: user_id });

    const dateFilter = format(user.date, `yyyy-MM-dd'T'03:00:00`);

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
        'X-Application': user.appKey,
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

      const betHasValue =
        Number(Number(oldBet.profit) - Number(oldBet.commission)) !== 0;

      if (!existsBet && betHasValue) {
        const bet = {
          uuid: uuidv4(),
          user_id,
          sport: eventTypeConverter.toString(oldBet.eventTypeId),
          eventId: oldBet.eventId,
          marketId: oldBet.marketId,
          eventDescription: oldBet.itemDescription.eventDesc,
          marketDesc: oldBet.itemDescription.marketDesc,
          date: parseISO(
            format(
              addHours(parseISO(oldBet.itemDescription.marketStartTime), -3),
              'yyyy-MM-dd',
            ),
          ),
          startTime: parseISO(oldBet.itemDescription.marketStartTime),
          profitLoss: Number(Number(oldBet.profit) - Number(oldBet.commission)),
          synchronized: false,
        };

        bets.push(bet);
      }
    }

    return bets;
  }
}

export default BetfairService;
