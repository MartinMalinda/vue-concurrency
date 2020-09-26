const fs = require('fs')
const path = require('path')

const dir = path.resolve(__dirname, '..')

console.log('[vue-concurrency] fixing vue3 import path (alias)');

function replaceInFile(filePath, source, replacement) {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      return console.error(err);
    }
    const result = data.replace(source, replacement);

    fs.writeFile(filePath, result, 'utf8', err => err && console.err(err));
  });
}

function fixVue3Import() {
  ['vue-concurrency.modern.js', 'vue-concurrency.module.js'].forEach(fileName => {
    replaceInFile(path.join(dir, 'dist', 'vue3', fileName), `from"vue3"`, `from"vue"`);
  });

  ['vue-concurrency.js', 'vue-concurrency.umd.js'].forEach(fileName => {
    replaceInFile(path.join(dir, 'dist', 'vue3', fileName), `require("vue3")`, `require("vue")`);
  });
}

fixVue3Import();
