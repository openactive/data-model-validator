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
    DataModelHelper.loadModel('Dataset', '2.0'),
    '2.0',
    true,
  );
  // const model = ApplyRules.loadModel('Dataset', '2.0');
  // const model = loadModel('Dataset', '2.0');
  // const data = {
  //   '@context': [
  //     'https://schema.org/',
  //     'https://openactive.io/',
  //   ],
  //   '@type': 'Dataset',
  //   '@id': 'https://opendata.fusion-lifestyle.com/OpenActive/',
  //   url: 'https://opendata.fusion-lifestyle.com/OpenActive/',
  //   name: 'Fusion Lifestyle Sessions and Facilities',
  //   description: 'Near real-time availability and rich descriptions relating to the sessions and facilities available from Fusion Lifestyle',
  //   accessService: {
  //     '@type': 'WebAPI',
  //     name: 'Open Booking API',
  //     description: 'An API that allows for seamless booking experiences to be created for sessions and facilities available from Fusion Lifestyle',
  //     authenticationAuthority: 'https://auth.reference-implementation.openactive.io',
  //     conformsTo: [
  //       'https://openactive.io/open-booking-api/EditorsDraft/',
  //     ],
  //     documentation: 'https://permalink.openactive.io/dataset-site/open-booking-api-documentation',
  //     endpointDescription: 'https://www.openactive.io/open-booking-api/EditorsDraft/swagger.json',
  //     endpointUrl: 'https://reference-implementation.openactive.io/api/openbooking',
  //     landingPage: 'https://example.com/api-landing-page',
  //     termsOfService: 'https://example.com/api-terms-page',
  //   },
  //   keywords: [
  //     'Sessions',
  //     'Facilities',
  //     'Activities',
  //     'Sports',
  //     'Physical Activity',
  //     'OpenActive',
  //   ],
  //   license: 'https://creativecommons.org/licenses/by/4.0/',
  //   distribution: [
  //     {
  //       '@type': 'DataDownload',
  //       name: 'ScheduledSession',
  //       additionalType: 'https://openactive.io/ScheduledSession',
  //       contentUrl: 'https://www.example.com/feeds/scheduled-sessions',
  //       encodingFormat: 'application/vnd.openactive.rpde+json; version=1',
  //       identifier: 'ScheduledSession',
  //     },
  //     {
  //       '@type': 'DataDownload',
  //       name: 'SessionSeries',
  //       additionalType: 'https://openactive.io/SessionSeries',
  //       contentUrl: 'https://www.example.com/feeds/session-series',
  //       encodingFormat: 'application/vnd.openactive.rpde+json; version=1',
  //       identifier: 'SessionSeries',
  //     },
  //     {
  //       '@type': 'DataDownload',
  //       name: 'Event',
  //       additionalType: 'https://schema.org/Event',
  //       contentUrl: 'https://www.example.com/feeds/events',
  //       encodingFormat: 'application/vnd.openactive.rpde+json; version=1',
  //       identifier: 'Event',
  //     },
  //     {
  //       '@type': 'DataDownload',
  //       name: 'FacilityUse',
  //       additionalType: 'https://openactive.io/FacilityUse',
  //       contentUrl: 'https://www.example.com/feeds/facility-uses',
  //       encodingFormat: 'application/vnd.openactive.rpde+json; version=1',
  //       identifier: 'FacilityUse',
  //     },
  //     {
  //       '@type': 'DataDownload',
  //       name: 'Slot for FacilityUse',
  //       additionalType: 'https://openactive.io/Slot',
  //       contentUrl: 'https://www.example.com/feeds/facility-use-slots',
  //       encodingFormat: 'application/vnd.openactive.rpde+json; version=1',
  //       identifier: 'FacilityUseSlot',
  //     },
  //     {
  //       '@type': 'DataDownload',
  //       name: 'CourseInstance',
  //       additionalType: 'https://schema.org/CourseInstance',
  //       contentUrl: 'https://www.example.com/feeds/course-instances',
  //       encodingFormat: 'application/vnd.openactive.rpde+json; version=1',
  //       identifier: 'CourseInstance',
  //     },
  //   ],
  //   discussionUrl: 'https://github.com/gladstonemrm/FusionLifestyle/schmissues',
  //   documentation: 'https://permalink.openactive.io/dataset-site/open-data-documentation',
  //   inLanguage: [
  //     'en-GB',
  //   ],
  //   publisher: {
  //     '@type': 'Organization',
  //     name: 'Fusion Lifestyle',
  //     description: 'Fusion Lifestyle was established in April 2000 following a decision by a London Borough Council to outsource the management of the leisure facilities. Fusion now manages a diverse portfolio of facilities using our specialist expertise to provide sustainable solutions for councils and exciting products and programmes for our customers. Fusion is a national operator managing leisure facilities from Wales to London and as far north as Newcastle. \n\nNo two Fusion sites are the same, we retain the heritage of centres when we refurbish and we are experienced at managing centres from ice rinks to outward bound residential centres, town halls and expansive leisure facilities. We put our energies into providing facilities and programmes that are an attractive proposition to the local community. We respect the history of our centres and it is not uncommon for generations of local residents to hold fond memories of learning to swim in our centres, playing football matches over the years and hosting birthday celebrations at our sites.\n\nFusion is a registered charity, there are therefore no shareholders. We are able to continually reinvest in facilities, products and importantly people.\n',
  //     email: 'info@fusion-lifestyle.com',
  //     legalName: 'Fusion Lifestyle',
  //     logo: {
  //       '@type': 'ImageObject',
  //       url: 'https://res.cloudinary.com/gladstone/image/upload/fusion-lifestyle-live/ydokan4mlia7zigqd79d',
  //     },
  //     url: 'https://www.fusion-lifestyle.com/',
  //   },
  //   dateModified: '2020-04-23T09:01:05+01:00',
  //   datePublished: '2019-04-25T19:32:14+00:00',
  //   schemaVersion: 'https://openactive.io/modelling-opportunity-data/2.0/',
  //   bookingService: {
  //     '@type': 'BookingService',
  //     name: 'Gladstone',
  //     url: 'https://www.gladstonesoftware.co.uk',
  //     softwareVersion: '3.0.2',
  //     hasCredential: 'https://certificates.reference-implementation.openactive.io/examples/all-features/controlled/',
  //   },
  //   backgroundImage: {
  //     '@type': 'ImageObject',
  //     url: 'https://res.cloudinary.com/gladstone/image/upload/fusion-lifestyle-live/jjtttkudkodzfzulijsu?',
  //   },
  // };

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
