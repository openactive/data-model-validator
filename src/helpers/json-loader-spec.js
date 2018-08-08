const RequestHelper = require('./request');
const JsonLoaderHelper = require('./json-loader');
const OptionsHelper = require('./options');

describe('JsonLoaderHelper', () => {
  beforeEach(() => {
    JsonLoaderHelper.clearCache();
  });
  it('should load a JSON file', () => {
    spyOn(RequestHelper, 'get').and.callFake((method, url) => ({
      headers: {
        'content-type': 'application/ld+json',
      },
      url,
      statusCode: 200,
      body: '{}',
    }));

    const response = JsonLoaderHelper.getFile(
      'https://www.openactive.io/activity-list/activity-list.jsonld',
      new OptionsHelper({
        loadRemoteJson: true,
      }),
    );

    expect(RequestHelper.get).toHaveBeenCalledWith(
      'https://www.openactive.io/activity-list/activity-list.jsonld',
    );
    expect(
      response.errorCode,
    ).toBe(JsonLoaderHelper.ERROR_NONE);
  });
  it('should 404 on an invalid JSON file', () => {
    spyOn(RequestHelper, 'get').and.callFake((method, url) => ({
      headers: {
        'content-type': 'application/ld+json',
      },
      url,
      statusCode: 404,
      body: null,
    }));

    const response = JsonLoaderHelper.getFile(
      'https://www.openactive.io/activity-list/activity-list.json',
      new OptionsHelper({
        loadRemoteJson: true,
      }),
    );

    expect(RequestHelper.get).toHaveBeenCalledWith(
      'https://www.openactive.io/activity-list/activity-list.json',
    );
    expect(
      response.errorCode,
    ).toBe(JsonLoaderHelper.ERROR_NO_REMOTE);
    expect(
      response.statusCode,
    ).toBe(404);
  });
});
