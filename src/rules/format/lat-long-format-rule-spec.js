const LatLongFormatRule = require('./lat-long-format-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('LatLongFormatRule', () => {
  const rule = new LatLongFormatRule();

  const model = new Model({
    type: 'GeoCoordinates',
    fields: {
      latitude: {
        fieldName: 'latitude',
        sameAs: 'https://schema.org/latitude',
        requiredType: 'https://schema.org/Float',
      },
      longitude: {
        fieldName: 'longitude',
        sameAs: 'https://schema.org/longitude',
        requiredType: 'https://schema.org/Float',
      },
    },
  }, 'latest');

  it('should target lat / long fields of GeoCoordinates', () => {
    let isTargeted = rule.isFieldTargeted(model, 'latitude');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'longitude');
    expect(isTargeted).toBe(true);

    isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(false);
  });

  // WGS84Latitude
  it('should return no error for an valid latitude', () => {
    const values = [
      90.000,
      -89.123456,
      5.01123,
      70.445234,
    ];

    for (const value of values) {
      const data = {
        latitude: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid latitude', () => {
    const values = [
      90.000001,
      -100.0001,
    ];

    for (const value of values) {
      const data = {
        latitude: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid latitude with a namespace', () => {
    const values = [
      90.000001,
      -100.0001,
    ];

    for (const value of values) {
      const data = {
        'schema:latitude': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // WGS84Latitude
  it('should return no error for an valid longitude', () => {
    const values = [
      180.000,
      -179.123456,
      5.01123,
      70.445234,
    ];

    for (const value of values) {
      const data = {
        longitude: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid longitude', () => {
    const values = [
      180.000001,
      -180.0001,
    ];

    for (const value of values) {
      const data = {
        longitude: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return an error for an invalid longitude with a namespace', () => {
    const values = [
      180.000001,
      -180.0001,
    ];

    for (const value of values) {
      const data = {
        'schema:longitude': value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
