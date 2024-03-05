const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');
const { SelfIndexingObject } = require('../../helpers/self-indexing-object');

const TEST_KEYS = SelfIndexingObject.create(/** @type {const} */([
  'githubButNotIssues',
  'unrecognisedFormat',
]));

module.exports = class DiscussionUrlShouldPointToRecognisedDiscussionBoardRule extends Rule {
  constructor(options) {
    super(options);
    this.targetFields = {
      Dataset: ['discussionUrl'],
    };
    this.meta = {
      name: 'DiscussionUrlShouldPointToRecognisedDiscussionBoardRule',
      description: 'Validates that the `discussionUrl` property points to a recognised discussion board.',
      tests: {
        [TEST_KEYS.githubButNotIssues]: {
          message: 'If `discussionUrl` points to GitHub, it should be to the project\'s /issues page e.g. `https://github.com/openactive/OpenActive.Server.NET/issues`.',
          category: ValidationErrorCategory.DATA_QUALITY,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.INVALID_FORMAT,
        },
        [TEST_KEYS.unrecognisedFormat]: {
          message: 'The `discussionUrl` property does not point to a recognised discussion board. Currently recognised discussion board formats: `https://github.com/<ORG>/<REPO>/issues`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.WARNING,
          type: ValidationErrorType.INVALID_FORMAT,
        },
      },
    };
  }

  /**
   * @param {import('../../classes/model-node').ModelNodeType} node
   * @param {string} field
   */
  async validateField(node, field) {
    const discussionUrlRaw = node.getValue(field);
    const discussionUrl = new URL(discussionUrlRaw);
    if (discussionUrl.hostname === 'github.com') {
      return this.validateGitHubUrl(discussionUrl, node, field);
    }
    return [
      this.createError(
        TEST_KEYS.unrecognisedFormat,
        {
          value: node.getValue(field),
          path: node.getPath(field),
        },
      ),
    ];
  }

  /**
   * @param {URL} discussionUrl
   * @param {import('../../classes/model-node').ModelNodeType} node
   * @param {string} field
   */
  validateGitHubUrl(discussionUrl, node, field) {
    const isGhIssuesUrl = discussionUrl.pathname.endsWith('/issues');
    if (isGhIssuesUrl) {
      return [];
    }
    return [
      this.createError(
        TEST_KEYS.githubButNotIssues,
        {
          value: node.getValue(field),
          path: node.getPath(field),
        },
      ),
    ];
  }
};
