'use strict';

const moment = require('moment');
const Rule = require('../rule');
const Field = require('../../classes/field');
const ValidationError = require('../../errors/validation-error');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class DateFormatRule extends Rule {

    constructor(options) {
        super(options);
        this._targetModels = ['Event'];
        this._description = "Validates that startDate is before the endDate of an Event.";
    }

    validateModel(data, model, parent) {
        if (typeof(data['startDate']) === 'undefined'
            || typeof(data['endDate']) === 'undefined'
        ) {
            return [];
        }
        let errors = [];

        let startDate = moment(data['startDate'], ['YYYY-MM-DD\THH:mm:ssZZ', 'YYYY-MM-DD', 'YYYYMMDD'], true);
        let endDate = moment(data['endDate'], ['YYYY-MM-DD\THH:mm:ssZZ', 'YYYY-MM-DD', 'YYYYMMDD'], true);

        if (!startDate.isValid() || !endDate.isValid()) {
            return [];
        }

        if (startDate > endDate) {
            errors.push(
                new ValidationError(
                    {
                        "category": ValidationErrorCategory.DATA_QUALITY,
                        "type": ValidationErrorType.START_DATE_AFTER_END_DATE,
                        "value": data['startDate'],
                        "severity": ValidationErrorSeverity.WARNING,
                        "path": 'startDate'
                    }
                )
            );
        }

        return errors;
    }
}