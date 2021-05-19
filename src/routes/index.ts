import { Router } from 'express';
import betsRouter from './bets.routes';

const routes = Router();

routes.use('/bets', betsRouter);

export default routes;
