import {
  MockServiceFoo,
  MockServiceBar,
  MockServiceWithArgs,
} from './MockService';
import { cache, createCacheKey } from '../src/service-cache.decorator';

describe('Test service cache decorator', () => {
  let mockServiceFoo: MockServiceFoo;
  let mockServiceBar: MockServiceBar;

  beforeEach(() => {
    mockServiceFoo = new MockServiceFoo();
    mockServiceBar = new MockServiceBar();
    cache.clear();
  });

  async function sleep(ms: number) {
    return new Promise((r) => setTimeout(r, ms));
  }

  it('Test that result is cached', async () => {
    const firstResult = await mockServiceFoo.fetch('foo');
    const secondResult = await mockServiceFoo.fetch('foo');
    expect(firstResult).toEqual(secondResult);
  });
  it('Test so calls with different parameters is not cached', async () => {
    const firstResult = await mockServiceFoo.fetch('foo');
    const secondResult = await mockServiceFoo.fetch('bar');
    expect(firstResult).not.toEqual(secondResult);
  });
  it('Test so cache entries are purged', async () => {
    const firstResult = await mockServiceFoo.fetch('foo');
    await sleep(250);
    const secondResult = await mockServiceFoo.fetch('foo');
    expect(firstResult).not.toEqual(secondResult);
  });
  it('Test so all methods are decorated', async () => {
    const methods = ['fetchFoo', 'fetchBar', 'fetchFooBar'];
    for (const method of methods) {
      let firstResult = await mockServiceBar[method]('foo');
      let secondResult = await mockServiceBar[method]('foo');
      expect(firstResult).toEqual(secondResult);
      firstResult = await mockServiceBar[method]('foo');
      await sleep(250);
      secondResult = await mockServiceBar[method]('foo');
      expect(firstResult).not.toEqual(secondResult);
    }
  });
  it('Test so decorator arguments are set', async () => {
    const mockServiceWithArg = new MockServiceWithArgs();
    await mockServiceWithArg.fetch();
    const cacheKey = createCacheKey(MockServiceWithArgs.CACHE_KEY, []);
    expect(cache.get(cacheKey)).not.toBeUndefined();
    const cacheEntries = cache.dump();
    const cacheEntry = cacheEntries
      .filter(
        (entry) =>
          entry[0] === cacheKey &&
          entry[1].ttl === MockServiceWithArgs.CACHE_TTL,
      )
      .pop();
    expect(cacheEntry).not.toBeUndefined();
    expect(cacheEntry).not.toBeNull();
    expect(cacheEntry[0]).toEqual(cacheKey);
    expect(cacheEntry[1].ttl).toEqual(MockServiceWithArgs.CACHE_TTL);
  });
  it('Test so invalid key returns null', async () => {
    const mockServiceWithArg = new MockServiceWithArgs();
    await mockServiceWithArg.fetch();
    const cacheKey = 'nonExistingKey';
    expect(cache.get(cacheKey)).toBeUndefined();
    expect(cache.size).toEqual(1);
  });
});
