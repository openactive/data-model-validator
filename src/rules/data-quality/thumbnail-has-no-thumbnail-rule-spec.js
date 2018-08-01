const ThumbnailHasNoThumbnailRule = require('./thumbnail-has-no-thumbnail-rule');
const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('ThumbnailHasNoThumbnailRule', () => {
  const rule = new ThumbnailHasNoThumbnailRule();

  const model = new Model({
    type: 'ImageObject',
    fields: {
      thumbnail: {
        fieldName: 'thumbnail',
        model: 'ArrayOf#ImageObject',
      },
    },
  });

  it('should target ImageObject models', () => {
    const isTargeted = rule.isModelTargeted(model);
    expect(isTargeted).toBe(true);
  });

  it('should return no error when a ImageObject\'s parent is not an ImageObject', () => {
    const data = {
      type: 'ImageObject',
      thumbnail: [
        {
          type: 'ImageObject',
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
  it('should return no error when a ImageObject\'s parent is an ImageObject, but it doesn\'t have a thumbnail', () => {
    const parentData = {
      type: 'ImageObject',
      thumbnail: [
        {
          type: 'ImageObject',
        },
      ],
    };

    const data = {
      type: 'ImageObject',
    };

    const parentNode = new ModelNode(
      '$',
      parentData,
      null,
      model,
    );

    const nodeToTest = new ModelNode(
      '$',
      data,
      parentNode,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(0);
  });
  it('should return an error when a ImageObject\'s parent is an ImageObject, and it has a thumbnail', () => {
    const parentData = {
      type: 'ImageObject',
      thumbnail: [
        {
          type: 'ImageObject',
          thumbnail: [
            {
              type: 'ImageObject',
            },
          ],
        },
      ],
    };

    const data = {
      type: 'ImageObject',
      thumbnail: [
        {
          type: 'ImageObject',
        },
      ],
    };

    const parentNode = new ModelNode(
      '$',
      parentData,
      null,
      model,
    );

    const nodeToTest = new ModelNode(
      '$',
      data,
      parentNode,
      model,
    );
    const errors = rule.validate(nodeToTest);
    expect(errors.length).toBe(1);
    expect(errors[0].type).toBe(ValidationErrorType.THUMBNAIL_HAS_NO_THUMBNAIL);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
  });
});
