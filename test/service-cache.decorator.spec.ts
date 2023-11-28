import { MockService } from './MockService';

describe('Test service cache decorator', () => {
  let mockService: MockService;

  beforeEach(() => {
    mockService = new MockService();
  });

  it('Test that result is cached', async () => {
    const firstResult = await mockService.fetch('foo');
    const secondResult = await mockService.fetch('foo');
    expect(firstResult).toEqual(secondResult);
  });
  it('Test so calls with different parameters is not cached', async () => {
    const firstResult = await mockService.fetch('foo');
    const secondResult = await mockService.fetch('bar');
    expect(firstResult).not.toEqual(secondResult);
  });
  it('Test so cache entries are purged', async () => {
    const firstResult = await mockService.fetch('foo');
    await new Promise((r) => setTimeout(r, 250));
    const secondResult = await mockService.fetch('foo');
    expect(firstResult).not.toEqual(secondResult);
  });
});
