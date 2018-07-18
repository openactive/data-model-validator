'use strict';

const DatetimeFormatRule = require('./datetime-format-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('DatetimeFormatRule', function() {
    const rule = new DatetimeFormatRule();

    it('should target fields of any type', function() {
        let model = new Model({
            "type": "Event"
        });
        let isTargeted = rule.isFieldTargeted(model, 'type');
        expect(isTargeted).toBe(true);
    });

    // ISO8601DateTime
    it('should return no error for an valid datetime', function() {
        let model = new Model({
            "type": "Event",
            "fields": {
                "datetime": {
                    "fieldName": "datetime",
                    "requiredType": "http://schema.org/DateTime"
                }
            }
        });
        model.hasSpecification = true;
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
                    "requiredType": "http://schema.org/DateTime"
                }
            }
        });
        model.hasSpecification = true;
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
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
    it('should return an error for an invalid datetime from an unknown Model', function() {
        let model = new Model({});

        let values = [
            "2017-09-06T09:00:00"
        ];

        for (let value of values) {
            let data = {
                "datetime": value
            };
            let errors = rule.validate(data, model, null);
            expect(errors.length).toBe(1);
            expect(errors[0].type).toBe(ValidationErrorType.INVALID_FORMAT);
            expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
        }
    });
});
