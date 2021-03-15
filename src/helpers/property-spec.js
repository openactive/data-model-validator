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
});
