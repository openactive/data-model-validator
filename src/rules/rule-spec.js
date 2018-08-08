const Rule = require('./rule');
const Model = require('../classes/model');

describe('Rule', () => {
  const model = new Model({
    type: 'Event',
    requiredFields: [
      '@context',
      'activity',
      'location',
    ],
  }, 'latest');
  const rule = new Rule();

  it('should not target any models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(false);
  });

  it('should not target any fields', () => {
    const isTargeted = rule.isFieldTargeted(model, '*');
    expect(isTargeted).toBe(false);
  });

  it('should throw if trying to validate a model', () => {
    const data = {};
    function doValidate() {
      rule.validateModel(data, model, null);
    }
    expect(doValidate).toThrow();
  });

  it('should throw if trying to validate a field', () => {
    const data = {};
    const field = 'field';
    function doValidate() {
      rule.validateField(data, field, model, null);
    }
    expect(doValidate).toThrow();
  });
});
