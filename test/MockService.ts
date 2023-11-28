import { ServiceCache } from '../src/service-cache.decorator';

export class MockService {
  @ServiceCache({ key: 'myCache', ttl: 150 })
  async fetch(arg: string) {
    return {
      message: 'Return ' + arg + ' from service',
      arg,
      timestamp: new Date().getTime(),
    };
  }
}
