import { getRepository, IsNull, getManager } from 'typeorm';
import { format, startOfMonth, endOfMonth, parseISO } from 'date-fns';

import League from '../models/League';

class LeagueService {
  public async find(user_id: string): Promise<League[]> {
    const leagueRepository = getRepository(League);

    const leagues = await leagueRepository.find({
      where: [{ user_id }, { user_id: IsNull() }],
      order: { name: 'ASC' },
    });

    return leagues;
  }

  public async findWithStats(user_id: string, date: string): Promise<any> {
    const entityManager = getManager();

    const startMonth =
      date !== '1900-01-01'
        ? format(startOfMonth(parseISO(date)), 'yyyy-MM-dd')
        : '1900-01-01';

    const endMonth =
      date !== '1900-01-01'
        ? format(endOfMonth(parseISO(date)), 'yyyy-MM-dd')
        : '3000-01-01';

    const leagues = await entityManager.query(`
    WITH entrances as (
      SELECT SUM("profitLoss") "profitLoss", 
        case when SUM("profitLoss") > 0 then 1 else 0 end greens,  
        case when SUM("profitLoss") < 0 then 1 else 0 end reds,  
        case when SUM("profitLoss") > 0 then SUM("profitLoss") else 0 end profit,  
        case when SUM("profitLoss") < 0 then SUM("profitLoss") else 0 end loss,  
        league_id, "eventDescription", "date" 
      FROM "bets" "Bet" 
      WHERE (user_id IS NULL OR user_id = '${user_id}') AND date BETWEEN '${startMonth}' AND '${endMonth}' AND league_id IS NOT NULL GROUP 
      BY  league_id, "eventDescription", date, "startTime" ORDER BY "startTime" DESC, "league_id" ASC)
      
      
      SELECT 			leagues.id,
                  name, 
                  COALESCE(SUM(entrances."profitLoss"), 0) result,
                  count(entrances.*) entrances,
                  COALESCE(SUM(entrances.greens), 0) greens,
                  COALESCE(SUM(entrances.reds), 0) reds,
                  COALESCE(SUM(entrances."profitLoss") / SUM(entrances.profit + (entrances.loss * -1)) * 100, 0) roi
      FROM 				leagues
      LEFT JOIN	  entrances
      ON					entrances.league_id = leagues.id
      WHERE       (user_id IS NULL OR user_id = '${user_id}')
      GROUP BY 		leagues.name, leagues.id
      ORDER BY    result DESC
    `);

    for (let index = 0; index < leagues.length; index++) {
      const league = leagues[index];

      league.greenPercent =
        league.entrances === '0'
          ? 0
          : Number((league.greens / league.entrances) * 100).toFixed(2);
      league.redPercent =
        league.entrances === '0'
          ? 0
          : Number((league.reds / league.entrances) * 100).toFixed(2);
    }

    return leagues;
  }

  public async create(user_id: string, name: string): Promise<string> {
    const leagueRepository = getRepository(League);

    const league = leagueRepository.create({
      user_id,
      name,
    });

    await leagueRepository.save(league);

    return 'Campeonato criado com sucesso';
  }

  public async deleteLeague(id: string): Promise<string> {
    const leagueRepository = getRepository(League);

    const league = await leagueRepository.findOne({ id });

    if (league) {
      if (!league.user_id) {
        throw new Error('Não é possivel excluir um campeonato interno');
      }

      await leagueRepository.delete({
        id,
      });

      return 'Campeonato deletado com sucesso.';
    }

    return 'Não existe um campeonato com o id informado';
  }
}

export default LeagueService;
