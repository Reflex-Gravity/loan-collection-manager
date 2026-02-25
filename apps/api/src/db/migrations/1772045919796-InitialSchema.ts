import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772045919796 implements MigrationInterface {
    name = 'InitialSchema1772045919796'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."actions_logs_type_enum" AS ENUM('CALL', 'SMS', 'EMAIL', 'WHATSAPP')`);
        await queryRunner.query(`CREATE TYPE "public"."actions_logs_outcome_enum" AS ENUM('NO_ANSWER', 'PROMISE_TO_PAY', 'PAID', 'WRONG_NUMBER')`);
        await queryRunner.query(`CREATE TABLE "actions_logs" ("id" SERIAL NOT NULL, "case_id" integer NOT NULL, "type" "public"."actions_logs_type_enum" NOT NULL, "outcome" "public"."actions_logs_outcome_enum" NOT NULL, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL, CONSTRAINT "PK_19a4a12159a36ad897b287811bd" PRIMARY KEY ("id"))`);
        await queryRunner.query(`ALTER TABLE "actions_logs" ADD CONSTRAINT "FK_79bb5bf56614c808d781240e6b2" FOREIGN KEY ("case_id") REFERENCES "case"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "actions_logs" DROP CONSTRAINT "FK_79bb5bf56614c808d781240e6b2"`);
        await queryRunner.query(`DROP TABLE "actions_logs"`);
        await queryRunner.query(`DROP TYPE "public"."actions_logs_outcome_enum"`);
        await queryRunner.query(`DROP TYPE "public"."actions_logs_type_enum"`);
    }

}
