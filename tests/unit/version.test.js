import { describe, expect, it } from 'vitest';
import { resolveVersion } from '../../tools/version.js';

describe('resolveVersion', () => {
  it('falls back to dev when unset or empty', () => {
    expect(resolveVersion(undefined)).toBe('dev');
    expect(resolveVersion('')).toBe('dev');
  });

  it('accepts dev and a 40-character lowercase hex commit id', () => {
    const sha = '0123456789abcdef0123456789abcdef01234567';

    expect(resolveVersion('dev')).toBe('dev');
    expect(resolveVersion(sha)).toBe(sha);
  });

  it.each([
    ['too short', 'a'.repeat(39)],
    ['too long', 'a'.repeat(41)],
    ['uppercase', 'A'.repeat(40)],
    ['non-hex characters', 'g'.repeat(40)],
    ['another word', 'latest'],
    ['padded dev', ' dev'],
    ['markup injection', '"><script>'],
  ])('rejects %s', (_name, value) => {
    expect(() => resolveVersion(value)).toThrow(/KULKI_VERSION/);
  });
});
