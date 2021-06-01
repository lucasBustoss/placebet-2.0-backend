import { Router } from 'express';
import BetService from '../services/BetService';
import BetfairService from '../services/BetfairService';
import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const betsRouter = Router();

betsRouter.use(ensureAuthenticated);

betsRouter.get('/', async (request, response) => {
  const betService = new BetService();
  const { date } = request.query;
  const user_id = request.user.id;

  const data = await betService.find(user_id.toString(), date.toString());

  response.json(data);
});

betsRouter.get('/resultsPerDate', async (request, response) => {
  const betService = new BetService();
  const { date } = request.query;
  const user_id = request.user.id;

  const data = await betService.findResultsPerDate(
    user_id.toString(),
    date.toString(),
  );

  response.json(data);
});

export default betsRouter;
