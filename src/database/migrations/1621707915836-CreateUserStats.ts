import { MigrationInterface, QueryRunner, Table } from 'typeorm';
/*eslint-disable*/

export class CreateStats1621707915836 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'userstats',
                columns: [
                    {
                        name: 'id',
                        type: 'uuid',
                        isPrimary: true,
                        generationStrategy: 'uuid',
                        default: 'uuid_generate_v4()',
                    },
                    {
                        name: 'user_id',
                        type: 'uuid',
                    },
                    {
                        name: 'month',
                        type: 'varchar',
                    },
                    {
                        name: 'stake',
                        type: 'decimal',
                    },
                    {
                        name: 'startBank',
                        type: 'decimal',
                    },
                    {
                        name: 'finalBank',
                        type: 'decimal',
                    },
                    {
                        name: 'startBankBetfair',
                        type: 'decimal',
                    },
                    {
                        name: 'finalBankBetfair',
                        type: 'decimal',
                    },
                    {
                        name: 'profitLoss',
                        type: 'decimal',
                    },
                    {
                        name: 'roiBank',
                        type: 'decimal',
                    },
                    {
                        name: 'roiStake',
                        type: 'decimal',
                    },
                    {
                        name: 'created_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                    {
                        name: 'updated_at',
                        type: 'timestamp',
                        default: 'now()',
                    },
                ],
            }),
        );
    }

    public async down(queryRunner: QueryRunner): Promise<any> {
        await queryRunner.dropTable('userstats');
    }
}
