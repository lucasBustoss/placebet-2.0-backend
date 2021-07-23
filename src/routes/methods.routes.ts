import { Router } from 'express';
import MethodsService from '../services/MethodService';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const methodsRouter = Router();

methodsRouter.use(ensureAuthenticated);

methodsRouter.get('/', async (request, response) => {
  try {
    const methodService = new MethodsService();
    const user_id = request.user.id;

    const data = await methodService.find(user_id);

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

methodsRouter.get('/stats', async (request, response) => {
  try {
    const methodService = new MethodsService();
    const user_id = request.user.id;
    const { date } = request.query;

    const data = await methodService.findWithStats(user_id, date.toString());

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

methodsRouter.post('/', async (request, response) => {
  const methodService = new MethodsService();
  const { name } = request.body;
  const user_id = request.user.id;

  const data = await methodService.create(user_id, name);

  response.json({ message: data });
});

methodsRouter.delete('/:id', async (request, response) => {
  try {
    const methodService = new MethodsService();
    const { id } = request.params;

    const message = await methodService.deleteMethod(id);

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
    return response.status(400).json({ error: err.message });
  }
});

export default methodsRouter;
