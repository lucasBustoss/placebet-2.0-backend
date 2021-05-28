import { Router } from 'express';
import StatsService from '../services/UserStatsService';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const betsRouter = Router();

betsRouter.use(ensureAuthenticated);

betsRouter.get('/', async (request, response) => {
  try {
    const statsService = new StatsService();
    const { user_id, date } = request.query;

    const data = await statsService.find(user_id.toString(), date.toString());

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

betsRouter.get('/statsByYear', async (request, response) => {
  const statsService = new StatsService();
  const { user_id, date } = request.query;

  const data = await statsService.findBankByYear(
    user_id.toString(),
    date.toString(),
  );

  response.json(data);
});

betsRouter.get('/statsBetfairByYear', async (request, response) => {
  const statsService = new StatsService();
  const { user_id, date } = request.query;

  const data = await statsService.findBetfairBankByYear(
    user_id.toString(),
    date.toString(),
  );

  response.json(data);
});

export default betsRouter;
