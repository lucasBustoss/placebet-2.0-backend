/* eslint-disable no-nested-ternary */
import { format, addHours } from 'date-fns';
import Bet from '../schemas/Bet';

class BetService {
  public async find(groupBy: string, date: string | undefined): Promise<any> {
    let bets = [];
    let id = '';

    if (groupBy === 'EVENT') id = '$eventDescription';
    else if (groupBy === 'DATE') id = '$date';
    else if (groupBy === 'METHOD') id = '$method';

    const where = {
      date: date || {
        $gte: '2000-01-01',
        $lt: format(addHours(new Date(), 3), 'yyyy-MM-dd'),
      },
    };

    if (id === '') {
      bets = await Bet.find(where);
    } else {
      const group = {
        _id: id,
        profitLoss: { $sum: '$profitLoss' },
      };

      const findBets = await Bet.aggregate([
        { $match: where },
        { $group: group },
      ]);

      for (let index = 0; index < findBets.length; index++) {
        const findBet = findBets[index];

        const bet = {
          [groupBy.toLowerCase()]: findBet._id,
          profitLoss: Number(findBet.profitLoss).toFixed(2),
        };

        bets.push(bet);
      }
    }

    return bets;
  }
}

export default BetService;
