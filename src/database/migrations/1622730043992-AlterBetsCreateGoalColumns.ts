/*eslint-disable*/
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBetsCreateGoalColumns1622730043992 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bets" ADD COLUMN "goalsScored" integer NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "bets" ADD COLUMN "goalsConceded" integer NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "goalsScored"`);
        await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "goalsConceded"`);

    }

}
