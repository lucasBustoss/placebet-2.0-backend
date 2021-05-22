import { Router } from 'express';
import betsRouter from './bets.routes';
import statsRouter from './userstats.routes';

const routes = Router();

routes.use('/bets', betsRouter);
routes.use('/stats', statsRouter);

export default routes;
