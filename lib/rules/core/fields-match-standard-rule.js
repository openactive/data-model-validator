'use strict';

const Rule = require('../rule');
const Field = require('../../classes/field');
const Standard = require('../../classes/standard');
const Loader = require('../../loader');
const ValidationError = require('../../validation-error');

module.exports = class FieldsMatchStandardRule extends Rule {

    constructor(options) {
        super(options);
        this._targetFields = '*';
        this._description = "Validates that all fields match the correct standard.";
    }

    validateField(data, field, model, parent) {
        if (typeof(model.fields[field]) === 'undefined') {
            return [];
        }

        let errors = [];

        // Is there a standard?
        let fieldObj = new Field(model.fields[field]);

        if (
            typeof(fieldObj.standard) !== 'undefined'
            && fieldObj.standard.substr(0, 1) === '$'
        ) {
            let standardData = Loader.loadStandard(fieldObj.standard.substr(1));
            let standard = new Standard(standardData);

            if (!standard.validate(data[field])) {
                errors.push(
                    new ValidationError(
                        {
                            "category": "conformance",
                            "type": "invalid_standard",
                            "message": standard.validationErrorMessage,
                            "value": data[field],
                            "severity": "failure",
                            "path": field
                        }
                    )
                );
            }
        }

        return errors;
    }
}
