/*
 * @author acrazing joking.young@gmail.com
 * @since 2020-09-09 23:37:28
 */

import { safeHtml } from './safeHtml';

const htmlInput = `
<div>
  <h1>H1</h1>
  <h2>H2</h2>
\t<script>Script</script>
\t<style>Style</style>
  <p class="class" style="padding: 0">
    <span>Span</span>
    <table>
      <tr><td>TD</td></tr>
    </table>
    <img src="hello world" id="omit" />
  </p>
  <a href="/download.html" target="_blank" about="about">Download<span>child</span></a>
  <a href="javascript:" target="_blank" about="about">Javascript<span>child</span></a>
</div>
`;

const htmlOutput = `
<div>
  <h1>H1</h1>
  <h2>H2</h2>
\t
\t
  <p>
    <span>Span</span>
    <table>
      <tr><td>TD</td></tr>
    </table>
    <img src="hello world">
  </p>
  <a href="/download.html" target="_blank">Download<span>child</span></a>
  <a target="_blank">Javascript<span>child</span></a>
</div>
`;

describe('safeHtml', () => {
  it('should stringify safe html as expected', () => {
    expect(safeHtml(htmlInput)).toEqual(htmlOutput);
  });

  it('should remove style attributes by default', () => {
    expect(safeHtml('<p style="color: red">Text</p>')).toEqual('<p>Text</p>');
  });

  it('should allow sanitized style attributes', () => {
    expect(
      safeHtml('<p style="color: red; background: url(javascript:)">Text</p>', {
        sanitizeStyle(value) {
          expect(value).toBe('color: red; background: url(javascript:)');
          return 'color: red';
        },
      }),
    ).toEqual('<p style="color: red">Text</p>');
  });

  it('should remove style attributes rejected by sanitizeStyle', () => {
    expect(
      safeHtml('<p style="color: red">Text</p>', {
        sanitizeStyle() {
          return false;
        },
      }),
    ).toEqual('<p>Text</p>');
  });

  it('should not allow raw style attributes through allowedAttrs', () => {
    expect(
      safeHtml('<p STYLE="color: red">Text</p>', {
        allowedAttrs: ['style'],
      }),
    ).toEqual('<p>Text</p>');
  });

  it('should escape sanitized style attribute values', () => {
    expect(
      safeHtml('<p style="color: red">Text</p>', {
        sanitizeStyle() {
          return 'font-family: "x"; content: "<"';
        },
      }),
    ).toEqual('<p style="font-family: &quot;x&quot;; content: &quot;&lt;&quot;">Text</p>');
  });
});
