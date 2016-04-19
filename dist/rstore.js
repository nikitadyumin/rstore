(function webpackUniversalModuleDefinition(root, factory) {
	if(typeof exports === 'object' && typeof module === 'object')
		module.exports = factory();
	else if(typeof define === 'function' && define.amd)
		define([], factory);
	else {
		var a = factory();
		for(var i in a) (typeof exports === 'object' ? exports : root)[i] = a[i];
	}
})(this, function() {
return /******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _lens = __webpack_require__(1);

	var _lens2 = _interopRequireDefault(_lens);

	var _store = __webpack_require__(3);

	var _store2 = _interopRequireDefault(_store);

	var _utils = __webpack_require__(4);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	module.exports = {
	    fromEvent: _utils.fromEvent,
	    lens: _lens2.default,
	    store: _store2.default
	}; /**
	    * Created by ndyumin on 23.12.2015.
	    */

/***/ },
/* 1 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Created by ndyumin on 29.12.2015.
	 */

	var clone = __webpack_require__(2);

	function defineGetter(name) {
	    return function (o) {
	        return o[name];
	    };
	}

	function defineSetter(name) {
	    return function (o, v) {
	        var _clone = clone(o);
	        _clone[name] = v;
	        return _clone;
	    };
	}

	function lens(name) {
	    function _lens(getter, setter) {
	        return {
	            get: getter,
	            set: setter,
	            toggle: function toggle(obj) {
	                return setter(obj, !getter(obj));
	            },
	            combine: function combine(l) {
	                return _lens(function (obj) {
	                    return l.get(getter(obj));
	                }, function (obj, val) {
	                    return setter(obj, l.set(getter(obj), val));
	                });
	            },
	            defineMapSetter: function defineMapSetter(mapper) {
	                return _lens(getter, function (obj, value) {
	                    return setter(obj, getter(obj).map(mapper(value)));
	                });
	            },
	            defineFilterSetter: function defineFilterSetter(filter) {
	                return _lens(getter, function (obj, value) {
	                    return setter(obj, getter(obj).filter(filter(value)));
	                });
	            }
	        };
	    }

	    return _lens(defineGetter(name), defineSetter(name));
	}

	module.exports = lens;

/***/ },
/* 2 */
/***/ function(module, exports) {

	"use strict";

	/**
	 * Created by ndyumin on 29.12.2015.
	 */
	function clone(o) {
	  return JSON.parse(JSON.stringify(o));
	}

	module.exports = clone;

/***/ },
/* 3 */
/***/ function(module, exports) {

	'use strict';

	function _typeof(obj) { return obj && typeof Symbol !== "undefined" && obj.constructor === Symbol ? "symbol" : typeof obj; }

	/**
	 * Created by ndyumin on 23.12.2015.
	 */

	var runUnsub = function runUnsub(fn) {
	    return typeof fn === 'function' ? fn() : (typeof fn === 'undefined' ? 'undefined' : _typeof(fn)) === 'object' ? typeof fn.unsubscribe === 'function' ? fn.unsubscribe() : console.log('ehm...', fn) : console.log('unknown subscription', fn);
	};

	function rstore(init) {
	    var plugged = [];

	    function stream(executor) {
	        return {
	            /**
	             * start stream
	             */
	            subscribe: executor,
	            /**
	             * @deprecated
	             * use `.subscribe` instead
	             */
	            stream: function stream() {
	                return {
	                    onValue: executor
	                };
	            },
	            /**
	             *
	             * @param streams
	             */
	            plug: function plug() {
	                for (var _len = arguments.length, streams = Array(_len), _key = 0; _key < _len; _key++) {
	                    streams[_key] = arguments[_key];
	                }

	                return stream(function (sink) {
	                    plugged.push.apply(plugged, streams);
	                    var unsubs = [];
	                    return executor(function (init) {
	                        unsubs.forEach(runUnsub);
	                        unsubs.length = 0;
	                        sink(init);
	                        var clb = function clb(reducer) {
	                            return function (v) {
	                                return sink(init = reducer(init, v));
	                            };
	                        };

	                        function _plug(s$, reducer) {
	                            var observeMethod = s$.observe || s$.onValue || s$.subscribe;
	                            var unsub = observeMethod.call(s$, clb(reducer));
	                            unsubs.push(unsub);

	                            for (var _len2 = arguments.length, _streams = Array(_len2 > 2 ? _len2 - 2 : 0), _key2 = 2; _key2 < _len2; _key2++) {
	                                _streams[_key2 - 2] = arguments[_key2];
	                            }

	                            if (_streams.length !== 0) {
	                                _plug.apply(undefined, _streams);
	                            }
	                        }

	                        _plug.apply(undefined, plugged);
	                        return function () {
	                            return unsubs.forEach(runUnsub);
	                        };
	                    });
	                });
	            }
	        };
	    }

	    return stream(function (sink) {
	        return sink(init);
	    });
	}

	module.exports = rstore;

/***/ },
/* 4 */
/***/ function(module, exports) {

	"use strict";

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.fromEvent = fromEvent;
	/**
	 * Created by ndyumin on 18.04.2016.
	 */
	function fromEvent(node, eventName) {
	    return {
	        subscribe: function subscribe(observer) {
	            node.addEventListener(eventName, observer);
	            return function () {
	                return node.removeEventListener(eventName, observer);
	            };
	        }
	    };
	}

/***/ }
/******/ ])
});
;