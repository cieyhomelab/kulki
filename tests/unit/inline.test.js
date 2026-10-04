import { describe, expect, it } from 'vitest';
import { inlineAssets } from '../../tools/inline.js';

const template = '<head><!-- inline:css --></head><body><!-- inline:js --></body>';

describe('inlineAssets', () => {
  it('replaces both markers with inline elements', () => {
    const html = inlineAssets(template, { css: 'a{}', js: 'x()' });

    expect(html).toBe('<head><style>\na{}\n</style></head><body><script>\nx()\n</script></body>');
  });

  it('keeps `$` sequences in assets intact', () => {
    const html = inlineAssets(template, { css: '', js: "s.replace(/a/, '$&$1')" });

    expect(html).toContain("s.replace(/a/, '$&$1')");
  });

  it('escapes closing tags that would end the inline element early', () => {
    const html = inlineAssets(template, { css: '', js: 'const s = "</script>";' });

    expect(html).toContain('const s = "<\\/script>";');
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it('rejects a template with a missing marker', () => {
    expect(() => inlineAssets('<!-- inline:css -->', { css: '', js: '' })).toThrow(/inline:js/);
  });
});
