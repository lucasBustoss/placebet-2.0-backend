import { Router } from 'express';
import ReportService from '../services/ReportService';

import ensureAuthenticated from '../middlewares/ensureAuthenticated';

const methodsRouter = Router();

methodsRouter.use(ensureAuthenticated);

methodsRouter.get('/monthly', async (request, response) => {
  try {
    const reportService = new ReportService();
    const user_id = request.user.id;
    const { date } = request.query;

    const data = await reportService.getMonthlyData(user_id, date.toString());

    return response.json(data);
  } catch (err) {
    console.log(err);
    return response.status(400).json({ error: err.message });
  }
});

export default methodsRouter;
