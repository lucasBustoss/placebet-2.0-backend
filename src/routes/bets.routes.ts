import { Router } from 'express';
import BetService from '../services/BetService';
import BetfairService from '../services/BetfairService';

const betsRouter = Router();

betsRouter.get('/', async (request, response) => {
  const betService = new BetService();

  const data = await betService.find();

  response.json(data);
});

betsRouter.get('/resultsPerDate', async (request, response) => {
  const betService = new BetService();
  const data = await betService.findResultsPerDate();

  response.json(data);
});

betsRouter.get('/integrate', async (request, response) => {
  const betfairService = new BetfairService();
  const data = await betfairService.integrate();

  response.json({ message: data });
});

export default betsRouter;
