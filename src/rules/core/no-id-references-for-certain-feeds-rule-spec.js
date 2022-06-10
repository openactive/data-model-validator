const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const OptionsHelper = require('../../helpers/options');
const NoIdReferencesForCertainFeedsRule = require('./no-id-references-for-certain-feeds-rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('NoIdReferencesForCertainFeedsRule', () => {
  const rule = new NoIdReferencesForCertainFeedsRule();

  describe('for kind ScheduledSessions.SessionSeries feeds', () => {
    const model = new Model({
      type: 'ScheduledSession',
      validationMode: {
        RPDEFeed: 'feed',
        BookableRPDEFeed: 'feed',
      },
      rpdeKind: [
        'ScheduledSession',
        'ScheduledSession.SessionSeries',
      ],
      imperativeConfigurationWithContext: {
        feed: {
          ScheduledSession: {
            referencedFields: [
              'superEvent',
            ],
          },
          'ScheduledSession.SessionSeries': {
            shallNotBeReferencedFields: [
              'superEvent',
            ],
          },
        },
      },
      imperativeConfiguration: {
        feed: {},
      },
    }, 'latest');
    model.hasSpecification = true;

    it('should validate that superEvent within the ScheduledSession is a not an ID reference, but an object', async () => {
      const options = new OptionsHelper({ validationMode: 'RPDEFeed', rpdeKind: 'ScheduledSession.SessionSeries' });

      const data = {
        '@context': 'https://openactive.io/',
        '@type': 'ScheduledSession',
        superEvent: {
          '@id': 'https://example.com/item/2',
        },
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(0);
    });
    it('should error when superEvent within the ScheduledSession is not an object but an ID reference', async () => {
      const options = new OptionsHelper({ validationMode: 'RPDEFeed', rpdeKind: 'ScheduledSession.SessionSeries' });

      const data = {
        '@context': 'https://openactive.io/',
        '@type': 'ScheduledSession',
        superEvent: 'https://example.com/item/2',
      };

      const nodeToTest = new ModelNode(
        '$',
        data,
        null,
        model,
        options,
      );
      const errors = await rule.validate(nodeToTest);

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.FIELD_SHOUlD_NOT_BE_ID_REFERENCE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    });
  });
});
