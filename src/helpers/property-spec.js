const { performance } = require('perf_hooks');
const PropertyHelper = require('./property');

describe('PropertyHelper', () => {
  describe('isUrlTemplate', () => {
    it('should return true for template', async () => {
      const result = PropertyHelper.isUrlTemplate('{test}');
      expect(result).toBe(true);
    });
    it('should return false for string', async () => {
      const result = PropertyHelper.isUrlTemplate('test');
      expect(result).toBe(false);
    });
    it('should return false for erroneous string', async () => {
      const result = PropertyHelper.isUrlTemplate('{description}{something-else}.');
      expect(result).toBe(false);
    });
    it('should return false for URL that has previously caused issues', async () => {
      const result = PropertyHelper.isUrlTemplate('https://reachstorageaccount.blob.core.windows.net/images/9142d700-adb7-4f7b-af10-fef045ff11f4/783cbdc4-c0c0-449b-8ce0-1e147337a628/The Regal - Bball Court.jpg');
      expect(result).toBe(false);
    });
  });

  describe('isUrl', () => {
    const data = [
      // 'https://domain1.domain2.domain3.domain4.net/ ',
      // 'https://reachstorageaccount.blob.core.windows.net/images/9142d700-adb7-4f7b-af10-fef045ff11f4/783cbdc4-c0c0-449b-8ce0-1e147337a628/The Regal - Bball Court.jpg',
    ];

    it('should not take more than 100ms to complete', () => {
      const t0 = performance.now();
      for (const item of data) {
        PropertyHelper.isUrl(item);
      }
      const t1 = performance.now();
      expect(t1 - t0).toBeLessThan(100);
    });

    it('should return true for url', async () => {
      const result = PropertyHelper.isUrl('https://www.example.com/');
      expect(result).toBe(true);
    });

    it('should return true for localhost', async () => {
      const result = PropertyHelper.isUrl('http://localhost:5000/');
      expect(result).toBe(true);
    });

    it('should return true for dev domain', async () => {
      const result = PropertyHelper.isUrl('http://mylocal.something:5000/');
      expect(result).toBe(true);
    });

    it('should return false for invalid URL', async () => {
      const result = PropertyHelper.isUrl('https://www.example.com/ space');
      expect(result).toBe(false);
    });
  });
});
