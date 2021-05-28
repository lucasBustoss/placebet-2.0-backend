import { Router } from 'express';
import BetfairService from '../services/BetfairService';

const betfairRouter = Router();

betfairRouter.get('/integrate', async (request, response) => {
  const betfairService = new BetfairService();
  const { user_id } = request.query;
  const token = request.headers.authorization;

  const data = await betfairService.integrate(
    user_id.toString(),
    token.toString(),
  );

  response.json({ message: data });
});

export default betfairRouter;
