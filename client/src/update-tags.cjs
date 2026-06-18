const fs = require('fs');
const path = require('path');

const dir = 'd:\\\\Project\\\\2nd-hand-revived\\\\client\\\\src';

function walk(d) {
  let results = [];
  const list = fs.readdirSync(d);
  list.forEach(file => {
    file = path.join(d, file);
    const stat = fs.statSync(file);
    if (stat && stat.isDirectory()) {
      results = results.concat(walk(file));
    } else {
      if(file.endsWith('.tsx') || file.endsWith('.ts')) results.push(file);
    }
  });
  return results;
}

const files = walk(dir);

files.forEach(file => {
  let content = fs.readFileSync(file, 'utf8');
  let updated = content;
  
  // Replace <Tag key={tag} color="blue"> with <Tag variant="outlined" key={tag} color="blue">
  updated = updated.replace(/<Tag\b(?![^>]*variant=)/g, '<Tag variant="outlined"');
  
  if(updated !== content) {
    fs.writeFileSync(file, updated, 'utf8');
    console.log('Updated ' + file);
  }
});

console.log('Done!');
