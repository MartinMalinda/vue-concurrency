---
sidebarDepth: 0
---

# Installation

### 1. Install with NPM or Yarn

**NPM**

```
npm install --save vue-concurrency
```

**YARN**

```
yarn add vue-concurrency
```

### 2. Make sure your AJAX solution throws errors on error responses

This is necessary so that error handling works well with Tasks. Axios throws errors by default, fetch doesn't.

If you're using [Fetch API](https://developer.mozilla.org/en-US/docs/Web/API/Fetch_API), please [follow the instructions here](/handling-errors/#ajax-error-responses).

### 3. Add polyfills for Internet Explorer (optional)

`vue-concurrency` uses [CAF](https://github.com/getify/CAF) under the hood which utilizes [AbortController](https://developer.mozilla.org/en-US/docs/Web/API/AbortController) and [Symbol](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Symbol). Both of these are not supported in IE.

If you need to support IE, you need to polyfill those two.

- [AbortController polyfill](https://github.com/mo/abortcontroller-polyfill)

Symbol polyfill is probably already included for you as it's most likely shipped as part of Vue itself. But depending from Vue version and build tooling, it might also need to be added:

- [Symbol polyfill](https://github.com/medikoo/es6-symbol)

`Fetch` polyfill is not needed (unless you use it:))
