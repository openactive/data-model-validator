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

  it('should return no error when no HTML is supplied in content', async () => {
    const data = {
      type: 'Event',
    };

    const descriptions = [
      '< body >',
      'No HTML',
      '</ body >',
    ];

    for (const description of descriptions) {
      data.description = description;
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return no error when HTML is supplied in beta:formattedDescription', async () => {
    const data = {
      type: 'Event',
    };

    const descriptions = [
      '< body >',
      'No HTML',
      '</ body >',
    ];

    for (const description of descriptions) {
      data.description = description;
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return no error when no HTML is supplied in content in a namespaced field', async () => {
    const data = {
      type: 'Event',
    };

    const descriptions = [
      '<p>Test HTML</p>',
      'Street 1,<br />Street 2',
      '<script>XSS.vulnerability = true;</script>',
    ];

    for (const description of descriptions) {
      data['beta:formattedDescription'] = description;
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error when HTML is supplied in content', async () => {
    const data = {
      type: 'Event',
    };

    const descriptions = [
      '<p>Test HTML</p>',
      'Street 1,<br />Street 2',
      '<script>XSS.vulnerability = true;</script>',
    ];

    for (const description of descriptions) {
      data.description = description;
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validateAsync(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.NO_HTML);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });
});
