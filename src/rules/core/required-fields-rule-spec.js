

const RequiredFieldsRule = require('./required-fields-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('RequiredFieldsRule', () => {
  const model = new Model({
    type: 'Event',
    requiredFields: [
      '@context',
      'activity',
      'location',
    ],
  });
  model.hasSpecification = true;

  const rule = new RequiredFieldsRule();

  const baseInheritanceModel = {
    type: 'Event',
    inSpec: [
      'name',
      'subEvent',
      'superEvent',
    ],
    requiredFields: [
      'name',
    ],
    fields: {
      name: {
        fieldName: 'name',
        requiredType: 'http://schema.org/Text',
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

  it('should return no errors if all required fields are present', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
      type: 'Event',
      'oa:activity': {
        id: 'https://example.com/reference/activities#Speedball',
        inScheme: 'https://example.com/reference/activities',
        prefLabel: 'Speedball',
        type: 'Concept',
      },
      location: {
        address: {
          addressLocality: 'New Malden',
          addressRegion: 'London',
          postalCode: 'NW5 3DU',
          streetAddress: 'Raynes Park High School, 46A West Barnes Lane',
          type: 'PostalAddress',
        },
        description: 'Raynes Park High School in London',
        geo: {
          latitude: 51.4034423828125,
          longitude: -0.2369088977575302,
          type: 'GeoCoordinates',
        },
        id: 'https://example.com/locations/1234ABCD',
        identifier: '1234ABCD',
        name: 'Raynes Park High School',
        telephone: '01253 473934',
        type: 'Place',
      },
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

  it('should return a failure per field if any required fields are missing', () => {
    const data = {
      '@context': 'https://www.openactive.io/ns/oa.jsonld',
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
      expect(error.type).toBe(ValidationErrorType.MISSING_REQUIRED_FIELD);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  describe('with inheritsTo properties', () => {
    it('should respect required fields when inheritsTo is *', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = '*';
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsTo is set to include', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        include: ['name'],
      };
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsTo is set to include (but not the field we want)', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        include: ['id'],
      };
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsTo is set to exclude', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        exclude: ['name'],
      };
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsTo is set to exclude (but not the field we want)', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.subEvent.inheritsTo = {
        exclude: ['id'],
      };
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsFrom is *', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = '*';
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsFrom is set to include', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        include: ['name'],
      };
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsFrom is set to include (but not the field we want)', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        include: ['id'],
      };
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsFrom is set to exclude', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        exclude: ['name'],
      };
      const inheritanceModel = new Model(modelObj);
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
    it('should respect required fields when inheritsFrom is set to exclude (but not the field we want)', () => {
      const modelObj = loadInheritanceModel();
      modelObj.fields.superEvent.inheritsFrom = {
        exclude: ['id'],
      };
      const inheritanceModel = new Model(modelObj);
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
