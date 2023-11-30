import { LRUCache } from 'lru-cache';
import md5 = require('md5');
import dotenv = require('dotenv');
dotenv.config();

const DEFAULT_CACHE_KEY = process.env.CACHE_KEY || 'serviceCache';
const DEFAULT_CACHE_TTL = parseInt(process.env.CACHE_TTL, 10) || 60 * 30 * 1000;

const cache = new LRUCache({
  // How long to live in milliseconds.
  ttl: DEFAULT_CACHE_TTL,
  ttlAutopurge: true,
});

export interface ServiceCacheOptions {
  key?: string;
  ttl?: number;
}

function isConstructor(obj: any) {
  return !!obj.prototype && !!obj.prototype.constructor.name;
}

function cacheDecorator(
  options?: ServiceCacheOptions,
): (methodName: string, descriptor: PropertyDescriptor) => PropertyDescriptor {
  const { key, ttl } = Object.assign(
    {
      key: DEFAULT_CACHE_KEY,
      ttl: DEFAULT_CACHE_TTL,
    },
    options,
  );
  return (
    methodName: string,
    descriptor: PropertyDescriptor,
  ): PropertyDescriptor => {
    const method = descriptor.value;

    descriptor.value = async function (...args: any[]) {
      const cacheKey = key + '-' + md5(JSON.stringify(args));
      let result = cache.get(cacheKey);
      if (!result) {
        result = await method.apply(this, args);
        cache.set(cacheKey, result, {
          ttl,
        });
      }

      return result;
    };

    return descriptor;
  };
}

export function ServiceCache(options?: ServiceCacheOptions) {
  return function (
    target: Record<string, any>,
    propertyName?: string,
    propertyDescriptor?: PropertyDescriptor,
  ): void | TypedPropertyDescriptor<any> | any {
    if (!propertyName) {
      for (const key of Object.getOwnPropertyNames(target.prototype)) {
        let descriptor = Object.getOwnPropertyDescriptor(target.prototype, key);
        if (descriptor && !isConstructor(descriptor.value)) {
          descriptor = cacheDecorator(options)(key, descriptor);
          Object.defineProperty(target.prototype, key, descriptor);
        }
      }
    } else {
      propertyDescriptor.value = cacheDecorator(options)(
        propertyName,
        propertyDescriptor,
      ).value;
    }
  };
}
