import * as logger from '../src/common/logger/winston.logger';

describe('winston.logger smoke', () => {
  it('exported functions callable without throwing', () => {
    expect(() => logger.logInfo('X', {} as any)).not.toThrow();
    expect(() => logger.logWarn?.('X', {} as any)).not.toThrow();
    expect(() => logger.logError('X', {} as any)).not.toThrow();
  });
});
