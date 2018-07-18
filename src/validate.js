'use strict';

const modelLoader = require('openactive-data-models');
const Model = require('./classes/model');
const ValidationErrorSeverity = require('./errors/validation-error-severity');
const ValidationErrorCategory = require('./errors/validation-error-category');
const ValidationErrorType = require('./errors/validation-error-type');
const ValidationError = require('./errors/validation-error');

module.exports = validate;

function validate(value, model, options) {
    let errors = [];

    // Load the rules
    const rules = require('./rules');
    let ruleObjects = [];
    for (let index in rules) {
        ruleObjects.push(new rules[index]());
    }

    let isSingleObject = false;
    let possibleModel = null;
    let valuesToTest = [];

    if (value instanceof Array) {
        valuesToTest = value;
        // This should throw a warning - we're only expecting
        // to validate single objects with this library
        errors.push(
            new ValidationError({
                "category": ValidationErrorCategory.INTERNAL,
                "message": "Arrays are not supported for validation. Please only submit single objects for validation.",
                "type": ValidationErrorType.INVALID_JSON,
                "value": value,
                "severity": ValidationErrorSeverity.WARNING,
                "path": '$'
            })
        );
    } else if (typeof(value) === 'object') {
        valuesToTest.push(value);
        isSingleObject = true;
    } else {
        // This should throw a failure - we can only evaluate objects
        errors.push(
            new ValidationError({
                "category": ValidationErrorCategory.INTERNAL,
                "message": "Only objects are supported for validation. Please only submit single objects for validation.",
                "type": ValidationErrorType.INVALID_JSON,
                "value": value,
                "severity": ValidationErrorSeverity.FAILURE,
                "path": '$'
            })
        );
    }

    let index = 0;
    for (let value of valuesToTest) {
        let path = '$';
        if (!isSingleObject) {
            path += '[' + index + ']';
        }

        let modelName;

        // If no model provided, use the type in the object
        if (typeof(model) === 'undefined' || model === null) {
            if (typeof(value.type) !== 'undefined') {
                modelName = value.type;
            }
        } else {
            modelName = model;
        }

        // Load the model
        let modelResponse = loadModel(
            modelName,
            path
        );
        let modelObject = modelResponse.modelObject;
        errors = errors.concat(modelResponse.errors);

        // Apply the rules
        errors = errors.concat(applyModelRules(ruleObjects, value, modelObject, null, path));
    }

    return errors.map((x) => x.data);
}

function loadModel(modelName, path) {
    // Load the model (if it exists)
    // If the model doesn't exist, we can still apply a barebones set of
    // rules on the object.
    let modelObject;
    let errors = [];
    try {
        let modelData = modelLoader.loadModel(modelName);

        if (modelData) {
            modelObject = new Model(modelData, true);
        }
    } catch (e) {}
    if (!modelObject) {
        errors.push(
            new ValidationError({
                "category": ValidationErrorCategory.INTERNAL,
                "type": ValidationErrorType.MODEL_NOT_FOUND,
                "value": "#" + modelName,
                "severity": ValidationErrorSeverity.WARNING,
                "path": path
            })
        );
        modelObject = new Model();
    }
    return {
        errors: errors,
        modelObject: modelObject
    };
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
    let fieldsToTest = [];
    let isSingleObject = false;
    let possibleModel = null;

    if (data[field] instanceof Array) {
        fieldsToTest = data[field];
    } else if (typeof(data[field]) === 'object') {
        fieldsToTest.push(data[field]);
        isSingleObject = true;
    }

    let index = 0;
    for (let fieldValue of fieldsToTest) {
        if (typeof(fieldValue) !== 'object') {
            index += 1;
            continue;
        }

        let subModelType = fieldValue.type;
        let currentFieldPath = path + '.' + field;
        if (!isSingleObject) {
            currentFieldPath += '[' + index + ']';
        }

        let modelResponse = loadModel(
            subModelType,
            currentFieldPath
        );
        let subModel = modelResponse.modelObject;
        errors = errors.concat(modelResponse.errors);

        let subModelErrors = applyModelRules(
            rules,
            fieldValue,
            subModel,
            data,
            currentFieldPath
        );
        errors = errors.concat(subModelErrors);
        index += 1;
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
