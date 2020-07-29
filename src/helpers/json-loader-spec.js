const nock = require('nock');
const JsonLoaderHelper = require('./json-loader');
const OptionsHelper = require('./options');

describe('JsonLoaderHelper', () => {
  beforeEach(() => {
    JsonLoaderHelper.clearCache();
    nock.disableNetConnect();
  });
  afterEach(() => {
    nock.cleanAll();
    nock.enableNetConnect();
  });
  it('should load a JSON file', async () => {
    const scope = nock('https://openactive.io')
      .get('/activity-list')
      .reply(200, {}, {
        'Content-Type': 'application/ld+json',
      });

    const response = await JsonLoaderHelper.getFile(
      'https://openactive.io/activity-list',
      new OptionsHelper({
        loadRemoteJson: true,
      }),
    );

    expect(scope.pendingMocks()).toEqual([]);
    expect(
      response.errorCode,
    ).toBe(JsonLoaderHelper.ERROR_NONE);
  });
  it('should follow the link header of a JSON file', async () => {
    // This ensures that schema.org is supported
    // See https://github.com/schemaorg/schemaorg/issues/2578 for reference
    const scope = nock('https://openactive.io')
      .get('/')
      .reply(200, {}, {
        'Content-Type': 'application/ld+json',
        Link: '</docs/jsonldcontext.jsonld>; rel="alternate"; type="application/ld+json"',
      })
      .get('/docs/jsonldcontext.jsonld')
      .reply(200, {}, {
        'Content-Type': 'application/ld+json',
      });

    const response = await JsonLoaderHelper.getFile(
      'https://openactive.io/',
      new OptionsHelper({
        loadRemoteJson: true,
      }),
    );

    expect(scope.pendingMocks()).toEqual([]);
    expect(
      response.errorCode,
    ).toBe(JsonLoaderHelper.ERROR_NONE);
  });
  it('should 404 on an invalid JSON file', async () => {
    const scope = nock('https://openactive.io')
      .get('/activity-list')
      .reply(404, null, {
        'Content-Type': 'application/ld+json',
      });

    const response = await JsonLoaderHelper.getFile(
      'https://openactive.io/activity-list',
      new OptionsHelper({
        loadRemoteJson: true,
      }),
    );

    expect(scope.pendingMocks()).toEqual([]);
    expect(
      response.errorCode,
    ).toBe(JsonLoaderHelper.ERROR_NO_REMOTE);
    expect(
      response.statusCode,
    ).toBe(404);
  });
});
