import { Router } from 'express';
import UsersService from '../services/UsersService';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const methodsRouter = Router();

methodsRouter.use(ensureAuthenticated);

methodsRouter.post('/', async (request, response) => {
  try {
    const usersService = new UsersService();
    const {
      username,
      appKey,
      name,
      email,
      money,
      startBank,
      startBetfairBank,
      date,
      number,
      stake,
      visibility,
    } = request.body;

    const data = await usersService.create(
      username,
      appKey,
      name,
      email,
      money,
      startBank,
      startBetfairBank,
      date,
      number,
      stake,
      visibility,
    );

    return response.json({ user: data });
  } catch (err) {
    console.log(err);

    return response.status(400).json({
      error: err.message,
    });
  }
});

export default methodsRouter;
