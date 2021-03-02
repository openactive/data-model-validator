const LatLngPrecisionRule = require('./lat-lng-precision-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('LatLngPrecisionRule', () => {
  const rule = new LatLngPrecisionRule();

  const model = new Model({
    type: 'GeoCoordinates',
    fields: {
      latitude: {
        fieldName: 'latitude',
        minDecimalPlaces: 2,
        sameAs: 'https://schema.org/latitude',
        requiredType: 'https://schema.org/Number',
      },
      longitude: {
        fieldName: 'longitude',
        minDecimalPlaces: 2,
        sameAs: 'https://schema.org/longitude',
        requiredType: 'https://schema.org/Number',
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  it('should target lat / long fields of GeoCoordinates', () => {
    let isTargeted = rule.isFieldTargeted(model, 'latitude');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'longitude');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(false);
  });

  it('should return no error for a value above a minDecimalPlaces threshold', async () => {
    const values = [
      -89.123456,
      5.01123,
      70.445234,
    ];

    for (const value of values) {
      const data = {
        latitude: value,
        longitude: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for a value below a minDecimalPlaces threshold', async () => {
    const values = [
      90.1,
      -100.1,
      110,
    ];

    for (const value of values) {
      const data = {
        latitude: value,
        longitude: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = await rule.validate(nodeToTest);
      expect(errors.length).toBe(2);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_PRECISION);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
      expect(errors[1].type).toBe(ValidationErrorType.INVALID_PRECISION);
      expect(errors[1].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
