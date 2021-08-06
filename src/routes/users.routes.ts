import { Router } from 'express';
import UsersService from '../services/UsersService';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const usersRouter = Router();

usersRouter.use(ensureAuthenticated);

usersRouter.get('/', async (request, response) => {
  try {
    const usersService = new UsersService();
    const { user_id } = request.query;

    const data = await usersService.find(user_id.toString());

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

usersRouter.post('/', async (request, response) => {
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

export default usersRouter;
