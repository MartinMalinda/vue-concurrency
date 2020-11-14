# 🚦 vue-concurrency

[![Test Coverage](https://api.codeclimate.com/v1/badges/59a2cde627ebcefcbba4/test_coverage)](https://codeclimate.com/github/MartinMalinda/vue-concurrency/test_coverage) [![gzip size](http://img.badgesize.io/https://unpkg.com/vue-concurrency/dist/vue2/vue-concurrency.modern.js?compression=gzip&label=gzip)](https://unpkg.com/vue-concurrency/dist/index.modern.js) [![npm](https://img.shields.io/npm/v/vue-concurrency)](https://www.npmjs.com/package/vue-concurrency)

Inspired by [ember-concurrency](http://ember-concurrency.com/).

A library for encapsulating asynchronous operations and managing concurrency for Vue and Composition API.

vue-concurrency aims to provide a reasonable abstraction for performing asynchronous operations. It reduces boilerplate code, provides reliable derived state and allows new approaches to techniques like throttling, debouncing, polling. Read more about why and how in the docs:

- 📖 [Documentation](https://vue-concurrency.netlify.app/)

## Features

- Vue 3 ✅
- Vue 2 + [@vue/composition-api](https://github.com/vuejs/composition-api) ✅
- **TypeScript support**
- **Async cancellation** via generator functions and [CAF](https://github.com/getify/CAF)
- Providing `AbortSignal` to **abort XHR/Fetch requests**
- **Derived reactive state** to track status of async operations: `isRunning, isIdle, isFinished, isCancelled` and more
- **Concurrency management**: `drop()`, `restartable()`, `enqueue()` and other tasks
- **SSR support** (experimental)

## Installation

- 📦 [Installation instructions](https://vue-concurrency.netlify.app/installation/)

## Demos

- 🔍 [Autocomplete](https://vue-concurrency.netlify.app/examples/autocomplete/)
- 🚦 [Concurrency](https://vue-concurrency.netlify.app/managing-concurrency/)

## License

MIT
