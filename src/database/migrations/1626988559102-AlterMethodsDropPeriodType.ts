/*eslint-disable*/

import { MigrationInterface, QueryRunner } from "typeorm";

export class AlterMethodsDropPeriodType1626988559102 implements MigrationInterface {

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "methods" DROP COLUMN "periodType"`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "methods" ADD COLUMN "periodType" integer NOT NULL`);
    }

}
