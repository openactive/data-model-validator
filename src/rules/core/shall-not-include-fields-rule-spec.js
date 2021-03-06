const ShallNotIncludeFieldsRule = require('./shall-not-include-fields-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const OptionsHelper = require('../../helpers/options');

describe('ShallNotIncludeFieldsRule', () => {
  const rule = new ShallNotIncludeFieldsRule();

  const model = new Model({
    type: 'Event',
    validationMode: {
      C1Request: 'request',
      C1Response: 'response',
    },
    imperativeConfiguration: {
      request: {
        shallNotInclude: [
          'duration',
        ],
      },
    },
    imperativeConfigurationWithContext: {
      response: {
        wedding: {
          shallNotInclude: [
            'price',
          ],
        },
        dinner: {
          shallNotInclude: [
            'barTab',
          ],
        },
      },
    },
    fields: {
      remainingAttendeeCapacity: {
        fieldName: 'remainingAttendeeCapacity',
        requiredType: 'https://schema.org/Integer',
      },
    },
  }, 'latest');

  describe('when in a validation mode with shallNotInclude setting', () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });

    it('should return no error when no shall not include fields part of data', async () => {
      const data = {
        '@type': 'Event',
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    });

    it('should return failures when shall not include fields present in data', async () => {
      const data = {
        '@type': 'Event',
        duration: 1,
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    });
  });

  describe('when there is a context-specific imperative config', () => {
    const options = new OptionsHelper({ validationMode: 'C1Response' });

    it('should return no error when shall not include fields present in data', async () => {
      const data = {
        '@type': 'Event',
      };

      const nodeToTest = new ModelNode(
        'wedding',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    });

    it('should return failures when shall not include fields present in data', async () => {
      const data = {
        '@type': 'Event',
        price: 10000,
      };

      const nodeToTest = new ModelNode(
        'wedding',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_ALLOWED_IN_SPEC);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    });
  });

  describe('when no imperative config for validation mode', () => {
    it('should not create errors', async () => {
      const data = {
        '@type': 'Event',
        duration: 1,
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    });
  });
});
