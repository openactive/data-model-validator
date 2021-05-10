const { performance } = require('perf_hooks');
const Field = require('./field');

describe('Field', () => {
  const data = [
    'https://domain1.domain2.domain3.domain4.net/ ',
  ];

  it('should not take more than 100ms to complete', () => {
    const t0 = performance.now();
    for (const item of data) {
      Field.URL_REGEX.test(item);
    }
    const t1 = performance.now();
    expect(t1 - t0).toBeLessThan(100);
  });
});
