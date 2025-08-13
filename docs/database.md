## Database Design (ERD & DDL)

이 문서는 제출 평가 도메인의 핵심 스키마를 요약합니다. 실제 스키마는 TypeORM 마이그레이션(`src/db/migrations/1755044326803-InitSchema.ts`)을 기준으로 합니다.

### ERD (개요)

```mermaid
erDiagram
  STUDENTS ||--o{ SUBMISSIONS : "has"
  SUBMISSIONS ||--|| SUBMISSION_MEDIA : "has"
  SUBMISSIONS ||--o{ SUBMISSION_LOGS : "logs"
  SUBMISSIONS ||--o{ REVISIONS : "re-evaluated by"

  STUDENTS {
    BIGSERIAL studentId PK
    BIGINT externalStudentId "UQ"
    VARCHAR(100) studentName
    TIMESTAMPTZ createdAt
    TIMESTAMPTZ updatedAt
  }

  SUBMISSIONS {
    UUID submissionId PK
    BIGINT studentId FK
    VARCHAR(100) componentType
    TEXT submitText
    ENUM status "PENDING|PROCESSING|SUCCESS|FAILED|RETRY_SCHEDULED"
    ENUM result "ok|failed"
    VARCHAR(500) message
    SMALLINT score
    TEXT feedback
    JSONB highlights
    TEXT highlightSubmitText
    INT apiLatencyMs
    VARCHAR(128) traceId
    JSONB aiRaw
    TIMESTAMPTZ createdAt
    TIMESTAMPTZ updatedAt
  }

  SUBMISSION_MEDIA {
    BIGSERIAL mediaId PK
    UUID submissionId FK UQ
    TEXT videoUrl
    TEXT audioUrl
    INT videoDurationSec
    INT audioDurationSec
    BIGINT videoSizeBytes
    BIGINT audioSizeBytes
    VARCHAR(100) storageContainer
    VARCHAR(255) blobNameVideo
    VARCHAR(255) blobNameAudio
    JSONB metadata
    TIMESTAMPTZ createdAt
  }

  SUBMISSION_LOGS {
    BIGSERIAL logId PK
    UUID submissionId FK
    VARCHAR(40) step
    VARCHAR(60) externalService
    JSONB requestPayload
    JSONB responsePayload
    ENUM status "ok|failed"
    INT httpStatus
    INT latencyMs
    VARCHAR(128) traceId
    TIMESTAMPTZ createdAt
  }

  REVISIONS {
    UUID revisionId PK
    UUID submissionId FK
    VARCHAR(500) reason
    ENUM status "PENDING|PROCESSING|SUCCESS|FAILED"
    SMALLINT score
    TEXT feedback
    JSONB highlights
    JSONB aiRaw
    INT apiLatencyMs
    VARCHAR(128) traceId
    TIMESTAMPTZ createdAt
    TIMESTAMPTZ updatedAt
  }

  STATS_DAILY {
    DATE statDate PK
    INT totalCount
    INT successCount
    INT failedCount
    INT pendingCount
    INT processingCount
    TIMESTAMPTZ createdAt
  }

  STATS_WEEKLY {
    SMALLINT statYear PK
    SMALLINT statWeek PK
    INT totalCount
    INT successCount
    INT failedCount
    INT pendingCount
    INT processingCount
    TIMESTAMPTZ createdAt
  }

  STATS_MONTHLY {
    SMALLINT statYear PK
    SMALLINT statMonth PK
    INT totalCount
    INT successCount
    INT failedCount
    INT pendingCount
    INT processingCount
    TIMESTAMPTZ createdAt
  }
```

관계 요약

- 학생(`students`) 1 — N 제출(`submissions`)
- 제출 1 — 1 미디어(`submission_media`)
- 제출 1 — N 로그(`submission_logs`)
- 제출 1 — N 재평가(`revisions`)

---

### 인덱스 및 제약

- `students.externalStudentId` Unique
- `students.studentName` Index
- `submissions.componentType`, `submissions.status`, `submissions.traceId` Index
- `submissions (studentId, componentType)` Unique (학생/컴포넌트 1회 평가 제한)
- `revisions (status, createdAt)` Index, `revisions (submissionId, createdAt)` Index
- 각 FK는 CASCADE/RESTRICT 정책을 마이그레이션에 따름

---

### DDL (발췌)

모든 테이블/인덱스는 `src/db/migrations/1755044326803-InitSchema.ts`에 정의되어 있습니다. 아래는 주요 발췌입니다.

```sql
-- students
CREATE TABLE "students" (
  "studentId" BIGSERIAL PRIMARY KEY,
  "externalStudentId" BIGINT UNIQUE,
  "studentName" VARCHAR(100) NOT NULL,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE INDEX "IDX_students_studentName" ON "students" ("studentName");

-- submissions (발췌)
CREATE TABLE "submissions" (
  "submissionId" UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
  "studentId" BIGINT NOT NULL,
  "componentType" VARCHAR(100) NOT NULL,
  "submitText" TEXT NOT NULL,
  "status" "public"."submission_status" NOT NULL DEFAULT 'PENDING',
  "result" "public"."result_status" NOT NULL DEFAULT 'ok',
  "message" VARCHAR(500),
  "score" SMALLINT,
  "feedback" TEXT,
  "highlights" JSONB,
  "highlightSubmitText" TEXT,
  "apiLatencyMs" INT,
  "traceId" VARCHAR(128),
  "aiRaw" JSONB,
  "createdAt" TIMESTAMPTZ NOT NULL DEFAULT now(),
  "updatedAt" TIMESTAMPTZ NOT NULL DEFAULT now()
);
CREATE UNIQUE INDEX "ux_submissions_student_component" ON "submissions" ("studentId", "componentType");
```

전체 스키마는 마이그레이션 파일을 참고하시고, 변경 시에는 새 마이그레이션을 생성하세요.

```bash
npm run db:migration:generate
npm run db:migration:run
```


