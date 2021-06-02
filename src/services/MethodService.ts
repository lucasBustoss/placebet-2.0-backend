import { getRepository, getManager } from 'typeorm';

import Method from '../models/Method';

class MethodService {
  public async find(user_id: string): Promise<Method[]> {
    const methodRepository = getRepository(Method);

    const methods = await methodRepository.find({ user_id });

    return methods;
  }

  public async findWithStats(user_id: string): Promise<any> {
    const entityManager = getManager();

    const methods = await entityManager.query(`
    WITH entrances as (
      SELECT SUM("profitLoss") "profitLoss", 
        case when SUM("profitLoss") > 0 then 1 else 0 end greens,  
        case when SUM("profitLoss") < 0 then 1 else 0 end reds,  
        case when SUM("profitLoss") > 0 then SUM("profitLoss") else 0 end profit,  
        case when SUM("profitLoss") < 0 then SUM("profitLoss") else 0 end loss,  
        method_id, "eventDescription", "date" 
      FROM "bets" "Bet" 
      WHERE user_id = '${user_id}' AND date BETWEEN '2021-05-01' AND '2021-05-31' GROUP 
      BY  method_id, "eventDescription", date, "startTime" ORDER BY "startTime" DESC, "method_id" ASC)
      
      
      SELECT 			name, 
                  SUM(entrances."profitLoss") result,
                  count(*) entrances,
                  SUM(entrances.greens) greens,
                  SUM(entrances.reds) reds,
                  SUM(entrances."profitLoss") / SUM(entrances.profit + (entrances.loss * -1)) * 100 roi
      FROM 				methods
      INNER JOIN	entrances
      ON					entrances.method_id = methods.id
      GROUP BY 		methods.name
    `);

    for (let index = 0; index < methods.length; index++) {
      const method = methods[index];

      method.greenPercent = Number(
        (method.greens / method.entrances) * 100,
      ).toFixed(2);
      method.redPercent = Number(
        (method.reds / method.entrances) * 100,
      ).toFixed(2);
    }

    return methods;
  }

  public async create(
    user_id: string,
    name: string,
    periodType: number,
  ): Promise<string> {
    const methodRepository = getRepository(Method);

    const method = methodRepository.create({
      user_id,
      name,
      periodType,
    });

    await methodRepository.save(method);

    return 'Método criado com sucesso';
  }
}

export default MethodService;
