const RpdeFeedRule = require('./rpde-feed-rule');
const OptionsHelper = require('../../helpers/options');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('RpdeFeedRule', () => {
  const rule = new RpdeFeedRule();

  it('should not target any model or field', () => {
    expect(rule.isModelTargeted()).toBe(false);
    expect(rule.isFieldTargeted()).toBe(false);
  });

  it('should return no notices for input that isn\'t an RPDE feed', () => {
    const data = {
      type: 'Event',
    };

    const { errors } = rule.validate(data);
    expect(errors.length).toBe(0);
  });

  it('should return a notice for an RPDE feed', () => {
    const data = {
      items: [
        {
          id: 'ABCDEF09001015',
          kind: 'session',
          state: 'updated',
          data: {
            type: 'Event',
          },
          modified: 1533177378657,
        },
      ],
      next: 'https://example.org/api/feed/?afterId=ABCDEF09001015&afterTimestamp=1533206202992&limit=500',
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };

    const { errors } = rule.validate(data);
    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.FOUND_RPDE_FEED);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.NOTICE);
  });

  it('should return a notice for an RPDE feed, and modify the data with a limit to the number of items', () => {
    const feed = {
      items: [
        {
          id: 'ABCDEF09001015',
          kind: 'session',
          state: 'updated',
          data: {
            type: 'Event',
          },
          modified: 1533177378657,
        },
        {
          id: 'ABCDEF09001015',
          kind: 'session',
          state: 'updated',
          data: {
            type: 'Event',
          },
          modified: 1533177378657,
        },
        {
          id: 'ABCDEF09001015',
          kind: 'session',
          state: 'updated',
          data: {
            type: 'Event',
          },
          modified: 1533177378657,
        },
      ],
      next: 'https://example.org/api/feed/?afterId=ABCDEF09001015&afterTimestamp=1533206202992&limit=500',
      license: 'https://creativecommons.org/licenses/by/4.0/',
    };

    const options = new OptionsHelper({
      rpdeItemLimit: 2,
    });
    const ruleWithOptions = new RpdeFeedRule(options);

    const { data, errors } = ruleWithOptions.validate(feed);
    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.FOUND_RPDE_FEED);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.NOTICE);
    expect(errors[0].message).toBe('The JSON you have submitted appears to be an RPDE feed. For performance reasons, the validator has only checked the first 2 items in this feed. Please note that validation on RPDE feeds is limited to checking whether required fields are present, and that the data in each item is a valid data model.');

    expect(data.items.length).toBe(2);
  });
});
