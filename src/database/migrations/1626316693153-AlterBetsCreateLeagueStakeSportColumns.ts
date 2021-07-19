/*eslint-disable*/
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBetsCreateLeagueStakeSportColumns1626316693153 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bets" ADD COLUMN "league_id" uuid`);
        await queryRunner.query(`ALTER TABLE "bets" ADD CONSTRAINT "FK_league_id" FOREIGN KEY ("league_id") REFERENCES leagues (id)`);
        await queryRunner.query(`ALTER TABLE "bets" ADD COLUMN "stake" decimal NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "bets" ADD COLUMN "sport" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bets" DROP CONSTRAINT "FK_league_id"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "league_id"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "stake"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "sport"`);

    }
}
