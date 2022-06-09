const DeprecatedFieldsRule = require('./deprecated-fields-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const OptionsHelper = require('../../helpers/options');

describe('DeprecatedFieldsRule', () => {
  const rule = new DeprecatedFieldsRule();

  const model = new Model({
    type: 'Event',
    fields: {
      ageRange: {
        fieldName: 'ageRange',
        sameAs: 'https://openactive.io/ageRange',
        model: '#QuantitativeValue',
        description: [
          'Indicates that an Offer is only applicable to a specific age range.',
        ],
        deprecationGuidance: 'Use `ageRestriction` instead of `ageRange` within the `Offer` for cases where the `Offer` is age restricted.',
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  describe('when in RPDEFeed validation mode', () => {
    const options = new OptionsHelper({ validationMode: 'RPDEFeed' });

    it('should return a failure', async () => {
      const data = {
        '@type': 'Event',
        ageRange: {
          '@type': 'QuantitativeValue',
          minValue: 18,
          maxValue: 65,
        },
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
      expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
    });
  });

  describe('when in non-RPDEFeed validation mode', () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });

    it('should return a failure', async () => {
      const data = {
        '@type': 'Event',
        ageRange: {
          '@type': 'QuantitativeValue',
          minValue: 18,
          maxValue: 65,
        },
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
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    });
  });
});
