const request = require('sync-request');
const { getExamplesWithContent } = require('@openactive/data-models');
const { validate } = require('./validate');
const OptionsHelper = require('./helpers/options');

const dataModelExamples = getExamplesWithContent('latest', (url) => {
  // eslint-disable-next-line no-console
  console.log(`Downloading ${url}`);
  return JSON.parse(request('GET', url, {
    headers: {
      'Content-Type': 'application/ld+json',
    },
  }).getBody());
});

for (const {
  category,
  name,
  file,
  data,
  validationMode,
} of dataModelExamples) {
  describe(`Example "${category} -> ${name}" (${file})`, () => {
    it('should validate with no failures', async () => {
      const results = await validate(data, new OptionsHelper({
        loadRemoteJson: true,
        version: 'latest',
        validationMode,
      }));
      const failures = results.filter((result) => result.severity === 'failure')
        .map((error) => `${error.path}: ${error.message.split('\n')[0]}`)
        // TECH DEBT: beta:virtualTour has been removed from the beta namespace temporarily as it breaks other libraries
        // Remove the line below once beta:virtualTour has been re-introduced
        .filter((x) => x.indexOf('beta:virtualTour') === -1);

      expect(failures).toEqual([]);
    });
  });
}
