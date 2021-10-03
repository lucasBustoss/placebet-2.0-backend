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

leaguesRouter.get('/stats', async (request, response) => {
  try {
    const leagueService = new LeagueService();
    const user_id = request.user.id;
    let { date } = request.query;

    if (!date) {
      date = '1900-01-01';
    }

    const data = await leagueService.findWithStats(user_id, date.toString());

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

leaguesRouter.post('/', async (request, response) => {
  const leagueService = new LeagueService();
  const { name } = request.body;
  const user_id = request.user.id;

  const data = await leagueService.create(user_id, name);

  response.json({ message: data });
});

leaguesRouter.delete('/:id', async (request, response) => {
  try {
    const leagueService = new LeagueService();
    const { id } = request.params;

    const message = await leagueService.deleteLeague(id);

    return response.json({ message });
  } catch (err) {
    if (err.message.includes('foreign key')) {
      console.log(err);
      return response.status(400).json({
        error: `O campeonato em questão está associado a alguma entrada. 
          Por esse motivo, não é possível excluí-lo. Verifique e tente novamente.`,
      });
    }

    console.log(err);

    return response.status(400).json({
      error: err.message,
    });
  }
});

export default leaguesRouter;
