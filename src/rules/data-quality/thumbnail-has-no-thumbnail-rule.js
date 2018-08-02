const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class ThumbnailHasNoThumbnailRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = ['ImageObject'];
    this.meta = {
      name: 'ThumbnailHasNoThumbnailRule',
      description: 'Validates that a thumbnail of an ImageObject does not have its own thumbnail.',
      tests: {
        default: {
          message: 'The thumbnail of an ImageObject cannot have its own thumbnail.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.THUMBNAIL_HAS_NO_THUMBNAIL,
        },
      },
    };
  }

  validateModel(node) {
    if (
      !node.hasMappedField('thumbnail')
      || node.parentNode === null
      || node.parentNode.model.type !== 'ImageObject'
    ) {
      return [];
    }
    const errors = [
      this.createError(
        'default',
        {
          value: node.getValue('thumbnail'),
          path: node.getPath(node.getMappedFieldName('thumbnail')),
        },
      ),
    ];

    return errors;
  }
};
