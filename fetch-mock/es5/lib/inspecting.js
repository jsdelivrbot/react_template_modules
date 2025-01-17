'use strict';

var _promise = require('babel-runtime/core-js/promise');

var _promise2 = _interopRequireDefault(_promise);

var _toConsumableArray2 = require('babel-runtime/helpers/toConsumableArray');

var _toConsumableArray3 = _interopRequireDefault(_toConsumableArray2);

var _slicedToArray2 = require('babel-runtime/helpers/slicedToArray');

var _slicedToArray3 = _interopRequireDefault(_slicedToArray2);

var _assign = require('babel-runtime/core-js/object/assign');

var _assign2 = _interopRequireDefault(_assign);

function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

var _require = require('./request-utils'),
    normalizeUrl = _require.normalizeUrl;

var FetchMock = {};
var compileRoute = require('./compile-route');

var isName = function isName(nameOrMatcher) {
	return typeof nameOrMatcher === 'string' && /^[\da-z\-]+$/.test(nameOrMatcher);
};

FetchMock.filterCallsWithMatcher = function (matcher) {
	var options = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : {};
	var calls = arguments[2];

	matcher = compileRoute(
	// HACK: add dummy response so that we can generate a matcher without
	// copileRoute's expectation that each route has a response defined
	(0, _assign2.default)({ matcher: matcher, response: 200 }, options)).matcher;
	return calls.filter(function (_ref) {
		var _ref2 = (0, _slicedToArray3.default)(_ref, 2),
		    url = _ref2[0],
		    opts = _ref2[1];

		return matcher(normalizeUrl(url), opts);
	});
};

FetchMock.filterCalls = function (nameOrMatcher, options) {
	var calls = this._calls;
	var matcher = '*';
	if (nameOrMatcher === true) {
		calls = calls.filter(function (_ref3) {
			var unmatched = _ref3.unmatched;
			return !unmatched;
		});
	} else if (nameOrMatcher === false) {
		calls = calls.filter(function (_ref4) {
			var unmatched = _ref4.unmatched;
			return unmatched;
		});
	} else if (typeof nameOrMatcher === 'undefined') {
		calls = calls;
	} else if (isName(nameOrMatcher)) {
		calls = calls.filter(function (_ref5) {
			var identifier = _ref5.identifier;
			return identifier === nameOrMatcher;
		});
	} else {
		matcher = normalizeUrl(nameOrMatcher);
		if (this.routes.some(function (_ref6) {
			var identifier = _ref6.identifier;
			return identifier === matcher;
		})) {
			calls = calls.filter(function (call) {
				return call.identifier === matcher;
			});
		}
	}

	if ((options || matcher !== '*') && calls.length) {
		if (typeof options === 'string') {
			options = { method: options };
		}
		calls = this.filterCallsWithMatcher(matcher, options, calls);
	}
	return calls;
};

FetchMock.calls = function (nameOrMatcher, options) {
	return this.filterCalls(nameOrMatcher, options);
};

FetchMock.lastCall = function (nameOrMatcher, options) {
	return [].concat((0, _toConsumableArray3.default)(this.filterCalls(nameOrMatcher, options))).pop();
};

FetchMock.lastUrl = function (nameOrMatcher, options) {
	return (this.lastCall(nameOrMatcher, options) || [])[0];
};

FetchMock.lastOptions = function (nameOrMatcher, options) {
	return (this.lastCall(nameOrMatcher, options) || [])[1];
};

FetchMock.called = function (nameOrMatcher, options) {
	return !!this.filterCalls(nameOrMatcher, options).length;
};

FetchMock.flush = function (waitForResponseMethods) {
	var _this = this;

	var queuedPromises = this._holdingPromises;
	this._holdingPromises = [];

	return _promise2.default.all(queuedPromises).then(function () {
		if (waitForResponseMethods && _this._holdingPromises.length) {
			return _this.flush(waitForResponseMethods);
		}
	});
};

FetchMock.done = function (nameOrMatcher) {
	var _this2 = this;

	// - true or undefined
	// - nameOrMatcher or matcher
	// - don't support options any more?
	// - ah, but what about when multiple routes have same matcher
	// 		- nameOrMatcher them

	// const calls = this.filterCalls(nameOrMatcher, options);
	var identifiers = nameOrMatcher && typeof nameOrMatcher !== 'boolean' ? [{ identifier: nameOrMatcher }] : this.routes;
	// Can't use array.every because
	// a) not widely supported
	// b) would exit after first failure, which would break the logging
	return identifiers.map(function (_ref7) {
		var identifier = _ref7.identifier;

		if (!_this2.called(identifier)) {
			console.warn('Warning: ' + identifier + ' not called'); // eslint-disable-line
			return false;
		}

		var expectedTimes = (_this2.routes.find(function (r) {
			return r.identifier === identifier;
		}) || {}).repeat;

		if (!expectedTimes) {
			return true;
		}
		var actualTimes = _this2.filterCalls(identifier).length;
		if (expectedTimes > actualTimes) {
			console.warn('Warning: ' + identifier + ' only called ' + actualTimes + ' times, but ' + expectedTimes + ' expected'); // eslint-disable-line
			return false;
		} else {
			return true;
		}
	}).every(function (bool) {
		return bool;
	});
};

module.exports = FetchMock;