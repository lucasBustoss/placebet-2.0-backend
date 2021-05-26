import { Router } from 'express';
import StatsService from '../services/UserStatsService';

const betsRouter = Router();

betsRouter.get('/', async (request, response) => {
  const statsService = new StatsService();
  const { user_id, date } = request.query;

  const data = await statsService.find(user_id.toString(), date.toString());

  response.json(data);
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
