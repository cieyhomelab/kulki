import { describe, expect, it } from 'vitest';
import { inlineAssets } from '../../tools/inline.js';

const template =
  '<head><!-- inline:version --><!-- inline:css --></head><body><!-- inline:js --></body>';
const version = 'dev';

describe('inlineAssets', () => {
  it('replaces both markers with inline elements', () => {
    const html = inlineAssets(template, { css: 'a{}', js: 'x()', version });

    expect(html).toBe(
      '<head><meta name="kulki-version" content="dev" /><style>\na{}\n</style></head><body><script>\nx()\n</script></body>',
    );
  });

  it('keeps `$` sequences in assets intact', () => {
    const html = inlineAssets(template, { css: '', js: "s.replace(/a/, '$&$1')", version });

    expect(html).toContain("s.replace(/a/, '$&$1')");
  });

  it('escapes closing tags that would end the inline element early', () => {
    const html = inlineAssets(template, { css: '', js: 'const s = "</script>";', version });

    expect(html).toContain('const s = "<\\/script>";');
    expect(html.match(/<\/script>/g)).toHaveLength(1);
  });

  it('rejects a template with a missing marker', () => {
    expect(() => inlineAssets('<!-- inline:css -->', { css: '', js: '', version })).toThrow(
      /inline:js/,
    );
  });

  it('inserts the version meta tag in place of its marker', () => {
    const sha = 'a'.repeat(40);
    const html = inlineAssets(template, { css: '', js: '', version: sha });

    expect(html.match(/<meta name="kulki-version"/g)).toHaveLength(1);
    expect(html).toContain(`<meta name="kulki-version" content="${sha}" />`);
    expect(html).not.toContain('inline:version');
  });

  it('rejects a template with a missing version marker', () => {
    expect(() =>
      inlineAssets('<!-- inline:css --><!-- inline:js -->', { css: '', js: '', version }),
    ).toThrow(/inline:version/);
  });
});
