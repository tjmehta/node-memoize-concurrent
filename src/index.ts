import mem from 'mem'
import mimic from 'mimic-fn'

type FunctionToMemoize<ArgumentsType extends unknown[], ReturnType> = (
  ...args: ArgumentsType
) => ReturnType

export default function memoizeConcurrent<
  ArgumentsType extends unknown[],
  ResolveType,
  CacheKeyType = string
>(
  fn: FunctionToMemoize<ArgumentsType, Promise<ResolveType>>,
  opts?: mem.Options<ArgumentsType, CacheKeyType, Promise<ResolveType>>,
): FunctionToMemoize<ArgumentsType, Promise<ResolveType>> {
  const cache = new Map<
    CacheKeyType,
    { data: Promise<ResolveType>; maxAge: number }
  >()
  const cacheKey =
    opts?.cacheKey ||
    ((args: ArgumentsType): CacheKeyType => args[0] as CacheKeyType)

  return mem<
    ArgumentsType,
    Promise<ResolveType>,
    CacheKeyType,
    FunctionToMemoize<ArgumentsType, Promise<ResolveType>>
  >(
    mimic((...args: ArgumentsType): Promise<ResolveType> => {
      try {
        return fn(...args)
      } finally {
        const key = cacheKey(args)
        cache.delete(key)
      }
    }, fn),
    {
      ...opts,
      cacheKey,
      cache,
    },
  )
}
