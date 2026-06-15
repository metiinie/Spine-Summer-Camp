const fs = require('fs');

const en = JSON.parse(fs.readFileSync('messages/en.json', 'utf8')).en;
const am = JSON.parse(fs.readFileSync('messages/am.json', 'utf8')).en; // am.json has root "en"

function checkMissingKeys(obj1, obj2, prefix = '') {
  let missing = [];
  for (const key in obj1) {
    if (!(key in obj2)) {
      missing.push(prefix + key);
    } else if (typeof obj1[key] === 'object' && obj1[key] !== null && !Array.isArray(obj1[key])) {
      missing = missing.concat(checkMissingKeys(obj1[key], obj2[key], prefix + key + '.'));
    } else if (Array.isArray(obj1[key])) {
      // Assuming arrays of objects have same length for simplicity, or we can just check length
      if (!Array.isArray(obj2[key]) || obj1[key].length !== obj2[key].length) {
         missing.push(prefix + key + ' (Array length mismatch)');
      }
    }
  }
  return missing;
}

const missingInAm = checkMissingKeys(en, am);
const missingInEn = checkMissingKeys(am, en);

console.log("Missing in am.json:", missingInAm);
console.log("Missing in en.json:", missingInEn);
