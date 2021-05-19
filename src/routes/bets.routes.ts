import { Router } from 'express';
import BetService from '../services/BetService';
import BetfairService from '../services/BetfairService';

const betsRouter = Router();

betsRouter.get('/', async (request, response) => {
  const betService = new BetService();

  const { groupBy, date } = request.query;

  const data = await betService.find(
    groupBy ? groupBy.toString() : 'NONE',
    date?.toString(),
  );

  response.json(data);
});

betsRouter.get('/integrate', async (request, response) => {
  const betfairService = new BetfairService();
  const data = await betfairService.integrate();

  response.json({ message: data });
});

export default betsRouter;
