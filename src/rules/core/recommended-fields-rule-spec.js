const RecommendedFieldsRule = require('./recommended-fields-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const ValidationMode = require('../../helpers/validation-mode');
const OptionsHelper = require('../../helpers/options');

describe('RecommendedFieldsRule', () => {
  const model = new Model({
    type: 'Event',
    recommendedFields: [
      'description',
      'name',
    ],
    validationMode: {
      C1Request: 'request',
    },
    imperativeConfiguration: {
      request: {
        recommendedFields: [
          'duration',
        ],
      },
    },
  }, 'latest');
  model.hasSpecification = true;

  const baseInheritanceModel = {
    type: 'Event',
    inSpec: [
      'name',
      'subEvent',
      'superEvent',
    ],
    recommendedFields: [
      'name',
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

  const rule = new RecommendedFieldsRule();

  it('should target models of any type', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if all recommended fields are present', () => {
    const data = {
      '@context': 'https://openactive.io/',
      type: 'Event',
      name: 'Tai chi Class',
      'schema:description': 'A class about Tai Chi',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return a warning per field if any recommended fields are missing', () => {
    const data = {
      '@context': 'https://openactive.io/',
      type: 'Event',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(2);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MISSING_RECOMMENDED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
    }
  });

  describe('when validation mode is on with separate required fields', () => {
    const options = new OptionsHelper({ validationMode: ValidationMode.C1Request });

    it('should return no errors if all required fields are present', () => {
      const data = {
        type: 'Event',
        duration: 'PT1H30M',
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
        options,
      );
      const errors = rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    });

    it('should return a warning per field if any required fields are missing', () => {
      const data = {
        type: 'Event',
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
        options,
      );
      const errors = rule.validate(nodeToTest);

      expect(errors.length).toBe(1);

      for (const error of errors) {
        expect(error.type).toBe(ValidationErrorType.MISSING_RECOMMENDED_FIELD);
        expect(error.severity).toBe(ValidationErrorSeverity.WARNING);
      }
    });
  });

  describe('with inheritsTo properties', () => {
    it('should respect recommended fields when inheritsTo is *', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = '*';
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        type: 'Event',
        subEvent: [{
          type: 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(0);
    });
    it('should respect recommended fields when inheritsTo is set to include', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        include: ['name'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        type: 'Event',
        subEvent: [{
          type: 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(0);
    });
    it('should respect recommended fields when inheritsTo is set to include (but not the field we want)', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        include: ['id'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        type: 'Event',
        subEvent: [{
          type: 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(1);
    });
    it('should respect recommended fields when inheritsTo is set to exclude', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        exclude: ['name'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        type: 'Event',
        subEvent: [{
          type: 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(1);
    });
    it('should respect recommended fields when inheritsTo is set to exclude (but not the field we want)', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        exclude: ['id'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        name: 'Test Event',
        type: 'Event',
        subEvent: [{
          type: 'Event',
        }],
      };

      // Test the top-level node first
      const rootNodeToTest = new ModelNode(
        '$',
        data,
        null,
        inheritanceModel,
      );
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The subEvent should inherit the parent node name, and not error
      const subEventNodeToTest = new ModelNode(
        'subEvent',
        data.subEvent[0],
        rootNodeToTest,
        inheritanceModel,
      );
      const subEventErrors = rule.validate(subEventNodeToTest);
      expect(subEventErrors.length).toBe(0);
    });
  });

  describe('with inheritsFrom properties', () => {
    it('should respect recommended fields when inheritsFrom is *', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = '*';
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        type: 'Event',
        superEvent: {
          type: 'Event',
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
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
    it('should respect recommended fields when inheritsFrom is set to include', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        include: ['name'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        type: 'Event',
        superEvent: {
          type: 'Event',
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
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down - should be fine
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
    it('should respect recommended fields when inheritsFrom is set to include (but not the field we want)', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        include: ['id'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        type: 'Event',
        superEvent: {
          type: 'Event',
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
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(1);

      // Test the next node down should be fine
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
    it('should respect recommended fields when inheritsFrom is set to exclude', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        exclude: ['name'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        type: 'Event',
        superEvent: {
          type: 'Event',
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
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(1);

      // Test the next node down
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
    it('should respect recommended fields when inheritsFrom is set to exclude (but not the field we want)', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        exclude: ['id'],
      };
      const inheritanceModel = new Model(modelObj, 'latest');
      inheritanceModel.hasSpecification = true;
      const data = {
        type: 'Event',
        superEvent: {
          type: 'Event',
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
      const rootErrors = rule.validate(rootNodeToTest);
      expect(rootErrors.length).toBe(0);

      // Test the next node down
      // The superEvent should be fine
      const superEventNodeToTest = new ModelNode(
        'superEvent',
        data.superEvent,
        rootNodeToTest,
        inheritanceModel,
      );
      const superEventErrors = rule.validate(superEventNodeToTest);
      expect(superEventErrors.length).toBe(0);
    });
  });
});
