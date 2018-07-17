'use strict';

const loader = require('./loader');
const Model = require('./classes/model');
const ValidationErrorSeverity = require('./errors/validation-error-severity');
const ValidationErrorCategory = require('./errors/validation-error-category');
const ValidationErrorType = require('./errors/validation-error-type');
const ValidationError = require('./errors/validation-error');

module.exports = validate;

function validate(value, model, options) {
    // If no model provided, use the type in the object
    if (typeof(model) === 'undefined' || model === null) {
        if (typeof(value.type) !== 'undefined') {
            model = value.type;
        }
    }

    // Load the model (if it exists)
    let modelObject;
    try {
        modelObject = loadModel(model)
    } catch (e) {
        return [
            new ValidationError({
                "category": ValidationErrorCategory.INTERNAL,
                "type": ValidationErrorType.MODEL_NOT_FOUND,
                "value": "#" + model,
                "severity": ValidationErrorSeverity.FAILURE,
                "path": null
            })
        ];
    }

    // Load the rules
    const rules = require('./rules');
    let ruleObjects = [];
    for (let index in rules) {
        ruleObjects.push(new rules[index]());
    }

    let errors = applyModelRules(ruleObjects, value, modelObject, null, '$');

    return errors.map((x) => x.data);
}

function loadModel(model) {
    let modelData = loader.loadModel(model);
    let modelObject;

    if (modelData) {
        modelObject = new Model(modelData);
    }
    return modelObject;
}

function applyModelRules(rules, data, model, parent, path) {
    let errors = [];
    for (let rule of rules) {
        // Apply whole-model rule, and field-specific rules
        errors = addFullPathToErrors(rule.validate(data, model, parent), errors, path);
    }
    for (let field in data) {
        // If this field is itself a model, apply that model's rules to it
        errors = errors.concat(applySubModelRules(rules, data, field, model, parent, path));
    }
    return errors;
}

function applySubModelRules(rules, data, field, model, parent, path) {
    let errors = [];

    // Can this field be a model (or array of models?)
    let possibleModels = model.getPossibleModelsForField(field);
    if (!possibleModels.length) {
        return [];
    }

    if (
        typeof(data[field]) === 'object'
        && typeof(data[field].type) !== 'undefined'
        && possibleModels.indexOf('#' + data[field].type) >= 0
    ) {
        // This means it could be a single model
        // We need to load the new model
        let subModelData
        try {
            subModelData = loadModel(data[field].type);
        } catch (e) {}
        if (subModelData) {
            let subModel = new Model(subModelData);
            let subModelErrors = applyModelRules(
                rules,
                data[field],
                subModel,
                data,
                path + '.' + field
            );
            errors = errors.concat(subModelErrors);
        } else {
            errors.push(
                new ValidationError({
                    "category": ValidationErrorCategory.INTERNAL,
                    "type": ValidationErrorType.MODEL_NOT_FOUND,
                    "value": "#" + data[field].type,
                    "severity": ValidationErrorSeverity.WARNING,
                    "path": path + '.' + field
                })
            );
        }
    } else if (data[field] instanceof Array) {
        let index = 0;
        // This means it could be an array of models
        // Check that the whole array is of the same type
        let uniqueTypes = getUniqueTypesArray(data[field]);
        if (uniqueTypes.length !== 1
            || possibleModels.indexOf('ArrayOf#' + uniqueTypes[0]) < 0
        ) {
            return [];
        }
        let subModelData;
        try {
            subModelData = loadModel(uniqueTypes[0]);
        } catch (e) {}
        if (subModelData) {
            for (let fieldValue of data[field]) {
                let subModel = new Model(subModelData);
                let subModelErrors = applyModelRules(
                    rules,
                    fieldValue,
                    subModel,
                    data,
                    path + '.' + field + '[' + index + ']'
                );
                errors = errors.concat(subModelErrors);
            }
            index += 1;
        } else {
            errors.push(
                new ValidationError({
                    "category": ValidationErrorCategory.INTERNAL,
                    "type": ValidationErrorType.MODEL_NOT_FOUND,
                    "value": "#" + uniqueTypes[0],
                    "severity": ValidationErrorSeverity.WARNING,
                    "path": path + '.' + field + '[' + index + ']'
                })
            );
        }
    }
    return errors;
}

function getUniqueTypesArray(array) {
    // Map the array to their types
    let types = array.map((x) => {
        if (typeof(x) === 'object'
            && typeof(x.type) !== 'undefined'
        ) {
            return x.type;
        }
        return typeof(x);
    });
    // Make unique
    return [...new Set(types)];
}

function addFullPathToErrors(newErrors, existingErrors, path) {
    for (let error of newErrors) {
        error.path = path + (error.path ? '.' + error.path : '');
    }
    return existingErrors.concat(newErrors);
}
