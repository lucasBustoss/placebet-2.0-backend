import { Router } from 'express';
import LeagueService from '../services/LeagueService';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const leaguesRouter = Router();

leaguesRouter.use(ensureAuthenticated);

leaguesRouter.get('/', async (request, response) => {
  try {
    const leagueService = new LeagueService();
    const user_id = request.user.id;

    const data = await leagueService.find(user_id);

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

export default leaguesRouter;
