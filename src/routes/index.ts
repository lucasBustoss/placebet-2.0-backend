import { Router } from 'express';
import betsRouter from './bets.routes';
import statsRouter from './userstats.routes';
import betfairRouter from './betfair.routes';
import sessionsRouter from './sessions.routes';
import methodRouter from './methods.routes';
import leagueRouter from './leagues.routes';
import reportsRouter from './reports.routes';
import usersRouter from './users.routes';

const routes = Router();

routes.use('/bets', betsRouter);
routes.use('/stats', statsRouter);
routes.use('/betfair', betfairRouter);
routes.use('/sessions', sessionsRouter);
routes.use('/methods', methodRouter);
routes.use('/leagues', leagueRouter);
routes.use('/reports', reportsRouter);
routes.use('/users', usersRouter);

export default routes;
