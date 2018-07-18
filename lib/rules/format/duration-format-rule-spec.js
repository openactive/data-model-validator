'use strict';

const DurationFormatRule = require('./duration-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('DurationFormatRule', function() {
    const rule = new DurationFormatRule();

    it('should target fields of any type', function() {
        let model = new Model({
            "type": "Event"
        });
        let isTargeted = rule.isFieldTargeted(model, 'type');
        expect(isTargeted).toBe(true);
    });

    // ISO8601Duration
    it('should return no error for an valid duration', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "duration": {
                    "fieldName": "duration",
                    "requiredType": "http://schema.org/Duration"
                }
            }
        });
        model.hasSpecification = true;
        let values = [
            "P0Y",
            "PT0,5H",
            "P5DT0.5S",
            "P5YT7H20M",
            "P2W"
        ];

        for (let value of values) {
            let data = {
                "duration": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid duration', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "duration": {
                    "fieldName": "duration",
                    "requiredType": "http://schema.org/Duration"
                }
            }
        });
        model.hasSpecification = true;
        let values = [
            "P",
            "P7H",
            "P0.5Y0.5M",
        ];

        for (let value of values) {
            let data = {
                "duration": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
    it('should return an error for an invalid duration from an unknown Model', function() {
        let model = new Model({});

        let values = [
            "P7H",
            "P0.5Y0.5M",
        ];

        for (let value of values) {
            let data = {
                "duration": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
