const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(function(file) {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if (file.endsWith('.tsx') || file.endsWith('.ts')) {
        results.push(file);
      }
    }
  });
  return results;
}

const files = walk('./src');
let changedCount = 0;
files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  if (content.includes('rowKey')) {
    // remove rowKey="id" or rowKey={...}
    const newContent = content.replace(/\s*rowKey=["'].*?["']/g, '').replace(/\s*rowKey=\{.*?\}/g, '');
    if (content !== newContent) {
      fs.writeFileSync(file, newContent, 'utf8');
      changedCount++;
      console.log('Fixed ' + file);
    }
  }
});
console.log('Done. Fixed ' + changedCount + ' files.');
