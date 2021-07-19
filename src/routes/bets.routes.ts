import { Router } from 'express';
import BetService from '../services/BetService';
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

betsRouter.post('/', async (request, response) => {
  const betService = new BetService();
  const user_id = request.user.id;
  const { bets } = request.body;

  const data = await betService.create(user_id, bets);

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

betsRouter.patch('/', async (request, response) => {
  const betService = new BetService();
  const { eventId, marketIds, method_id, goalsScored, goalsConceded } =
    request.body;

  await betService.updateBet(
    eventId,
    marketIds,
    method_id,
    goalsScored,
    goalsConceded,
  );

  response.json();
});

betsRouter.delete('/:id', async (request, response) => {
  const betService = new BetService();
  const { id } = request.params;

  const message = await betService.deleteBet(id);

  response.json({ message });
});

export default betsRouter;
