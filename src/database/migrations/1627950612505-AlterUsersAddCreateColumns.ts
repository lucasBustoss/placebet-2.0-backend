/*eslint-disable*/
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterUsersAddCreateColumns1627950612505 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "currencyType" varchar`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "startBank" decimal`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "startBetfairBank" decimal`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "date" date`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "moneyType" integer`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "stake" decimal`);
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "visibility" integer`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "currencyType"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "startBank"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "startBetfairBank"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "date"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "moneyType"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "stake"`);
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "visibility"`);
    }
}
