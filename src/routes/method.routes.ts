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

    const data = await methodService.findWithStats(user_id);

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

methodsRouter.post('/', async (request, response) => {
  const methodService = new MethodsService();
  const { name, periodType } = request.body;
  const user_id = request.user.id;

  const data = await methodService.create(user_id, name, periodType);

  response.json({ message: data });
});

export default methodsRouter;
