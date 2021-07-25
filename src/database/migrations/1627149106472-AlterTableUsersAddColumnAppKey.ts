/*eslint-disable*/
import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterTableUsersAddColumnAppKey1627149106472 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" ADD COLUMN "appkey" varchar`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "users" DROP COLUMN "appkey"`);
    }

}
