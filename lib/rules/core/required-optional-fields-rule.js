'use strict';

const Rule = require('../rule');
const ValidationError = require('../../validation-error');

module.exports = class RequiredOptionalFieldsRule extends Rule {

    constructor(options) {
        super(options);
        this._targetModels = '*';
        this._description = "Validates that all optional fields that are part of a required group are present in the JSON data.";
    }

    validateModel(data, model, parent) {
        let errors = [];
        for (let option of model.requiredOptions) {
            if (typeof(option.options) !== 'undefined'
                && option.options instanceof Array
            ) {
                let found = false;

                for (let field of option.options) {
                    if (typeof(data[field]) !== 'undefined'
                        && data[field] !== null
                    ) {
                        found = true;
                        break;
                    }
                }

                if (!found) {
                    errors.push(
                        new ValidationError(
                            {
                                "category": "conformance",
                                "type": "missing_required_field",
                                "message": option.description ? option.description.join(' ') : null,
                                "value": undefined,
                                "severity": "failure",
                                "path": '[\'' + option.options.join('\', \'') + '\']'
                            }
                        )
                    );
                }
            }
        }
        return errors;
    }
}
