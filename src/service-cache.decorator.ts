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

export function ServiceCache(options?: ServiceCacheOptions) {
  return function (
    target: Record<string, any>,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) {
    const { key = DEFAULT_CACHE_KEY, ttl = DEFAULT_CACHE_TTL } = options;
    const method = descriptor.value;
    descriptor.value = async function (...args: any[]): Promise<any> {
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
  };
}
