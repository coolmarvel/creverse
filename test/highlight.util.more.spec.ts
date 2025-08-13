import { boldHighlights } from '../src/submissions/utils/highlight.util';

describe('boldHighlights more', () => {
  it('handles case-insensitive match', () => {
    const out = boldHighlights('Hello World', ['world']);
    expect(out).toBe('Hello <b>World</b>');
  });
  it('highlights multiple non-overlapping tokens', () => {
    const out = boldHighlights('abcd', ['ab', 'cd']);
    expect(out).toBe('<b>ab</b><b>cd</b>');
  });
});
