# memoizeConcurrent

memoize async functions such that concurrent calls return the same promise

# Installation

```sh
npm i --save memoize-concurrent
```

# Usage

#### Supports both ESM and CommonJS

```js
// esm
import memo from 'memoize-concurrent'
// commonjs
const memo = require('memoize-concurrent').default
```

#### Basic Example

Example showing that concurrent calls return the same promise and asyncronous calls invoke the passed function

```js
import memo from 'memoize-concurrent'

const memoizedFetch = memo(fetch)

const promise1 = memoizedFetch('http://localhost') // hits server
const promise2 = memoizedFetch('http://localhost') // hits cache
console.log(promise1 === promise2) // true
await promise1
const promise3 = memoizedFetch('http://localhost') // hits server
console.log(promise1 === promise3) // false
```

#### Uses [mem](https://github.com/sindresorhus/mem) for Memoization

memoizeConcurrent uses [mem](https://github.com/sindresorhus/mem) under the hood and supports the same options

```js
import memo from 'memoize-concurrent'

const memoizedFetch = memo(fetch, {
  maxAge: 10, // maxAge of value in cache
  cacheKey: (args) => args[0], // function to compute cache key
  cache: new Map(), // provide your own cache
})
```

# License

MIT
