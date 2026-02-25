import { MigrationInterface, QueryRunner } from "typeorm";

export class InitialSchema1772059343881 implements MigrationInterface {
    name = 'InitialSchema1772059343881'

    public async up(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`CREATE TYPE "public"."loans_status_enum" AS ENUM('ACTIVE', 'CLOSED', 'DEFAULT')`);
        await queryRunner.query(`CREATE TABLE "loans" ("id" SERIAL NOT NULL, "customer_id" integer NOT NULL, "principal" numeric(10,2) NOT NULL, "outstanding" numeric(10,2) NOT NULL, "due_date" TIMESTAMP WITH TIME ZONE NOT NULL, "status" "public"."loans_status_enum" NOT NULL DEFAULT 'ACTIVE', CONSTRAINT "PK_5c6942c1e13e4de135c5203ee61" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TABLE "customers" ("id" SERIAL NOT NULL, "name" character varying NOT NULL, "email" character varying NOT NULL, "country" character varying NOT NULL, "riskScore" integer NOT NULL DEFAULT '1', CONSTRAINT "PK_133ec679a801fab5e070f73d3ea" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."action_logs_type_enum" AS ENUM('CALL', 'SMS', 'EMAIL', 'WHATSAPP')`);
        await queryRunner.query(`CREATE TYPE "public"."action_logs_outcome_enum" AS ENUM('NO_ANSWER', 'PROMISE_TO_PAY', 'PAID', 'WRONG_NUMBER')`);
        await queryRunner.query(`CREATE TABLE "action_logs" ("id" SERIAL NOT NULL, "case_id" integer NOT NULL, "type" "public"."action_logs_type_enum" NOT NULL, "outcome" "public"."action_logs_outcome_enum" NOT NULL, "notes" text, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cc15d2a348eaf2e1e153055380c" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_5e679eb85c27d7634ba20593f8" ON "action_logs" ("case_id", "created_at") `);
        await queryRunner.query(`CREATE TABLE "rule_decisions" ("id" SERIAL NOT NULL, "case_id" integer NOT NULL, "matched_rules" jsonb NOT NULL, "reason" text NOT NULL, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_1de6cc2f5b74055891a3d067fdf" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE TYPE "public"."cases_stage_enum" AS ENUM('SOFT', 'HARD', 'LEGAL')`);
        await queryRunner.query(`CREATE TYPE "public"."cases_status_enum" AS ENUM('OPEN', 'IN_PROGRESS', 'RESOLVED', 'CLOSED')`);
        await queryRunner.query(`CREATE TABLE "cases" ("id" SERIAL NOT NULL, "customer_id" integer NOT NULL, "loan_id" integer NOT NULL, "dpd" integer NOT NULL DEFAULT '0', "stage" "public"."cases_stage_enum" NOT NULL DEFAULT 'SOFT', "status" "public"."cases_status_enum" NOT NULL DEFAULT 'OPEN', "assigned_to" character varying, "assigned_group" character varying, "created_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updated_at" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_264acb3048c240fb89aa34626db" PRIMARY KEY ("id"))`);
        await queryRunner.query(`CREATE INDEX "IDX_61064a60a102749be2b969961d" ON "cases" ("assigned_to") `);
        await queryRunner.query(`CREATE INDEX "IDX_4d37e4b9b1b95f665df72a77b2" ON "cases" ("status", "stage", "dpd") `);
        await queryRunner.query(`ALTER TABLE "loans" ADD CONSTRAINT "FK_407d3207500ffa10289f908f0ef" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "action_logs" ADD CONSTRAINT "FK_0e46f0c58294d9cccc4788bde03" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "rule_decisions" ADD CONSTRAINT "FK_33f95e8ab9de9e8db9e45031908" FOREIGN KEY ("case_id") REFERENCES "cases"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_7a1c3dfb1bba433e1766d51d3ee" FOREIGN KEY ("customer_id") REFERENCES "customers"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
        await queryRunner.query(`ALTER TABLE "cases" ADD CONSTRAINT "FK_9262486563dd6a102fff570749f" FOREIGN KEY ("loan_id") REFERENCES "loans"("id") ON DELETE NO ACTION ON UPDATE NO ACTION`);
    }

    public async down(queryRunner: QueryRunner): Promise<void> {
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_9262486563dd6a102fff570749f"`);
        await queryRunner.query(`ALTER TABLE "cases" DROP CONSTRAINT "FK_7a1c3dfb1bba433e1766d51d3ee"`);
        await queryRunner.query(`ALTER TABLE "rule_decisions" DROP CONSTRAINT "FK_33f95e8ab9de9e8db9e45031908"`);
        await queryRunner.query(`ALTER TABLE "action_logs" DROP CONSTRAINT "FK_0e46f0c58294d9cccc4788bde03"`);
        await queryRunner.query(`ALTER TABLE "loans" DROP CONSTRAINT "FK_407d3207500ffa10289f908f0ef"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_4d37e4b9b1b95f665df72a77b2"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_61064a60a102749be2b969961d"`);
        await queryRunner.query(`DROP TABLE "cases"`);
        await queryRunner.query(`DROP TYPE "public"."cases_status_enum"`);
        await queryRunner.query(`DROP TYPE "public"."cases_stage_enum"`);
        await queryRunner.query(`DROP TABLE "rule_decisions"`);
        await queryRunner.query(`DROP INDEX "public"."IDX_5e679eb85c27d7634ba20593f8"`);
        await queryRunner.query(`DROP TABLE "action_logs"`);
        await queryRunner.query(`DROP TYPE "public"."action_logs_outcome_enum"`);
        await queryRunner.query(`DROP TYPE "public"."action_logs_type_enum"`);
        await queryRunner.query(`DROP TABLE "customers"`);
        await queryRunner.query(`DROP TABLE "loans"`);
        await queryRunner.query(`DROP TYPE "public"."loans_status_enum"`);
    }

}
