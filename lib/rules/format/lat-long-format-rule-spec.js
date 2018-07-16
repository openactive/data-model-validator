'use strict';

const LatLongFormatRule = require('./lat-long-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('LatLongFormatRule', function() {
    const rule = new LatLongFormatRule();

    const model = new Model({
        "type": "GeoCoordinates",
        "fields": {
            "latitude": {
                "fieldName": "latitude",
                "sameAs": "http://schema.org/latitude",
                "requiredType": "http://schema.org/Float"
            },
            "longitude": {
                "fieldName": "longitude",
                "sameAs": "http://schema.org/longitude",
                "requiredType": "http://schema.org/Float"
            }
        }
    });

    it('should target lat / long fields of GeoCoordinates', function() {
        let isTargeted = rule.isFieldTargeted(model, 'latitude');
        expect(isTargeted).toBe(true);

        isTargeted = rule.isFieldTargeted(model, 'longitude');
        expect(isTargeted).toBe(true);

        isTargeted = rule.isFieldTargeted(model, 'type');
        expect(isTargeted).toBe(false);
    });

    // WGS84Latitude
    it('should return no error for an valid latitude', function() {
        let values = [
            90.000,
            -89.123456,
            5.01123,
            70.445234
        ];

        for (let value of values) {
            let data = {
                "latitude": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid latitude', function() {
        let values = [
            90.000001,
            -100.0001
        ];

        for (let value of values) {
            let data = {
                "latitude": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });

    // WGS84Latitude
    it('should return no error for an valid longitude', function() {
        let values = [
            180.000,
            -179.123456,
            5.01123,
            70.445234
        ];

        for (let value of values) {
            let data = {
                "longitude": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid longitude', function() {
        let values = [
            180.000001,
            -180.0001
        ];

        for (let value of values) {
            let data = {
                "longitude": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
