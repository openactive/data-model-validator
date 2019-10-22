const modeNames = [
  'C1Request',
  'C1Response',
  'C2Request',
  'C2Response',
  'PRequest',
  'PResponse',
  'C1Request',
  'C1Response',
  'OrderProposalPatch',
  'OrderPatch',
  'OrderFeed',
  'OrderStatus',
  'OpenData',
];

const ValidationMode = Object.freeze(
  modeNames.reduce((enums, modeName) => {
    // eslint-disable-next-line no-param-reassign
    enums[modeName] = modeName;
    return enums;
  }, {}),
);

module.exports = ValidationMode;
