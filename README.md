# vue-concurrency (beta)

<p align="center">
  [![Test Coverage](https://api.codeclimate.com/v1/badges/59a2cde627ebcefcbba4/test_coverage)](https://codeclimate.com/github/MartinMalinda/vue-concurrency/test_coverage)
  [![gzip size](http://img.badgesize.io/https://unpkg.com/vue-concurrency/dist/index.modern.js?compression=gzip&label=gzip)](https://unpkg.com/vue-concurrency/dist/index.modern.js)

Vue's [ember-concurrency](http://ember-concurrency.com/) wannabe.

A library for encapsulating asynchronous operations and managing concurrency for Vue and Composition API.

</p>

vue-concurrency aims to provide a reasonable abstraction for performing asynchronous operations. It reduces boilerplate code, provides reliable derived state and allows new approaches to techniques like throttling, debouncing, polling. Read more about WHY and HOW in the docs:

- 📖 https://vue-concurrency.netlify.app/

## Features

- TypeScript Support
- Async cancellation via generator functions and CAF
- Providing `AbortSignal` to abort XHR/Fetch requests
- Derived reactive state to track status of async operations: `isRunning, isIdle, isFinished, isCancelled` and many others
- Concurrency management: `drop()`, `restartable()`, `enqueue()`

## Installation

- https://vue-concurrency.netlify.app/installation/

## License

MIT
