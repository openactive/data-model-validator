const ValidInputRule = require('./valid-input-rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ValidInputRule', () => {
  const rule = new ValidInputRule();

  it('should not target any model or field', () => {
    expect(rule.isModelTargeted()).toBe(false);
    expect(rule.isFieldTargeted()).toBe(false);
  });

  it('should return no error for valid input', async () => {
    const data = {
      '@type': 'Event',
    };

    const { errors } = await rule.validate(data);
    expect(errors.length).toBe(0);
  });

  it('should return a warning for an array input', async () => {
    const data = [
      {
        '@type': 'Event',
      },
    ];

    const { errors } = await rule.validate(data);
    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.INVALID_JSON);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
  });

  it('should return a failure for invalid input', async () => {
    const dataItems = [
      'string',
      1,
      null,
      undefined,
    ];

    for (const data of dataItems) {
      const { errors } = await rule.validate(data);
      expect(errors.length).toBe(1);

      expect(errors[0].type).toBe(ValidationErrorType.INVALID_JSON);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
