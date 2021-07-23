import { getRepository, getManager } from 'typeorm';
import { startOfMonth, endOfMonth, format, parseISO } from 'date-fns';

import Method from '../models/Method';

class MethodService {
  public async find(user_id: string): Promise<Method[]> {
    const methodRepository = getRepository(Method);

    const methods = await methodRepository.find({ user_id });

    return methods;
  }

  public async findWithStats(user_id: string, date: string): Promise<any> {
    const entityManager = getManager();

    const startMonth = format(startOfMonth(parseISO(date)), 'yyyy-MM-dd');
    const endMonth = format(endOfMonth(parseISO(date)), 'yyyy-MM-dd');

    const methods = await entityManager.query(`
    WITH entrances as (
      SELECT SUM("profitLoss") "profitLoss", 
        case when SUM("profitLoss") > 0 then 1 else 0 end greens,  
        case when SUM("profitLoss") < 0 then 1 else 0 end reds,  
        case when SUM("profitLoss") > 0 then SUM("profitLoss") else 0 end profit,  
        case when SUM("profitLoss") < 0 then SUM("profitLoss") else 0 end loss,  
        method_id, "eventDescription", "date" 
      FROM "bets" "Bet" 
      WHERE user_id = '${user_id}' AND date BETWEEN '${startMonth}' AND '${endMonth}' AND method_id IS NOT NULL GROUP 
      BY  method_id, "eventDescription", date, "startTime" ORDER BY "startTime" DESC, "method_id" ASC)
      
      
      SELECT 			methods.id,
                  name, 
                  COALESCE(SUM(entrances."profitLoss"), 0) result,
                  count(entrances.*) entrances,
                  COALESCE(SUM(entrances.greens), 0) greens,
                  COALESCE(SUM(entrances.reds), 0) reds,
                  COALESCE(SUM(entrances."profitLoss") / SUM(entrances.profit + (entrances.loss * -1)) * 100, 0) roi
      FROM 				methods
      LEFT JOIN	entrances
      ON					entrances.method_id = methods.id
      GROUP BY 		methods.name, methods.id
    `);

    for (let index = 0; index < methods.length; index++) {
      const method = methods[index];

      console.log(method.entrances);

      method.greenPercent =
        method.entrances === '0'
          ? 0
          : Number((method.greens / method.entrances) * 100).toFixed(2);
      method.redPercent =
        method.entrances === '0'
          ? 0
          : Number((method.reds / method.entrances) * 100).toFixed(2);
    }

    return methods;
  }

  public async create(user_id: string, name: string): Promise<string> {
    const methodRepository = getRepository(Method);

    const method = methodRepository.create({
      user_id,
      name,
    });

    await methodRepository.save(method);

    return 'Método criado com sucesso';
  }

  public async deleteMethod(id: string): Promise<string> {
    const methodsRepository = getRepository(Method);

    const method = await methodsRepository.findOne({ id });

    if (method) {
      await methodsRepository.delete({
        id,
      });

      return 'Estratégia deletada com sucesso.';
    }

    return 'Não existe uma estratégia com o id informado';
  }
}

export default MethodService;
