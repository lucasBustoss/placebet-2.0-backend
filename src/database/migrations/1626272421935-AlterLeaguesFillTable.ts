/*eslint-disable*/

import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterLeaguesFillTable1626272421935 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`INSERT INTO "leagues" (name) VALUES ('Campeonato Brasileiro - Série A')`);
        await queryRunner.query(`INSERT INTO "leagues" (name) VALUES ('Campeonato Brasileiro - Série B')`);
        await queryRunner.query(`INSERT INTO "leagues" (name) VALUES ('Campeonato Brasileiro - Série C')`);
        await queryRunner.query(`INSERT INTO "leagues" (name) VALUES ('Campeonato Brasileiro - Série D')`);
        await queryRunner.query(`INSERT INTO "leagues" (name) VALUES ('Copa do Brasil')`);
        await queryRunner.query(`INSERT INTO "leagues" (name) VALUES ('Copa Libertadores')`);
        await queryRunner.query(`INSERT INTO "leagues" (name) VALUES ('Copa Sulamericana')`);
        await queryRunner.query(`INSERT INTO "leagues" (name) VALUES ('UEFA Champions League')`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DELETE from Leagues`);
    }

}
