const FieldsCorrectTypeRule = require('./fields-correct-type-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('FieldsCorrectTypeRule', () => {
  const rule = new FieldsCorrectTypeRule();

  it('should target fields of any type', () => {
    const model = new Model({
      type: 'Event',
    });
    const isTargeted = rule.isFieldTargeted(model, 'type');
    expect(isTargeted).toBe(true);
  });

  // Single types
  // Boolean
  it('should return no error for an valid boolean type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Boolean',
        },
      },
    });
    model.hasSpecification = true;
    const data = {
      field: true,
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
  it('should return an error for an invalid boolean type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Boolean',
        },
      },
    });
    model.hasSpecification = true;
    const data = {
      field: 'true',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.INVALID_TYPE);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });

  // Float
  it('should return no error for an valid float type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Float',
        },
        field2: {
          fieldName: 'field2',
          requiredType: 'http://schema.org/Float',
        },
        field3: {
          fieldName: 'field3',
          requiredType: 'http://schema.org/Float',
        },
      },
    });
    model.hasSpecification = true;
    const data = {
      field: 3.45,
      field2: 3,
      field3: 3e-5,
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
  it('should return an error for an invalid float type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Float',
        },
        field2: {
          fieldName: 'field2',
          requiredType: 'http://schema.org/Float',
        },
        field3: {
          fieldName: 'field3',
          requiredType: 'http://schema.org/Float',
        },
      },
    });
    model.hasSpecification = true;
    const data = {
      field: 'true',
      field2: {},
      field3: '3.45',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(3);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // Integer
  it('should return no error for an valid integer type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Integer',
        },
        field2: {
          fieldName: 'field2',
          requiredType: 'http://schema.org/Integer',
        },
        field3: {
          fieldName: 'field3',
          requiredType: 'http://schema.org/Integer',
        },
      },
    });
    model.hasSpecification = true;
    const data = {
      field: 3,
      field2: 3e5,
      field3: 30e-1,
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
  it('should return an error for an invalid integer type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Integer',
        },
        field2: {
          fieldName: 'field2',
          requiredType: 'http://schema.org/Integer',
        },
        field3: {
          fieldName: 'field3',
          requiredType: 'http://schema.org/Integer',
        },
      },
    });
    model.hasSpecification = true;
    const data = {
      field: '3',
      field2: {},
      field3: 3e-1,
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );

    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(3);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // url
  it('should return no error for an valid url type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/url',
        },
      },
    });
    model.hasSpecification = true;
    const values = [
      'http://example.com',
      'http://example.com/blah_blah',
      'http://example.com/blah_blah/',
      'https://www.example.com/test#fragment',
      'http://142.42.1.1/',
      'http://142.42.1.1:8080/',
      'http://مثال.إختبار',
      'http://a.b-c.de',
      'https://www.example.com/foo/?bar=baz&inga=42&quux',
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid url type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/url',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      'http://10.1.1.1',
      'http://1.1.1.1.1',
      'http://127.0.0.1',
      'http://localhost/',
      true,
      27,
      {},
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // Date
  it('should return no error for an valid date type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Date',
        },
      },
    });
    model.hasSpecification = true;
    const values = [
      '20170512',
      '2018-05-13',
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid date type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Date',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      'http://www.example.com',
      true,
      27,
      {},
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // DateTime
  it('should return no error for an valid datetime type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/DateTime',
        },
      },
    });
    model.hasSpecification = true;
    const values = [
      '2017-05-12T09:00:00Z',
      '2018-05-13T09:00:00+01:00',
      '2018-05-13T09:00:00',
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid datetime type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/DateTime',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      '2018-07-01',
      'http://www.example.com',
      true,
      27,
      {},
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // Duration
  it('should return no error for an valid duration type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Duration',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      'PT30M',
      'P1YT5M',
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid duration type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Duration',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      '2018-07-01',
      'http://www.example.com',
      true,
      27,
      {},
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // Text
  it('should return no error for an valid text type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Text',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      'PT30M',
      'http://example.com',
      '2018-01-01',
      '2017-05-12T09:00:00Z',
      'Lorem ipsum',
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid text type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Text',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      true,
      27,
      {},
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // Model
  it('should return no error for an valid model type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          model: '#Schedule',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      {
        type: 'Schedule',
      },
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid model type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/Text',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      true,
      27,
      {},
      {
        type: 'Person',
      },
      [
        {
          type: 'Schedule',
        },
      ],
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
  it('should return no error for an invalid flexible model type', () => {
    const model = new Model({
      type: 'Place',
      fields: {
        amenityFeature: {
          fieldName: 'amenityFeature',
          model: '#LocationFeatureSpecification',
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      {
        type: 'Place',
        amenityFeature: [
          {
            type: 'ext:MyLocation',
            value: true,
            name: 'My Location',
          },
        ],
      },
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });

  // ArrayOf
  it('should return no error for an valid array type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        integer_array: {
          fieldName: 'integer_array',
          requiredType: 'ArrayOf#http://schema.org/Integer',
        },
        float_array: {
          fieldName: 'float_array',
          requiredType: 'ArrayOf#http://schema.org/Float',
        },
        boolean_array: {
          fieldName: 'boolean_array',
          requiredType: 'ArrayOf#http://schema.org/Boolean',
        },
        url_array: {
          fieldName: 'url_array',
          requiredType: 'ArrayOf#http://schema.org/url',
        },
        date_array: {
          fieldName: 'date_array',
          requiredType: 'ArrayOf#http://schema.org/Date',
        },
        datetime_array: {
          fieldName: 'datetime_array',
          requiredType: 'ArrayOf#http://schema.org/DateTime',
        },
        duration_array: {
          fieldName: 'duration_array',
          requiredType: 'ArrayOf#http://schema.org/Duration',
        },
        text_array: {
          fieldName: 'text_array',
          requiredType: 'ArrayOf#http://schema.org/Text',
        },
        model_array: {
          fieldName: 'model_array',
          model: 'ArrayOf#Schedule',
        },
      },
    });
    model.hasSpecification = true;

    const data = {
      integer_array: [
        1,
        2,
      ],
      float_array: [
        1.3,
        2,
      ],
      boolean_array: [
        true,
        false,
      ],
      url_array: [
        'http://www.example.com',
        'https://8.8.8.8/',
      ],
      date_array: [
        '2018-01-01',
        '2019-01-01',
      ],
      datetime_array: [
        '2017-05-12T09:00:00Z',
        '2018-05-13T09:00:00+01:00',
        '2018-05-13T09:00:00',
      ],
      duration_array: [
        'PT30M',
        'P1YT5M',
      ],
      text_array: [
        'PT30M',
        'http://example.com',
        '2018-01-01',
        '2017-05-12T09:00:00Z',
        'Lorem ipsum',
      ],
      model_array: [
        {
          type: 'Schedule',
        },
        {
          type: 'Schedule',
        },
      ],
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
  it('should return an error for an invalid array type', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        integer_array: {
          fieldName: 'integer_array',
          requiredType: 'ArrayOf#http://schema.org/Integer',
        },
        float_array: {
          fieldName: 'float_array',
          requiredType: 'ArrayOf#http://schema.org/Float',
        },
        boolean_array: {
          fieldName: 'boolean_array',
          requiredType: 'ArrayOf#http://schema.org/Boolean',
        },
        url_array: {
          fieldName: 'integer_array',
          requiredType: 'ArrayOf#http://schema.org/url',
        },
        date_array: {
          fieldName: 'float_array',
          requiredType: 'ArrayOf#http://schema.org/Date',
        },
        datetime_array: {
          fieldName: 'boolean_array',
          requiredType: 'ArrayOf#http://schema.org/DateTime',
        },
        duration_array: {
          fieldName: 'integer_array',
          requiredType: 'ArrayOf#http://schema.org/Duration',
        },
        text_array: {
          fieldName: 'float_array',
          requiredType: 'ArrayOf#http://schema.org/Text',
        },
        model_array: {
          fieldName: 'boolean_array',
          model: 'ArrayOf#Schedule',
        },
      },
    });
    model.hasSpecification = true;

    const data = {
      integer_array: [
        1.3,
        2.4,
      ],
      float_array: [
        true,
        false,
      ],
      boolean_array: [
        'http://www.example.com',
        'https://8.8.8.8/',
      ],
      url_array: [
        '2018-01-01',
        '2019-01-01',
      ],
      date_array: [
        '2017-05-12T09:00:00Z',
        '2018-05-13T09:00:00+01:00',
        '2018-05-13T09:00:00',
      ],
      datetime_array: [
        'PT30M',
        'P1YT5M',
      ],
      duration_array: [
        'http://example.com',
        '2018-01-01',
        '2017-05-12T09:00:00Z',
        'Lorem ipsum',
      ],
      text_array: [
        9,
        true,
        {},
      ],
      model_array: [
        {
          type: 'Person',
        },
        {
          type: 'Person',
        },
      ],
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(9);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });

  // Multiple rules
  it('should return no error for an valid type with multiple rules', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/url',
          model: '#Schedule',
          alternativeTypes: [
            'http://schema.org/DateTime',
          ],
          alternativeModels: [
            'ArrayOf#Person',
          ],
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      {
        type: 'Schedule',
      },
      [
        {
          type: 'Person',
        },
      ],
      'http://example.com/',
      '2018-01-01T09:00:00',
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(0);
    }
  });
  it('should return an error for an invalid type with multiple rules', () => {
    const model = new Model({
      type: 'Event',
      fields: {
        field: {
          fieldName: 'field',
          requiredType: 'http://schema.org/url',
          model: '#Schedule',
          alternativeTypes: [
            'http://schema.org/DateTime',
          ],
          alternativeModels: [
            'ArrayOf#Person',
          ],
        },
      },
    });
    model.hasSpecification = true;

    const values = [
      true,
      27,
      {},
      {
        type: 'Person',
      },
      [
        {
          type: 'Schedule',
        },
      ],
    ];

    for (const value of values) {
      const data = {
        field: value,
      };
      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
      );
      const errors = rule.validate(nodeToTest);
      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.INVALID_TYPE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
