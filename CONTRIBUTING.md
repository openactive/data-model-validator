# Contributing

## Introduction

The validator library works by traversing the JSON object provided to it, and applying rules at each level in the tree.

Every message that can be returned by the validator library is defined within a rule.

There are 2 main types of rule that the library makes use of.

### Raw Rules

These rules are applied to check that the raw input provided is a valid JSON object that is worth validating.

They are applied once at the beginning of the validation run to the entire data object.

These rules currently:

* Error if the submitted data is not an object
* Notifies of the library's limitations if the submitted data is detected to be an RPDE feed

### Core Rules

These rules are processed at each node in the object tree, in the order that they are defined in the core rules list.

For each object, the following algorithm is followed:

#### ApplyRules

* Apply all model-level rules to the whole object
* Apply all field-level rules to each field in the current object
* Iterate through each field and recursively apply **ApplyRules** if an `object` or `Array of objects` is found within it

### Accessing the rules

The constructors of both sets of rules are exported by the application in the `defaultRules` property:

```js
const { defaultRules } = require('openactive-data-model-validator');

console.log(defaultRules);

// {
//   "raw": [
//     ...
//   ],
//   "core": [
//     ...
//   ]
// }

```

## Adding rules

To add a new rule, you will need to extend the [`Rule`](src/rules/rule.js) class.

The rule name you create should:

* Be unique
* Be written in UpperCamelCase
* End in Rule - e.g. `CheckForFooRule`
* Have a filename that matches the rule name in kebab case - e.g. `check-for-foo-rule.js`
* Have a test file that sits beside the rule file, with a trailing `-spec` - e.g. `check-for-foo-rule-spec.js`

### Rule targeting

* Set `this.targetModels` to an array of the names of model you are targeting, or a string `'*'` wildcard. If you target a model, you **MUST** implement `validateModel`.

**OR**

* Set `this.targetFields` to an object map of the fields you are targeting in each model, or a string `'*''` wildcard. Setting the property to `null` means that the rule will be applied once to the whole model. If you target a field, you **MUST** implement `validateField`.
field
Generally speaking, you **SHOULD NOT** implement both `validateModel` and `validateField` in the same rule.

Independently, a rule can also target particular modes of use. It is used to restrict rules which should only apply during a particular usage of the models (e.g. an Order used during one of the booking phases - C1Request, C2Response or PatchOrder). By default, a rule will target all modes.

#### Model & field targetting

There is a lot of flexibility in the way that you can target rules.

To target all models at the top level:

```js
this.targetModels = '*';
```

To target all fields in every model:

```js
this.targetFields = '*';
```

To target specific models at the top level:

```js
this.targetModels = ['Event', 'Place'];
```

To target specific fields in specific models:

```js
this.targetFields = {
    'Event': [
        'startDate',
        'endDate'
    ],
    'Place': [
        'url'
    ]
};
```

### Validation Mode targetting

To target all modes:

```js
this.targetValidationModes = '*';
```

To target specific modes:

```js
this.targetValidationModes = ['C1Request', 'C2Response'];
```

### Metadata

Set `this.meta` to explain what the rule is testing for.

Defining this detail here makes it easier for libaries to scrape all of the rules that the validator will run.

This meta object should include:

* A `name` matching the name of the class.
* A `description` explain what the whole rule tests for.
* A hash of `tests`, explaining each scenario that this rule covers, and defining the message and error parameters that are thrown.
Each `key` should be unique, but can be any value. This `key` can be referred to within the rule to trigger a particular error.
Each test can define:
  * `description` - A description of the test. Optional if there is only one test.
  * `message` - The error message that is returned if this test fails. This can contain simple `{{handlebars}}` variable placeholders.
  * `sampleValues` - If the `message` contains handlebar placeholders, this property should contain a map of sample values for documentation purposes.
  * `category` - The category of the error when returned. Should come from the [`ValidationErrorCategory`](src/errors/validation-error-category.js) enum, and be one of:
    * `ValidationErrorCategory.CONFORMANCE`
    * `ValidationErrorCategory.DATA_QUALITY`
    * `ValidationErrorCategory.INTERNAL`
  * `severity` - The category of the error when returned. Should come from the [`ValidationErrorSeverity`](src/errors/validation-error-severity.js) enum, and be one of:
    * `ValidationErrorSeverity.FAILURE`
    * `ValidationErrorSeverity.WARNING`
    * `ValidationErrorSeverity.NOTICE`
    * `ValidationErrorSeverity.SUGGESTION`
  * `type` - The type of the error when returned. Should come from the [`ValidationErrorType`](src/errors/validation-error-type.js) enum.

#### Example

```js
this.meta = {
  name: 'FieldsNotInModelRule',
  description: 'Validates that all fields are present in the specification.',
  tests: {
    noExperimental: {
      description: 'Raises a notice if experimental fields are detected.',
      message: 'The validator does not currently check experimental fields.',
      category: ValidationErrorCategory.CONFORMANCE,
      severity: ValidationErrorSeverity.NOTICE,
      type: ValidationErrorType.EXPERIMENTAL_FIELDS_NOT_CHECKED,
    },
    typoHint: {
      description: 'Detects common typos, and raises a warning informing on how to correct.',
      message: 'Field "{{typoField}}" is a common typo for "{{actualField}}". Please correct this field to "{{actualField}}".',
      sampleValues: {
        typoField: 'offer',
        actualField: 'offers',
      },
      category: ValidationErrorCategory.CONFORMANCE,
      severity: ValidationErrorSeverity.FAILURE,
      type: ValidationErrorType.FIELD_COULD_BE_TYPO,
    },
    inSchemaOrg: {
      description: 'Raises a notice that fields in the schema.org schema that aren\'t in the OpenActive specification aren\'t checked by the validator.',
      message: 'This field is declared in schema.org but this validator is not yet capable of checking whether they have the right format or values. You should refer to the schema.org documentation for additional guidance.',
      category: ValidationErrorCategory.CONFORMANCE,
      severity: ValidationErrorSeverity.NOTICE,
      type: ValidationErrorType.SCHEMA_ORG_FIELDS_NOT_CHECKED,
    },
    notInSpec: {
      description: 'Raises a warning for fields that aren\'t in the OpenActive specification, and that aren\'t caught by other rules.',
      message: 'This field is not defined in the OpenActive specification.',
      category: ValidationErrorCategory.CONFORMANCE,
      severity: ValidationErrorSeverity.WARNING,
      type: ValidationErrorType.FIELD_NOT_IN_SPEC,
    },
  },
};
```

### `validateModel` and `validateField`

Only one of these methods is expected to be implemented on each rule.

Both methods take the current node in the tree as a parameter, and return an `array` of zero or more `ValidationError`s.

The parameters they accept are:

* `node` - A `ModelNode` object, representing the current place in the object tree. It contains the following properties:
  * `name` - The name of the field that this node has come from. Will be `"$"` if this is the root node.
  * `arrayIndex` - If this object is within an array, this field will contain the array index that it is at.
  * `value` - The value object of the current node.
  * `model` - The model object definition corresponding to this node. Will never be `null`, but could contain no constraints if the model of this node is not known to the library.
  * `options` - A copy of the options passed to the `validate` method.
  * `parentNode` - The `ModelNode` object representing the parent of this node. Will be `null` if this is the root node.
  * `rootNode` - The `ModelNode` object representing the root node. Will be `null` if this is the root node.
* `field` **(validateField only)** - the name of the field that has been selected for validation in this rule.

The `validate*` methods should use the node provided to verify the data conforms to the rules it defines.

If the node does not comply, an error can be raised by calling the `createError` method, inherited from the `Rule` object.

The `createError` method accepts the following parameters:

* `key` - The key of the object defined in `this.meta.tests` that the defines the error that has been triggered.
* `extra` - An object of extra properties to pass to the `ValidationError` constructor. These are typically:
  * `value` - The value of the property that has triggered the error.
  * `path` - The jsonpath to the property that has triggered the error. The full path to the current node can be found by calling `node.getPath()`.
  If you call `node.getPath()` with arguments, these will be appended to the current path.
* `messageValues` - An optional object of parameters to replace in the error message. This **MUST** be provided if the message has placeholders within it.

#### createError Example

```js
this.createError(
  'default',
  {
    value: testValue,
    path: node.getPath(field),
  },
  {
    field,
    model: node.model.type,
  },
);
```

### Adding the rule for processing

#### Adding to the core library

* You should write a test for your rule.
* Add the rule's file, as well as its test file to tsconfig.json's `include` array, so that TypeScript can check for errors.
* Add the rule to the list in `rules/index`, so that it is processed.

#### Adding to your own application

TODO

### Complete Example

```js
const {
  Rule,
  ValidationError,
  ValidationErrorCategory,
  ValidationErrorType,
  ValidationErrorSeverity
} = require('openactive-data-model-validator');

class RequiredFieldsRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.targetValidationModes = '*';
    this.meta = {
      name: 'RequiredFieldsRule',
      description: 'Validates that all required fields are present in the JSON data.',
      tests: {
        default: {
          message: 'Required field "{{field}}" is missing from "{{model}}".',
          sampleValues: {
            field: 'name',
            model: 'Event',
          },
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.MISSING_REQUIRED_FIELD,
        },
      },
    };
  }

  validateModel(node) {
    // Don't do this check for models that we don't actually have a spec for
    if (!node.model.hasSpecification) {
      return [];
    }
    const errors = [];
    for (const field of node.model.requiredFields) {
      const testValue = node.getValueWithInheritance(field);
      if (typeof testValue === 'undefined') {
        errors.push(
          this.createError(
            'default',
            {
              value: testValue,
              path: node.getPath(field),
            },
            {
              field,
              model: node.model.type,
            },
          ),
        );
      }
    }
    return errors;
  }
}
```
