const DiscussionUrlShouldPointToRecognisedDiscussionBoardRule = require('./discussion-url-should-point-to-recognised-discussion-board-rule');
const ModelNode = require('../../classes/model-node');
const Model = require('../../classes/model');
const DataModelHelper = require('../../helpers/data-model');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('DiscussionUrlShouldPointToRecognisedDiscussionBoardRule', () => {
  const rule = new DiscussionUrlShouldPointToRecognisedDiscussionBoardRule();

  const model = new Model(
    DataModelHelper.loadModel('Dataset', 'latest'),
    'latest',
    true,
  );

  it('should target Dataset discussionUrl', () => {
    const isTargeted = rule.isFieldTargeted(model, 'discussionUrl');
    expect(isTargeted).toBe(true);
  });

  it('should return no error when discussionUrl points to a GitHub repo\'s /issues', async () => {
    const nodeToTest = new ModelNode('$', {
      discussionUrl: 'https://github.com/openactive/openactive-test-suite/issues',
    }, null, model);
    const errors = await rule.validate(nodeToTest);
    expect(errors).toHaveSize(0);
  });

  it('should return an error when discussionUrl points to a GitHub repo but not to /issues', async () => {
    const nodeToTest = new ModelNode('$', {
      discussionUrl: 'https://github.com/openactive/openactive-test-suite',
    }, null, model);
    const errors = await rule.validate(nodeToTest);
    expect(errors).toHaveSize(1);
    expect(errors[0].rule).toEqual('DiscussionUrlShouldPointToRecognisedDiscussionBoardRule');
    expect(errors[0].category).toEqual(ValidationErrorCategory.DATA_QUALITY);
    expect(errors[0].type).toEqual(ValidationErrorType.INVALID_FORMAT);
    expect(errors[0].severity).toEqual(ValidationErrorSeverity.FAILURE);
  });

  it('should return a warning when discussionUrl points to an unrecognised place', async () => {
    const nodeToTest = new ModelNode('$', {
      discussionUrl: 'https://example.com/some-place',
    }, null, model);
    const errors = await rule.validate(nodeToTest);
    expect(errors).toHaveSize(1);
    expect(errors[0].rule).toEqual('DiscussionUrlShouldPointToRecognisedDiscussionBoardRule');
    expect(errors[0].category).toEqual(ValidationErrorCategory.CONFORMANCE);
    expect(errors[0].type).toEqual(ValidationErrorType.INVALID_FORMAT);
    expect(errors[0].severity).toEqual(ValidationErrorSeverity.WARNING);
  });
});
