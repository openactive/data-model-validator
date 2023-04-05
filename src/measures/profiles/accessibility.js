const ValidationErrorType = require('../../errors/validation-error-type');

module.exports = {
  name: 'Accessibility',
  identifier: 'accessibility',
  measures: [
    {
      name: 'Has accessibilitySupport',
      exclusions: [ // Logic: if no errors are present for any of the paths (paths are matched with endsWith)
        {
          errorType: [
            ValidationErrorType.MISSING_RECOMMENDED_FIELD,
          ],
          targetPaths: [
            /\.accessibilitySupport/,
          ],
        },
      ],
    },
  ],
};
