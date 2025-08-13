import { HttpStatus } from '@nestjs/common';
import { ApiResponseOptions } from '@nestjs/swagger';

/**
 * 공통 API 응답 스키마 정의
 */
export const API_RESPONSE_SCHEMAS = {
  // 2XX Success Responses
  SUCCESS: {
    status: HttpStatus.OK,
    description: '요청 성공',
    schema: {
      example: {
        result: 'ok',
        message: null,
        data: {},
        apiLatency: 42,
      },
    },
  } as ApiResponseOptions,

  CREATED: {
    status: HttpStatus.CREATED,
    description: '리소스 생성 성공',
    schema: {
      example: {
        result: 'ok',
        message: '성공적으로 생성되었습니다',
        data: { id: 'uuid', createdAt: '2025-08-13T00:00:00.000Z' },
        apiLatency: 120,
      },
    },
  } as ApiResponseOptions,

  NO_CONTENT: {
    status: HttpStatus.NO_CONTENT,
    description: '요청 성공 (응답 본문 없음)',
  } as ApiResponseOptions,

  // 4XX Client Errors
  BAD_REQUEST: {
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 요청',
    schema: {
      example: {
        result: 'failed',
        message: '입력값이 올바르지 않습니다',
      },
    },
  } as ApiResponseOptions,

  VALIDATION_ERROR: {
    status: HttpStatus.BAD_REQUEST,
    description: '유효성 검증 실패',
    schema: {
      example: {
        result: 'failed',
        message: ['studentId must be a positive number', 'submitText must be longer than 10 characters', 'componentType is required'],
      },
    },
  } as ApiResponseOptions,

  UNAUTHORIZED: {
    status: HttpStatus.UNAUTHORIZED,
    description: '인증 실패',
    schema: {
      example: {
        result: 'failed',
        message: 'Invalid token',
      },
    },
  } as ApiResponseOptions,

  FORBIDDEN: {
    status: HttpStatus.FORBIDDEN,
    description: '권한 없음',
    schema: {
      example: {
        result: 'failed',
        message: 'Access denied',
      },
    },
  } as ApiResponseOptions,

  NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    description: '리소스를 찾을 수 없음',
    schema: {
      example: {
        result: 'failed',
        message: 'Resource not found',
      },
    },
  } as ApiResponseOptions,

  CONFLICT: {
    status: HttpStatus.CONFLICT,
    description: '리소스 충돌',
    schema: {
      example: {
        result: 'failed',
        message: 'Resource already exists',
      },
    },
  } as ApiResponseOptions,

  UNPROCESSABLE_ENTITY: {
    status: HttpStatus.UNPROCESSABLE_ENTITY,
    description: '처리할 수 없는 엔티티',
    schema: {
      example: {
        result: 'failed',
        message: 'Cannot process the entity due to semantic errors',
      },
    },
  } as ApiResponseOptions,

  TOO_MANY_REQUESTS: {
    status: HttpStatus.TOO_MANY_REQUESTS,
    description: '요청 제한 초과',
    schema: {
      example: {
        result: 'failed',
        message: 'Too many requests. Please try again later',
      },
    },
  } as ApiResponseOptions,

  // 5XX Server Errors
  INTERNAL_SERVER_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: '서버 내부 오류',
    schema: {
      example: {
        result: 'failed',
        message: '서버 내부 오류가 발생했습니다',
      },
    },
  } as ApiResponseOptions,

  SERVICE_UNAVAILABLE: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: '서비스 일시 중단',
    schema: {
      example: {
        result: 'failed',
        message: 'Service temporarily unavailable',
      },
    },
  } as ApiResponseOptions,

  GATEWAY_TIMEOUT: {
    status: HttpStatus.GATEWAY_TIMEOUT,
    description: '게이트웨이 타임아웃',
    schema: {
      example: {
        result: 'failed',
        message: 'Gateway timeout',
      },
    },
  } as ApiResponseOptions,
};

/**
 * Submission 관련 응답 스키마
 */
export const SUBMISSION_RESPONSE_SCHEMAS = {
  SUBMIT_SUCCESS: {
    status: HttpStatus.OK,
    description: '제출 성공',
    schema: {
      example: {
        result: 'ok',
        message: null,
        studentId: 123,
        studentName: '홍길동',
        score: 8,
        feedback: 'Great organization, minor grammar issues.',
        highlights: ['I like school.', 'pizza'],
        submitText: 'Hello my name is ...',
        highlightSubmitText: 'Hello my name is ... <b>I like school.</b> I love <b>pizza</b>.',
        mediaUrl: {
          video: 'https://...sas.mp4',
          audio: 'https://...sas.mp3',
        },
        apiLatency: 1432,
      },
    },
  } as ApiResponseOptions,

  ALREADY_SUBMITTED: {
    status: HttpStatus.BAD_REQUEST,
    description: '이미 제출된 컴포넌트',
    schema: {
      example: {
        result: 'failed',
        message: 'already requested for this component',
      },
    },
  } as ApiResponseOptions,

  SUBMISSION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    description: '제출물을 찾을 수 없음',
    schema: {
      example: {
        result: 'failed',
        message: 'submission not found',
      },
    },
  } as ApiResponseOptions,

  EVALUATION_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    description: '평가 실패',
    schema: {
      example: {
        result: 'failed',
        message: 'submission processing failed',
      },
    },
  } as ApiResponseOptions,

  LIST_SUCCESS: {
    status: HttpStatus.OK,
    description: '목록 조회 성공',
    schema: {
      example: {
        result: 'ok',
        message: null,
        page: 1,
        size: 20,
        total: 100,
        items: [
          {
            submissionId: 'uuid',
            studentId: '123',
            componentType: 'Essay Writing',
            status: 'SUCCESS',
            score: 8,
            createdAt: '2025-08-13T00:00:00.000Z',
          },
        ],
        apiLatency: 23,
      },
    },
  } as ApiResponseOptions,
};

/**
 * Revision 관련 응답 스키마
 */
export const REVISION_RESPONSE_SCHEMAS = {
  REQUEST_SUCCESS: {
    status: HttpStatus.OK,
    description: '재평가 요청 성공',
    schema: {
      example: {
        result: 'ok',
        message: null,
        revisionId: 'uuid',
        apiLatency: 89,
      },
    },
  } as ApiResponseOptions,

  REVISION_NOT_FOUND: {
    status: HttpStatus.NOT_FOUND,
    description: '재평가 정보를 찾을 수 없음',
    schema: {
      example: {
        result: 'failed',
        message: 'revision not found',
      },
    },
  } as ApiResponseOptions,

  REVISION_FAILED: {
    status: HttpStatus.BAD_REQUEST,
    description: '재평가 처리 실패',
    schema: {
      example: {
        result: 'failed',
        message: 'revision processing failed',
      },
    },
  } as ApiResponseOptions,
};

/**
 * 인증 관련 응답 스키마
 */
export const AUTH_RESPONSE_SCHEMAS = {
  MISSING_TOKEN: {
    status: HttpStatus.UNAUTHORIZED,
    description: 'Authorization 헤더 누락',
    schema: {
      example: {
        result: 'failed',
        message: 'Missing Authorization header',
      },
    },
  } as ApiResponseOptions,

  INVALID_TOKEN: {
    status: HttpStatus.UNAUTHORIZED,
    description: '유효하지 않은 토큰',
    schema: {
      example: {
        result: 'failed',
        message: 'Invalid token',
      },
    },
  } as ApiResponseOptions,

  INVALID_AUTH_FORMAT: {
    status: HttpStatus.UNAUTHORIZED,
    description: '잘못된 인증 형식',
    schema: {
      example: {
        result: 'failed',
        message: 'Invalid Authorization header',
      },
    },
  } as ApiResponseOptions,
};

/**
 * 파일 업로드 관련 응답 스키마
 */
export const FILE_RESPONSE_SCHEMAS = {
  INVALID_FILE_TYPE: {
    status: HttpStatus.BAD_REQUEST,
    description: '잘못된 파일 형식',
    schema: {
      example: {
        result: 'failed',
        message: ['비디오 파일만 업로드 가능합니다'],
      },
    },
  } as ApiResponseOptions,

  FILE_TOO_LARGE: {
    status: HttpStatus.BAD_REQUEST,
    description: '파일 크기 초과',
    schema: {
      example: {
        result: 'failed',
        message: 'File size exceeds 100MB limit',
      },
    },
  } as ApiResponseOptions,

  EMPTY_FILE: {
    status: HttpStatus.BAD_REQUEST,
    description: '빈 파일',
    schema: {
      example: {
        result: 'failed',
        message: 'uploaded file buffer is empty',
      },
    },
  } as ApiResponseOptions,
};

/**
 * 외부 서비스 관련 응답 스키마
 */
export const EXTERNAL_SERVICE_SCHEMAS = {
  AZURE_BLOB_ERROR: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Azure Blob Storage 오류',
    schema: {
      example: {
        result: 'failed',
        message: 'Failed to upload to Azure Blob Storage',
      },
    },
  } as ApiResponseOptions,

  AZURE_OPENAI_ERROR: {
    status: HttpStatus.SERVICE_UNAVAILABLE,
    description: 'Azure OpenAI 오류',
    schema: {
      example: {
        result: 'failed',
        message: 'AI evaluation service is temporarily unavailable',
      },
    },
  } as ApiResponseOptions,

  FFMPEG_ERROR: {
    status: HttpStatus.INTERNAL_SERVER_ERROR,
    description: 'FFmpeg 처리 오류',
    schema: {
      example: {
        result: 'failed',
        message: 'Video processing failed',
      },
    },
  } as ApiResponseOptions,
};
