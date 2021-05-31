import CompositeAbortController from 'composite-abort-controller'
import mem from 'mem'
import mimic from 'mimic-fn'
import raceAbort from 'race-abort'

type FunctionToMemoize<ArgumentsType extends unknown[], ReturnType> = (
  ...args: ArgumentsType
) => ReturnType

export interface OptsType<
  ArgumentsType extends unknown[],
  ResolveType,
  CacheKeyType = string
> extends mem.Options<ArgumentsType, CacheKeyType, Promise<ResolveType>> {
  signalAccessors?: {
    get: (args: ArgumentsType) => AbortSignal
    set: (signal: AbortSignal, args: ArgumentsType) => ArgumentsType
  }
}

export default function memoizeConcurrent<
  ArgumentsType extends unknown[],
  ResolveType,
  CacheKeyType = string
>(
  fn: FunctionToMemoize<ArgumentsType, Promise<ResolveType>>,
  opts?: OptsType<ArgumentsType, ResolveType, CacheKeyType>,
): FunctionToMemoize<ArgumentsType, Promise<ResolveType>> {
  const cache =
    opts?.cache ??
    new Map<CacheKeyType, { data: Promise<ResolveType>; maxAge: number }>()
  const cacheKey =
    opts?.cacheKey ??
    ((args: ArgumentsType): CacheKeyType => args[0] as CacheKeyType)
  const getSignal =
    opts?.signalAccessors?.get ?? ((args: ArgumentsType) => null)
  const setSignal =
    opts?.signalAccessors?.set ??
    ((signal: AbortSignal, args: ArgumentsType) => args)
  const memoized = mem<
    ArgumentsType,
    Promise<ResolveType>,
    CacheKeyType,
    FunctionToMemoize<ArgumentsType, Promise<ResolveType>>
  >(
    mimic(async (...args: ArgumentsType): Promise<ResolveType> => {
      const key = cacheKey(args)
      // @ts-ignore
      const controllerKey: CacheKeyType = `__nodeMemoizeConcurrent:compositeAbortController:${key}`

      try {
        return await fn(...args)
      } finally {
        cache.delete(key)
        cache.delete(controllerKey)
      }
    }, fn),
    {
      ...opts,
      cacheKey,
      cache,
    },
  )

  if (opts?.signalAccessors == null) return memoized

  return function wrapper(...args: ArgumentsType) {
    // @ts-ignore
    const controllerKey: CacheKeyType = `__nodeMemoizeConcurrent:compositeAbortController:${cacheKey(
      args,
    )}`
    // @ts-ignore
    const compositeAbortController: CompositeAbortController =
      cache.get(controllerKey)?.data ?? new CompositeAbortController()
    cache.set(controllerKey, {
      // @ts-ignore
      data: compositeAbortController,
      maxAge: Infinity,
    })
    const newSignal = getSignal(args)
    const argsWithSignal = setSignal(compositeAbortController.signal, args)

    if (newSignal != null) {
      compositeAbortController.addSignal(newSignal)
      return raceAbort(newSignal, memoized(...argsWithSignal))
    }

    return memoized(...argsWithSignal)
  }
}
