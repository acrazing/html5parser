/*
 * @since 2020-09-09 23:37:28
 * @author acrazing <joking.young@gmail.com>
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
  <p style="padding: 0">
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
});
