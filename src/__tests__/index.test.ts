import memo from '../index'

describe('memoizeConcurrent', () => {
  it('should return a function that behaves like the original', () => {
    const fn = (result: any) => Promise.resolve(result)
    const memoizedFn = memo(fn)
    expect(memoizedFn('key')).resolves.toBe('key')
  })

  describe('memoizedFn', () => {
    it('should return the same promise for syncronous calls', () => {
      const fn = (result: any) => Promise.resolve(result)
      const memoizedFn = memo(fn)
      const result1 = memoizedFn('key')
      const result2 = memoizedFn('key')
      expect(result1).toBe(result2)
    })

    it('should not return the same promise for asyncronous calls', async () => {
      const result = {}
      const fn = (result: any) => Promise.resolve(result)
      const memoizedFn = memo(fn)
      const result1 = memoizedFn('key')
      await result1
      const result2 = memoizedFn('key')
      expect(result1).not.toBe(result2)
    })

    describe('with a custom cache', () => {
      it('should return the same promise for syncronous calls', () => {
        const cache = new Map()
        const firstResult = Promise.resolve()
        cache.set('key', {
          data: firstResult,
        })
        const fn = (result: any) => Promise.resolve(result)
        const memoizedFn = memo(fn, { cache })
        const result1 = memoizedFn('key')
        const result2 = memoizedFn('key')
        expect(result1).toBe(firstResult)
        expect(result1).toBe(result2)
      })

      it('should not return the same promise for asyncronous calls', async () => {
        const cache = new Map()
        const firstResult = Promise.resolve()
        cache.set('key', {
          data: firstResult,
        })
        const fn = (result: any) => Promise.resolve(result)
        const memoizedFn = memo(fn, { cache })
        const result1 = memoizedFn('key')
        await result1
        const result2 = memoizedFn('key')
        expect(result1).toBe(firstResult)
        expect(result1).toBe(result2)
      })
    })

    describe('with a custom cacheKey', () => {
      it('should return the same promise for syncronous calls', () => {
        const cacheKey = () => 'key'
        const fn = () => Promise.resolve()
        const memoizedFn = memo(fn, { cacheKey })
        const result1 = memoizedFn()
        const result2 = memoizedFn()
        expect(result1).toBe(result2)
      })

      it('should not return the same promise for asyncronous calls', async () => {
        const cacheKey = () => 'key'
        const fn = () => Promise.resolve()
        const memoizedFn = memo(fn, { cacheKey })
        const result1 = memoizedFn()
        await result1
        const result2 = memoizedFn()
        expect(result1).not.toBe(result2)
      })
    })
  })
})
