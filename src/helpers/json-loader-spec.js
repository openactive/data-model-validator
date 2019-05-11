const nock = require('nock');
const JsonLoaderHelper = require('./json-loader');
const OptionsHelper = require('./options');

describe('JsonLoaderHelper', () => {
  beforeEach(() => {
    JsonLoaderHelper.clearCache();
  });
  afterEach(() => {
    nock.cleanAll();
  });
  it('should load a JSON file', async () => {
    const scope = nock('https://openactive.io')
      .get('/activity-list')
      .reply(200, {}, {
        'Content-Type': 'application/ld+json',
      });

    const response = await JsonLoaderHelper.getFileAsync(
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
  it('should 404 on an invalid JSON file', async () => {
    const scope = nock('https://openactive.io')
      .get('/activity-list')
      .reply(404, null, {
        'Content-Type': 'application/ld+json',
      });

    const response = await JsonLoaderHelper.getFileAsync(
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
