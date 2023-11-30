import { MockServiceFoo, MockServiceBar } from './MockService';

describe('Test service cache decorator', () => {
  let mockServiceFoo: MockServiceFoo;
  let mockServiceBar: MockServiceBar;

  beforeEach(() => {
    mockServiceFoo = new MockServiceFoo();
    mockServiceBar = new MockServiceBar();
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
});
