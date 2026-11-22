// Assemble les sources du cube en une seule page.
// Usage : npm run build:cube (ou node cube/build.js depuis n'importe où).
// Écrit public/index.html (la page servie) et cube/Cube-Ecole.html (copie hors ligne).
const fs = require('fs');
const path = require('path');

const here = (f) => path.join(__dirname, f);
let t = fs.readFileSync(here('template.html'), 'utf8');
const strip = s => s.replace(/^if \(typeof module.*$/m, '');
t = t.replace('/*ENGINE*/', () => strip(fs.readFileSync(here('engine.js'), 'utf8')))
     .replace('/*DATA*/', () => strip(fs.readFileSync(here('data.js'), 'utf8')))
     .replace('/*BACKUP*/', () => strip(fs.readFileSync(here('backup.js'), 'utf8')))
     .replace('/*F2L*/', () => fs.readFileSync(here('f2l.json'), 'utf8'));
fs.writeFileSync(path.join(__dirname, '..', 'public', 'index.html'), t);
fs.writeFileSync(here('Cube-Ecole.html'), t);
console.log('built', t.length);
