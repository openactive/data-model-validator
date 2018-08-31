const ScheduledSessionMustBeSubeventRule = require('./scheduled-session-must-be-subevent-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ScheduledSessionMustBeSubeventRule', () => {
  let model;
  let rule;

  beforeEach(() => {
    model = new Model({
      type: 'ScheduledSession',
      inSpec: [
        'type',
      ],
    }, 'latest');
    rule = new ScheduledSessionMustBeSubeventRule();
  });

  it('should target ScheduledSession models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no errors if the ScheduledSession is a subEvent of another Event', () => {
    const data = {
      type: 'ScheduledSession',
    };

    const nodeToTest = new ModelNode(
      'subEvent',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(0);
  });

  it('should return an error if the ScheduledSession is not a subEvent of another Event', () => {
    const data = {
      type: 'ScheduledSession',
    };

    const nodeToTest = new ModelNode(
      '$',
      data,
      null,
      model,
    );
    const errors = rule.validate(nodeToTest);

    expect(errors.length).toBe(1);

    for (const error of errors) {
      expect(error.type).toBe(ValidationErrorType.MODEL_MUST_BE_CHILD);
      expect(error.severity).toBe(ValidationErrorSeverity.FAILURE);
    }
  });
});
