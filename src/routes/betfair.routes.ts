import { Router } from 'express';
import BetfairService from '../services/BetfairService';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const betfairRouter = Router();

betfairRouter.use(ensureAuthenticated);

betfairRouter.get('/integrate', async (request, response) => {
  const betfairService = new BetfairService();

  const user_id = request.user.id;
  const token = request.headers.authorization;

  const data = await betfairService.integrate(
    user_id.toString(),
    token.toString(),
  );

  response.json(data);
});

export default betfairRouter;
