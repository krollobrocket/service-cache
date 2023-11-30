import { ServiceCache } from '../src/service-cache.decorator';

export class MockServiceFoo {
  @ServiceCache({ key: 'myCache', ttl: 150 })
  async fetch(arg: string) {
    return {
      message: 'Return ' + arg + ' from service',
      arg,
      timestamp: new Date().getTime(),
    };
  }
}

@ServiceCache({ key: 'classCache', ttl: 150 })
export class MockServiceBar {
  async fetchFoo(arg: string) {
    return {
      message: 'Return ' + arg + ' from service',
      arg,
      timestamp: new Date().getTime(),
    };
  }

  async fetchBar(arg: string) {
    return {
      message: 'Return ' + arg + ' from service',
      arg,
      timestamp: new Date().getTime(),
    };
  }

  async fetchFooBar(arg: string) {
    return {
      message: 'Return ' + arg + ' from service',
      arg,
      timestamp: new Date().getTime(),
    };
  }
}
