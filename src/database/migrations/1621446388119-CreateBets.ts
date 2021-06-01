import { MigrationInterface, QueryRunner, Table } from 'typeorm';
/*eslint-disable*/

export class CreateBets1621446388119 implements MigrationInterface {
    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.createTable(
            new Table({
                name: 'bets',
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
                        name: 'eventId',
                        type: 'varchar',
                    },
                    {
                        name: 'marketId',
                        type: 'varchar',
                    },
                    {
                        name: 'eventDescription',
                        type: 'varchar',
                    },
                    {
                        name: 'marketDesc',
                        type: 'varchar',
                    },
                    {
                        name: 'method_id',
                        type: 'uuid',
                        isNullable: true
                    },
                    {
                        name: 'date',
                        type: 'timestamp with time zone',
                    },
                    {
                        name: 'startTime',
                        type: 'timestamp with time zone',
                    },
                    {
                        name: 'profitLoss',
                        type: 'decimal',
                    },
                    {
                        name: 'synchronized',
                        type: 'boolean',
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
        await queryRunner.dropTable('bets');
    }
}
