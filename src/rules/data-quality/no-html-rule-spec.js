const NoHtmlRule = require('./no-html-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('NoHtmlRule', () => {
  const rule = new NoHtmlRule();

  const model = new Model({
    type: 'Event',
    fields: {
      description: {
        fieldName: 'description',
        requiredType: 'https://schema.org/Text',
      },
      'beta:formattedDescription': {
        fieldName: 'beta:formattedDescription',
        requiredType: 'https://schema.org/Text',
      },
    },
  }, 'latest');

  it('should target all models and fields', () => {
    const isTargeted = rule.isFieldTargeted(model, 'description');
    expect(isTargeted).toBe(true);
  });

  for (const description of [
    '< body text >',
    'No HTML',
    'And & Something < > else',
    '\r\nLine 1.\r\nLine 2.\r\n',
    'Line 1.\r\nLine 2.',
    'Line 1.\nLine 2.',
    '\nLine 1.\nLine 2.\n',
  ]) {
    it(`should return no error when no HTML is supplied in content of value ${JSON.stringify(description)}`, async () => {
      const data = {
        type: 'Event',
      };
      data.description = description;
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    });
  }

  for (const description of [
    '<p>Test HTML</p>',
    'Street 1,<br />Street 2',
    '<script>XSS.vulnerability = true;</script>',
  ]) {
    it(`should return no error when HTML is supplied in beta:formattedDescription with value ${JSON.stringify(description)}`, async () => {
      const data = {
        type: 'Event',
      };
      data['beta:formattedDescription'] = description;
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    });
  }

  for (const description of [
    '<p>Test HTML</p>',
    'Street 1,<br />Street 2',
    '<script>XSS.vulnerability = true;</script>',
    '\r\n&nbsp; &nbsp; &nbsp;',
    '<body>',
    '</body>',
  ]) {
    it(`should return an error when HTML is supplied in content of value ${JSON.stringify(description)}`, async () => {
      const data = {
        type: 'Event',
      };
      data.description = description;
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      if (errors[0]) {
        expect(errors[0].type).toBe(ValidationErrorType.NO_HTML);
        expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
      }
    });
  }
});
