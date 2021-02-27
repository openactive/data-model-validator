const RequiredOptionalFieldsRule = require('./required-optional-fields-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const OptionsHelper = require('../../helpers/options');

describe('RequiredOptionalFieldsRule', () => {
  const model = new Model({
    type: 'Event',
    requiredOptions: [
      {
        description: [
          'While these properties are marked as optional, a data publisher must provide either a schema:startDate or specify a oa:schedule for an event.',
        ],
        options: [
          'startDate',
          'schedule',
        ],
      },
    ],
    validationMode: {
      C1Request: 'request',
      C1Response: 'response',
    },
    imperativeConfiguration: {
      request: {
        requiredOptions: [
          {
            options: [
              'duration',
              'endDate',
            ],
          },
        ],
      },
    },
    imperativeConfigurationWithContext: {
      response: {
        wedding: {
          requiredOptions: [
            {
              options: [
                'church',
                'registerOffice',
              ],
            },
          ],
        },
        dinner: {
          requiredOptions: [
            {
              options: [
                'starter',
                'pudding',
              ],
            },
          ],
        },
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  const rule = new RequiredOptionalFieldsRule();

  const baseInheritanceModel = {
    type: 'Event',
    inSpec: [
      'name',
      'subEvent',
      'superEvent',
    ],
    requiredOptions: [
      {
        description: [
          'While these properties are marked as optional, a data publisher must provide either a name or a description.',
        ],
        options: [
          'name',
          'description',
        ],
      },
    ],
    fields: {
      name: {
        fieldName: 'name',
        requiredType: 'https://schema.org/Text',
      },
      subEvent: {
        fieldName: 'subEvent',
        model: 'ArrayOf#Event',
      },
      superEvent: {
        fieldName: 'superEvent',
        model: '#Event',
      },
    },
  };

  const loadInheritanceModel = () => Object.assign({}, baseInheritanceModel);

  it('should target models of any type', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if required optional fields are present', async () => {
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'Event',
      startDate: '2018-01-27T12:00:00Z',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return no errors if required optional fields are present with a namespace', async () => {
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'Event',
      'schema:startDate': '2018-01-27T12:00:00Z',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a failure per option group if any required optional fields are missing', async () => {
    const data = {
      '@context': 'https://openactive.io/',
      '@type': 'Event',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = await rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    expect(errors[0].path).toBe('$["startDate","schedule"]');
  });

  describe('when validation mode is on with separate required fields', () => {
    const options = new OptionsHelper({ validationMode: 'C1Request' });
    it('should return no errors if required optional fields are present', async () => {
      const data = {
        '@type': 'Event',
        endDate: '2018-01-27T12:00:00Z',
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    });

    it('should return a failure per option group if any required optional fields are missing', async () => {
      const data = {
        '@type': 'Event',
        startDate: '2018-01-27T12:00:00Z',
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);

      expect(errors[0].type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
      expect(errors[0].path).toBe('$["duration","endDate"]');
    });
  });

  describe('when there is a context-specific imperative config', () => {
    const options = new OptionsHelper({ validationMode: 'C1Response' });

    it('should return no errors if required optional fields are present', async () => {
      const data = {
        '@type': 'Event',
        church: 'Holy Trinity',
      };

      const nodeToTest = new ModelNode(
        'wedding',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    });

    it('should return a failure per option group if any required optional fields are missing', async () => {
      const data = {
        '@type': 'Event',
      };

      const nodeToTest = new ModelNode(
        'wedding',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);

      expect(errors[0].type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
      expect(errors[0].path).toBe('$.wedding["church","registerOffice"]');
    });
  });

  describe('with inheritsTo properties', () => {
    it('should respect required optional fields when inheritsTo is *', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = '*';
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        '@type': 'Event',
        subEvent: [{
          '@type': 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = await rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(0);
    });
    it('should respect required optional fields when inheritsTo is set to include', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        include: ['name'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        '@type': 'Event',
        subEvent: [{
          '@type': 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = await rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(0);
    });
    it('should respect required optional fields when inheritsTo is set to include (but not the field we want)', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        include: ['id'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        '@type': 'Event',
        subEvent: [{
          '@type': 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = await rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(1);
    });
    it('should respect required optional fields when inheritsTo is set to exclude', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        exclude: ['name'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        '@type': 'Event',
        subEvent: [{
          '@type': 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = await rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(1);
    });
    it('should respect required optional fields when inheritsTo is set to exclude (but not the field we want)', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        exclude: ['id'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        '@type': 'Event',
        subEvent: [{
          '@type': 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = await rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(0);
    });
  });

  describe('with inheritsFrom properties', () => {
    it('should respect required optional fields when inheritsFrom is *', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = '*';
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        '@type': 'Event',
        superEvent: {
          '@type': 'Event',
          name: 'Test Event',
        },
      };

      // Test the top-level node first
      // The superEvent should be inherited, and not error
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = await rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
    it('should respect required optional fields when inheritsFrom is set to include', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        include: ['name'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        '@type': 'Event',
        superEvent: {
          '@type': 'Event',
          name: 'Test Event',
        },
      };

      // Test the top-level node first
      // The superEvent should be inherited, and not error
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down - should be fine
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = await rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
    it('should respect required optional fields when inheritsFrom is set to include (but not the field we want)', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        include: ['id'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        '@type': 'Event',
        superEvent: {
          '@type': 'Event',
          name: 'Test Event',
        },
      };

      // Test the top-level node first
      // The superEvent should not be inherited, so should error
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(1);

      // Test the next node down should be fine
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = await rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
    it('should respect required optional fields when inheritsFrom is set to exclude', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        exclude: ['name'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        '@type': 'Event',
        superEvent: {
          '@type': 'Event',
          name: 'Test Event',
        },
      };

      // Test the top-level node first
      // The superEvent should not be inherited by the parent node, and error
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(1);

      // Test the next node down
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = await rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
    it('should respect required optional fields when inheritsFrom is set to exclude (but not the field we want)', async () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        exclude: ['id'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        '@type': 'Event',
        superEvent: {
          '@type': 'Event',
          name: 'Test Event',
        },
      };

      // Test the top-level node first, it should inherit the superEvent
      // node name, and not error
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = await rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The superEvent should be fine
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = await rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
  });
});
