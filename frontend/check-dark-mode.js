const fs = require('fs');
const path = require('path');

function walk(dir) {
  let results = [];
  const list = fs.readdirSync(dir);
  list.forEach(file => {
    file = path.join(dir, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else if (file.endsWith('.tsx') || file.endsWith('.ts')) {
      results.push(file);
    }
  });
  return results;
}

const files = walk('src');
const issues = [];

files.forEach(file => {
  const content = fs.readFileSync(file, 'utf8');
  const lines = content.split('\n');
  lines.forEach((line, i) => {
    if (line.includes('className=')) {
      // Check for common missing dark mode pairs
      if (line.includes('bg-white') && !line.includes('dark:bg-')) {
        issues.push(`${file}:${i + 1} - bg-white without dark:bg-*`);
      }
      if (line.includes('text-slate-900') && !line.includes('dark:text-')) {
        issues.push(`${file}:${i + 1} - text-slate-900 without dark:text-*`);
      }
      if (line.includes('text-slate-800') && !line.includes('dark:text-')) {
        issues.push(`${file}:${i + 1} - text-slate-800 without dark:text-*`);
      }
      if (line.includes('border-slate-100') && !line.includes('dark:border-')) {
        issues.push(`${file}:${i + 1} - border-slate-100 without dark:border-*`);
      }
    }
  });
});

console.log(`Found ${issues.length} potential dark mode issues.`);
console.log(issues.join('\n'));
