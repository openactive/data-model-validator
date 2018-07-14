'use strict';

const FieldsMatchStandardRule = require('./fields-match-standard-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('FieldsMatchStandardRule', function() {
    const rule = new FieldsMatchStandardRule();

    it('should target fields of any type', function() {
        let model = new Model({
            "type": "Event"
        });
        let isTargeted = rule.isFieldTargeted(model, 'type');
        expect(isTargeted).toBe(true);
    });

    // ISO3166-1-ALPHA2
    it('should return no error for an valid country code', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "country": {
                    "fieldName": "country",
                    "requiredType": "http://schema.org/Text",
                    "standard": "$ISO3166-1-ALPHA2"
                }
            }
        });
        let values = [
            "GB",
            "CN",
            "US"
        ];

        for (let value of values) {
            let data = {
                "country": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid country code', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "country": {
                    "fieldName": "country",
                    "requiredType": "http://schema.org/Text",
                    "standard": "$ISO3166-1-ALPHA2"
                }
            }
        });

        let values = [
            "BC",
            "QB",
            "ZY",
            "A"
        ];

        for (let value of values) {
            let data = {
                "country": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_STANDARD);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });

    // ISO4217-3LETTER
    it('should return no error for an valid currency code', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "currency": {
                    "fieldName": "currency",
                    "requiredType": "http://schema.org/Text",
                    "standard": "$ISO4217-3LETTER"
                }
            }
        });
        let values = [
            "GBP",
            "JPY",
            "USD"
        ];

        for (let value of values) {
            let data = {
                "currency": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid currency code', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "currency": {
                    "fieldName": "currency",
                    "requiredType": "http://schema.org/Text",
                    "standard": "$ISO4217-3LETTER"
                }
            }
        });

        let values = [
            "XAA",
            "XAB",
            "GB"
        ];

        for (let value of values) {
            let data = {
                "currency": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_STANDARD);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });


    // ISO8601DateTime
    it('should return no error for an valid datetime', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "datetime": {
                    "fieldName": "datetime",
                    "requiredType": "http://schema.org/DateTime",
                    "standard": "$ISO8601DateTime"
                }
            }
        });
        let values = [
            "2017-09-06T09:00:00Z",
            "2018-01-15T09:00:00+01:00"
        ];

        for (let value of values) {
            let data = {
                "datetime": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid datetime', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "datetime": {
                    "fieldName": "datetime",
                    "requiredType": "http://schema.org/DateTime",
                    "standard": "$ISO8601DateTime"
                }
            }
        });

        let values = [
            "2017-09-06T09:00:00",
            "2018-10-17",
            "ABC"
        ];

        for (let value of values) {
            let data = {
                "datetime": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_STANDARD);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });

    // WGS84Latitude
    it('should return no error for an valid latitude', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "latitude": {
                    "fieldName": "latitude",
                    "requiredType": "http://schema.org/Float",
                    "standard": "$WGS84Latitude"
                }
            }
        });
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
        let model = new Model({
            "type": "Event",
            "fields": {
                "latitude": {
                    "fieldName": "latitude",
                    "requiredType": "http://schema.org/Float",
                    "standard": "$WGS84Latitude"
                }
            }
        });

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
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_STANDARD);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });

    // WGS84Latitude
    it('should return no error for an valid longitude', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "longitude": {
                    "fieldName": "longitude",
                    "requiredType": "http://schema.org/Float",
                    "standard": "$WGS84Longitude"
                }
            }
        });
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
        let model = new Model({
            "type": "Event",
            "fields": {
                "longitude": {
                    "fieldName": "longitude",
                    "requiredType": "http://schema.org/Float",
                    "standard": "$WGS84Longitude"
                }
            }
        });

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
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_STANDARD);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
