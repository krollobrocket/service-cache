import { LRUCache } from 'lru-cache'
import md5 = require('md5')
import dotenv = require('dotenv')
dotenv.config()

const DEFAULT_CACHE_KEY = process.env.CACHE_KEY || 'serviceCache'
const DEFAULT_CACHE_TTL = parseInt(process.env.CACHE_TTL, 10) || 60 * 30 * 1000

export const cache = new LRUCache({
  // How long to live in milliseconds.
  ttl: DEFAULT_CACHE_TTL,
  ttlAutopurge: true,
})

export interface ServiceCacheOptions {
  key?: string
  ttl?: number
}

export const isConstructor = (obj: any): boolean => {
  return !!obj?.prototype?.constructor.name
}

export const createCacheKey = (key: string, ...args: [any]) =>
  key + '-' + md5(JSON.stringify(args))

type ServiceDescriptor = (descriptor: PropertyDescriptor) => PropertyDescriptor

const cacheDecorator = (options?: ServiceCacheOptions): ServiceDescriptor => {
  const { key, ttl } = Object.assign(
    {
      key: DEFAULT_CACHE_KEY,
      ttl: DEFAULT_CACHE_TTL,
    },
    options,
  )
  return (descriptor) => {
    const method = descriptor.value

    descriptor.value = async (...args: any[]) => {
      const cacheKey = createCacheKey(key, args)
      let result = cache.get(cacheKey)
      if (!result) {
        result = await method.apply(this, args)
        cache.set(cacheKey, result, {
          ttl,
        })
      }

      return result
    }

    return descriptor
  }
}

type ServiceMethod = (
  target: Record<string, any>,
  propertyName?: string,
  propertyDescriptor?: PropertyDescriptor,
) => void

export const ServiceCache =
  (options?: ServiceCacheOptions): ServiceMethod =>
  (
    target: Record<string, any>,
    propertyName?: string,
    propertyDescriptor?: PropertyDescriptor,
  ) => {
    if (!propertyName) {
      for (const key of Object.getOwnPropertyNames(target.prototype)) {
        let descriptor = Object.getOwnPropertyDescriptor(target.prototype, key)
        // Do not decorate constructor.
        if (descriptor && !isConstructor(descriptor.value)) {
          descriptor = cacheDecorator(options)(descriptor)
          Object.defineProperty(target.prototype, key, descriptor)
        }
      }
    } else {
      propertyDescriptor.value =
        cacheDecorator(options)(propertyDescriptor).value
    }
  }
