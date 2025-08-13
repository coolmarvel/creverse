import * as commonIndex from '../src/common/logger';

describe('common logger index', () => {
  it('exports symbols', () => {
    expect(typeof commonIndex.logInfo).toBe('function');
  });
});
