'use strict';

const EndBeforeStartRule = require('./end-before-start-rule');
const Model = require('../../classes/model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('EndBeforeStartRule', function() {
    const rule = new EndBeforeStartRule();

    const model = new Model({
        "type": "Event",
        "fields": {
            "startDate": {
                "fieldName": "startDate",
                "requiredType": "http://schema.org/DateTime"
            },
            "endDate": {
                "fieldName": "endDate",
                "requiredType": "http://schema.org/DateTime"
            }
        }
    });

    it('should target Event models', function() {
        let model = new Model({
            "type": "Event"
        });
        let isTargeted = rule.isModelTargeted(model);
        expect(isTargeted).toBe(true);
    });

    it('should return no error when the startDate is before the endDate', function() {
        let data = {
            "type": "Event",
            "startDate": "2017-09-06T09:00:00Z",
            "endDate": "2018-01-15T09:00:00+01:00"
        };

        let errors = rule.validate(data, model, null);
        expect(errors.length).toBe(0);
    });
    it('should return no error when the startDate is set, but the endDate isn\'t', function() {
        let data = {
            "type": "Event",
            "startDate": "2017-09-06T09:00:00Z"
        };

        let errors = rule.validate(data, model, null);
        expect(errors.length).toBe(0);
    });
    it('should return an error when the startDate is after the endDate', function() {
        let data = {
            "type": "Event",
            "startDate": "2017-09-06T09:00:00Z",
            "endDate": "2017-01-15T09:00:00Z"
        };

        let errors = rule.validate(data, model, null);
        expect(errors.length).toBe(1);
        expect(errors[0].type).toBe(ValidationErrorType.START_DATE_AFTER_END_DATE);
        expect(errors[0].severity).toBe(ValidationErrorSeverity.WARNING);
    });
});
