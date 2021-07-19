/*eslint-disable*/
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBetsDropSynchronizedColumn1626318458654 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bets" DROP COLUMN "synchronized"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "bets" ADD COLUMN "synchronized" boolean NOT NULL DEFAULT true`);
    }

}
