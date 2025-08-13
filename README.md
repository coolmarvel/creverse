## Submission Evaluation API (과제)

AI 학습 평가(Submission Evaluation) 기능을 제공하는 NestJS 기반 REST API입니다. 학생의 에세이 제출을 받아 미디어 전처리, Azure Blob 저장, Azure OpenAI 평가 호출을 통해 점수/피드백/하이라이트를 산출합니다. 과제 PDF의 스펙(응답 스키마, 전역 실패 응답, 로깅, 스케줄러)을 준수합니다.

## Project setup

```bash
$ npm install
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

# production mode
$ npm run start:prod
```

## Auth (dev)

- Swagger Authorize에 devtoken 입력 (Bearer 자동 부여)
- `.env`에서 `JWT_BEARER_TOKEN` 값 변경 가능

## API quick checks

- Health: `GET /v1/health`
- Submit(JSON): `POST /v1/submissions`
- Submit(multipart): `POST /v1/submissions` with field `videoFile`
- List: `GET /v1/submissions?include=media,logs&sort=score,DESC`
- Revision: `POST /v1/revision` body `{ submissionId }`

## Run tests

```bash
# unit tests
$ npm run test

# e2e tests
$ npm run test:e2e

# test coverage
$ npm run test:cov
```

## Env (.env)

```env
DATABASE_URL=postgres://creverse:creverse@localhost:5432/creverse
REDIS_URL=redis://localhost:6379

AZURE_ACCOUNT_NAME=devtaskblob
AZURE_ACCOUNT_KEY=...
AZURE_CONTAINER=task

AZURE_ENDPOINT_URL=https://...
AZURE_ENDPOINT_KEY=...
AZURE_OPENAI_DEPLOYMENT_NAME=feedback-01
AZURE_OPENAI_API_VERSION=2024-02-15-preview

JWT_BEARER_TOKEN=devtoken
```

## API quick checks

- Swagger: `http://localhost:3000/docs`
- Auth(개발): Authorize → `devtoken` 입력 (Bearer 자동 부여)
- Health: `GET /v1/health`
- Submit(JSON): `POST /v1/submissions`
- Submit(multipart): `POST /v1/submissions` (field `videoFile`)
- List: `GET /v1/submissions?include=media,logs&sort=score,DESC`
- Revision: `POST /v1/revision` body `{ submissionId }`

## CI (GitHub Actions)

- 러너: ubuntu-latest
- Services: Postgres 16, Redis 7
- Steps: install → wait DB → migration → lint → build → e2e

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

## License

Nest is [MIT licensed](https://github.com/nestjs/nest/blob/master/LICENSE).
