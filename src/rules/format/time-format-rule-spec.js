'use strict';

const TimeFormatRule = require('./time-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('TimeFormatRule', function() {
    const rule = new TimeFormatRule();

    it('should target fields of any type', function() {
        let model = new Model({
            "type": "Event"
        });
        let isTargeted = rule.isFieldTargeted(model, 'type');
        expect(isTargeted).toBe(true);
    });

    // ISO8601Time
    it('should return no error for an valid time', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "time": {
                    "fieldName": "time",
                    "requiredType": "http://schema.org/Time"
                }
            }
        });
        model.hasSpecification = true;
        let values = [
            "09:00:00Z",
            "09:00:00+01:00"
        ];

        for (let value of values) {
            let data = {
                "time": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(0);
        }
    });
    it('should return an error for an invalid time', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "time": {
                    "fieldName": "time",
                    "requiredType": "http://schema.org/Time"
                }
            }
        });
        model.hasSpecification = true;
        let values = [
            "2017-09-06T09:00:00",
            "2018-10-17",
            "09:00:00",
            "25:00:00Z",
            "ABC"
        ];

        for (let value of values) {
            let data = {
                "time": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
    it('should return an error for an invalid time from an unknown Model', function() {
        let model = new Model({});

        let values = [
            "09:00",
            "25:00:00Z"
        ];

        for (let value of values) {
            let data = {
                "time": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
