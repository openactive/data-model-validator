'use strict';

const Rule = require('../rule');
const ValidationError = require('../../validation-error');

module.exports = class BetaFieldsRule extends Rule {

    constructor(options) {
        super(options);
        this._targetModels = '*';
        this._description = "Validates that no beta fields are present in the data.";
    }

    validateModel(data, model, parent) {
        let errors = [];
        for (let field in data) {
            if (field.substring(0, 5) === 'beta:') {
                errors.push(
                    new ValidationError(
                        {
                            "category": "conformance",
                            "type": "beta_fields_not_checked",
                            "value": data[field],
                            "severity": "warning",
                            "path": field
                        }
                    )
                );
            }
        }
        return errors;
    }
}
