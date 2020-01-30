const Rule = require('../rule');
const ValidationErrorType = require('../../errors/validation-error-type');
const ValidationErrorCategory = require('../../errors/validation-error-category');
const ValidationErrorSeverity = require('../../errors/validation-error-severity');

module.exports = class BookingRootTypeCorrectRule extends Rule {
  constructor(options) {
    super(options);
    this.targetModels = '*';
    this.targetValidationModes = [
      'C1Request',
      'C1Response',
      'C2Request',
      'C2Response',
      'PRequest',
      'PResponse',
      'BRequest',
      'BOrderProposalRequest',
      'BResponse',
      'OrderProposalPatch',
      'OrderPatch',
      'OrdersFeed',
      'OrderStatus',
    ];
    this.meta = {
      name: 'BookingRootTypeCorrectRule',
      description: 'Validates that the root node is of type OrderQuote.',
      tests: {
        orderQuote: {
          description: 'Validates that the root node is of type `OrderQuote`.',
          message: 'C1 and C2 requests and responses must be of type `OrderQuote`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.WRONG_BASE_TYPE,
        },
        orderProposal: {
          description: 'Validates that the root node is of type OrderProposal.',
          message: 'P requests and responses, and OrderProposal Updates must be of type `OrderProposal`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.WRONG_BASE_TYPE,
        },
        order: {
          description: 'Validates that the root node is of type Order.',
          message: 'B requests and responses, and Order Cancellation requests, must be of type `Order`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.WRONG_BASE_TYPE,
        },
        ordersFeed: {
          description: 'Validates that the root node of items in an Orders Feed are of type Order or OrderProposal.',
          message: 'Items in an Orders Feed must be of type `Order` or `OrderProposal`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.WRONG_BASE_TYPE,
        },
        orderStatus: {
          description: 'Validates that the root node of items in an Order Status response are of type Order, OrderProposal, or OrderQuote.',
          message: 'Order Status responses must be of type `Order`, `OrderProposal` or `OrderQuote`.',
          category: ValidationErrorCategory.CONFORMANCE,
          severity: ValidationErrorSeverity.FAILURE,
          type: ValidationErrorType.WRONG_BASE_TYPE,
        },
      },
    };
  }

  validateModel(node) {
    if (!node.model.isJsonLd) {
      return [];
    }
    const errors = [];

    const expectedType = {
      C1Request: 'OrderQuote',
      C1Response: 'OrderQuote',
      C2Request: 'OrderQuote',
      C2Response: 'OrderQuote',
      PRequest: 'OrderProposal',
      PResponse: 'OrderProposal',
      OrderProposalPatch: 'OrderProposal',
      BRequest: 'Order',
      BOrderProposalRequest: 'Order',
      BResponse: 'Order',
      OrderPatch: 'Order',
    };

    let testKey;

    // Is this the root node?
    if (node.parentNode === null || !node.parentNode.model.isJsonLd) {
      if (expectedType[node.options.validationMode] === 'OrderQuote') {
        if (node.model.type !== 'OrderQuote') {
          testKey = 'orderQuote';
        }
      } else if (expectedType[node.options.validationMode] === 'OrderProposal') {
        if (node.model.type !== 'OrderProposal') {
          testKey = 'orderProposal';
        }
      } else if (expectedType[node.options.validationMode] === 'Order') {
        if (node.model.type !== 'Order') {
          testKey = 'order';
        }
      } else if (node.options.validationMode === 'OrdersFeed') {
        if (!['Order', 'OrderProposal'].includes(node.model.type)) {
          testKey = 'ordersFeed';
        }
      } else if (node.options.validationMode === 'OrderStatus') {
        if (!['Order', 'OrderProposal', 'OrderQuote'].includes(node.model.type)) {
          testKey = 'orderStatus';
        }
      }
    }

    if (testKey) {
      errors.push(
        this.createError(
          testKey,
          {
            value: node.model.type,
            path: node.getPath('@type'),
          },
        ),
      );
    }

    return errors;
  }
};
