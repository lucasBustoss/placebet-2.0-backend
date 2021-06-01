import { Router } from 'express';
import SessionsService from '../services/SessionService';

const betfairRouter = Router();

betfairRouter.post('/auth', async (request, response) => {
  try {
    const sessionsService = new SessionsService();
    const { username, password } = request.body;

    const data = await sessionsService.auth(
      username.toString(),
      password.toString(),
    );

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

betfairRouter.post('/validate', async (request, response) => {
  const { token } = request.body;
  const sessionsService = new SessionsService();

  const data = await sessionsService.validate(token.toString());

  response.json({ message: data });
});

export default betfairRouter;
