/*eslint-disable*/
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterBetsCreateDepositWithdrawColumns1624372416574 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "userstats" ADD COLUMN "bankDeposits" decimal NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "userstats" ADD COLUMN "bankWithdraws" decimal NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "userstats" ADD COLUMN "betfairDeposits" decimal NOT NULL DEFAULT 0`);
        await queryRunner.query(`ALTER TABLE "userstats" ADD COLUMN "betfairWithdraws" decimal NOT NULL DEFAULT 0`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "userstats" DROP COLUMN "bankDeposits"`);
        await queryRunner.query(`ALTER TABLE "userstats" DROP COLUMN "bankWithdraws"`);
        await queryRunner.query(`ALTER TABLE "userstats" DROP COLUMN "betfairDeposits"`);
        await queryRunner.query(`ALTER TABLE "userstats" DROP COLUMN "betfairWithdraws"`);

    }
}
