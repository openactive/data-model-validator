const Model = require('../../classes/model');
const ModelNode = require('../../classes/model-node');
const OptionsHelper = require('../../helpers/options');
const { IdReferencesForFeedsRule } = require('./id-references-for-feeds-rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

describe('IdReferencesForFeedsRule', () => {
  const rule = new IdReferencesForFeedsRule();

  describe('for kind FacilityUse/Slot or IndividualFacilityUse/Slot feeds', () => {
    const model = new Model({
      type: 'Slot',
      validationMode: {
        RPDEFeed: 'feed',
        BookableRPDEFeed: 'feed',
      },
      rpdeKind: [
        'FacilityUse/Slot',
        'IndividualFacilityUse/Slot',
      ],
      imperativeConfigurationWithContext: {
        feed: {
          'FacilityUse/Slot': {
            referencedFields: [
              'facilityUse',
            ],
          },
          'IndividualFacilityUse/Slot': {
            referencedFields: [
              'facilityUse',
            ],
          },
        },
      },
      imperativeConfiguration: {
        feed: {},
      },
    }, 'latest');
    model.hasSpecification = true;
    it('should validate that facilityUse within the Slot is a ID reference, and not an object', async () => {
      const options = new OptionsHelper({ validationMode: 'RPDEFeed', rpdeKind: 'FacilityUse/Slot' });

      const data = {
        '@context': 'https://openactive.io/',
        '@type': 'Slot',
        facilityUse: 'https://example.com/item/2',
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
    it('should error when the facilityUse within the Slot is an object not an ID reference', async () => {
      const options = new OptionsHelper({ validationMode: 'RPDEFeed', rpdeKind: 'FacilityUse/Slot' });

      const data = {
        '@context': 'https://openactive.io/',
        '@type': 'Slot',
        facilityUse: {
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

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_ID_REFERENCE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    });
  });
  describe('for kind ScheduledSessions feeds', () => {
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
        },
      },
      imperativeConfiguration: {
        feed: {},
      },
    }, 'latest');
    model.hasSpecification = true;

    it('should validate that superEvent within the ScheduledSession is a ID reference, and not an object', async () => {
      const options = new OptionsHelper({ validationMode: 'RPDEFeed', rpdeKind: 'ScheduledSession' });

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

      expect(errors.length).toBe(0);
    });
    it('should error when superEvent within the ScheduledSession is an object not an ID reference', async () => {
      const options = new OptionsHelper({ validationMode: 'RPDEFeed', rpdeKind: 'ScheduledSession' });

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

      expect(errors.length).toBe(1);
      expect(errors[0].type).toBe(ValidationErrorType.FIELD_NOT_ID_REFERENCE);
      expect(errors[0].severity).toBe(ValidationErrorSeverity.FAILURE);
    });
  });
});
