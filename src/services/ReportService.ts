import { getManager } from 'typeorm';
import {
  startOfMonth,
  endOfMonth,
  format,
  parseISO,
  startOfDay,
  endOfDay,
  addDays,
  lastDayOfMonth,
} from 'date-fns';

interface ProfitEvolution {
  date: string;
  profitLoss: number;
}

interface GoalsEvolution {
  date: string;
  goalsScored: number;
  goalsConceded: number;
}

interface MonthlyReport {
  profitEvolution: ProfitEvolution[];
  goalsEvolution: GoalsEvolution[];
}

class MethodService {
  public async getMonthlyData(
    user_id: string,
    date: string,
  ): Promise<MonthlyReport> {
    const profitEvolution = await this.getEvolutionProfit(user_id, date);
    const goalsEvolution = await this.getEvolutionGoals(user_id, date);

    return { profitEvolution, goalsEvolution };
  }

  private async getEvolutionProfit(
    user_id: string,
    date: string,
  ): Promise<ProfitEvolution[]> {
    const entityManager = getManager();

    const startMonth = parseISO(
      format(startOfMonth(parseISO(date)), 'yyyy-MM-dd'),
    );
    const endMonth = parseISO(format(endOfMonth(parseISO(date)), 'yyyy-MM-dd'));

    /* eslint-disable */

    const stats = await entityManager.query(`
      SELECT
        date,  
        sum("profitLoss") "profitLoss"
      FROM "bets" 
      WHERE bets.user_id = '${user_id}'  
      AND date BETWEEN '${format(
      startOfDay(startMonth),
      'yyyy-MM-dd HH:mm:ss',
    )}' AND '${format(endOfDay(endMonth), 'yyyy-MM-dd HH:mm:ss')}'
      GROUP BY date`);

    /* eslint-enable */

    let profitLoss = 0;
    const newResults = [];
    const lastDay = Number(format(lastDayOfMonth(parseISO(date)), 'dd'));

    for (let i = 0; i < lastDay; i++) {
      const day = format(
        addDays(startOfMonth(parseISO(date)), i),
        'dd/MM/yyyy',
      );

      const results = stats.filter(bet => {
        return format(bet.date, 'dd/MM/yyyy') === day;
      });

      if (results.length > 0) {
        profitLoss = Number(profitLoss) + Number(results[0].profitLoss);
      }

      const newResult = { date: day, profitLoss };

      newResults.push(newResult);
    }

    return newResults;
  }

  private async getEvolutionGoals(user_id: string, date: string): Promise<any> {
    const entityManager = getManager();

    const startMonth = parseISO(
      format(startOfMonth(parseISO(date)), 'yyyy-MM-dd'),
    );
    const endMonth = parseISO(format(endOfMonth(parseISO(date)), 'yyyy-MM-dd'));

    /* eslint-disable */

    const stats = await entityManager.query(`
      SELECT
        date,  
        sum("goalsScored") "goalsScored", 
        sum("goalsConceded") "goalsConceded"
      FROM "bets" 
      WHERE bets.user_id = '${user_id}'  
      AND date BETWEEN '${format(
      startOfDay(startMonth),
      'yyyy-MM-dd HH:mm:ss',
    )}' AND '${format(endOfDay(endMonth), 'yyyy-MM-dd HH:mm:ss')}'
      GROUP BY date`);

    let goalsScored = 0;
    let goalsConceded = 0;
    const newResults = [];
    const lastDay = Number(format(lastDayOfMonth(parseISO(date)), 'dd'));

    for (let i = 0; i < lastDay; i++) {
      const day = format(
        addDays(startOfMonth(parseISO(date)), i),
        'dd/MM/yyyy',
      );

      const results = stats.filter(bet => {
        return format(bet.date, 'dd/MM/yyyy') === day;
      });

      if (results.length > 0) {
        goalsScored = Number(goalsScored) + Number(results[0].goalsScored);
        goalsConceded = Number(goalsConceded) + Number(results[0].goalsConceded);
      }

      const newResult = { date: day, goalsScored, goalsConceded };

      newResults.push(newResult);
    }

    return newResults;
  }
}

export default MethodService;
