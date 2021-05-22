import { Router } from 'express';
import BetService from '../services/BetService';
import BetfairService from '../services/BetfairService';

const betsRouter = Router();

betsRouter.get('/', async (request, response) => {
  const betService = new BetService();
  const { user_id, date } = request.query;

  const data = await betService.find(user_id.toString(), date.toString());

  response.json(data);
});

betsRouter.get('/resultsPerDate', async (request, response) => {
  const betService = new BetService();
  const { user_id, date } = request.query;

  const data = await betService.findResultsPerDate(
    user_id.toString(),
    date.toString(),
  );

  response.json(data);
});

betsRouter.get('/integrate', async (request, response) => {
  const betfairService = new BetfairService();
  const { user_id, username, password } = request.query;

  const data = await betfairService.integrate(
    user_id.toString(),
    username.toString(),
    password.toString(),
  );

  response.json({ message: data });
});

export default betsRouter;
