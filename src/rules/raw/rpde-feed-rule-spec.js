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

  it('should return no notices for input that isn\'t an RPDE feed', async () => {
    const data = {
      type: 'Event',
    };

    const { errors } = await rule.validateAsync(data);
    expect(errors.length).toBe(0);
  });

  it('should return a notice for an RPDE feed', async () => {
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

    const { errors } = await rule.validateAsync(data);
    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.FOUND_RPDE_FEED);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.NOTICE);
  });

  it('should return a notice for an RPDE feed, and modify the data with a limit to the number of items', async () => {
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

    const { data, errors } = await ruleWithOptions.validateAsync(feed);
    expect(errors.length).toBe(1);

    expect(errors[0].type).toBe(ValidationErrorType.FOUND_RPDE_FEED);
    expect(errors[0].severity).toBe(ValidationErrorSeverity.NOTICE);
    expect(errors[0].message).toContain('first 2 items');

    expect(data.items.length).toBe(2);
  });
});
