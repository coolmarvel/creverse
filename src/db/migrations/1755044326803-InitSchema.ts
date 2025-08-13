import { MigrationInterface, QueryRunner } from 'typeorm';

export class InitSchema1755044326803 implements MigrationInterface {
  name = 'InitSchema1755044326803';

  public async up(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(
      `CREATE TABLE "stats_daily" ("statDate" date NOT NULL, "totalCount" integer NOT NULL DEFAULT '0', "successCount" integer NOT NULL DEFAULT '0', "failedCount" integer NOT NULL DEFAULT '0', "pendingCount" integer NOT NULL DEFAULT '0', "processingCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_272cb1c5e0c8dcbe0f7ac97ba77" PRIMARY KEY ("statDate"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "students" ("studentId" BIGSERIAL NOT NULL, "externalStudentId" bigint, "studentName" character varying(100) NOT NULL, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "UQ_6e0ec8584f4b494fe1fc11ffa8a" UNIQUE ("externalStudentId"), CONSTRAINT "PK_9d9f010d4d6a6eea8b4779638c4" PRIMARY KEY ("studentId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_2672f21a1dac4652f20d1be064" ON "students" ("studentName") `);
    await queryRunner.query(
      `CREATE TABLE "stats_weekly" ("statYear" smallint NOT NULL, "statWeek" smallint NOT NULL, "totalCount" integer NOT NULL DEFAULT '0', "successCount" integer NOT NULL DEFAULT '0', "failedCount" integer NOT NULL DEFAULT '0', "pendingCount" integer NOT NULL DEFAULT '0', "processingCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_cb50db860539ef3db888f0c874b" PRIMARY KEY ("statYear", "statWeek"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "submission_media" ("mediaId" BIGSERIAL NOT NULL, "submissionId" uuid NOT NULL, "videoUrl" text, "audioUrl" text, "videoDurationSec" integer, "audioDurationSec" integer, "videoSizeBytes" bigint, "audioSizeBytes" bigint, "storageContainer" character varying(100), "blobNameVideo" character varying(255), "blobNameAudio" character varying(255), "metadata" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "submission_id" uuid, CONSTRAINT "REL_2e9be2f1f37d7a484e38f4ce78" UNIQUE ("submission_id"), CONSTRAINT "PK_6f9e79862c9a37f4c2ad0658ce6" PRIMARY KEY ("mediaId"))`,
    );
    await queryRunner.query(
      `CREATE TABLE "revisions" ("revisionId" uuid NOT NULL DEFAULT uuid_generate_v4(), "submissionId" uuid NOT NULL, "reason" character varying(500), "status" "public"."revision_status" NOT NULL DEFAULT 'PENDING', "score" smallint, "feedback" text, "highlights" jsonb, "aiRaw" jsonb, "apiLatencyMs" integer, "traceId" character varying(128), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "submission_id" uuid, CONSTRAINT "PK_5df9bda85faeafcc46fe818f4b2" PRIMARY KEY ("revisionId"))`,
    );
    await queryRunner.query(`CREATE INDEX "ix_revisions_status_created" ON "revisions" ("status", "createdAt") `);
    await queryRunner.query(`CREATE INDEX "ix_revisions_submission_created" ON "revisions" ("submissionId", "createdAt") `);
    await queryRunner.query(
      `CREATE TABLE "submissions" ("submissionId" uuid NOT NULL DEFAULT uuid_generate_v4(), "studentId" bigint NOT NULL, "componentType" character varying(100) NOT NULL, "submitText" text NOT NULL, "status" "public"."submission_status" NOT NULL DEFAULT 'PENDING', "result" "public"."result_status" NOT NULL DEFAULT 'ok', "message" character varying(500), "score" smallint, "feedback" text, "highlights" jsonb, "highlightSubmitText" text, "apiLatencyMs" integer, "traceId" character varying(128), "aiRaw" jsonb, "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "updatedAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "student_id" bigint, CONSTRAINT "PK_e44b3b19987a93456e590a17e29" PRIMARY KEY ("submissionId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_7266106d0551b8cbd5ad95c7dd" ON "submissions" ("componentType") `);
    await queryRunner.query(`CREATE INDEX "IDX_d4842916487f15fcca89b1a918" ON "submissions" ("status") `);
    await queryRunner.query(`CREATE INDEX "IDX_9ecc257bc6d7d004d10ac98347" ON "submissions" ("traceId") `);
    await queryRunner.query(`CREATE UNIQUE INDEX "ux_submissions_student_component" ON "submissions" ("studentId", "componentType") `);
    await queryRunner.query(
      `CREATE TABLE "submission_logs" ("logId" BIGSERIAL NOT NULL, "submissionId" uuid NOT NULL, "step" character varying(40) NOT NULL, "externalService" character varying(60), "requestPayload" jsonb, "responsePayload" jsonb, "status" "public"."result_status" NOT NULL DEFAULT 'ok', "httpStatus" integer, "latencyMs" integer, "traceId" character varying(128), "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), "submission_id" uuid, CONSTRAINT "PK_6ca850680d19c42ea54b6465d3d" PRIMARY KEY ("logId"))`,
    );
    await queryRunner.query(`CREATE INDEX "IDX_350ec7825f8fa54d56029c4d88" ON "submission_logs" ("step") `);
    await queryRunner.query(`CREATE INDEX "IDX_05d342a5cc109069f3e81718d6" ON "submission_logs" ("traceId") `);
    await queryRunner.query(
      `CREATE TABLE "stats_monthly" ("statYear" smallint NOT NULL, "statMonth" smallint NOT NULL, "totalCount" integer NOT NULL DEFAULT '0', "successCount" integer NOT NULL DEFAULT '0', "failedCount" integer NOT NULL DEFAULT '0', "pendingCount" integer NOT NULL DEFAULT '0', "processingCount" integer NOT NULL DEFAULT '0', "createdAt" TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(), CONSTRAINT "PK_2398a54caaf58f9276c3d899e06" PRIMARY KEY ("statYear", "statMonth"))`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission_media" ADD CONSTRAINT "FK_2e9be2f1f37d7a484e38f4ce78e" FOREIGN KEY ("submission_id") REFERENCES "submissions"("submissionId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "revisions" ADD CONSTRAINT "FK_5aac4b8e3d5c3e7ba52a95254ad" FOREIGN KEY ("submission_id") REFERENCES "submissions"("submissionId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "submissions" ADD CONSTRAINT "FK_435def3bbd4b4bbb9de1209cdae" FOREIGN KEY ("student_id") REFERENCES "students"("studentId") ON DELETE RESTRICT ON UPDATE CASCADE`,
    );
    await queryRunner.query(
      `ALTER TABLE "submission_logs" ADD CONSTRAINT "FK_90a0447df332ee34a42ab096b4a" FOREIGN KEY ("submission_id") REFERENCES "submissions"("submissionId") ON DELETE CASCADE ON UPDATE CASCADE`,
    );
  }

  public async down(queryRunner: QueryRunner): Promise<void> {
    await queryRunner.query(`ALTER TABLE "submission_logs" DROP CONSTRAINT "FK_90a0447df332ee34a42ab096b4a"`);
    await queryRunner.query(`ALTER TABLE "submissions" DROP CONSTRAINT "FK_435def3bbd4b4bbb9de1209cdae"`);
    await queryRunner.query(`ALTER TABLE "revisions" DROP CONSTRAINT "FK_5aac4b8e3d5c3e7ba52a95254ad"`);
    await queryRunner.query(`ALTER TABLE "submission_media" DROP CONSTRAINT "FK_2e9be2f1f37d7a484e38f4ce78e"`);
    await queryRunner.query(`DROP TABLE "stats_monthly"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_05d342a5cc109069f3e81718d6"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_350ec7825f8fa54d56029c4d88"`);
    await queryRunner.query(`DROP TABLE "submission_logs"`);
    await queryRunner.query(`DROP INDEX "public"."ux_submissions_student_component"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_9ecc257bc6d7d004d10ac98347"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_d4842916487f15fcca89b1a918"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_7266106d0551b8cbd5ad95c7dd"`);
    await queryRunner.query(`DROP TABLE "submissions"`);
    await queryRunner.query(`DROP INDEX "public"."ix_revisions_submission_created"`);
    await queryRunner.query(`DROP INDEX "public"."ix_revisions_status_created"`);
    await queryRunner.query(`DROP TABLE "revisions"`);
    await queryRunner.query(`DROP TABLE "submission_media"`);
    await queryRunner.query(`DROP TABLE "stats_weekly"`);
    await queryRunner.query(`DROP INDEX "public"."IDX_2672f21a1dac4652f20d1be064"`);
    await queryRunner.query(`DROP TABLE "students"`);
    await queryRunner.query(`DROP TABLE "stats_daily"`);
  }
}
