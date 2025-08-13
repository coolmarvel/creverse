## Submission Evaluation API (과제)

AI 학습 평가(Submission Evaluation) 기능을 제공하는 NestJS 기반 REST API입니다. 학생의 에세이 제출을 받아 미디어 전처리(FFmpeg), Azure Blob 저장, Azure OpenAI 평가 호출을 통해 점수/피드백/하이라이트를 산출합니다. 과제 문서의 스펙(응답 스키마, 전역 실패 응답, 로깅, 스케줄러, 페이지네이션)을 준수합니다.

### 주요 기능

- 제출 API: 텍스트 및 선택적 비디오 업로드, 비디오 전처리 후 Blob 업로드, AI 평가 호출, 하이라이트 가공
- 조회 API: 제출 목록/상세, 재평가 요청/조회, 페이지네이션·정렬·검색
- 스케줄러: 일/주/월 통계 집계, 실패 제출 자동 재시도
- 공통 응답: 실패 시에도 HTTP 200 + `result: "failed"` + `message` 정책
- 로깅/트레이싱: 요청/응답, 외부 호출, 지연시간, TraceId 기록

문서 내 용어/엔드포인트는 과제 `개별과제.pdf`를 기준으로 정리되었습니다.

---

## 빠른 시작(Quick Start)

### 1) 사전 요구사항

- Node.js 20 LTS, npm
- Docker, Docker Compose

### 2) 환경 변수(.env)

앱 실행과 Docker Compose를 위해 다음 예시를 참고해 `.env`를 준비하세요.

```env
# App
DATABASE_URL=postgres://creverse:creverse@localhost:5432/creverse
DATABASE_SCHEMA=public
REDIS_URL=redis://localhost:6379

# Auth (개발용)
JWT_BEARER_TOKEN=devtoken
SWAGGER_USERNAME=
SWAGGER_PASSWORD=

# Azure Blob
AZURE_ACCOUNT_NAME=devtaskblob
AZURE_ACCOUNT_KEY=changeme
AZURE_CONTAINER=task

# Azure OpenAI
AZURE_ENDPOINT_URL=https://example.openai.azure.com/
AZURE_ENDPOINT_KEY=changeme
AZURE_OPENAI_DEPLOYMENT_NAME=feedback-01
AZURE_OPENAI_API_VERSION=2024-02-15-preview

# Docker Compose (DB)
POSTGRES_USERNAME=creverse
POSTGRES_PASSWORD=creverse
POSTGRES_DATABASE=creverse
POSTGRES_PORT=5432
```

### 3) 의존성 설치

```bash
npm install
```

### 4) 인프라 기동 (DB/Redis)

```bash
docker compose up -d db redis
```

PgAdmin이 필요한 경우 다음도 함께 기동할 수 있습니다.

```bash
docker compose up -d pgadmin
```

### 5) DB 마이그레이션 적용

```bash
npm run db:ensure:types
npm run db:migration:run
```

### 6) 애플리케이션 실행

```bash
# 개발(Watch)
npm run start:dev

# 일반 개발 실행
npm run start

# 프로덕션 빌드 후 실행
npm run build && npm run start:prod
```

### 7) API 문서(Swagger)

- URL: `http://localhost:3000/docs`
- 개발 인증: Authorize 버튼 클릭 후 `JWT_BEARER_TOKEN` 값을 입력하면 Bearer 헤더가 자동 부여됩니다.

---

## 스크립트(명령어)

```bash
# Lint
npm run lint

# Build
npm run build

# Unit Test
npm run test

# E2E Test
npm run test:e2e

# Coverage
npm run test:cov

# TypeORM Migration
npm run db:ensure:types
npm run db:migration:generate   # 엔티티 변경을 기반으로 신규 마이그레이션 생성
npm run db:migration:run        # 마이그레이션 적용
npm run db:migration:revert     # 최근 마이그레이션 롤백
```

---

## 배포 가이드(예시)

1. 런타임 환경 변수 설정(.env 또는 시크릿)

2. 데이터베이스 준비 및 마이그레이션

```bash
npm ci
npm run db:migration:run
```

3. 애플리케이션 빌드/실행

```bash
npm run build
npm run start:prod
```

4. 운영 고려사항

- 역프록시(예: Nginx) 앞단 배치 및 `/docs` 접근 제어 필요 시 BasicAuth 사용
- 로깅: pino/winston 로그를 수집기(예: CloudWatch, ELK, Azure Monitor)로 전송 권장
- 외부 의존성(Azure OpenAI/Blob) 장애 시 재시도·서킷브레이커 정책 고려

---

## 보안/인증

- 모든 엔드포인트는 Bearer JWT 요구(개발 모드에서 `JWT_BEARER_TOKEN`로 대체)
- 전역 실패 정책: 실패 시에도 HTTP 200 + `result: "failed"` + `message`

---

## API 퀵 체크

- Health: `GET /v1/health`
- Submit(JSON): `POST /v1/submissions`
- Submit(multipart): `POST /v1/submissions` (필드 `videoFile` 포함)
- List: `GET /v1/submissions?include=media,logs&sort=score,DESC`
- Revision: `POST /v1/revision` 바디 `{ submissionId }`

---

## CI (GitHub Actions)

- 러너: ubuntu-latest, 서비스: Postgres 16, Redis 7
- 작업: 설치 → DB 대기 → 마이그레이션 → Lint → Build → E2E

---

## 아키텍처(개요)

```mermaid
graph TD;
  Client[Client (Swagger/HTTP)] --> API[NestJS API]\n/v1/*;
  API -->|FFmpeg (fluent-ffmpeg)| FF[FFmpeg]
  API -->|Upload SAS| Blob[Azure Blob Storage]
  API -->|Chat Completions| AOAI[Azure OpenAI]
  API -->|TypeORM| PG[(PostgreSQL)]
  API -->|Logging| Pino[pino]
  Scheduler[Scheduler (Cron)] --> API
```

## 제출 플로우(시퀀스)

```mermaid
sequenceDiagram
  autonumber
  participant C as Client
  participant A as API (NestJS)
  participant F as FFmpeg
  participant B as Azure Blob
  participant O as Azure OpenAI
  participant D as Postgres

  C->>A: POST /v1/submissions (JSON or multipart)
  alt with video
    A->>F: preprocess (crop, mute, extract MP3)
    F-->>A: videoPath, audioPath
    A->>B: upload video/audio
    B-->>A: SAS URLs
  end
  A->>O: evaluate essay (JSON forced)
  O-->>A: { score, feedback, highlights }
  A->>A: boldHighlights(submitText, highlights)
  A->>D: persist submission/media/logs
  A-->>C: 200 { result: "ok", ... }
```

## 스케줄러(개요)

```mermaid
graph LR;
  Cron1[Daily 01:00] --> Agg1[Aggregate stats_daily]
  Cron2[Weekly] --> Agg2[Aggregate stats_weekly]
  Cron3[Monthly] --> Agg3[Aggregate stats_monthly]
  Retry[Every hour] --> ReEval[Retry FAILED submissions]
  Agg1 --> PG[(PostgreSQL)]
  Agg2 --> PG
  Agg3 --> PG
  ReEval --> API[NestJS AiService]
```

---

## 데이터베이스/ERD 문서

자세한 ERD, 테이블 정의서(DDL/마이그레이션)는 `docs/database.md`를 참고하세요.

---

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
