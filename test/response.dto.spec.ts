import { SuccessResponseDto, ErrorResponseDto, ValidationErrorResponseDto, PaginatedResponseDto } from '../src/common/response/response.dto';

describe('response.dto', () => {
  it('SuccessResponseDto defaults', () => {
    const dto = new SuccessResponseDto();
    expect(dto.result).toBe('ok');
  });
  it('ErrorResponseDto defaults', () => {
    const dto = new ErrorResponseDto();
    expect(dto.result).toBe('failed');
  });
  it('ValidationErrorResponseDto is assignable', () => {
    const dto = new ValidationErrorResponseDto();
    dto.message = ['a'];
    expect(Array.isArray(dto.message)).toBe(true);
  });
  it('PaginatedResponseDto shape', () => {
    const dto = new PaginatedResponseDto<any>();
    dto.result = 'ok' as any;
    dto.page = 1;
    dto.size = 10;
    dto.total = 0;
    dto.items = [];
    dto.apiLatency = 1;
    expect(dto.page).toBe(1);
  });
});
