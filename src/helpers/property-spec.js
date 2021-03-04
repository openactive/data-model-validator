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
  });
});
