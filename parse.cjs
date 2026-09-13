const fs = require('fs');
const html = fs.readFileSync('gen3.html', 'utf8');
const regex = /<td>\s*0*(\d+)\s*<\/td>.*?<a href="[^"]*" title="([^"]*?)(?: \(Pok[eé]mon\))?"/gis;
let match;
const res = [];
const seen = new Set();
while ((match = regex.exec(html)) !== null) {
  const id = parseInt(match[1]);
  if (!seen.has(id) && id >= 251) {
    seen.add(id);
    res.push(id + ' : ' + match[2]);
  }
}
fs.writeFileSync('parsed.txt', res.join('\n'));
