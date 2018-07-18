'use strict';

const moment = require('moment');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class LatLongFormatRule extends Rule {

    constructor(options) {
        super(options);
        this._targetFields = {
            'GeoCoordinates': ['latitude', 'longitude']
        };
        this._description = "Validates that latitude and longitude fields are in the correct format.";
        this._errors = {
            "latitude": "Geo latitude points should be expressed as floating point numbers, -90 to 90.",
            "longitude": "Geo longitude points should be expressed as floating point numbers, -180 to 180."
        };
    }

    validateField(data, field, model, parent) {
        let errors = [];
        if (
            typeof(data[field]) !== 'number'
            || (field === 'latitude' && (data[field] < -90 || data[field] > 90))
            || (field === 'longitude' && (data[field] < -180 || data[field] > 180))
        ) {
            errors.push(
                new ValidationError(
                    {
                        "category": ValidationErrorCategory.CONFORMANCE,
                        "type": ValidationErrorType.INVALID_FORMAT,
                        "message": this._errors[field],
                        "value": data[field],
                        "severity": ValidationErrorSeverity.FAILURE,
                        "path": field
                    }
                )
            );
        }
        return errors;
    }
}
