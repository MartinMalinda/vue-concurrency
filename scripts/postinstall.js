//
// Based from vue-demi - https://github.com/antfu/vue-demi/blob/master/scripts/postinstall.js
//

const fs = require('fs')
const path = require('path')

const dir = path.resolve(__dirname, '..')

function loadModule(name) {
  try {
    return require(name)
  } catch (e) {
    return undefined
  }
}

function switchVersion(version) {
  fs.writeFileSync(path.join(dir, 'dist', 'index.js'), `module.exports = require('./v${version}/vue-concurrency')\n`, 'utf-8')
  fs.writeFileSync(path.join(dir, 'dist', 'index.module.js'), `export * from './v${version}/vue-concurency.module'\n`, 'utf-8')
  fs.writeFileSync(path.join(dir, 'dist', 'index.modern.js'), `export * from './v${version}/vue-concurency.modern'\n`, 'utf-8')
  fs.writeFileSync(path.join(dir, 'dist', 'index.d.ts'), `export * from './v${version}/index'\n`, 'utf-8')
}

const Vue = loadModule('vue')

if (!Vue || typeof Vue.version !== 'string') {
  console.warn('[vue-concurrency] Vue is not detected in the dependencies. Please install Vue first.')
}
else if (Vue.version.startsWith('2.')) {
  switchVersion(2)
}
else if (Vue.version.startsWith('3.')) {
  switchVersion(3)
}
else {
  console.warn(`[vue-demi] Vue version v${Vue.version} is not suppported.`)
}