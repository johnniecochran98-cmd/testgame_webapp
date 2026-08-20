import { readFileSync } from 'node:fs';
for (const file of ['index.html','src/main.js','src/styles.css','README.md']) {
  const text = readFileSync(file, 'utf8');
  if (!text.trim()) throw new Error(`${file} is empty`);
}
new Function(readFileSync('src/main.js', 'utf8'));
console.log('Static game bundle validated.');
