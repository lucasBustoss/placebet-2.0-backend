import { Router } from 'express';
import StatsService from '../services/UserStatsService';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const statsRouter = Router();

statsRouter.use(ensureAuthenticated);

statsRouter.get('/', async (request, response) => {
  try {
    const statsService = new StatsService();
    const { date } = request.query;
    const user_id = request.user.id;

    const data = await statsService.find(user_id.toString(), date.toString());

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

statsRouter.get('/statsByYear', async (request, response) => {
  const statsService = new StatsService();
  const { date } = request.query;
  const user_id = request.user.id;

  const data = await statsService.findBankByYear(
    user_id.toString(),
    date.toString(),
  );

  response.json(data);
});

statsRouter.get('/statsBetfairByYear', async (request, response) => {
  const statsService = new StatsService();
  const { date } = request.query;
  const user_id = request.user.id;

  const data = await statsService.findBetfairBankByYear(
    user_id.toString(),
    date.toString(),
  );

  response.json(data);
});

export default statsRouter;
