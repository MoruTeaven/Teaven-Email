import { getAdminHTML } from './dist/admin_html_test.js';
const html = getAdminHTML();
const scrStart = html.indexOf('<script>');
const scrEnd = html.lastIndexOf('</script>');
const scr = html.substring(scrStart + 8, scrEnd);
console.log('Script length:', scr.length);

// Check for problematic \\\\' in output
let matches = 0;
let pos = -1;
while ((pos = scr.indexOf("\\\\'", pos + 1)) !== -1) {
  matches++;
}
console.log('Remaining problematic characters:', matches);

if (matches === 0) {
  try {
    new Function(scr);
    console.log('JS PARSE OK - no syntax errors');
  } catch(e) {
    console.log('JS ERROR:', e.message);
  }
}
