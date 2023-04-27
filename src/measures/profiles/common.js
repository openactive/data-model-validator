const ValidationErrorType = require('../../errors/validation-error-type');
const ExclusionMode = require('../exclusion-modes');

module.exports = {
  name: 'Common use',
  identifier: 'common',
  measures: [
    {
      name: 'Has a leader name',
      exclusions: [ // Logic: if no errors are present for any of the paths (paths are matched with endsWith), for any exclusion
        {
          errorType: [
            ValidationErrorType.MISSING_REQUIRED_FIELD,
          ],
          targetPaths: [
            /\.leader\.name$/,
          ],
        },
      ],
    },
    {
      name: 'Has a name',
      description: 'The name of the opportunity is essential for a participant to understand what the activity',
      exclusions: [ // Logic: if no errors are present for any of the target fields, for any exclusion
        {
          errorType: [
            ValidationErrorType.MISSING_REQUIRED_FIELD,
          ],
          targetFields: {
            Event: ['name'],
            FacilityUse: ['name'],
            IndividualFacilityUse: ['name'],
            CourseInstance: ['name'],
            EventSeries: ['name'],
            HeadlineEvent: ['name'],
            SessionSeries: ['name'],
            Course: ['name'],
          },
        },
      ],
    },
    {
      name: 'Has a description',
      exclusions: [ // Logic: if no errors are present for any of the target fields, for any exclusion
        {
          errorType: [
            ValidationErrorType.MISSING_RECOMMENDED_FIELD,
          ],
          targetFields: {
            Event: ['description'],
            FacilityUse: ['description'],
            IndividualFacilityUse: ['description'],
            CourseInstance: ['description'],
            EventSeries: ['description'],
            HeadlineEvent: ['description'],
            SessionSeries: ['description'],
            Course: ['description'],
          },
        },
      ],
    },
    {
      name: 'Has a postcode or lat/long',
      exclusions: [
        {
          errorType: [
            ValidationErrorType.MISSING_REQUIRED_FIELD,
          ],
          targetFields: {
            Place: ['geo', 'address'],
          },
        },
      ],
    },
    {
      name: 'Has a date in the future',
      exclusions: [
        {
          errorType: [
            ValidationErrorType.DATE_IN_THE_PAST, // TODO: Add this rule, outputs a warning for dates in the past
          ],
        },
      ],
    },
    {
      name: 'Activity List ID matches',
      exclusions: [
        {
          errorType: [
            ValidationErrorType.MISSING_REQUIRED_FIELD,
          ],
          targetFields: {
            Event: ['activity'],
            CourseInstance: ['activity'],
            EventSeries: ['activity'],
            HeadlineEvent: ['activity'],
            SessionSeries: ['activity'],
            Course: ['activity'],
          },
        },
        {
          errorType: [
            ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST,
            ValidationErrorType.USE_OFFICIAL_ACTIVITY_LIST,
          ],
        },
      ],
    },
    {
      name: 'Session has name, description or matching activity',
      exclusionMode: ExclusionMode.ALL, // ALL: all exclusions must be present to discount the item; ANY (default): Any exclusions discount the item if present
      exclusions: [
        {
          errorType: [
            ValidationErrorType.MISSING_REQUIRED_FIELD,
          ],
          targetFields: {
            Event: ['name'],
            FacilityUse: ['name'],
            IndividualFacilityUse: ['name'],
            CourseInstance: ['name'],
            EventSeries: ['name'],
            HeadlineEvent: ['name'],
            SessionSeries: ['name'],
            Course: ['name'],
          },
        },
        {
          errorType: [
            ValidationErrorType.MISSING_RECOMMENDED_FIELD,
          ],
          targetFields: {
            Event: ['description'],
            FacilityUse: ['description'],
            IndividualFacilityUse: ['description'],
            CourseInstance: ['description'],
            EventSeries: ['description'],
            HeadlineEvent: ['description'],
            SessionSeries: ['description'],
            Course: ['description'],
          },
        },
        {
          errorType: [
            ValidationErrorType.ACTIVITY_NOT_IN_ACTIVITY_LIST,
            ValidationErrorType.USE_OFFICIAL_ACTIVITY_LIST,
          ],
        },
      ],
    },
    {
      name: 'Has has a unique URL (e.g. for booking)',
      exclusions: [ // Logic: if no errors are present for any of the target fields, for any exclusion
      // Note that the required field logic is applied before errors outputted, therefore the below applies all inheritance logic etc implicitly
        {
          errorType: [
            ValidationErrorType.MISSING_REQUIRED_FIELD, // TODO: Add a rule that checks that the url is unique within the set of URLs given on the page (?), of perhaps using a hashmap of the @id
          ],
          targetFields: {
            Event: ['url'],
            FacilityUse: ['url'],
            Slot: ['url'],
            IndividualFacilityUse: ['url'],
            CourseInstance: ['url'],
            EventSeries: ['url'],
            HeadlineEvent: ['url'],
            SessionSeries: ['url'],
            ScheduledSession: ['url'],
            Course: ['url'],
          },
        },
      ],
    },
  ],
};
