//
// Based from vue-demi - https://github.com/antfu/vue-demi/blob/master/scripts/postinstall.js
//

const fs = require('fs')
const path = require('path')

const dir = path.resolve(__dirname, '..')

function replaceInFile(filePath, source, replacement) {
  fs.readFile(filePath, 'utf8', function (err, data) {
    if (err) {
      return console.error(err);
    }
    const result = data.replace(source, replacement);

    fs.writeFile(filePath, result, 'utf8', err => err && console.err(err));
  });
}

function loadModule(name) {
  try {
    return require(name)
  } catch (e) {
    return undefined
  }
}

function fixVue3Import() {
  ['vue-concurrency.modern.js', 'vue-concurrency.module.js'].forEach(fileName => {
    console.log(path.join(dir, 'dist', 'vue3', fileName));
    replaceInFile(path.join(dir, 'dist', 'vue3', fileName), `from"vue3"`, `from"vue"`);
  });

  ['vue-concurrency.js', 'vue-concurrency.umd.js'].forEach(fileName => {
    replaceInFile(path.join(dir, 'dist', 'vue3', fileName), `require("vue3")`, `require("vue")`);
  });
}

function switchVersion(version) {
  if (!fs.existsSync(path.join(dir, 'dist'))) {
    console.error('[vue-concurrency] dist folder is missing! this might be a broken release');
    return;
  }

  fs.writeFileSync(path.join(dir, 'dist', 'index.js'), `module.exports = require('./vue${version}/vue-concurrency')\n`, 'utf-8')
  fs.writeFileSync(path.join(dir, 'dist', 'index.module.js'), `export * from './vue${version}/vue-concurrency.module'\n`, 'utf-8')
  fs.writeFileSync(path.join(dir, 'dist', 'index.modern.js'), `export * from './vue${version}/vue-concurrency.modern'\n`, 'utf-8')
  fs.writeFileSync(path.join(dir, 'dist', 'index.d.ts'), `export * from './vue${version}/index'\n`, 'utf-8')
}

const Vue = loadModule('vue')

console.log(Vue.version);

if (!Vue || typeof Vue.version !== 'string') {
  console.warn('[vue-concurrency] Vue is not detected in the dependencies. Please install Vue first.')
}
else if (Vue.version.startsWith('2.')) {
  switchVersion(2)
  fixVue3Import();
}
else if (Vue.version.startsWith('3.')) {
  switchVersion(3)
  fixVue3Import();
}
else {
  console.warn(`[vue-concurrency] Vue version v${Vue.version} is not suppported.`)
}
