import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772050044001 implements MigrationInterface {
    name = 'InitialSchema1772050044001'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE INDEX "IDX_5e679eb85c27d7634ba20593f8" ON "action_logs" ("case_id", "created_at") `);
        await queryRunner.query(`CREATE INDEX "IDX_61064a60a102749be2b969961d" ON "cases" ("assigned_to") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d37e4b9b1b95f665df72a77b2" ON "cases" ("status", "stage", "dpd") `);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`DROP INDEX "public"."IDX_4d37e4b9b1b95f665df72a77b2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61064a60a102749be2b969961d"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5e679eb85c27d7634ba20593f8"`);
    }

}
