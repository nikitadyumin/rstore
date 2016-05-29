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
	    interval: _utils.interval,
	    address: _utils.address,
	    bus: _utils.bus,
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

	var _slicedToArray = function () { function sliceIterator(arr, i) { var _arr = []; var _n = true; var _d = false; var _e = undefined; try { for (var _i = arr[Symbol.iterator](), _s; !(_n = (_s = _i.next()).done); _n = true) { _arr.push(_s.value); if (i && _arr.length === i) break; } } catch (err) { _d = true; _e = err; } finally { try { if (!_n && _i["return"]) _i["return"](); } finally { if (_d) throw _e; } } return _arr; } return function (arr, i) { if (Array.isArray(arr)) { return arr; } else if (Symbol.iterator in Object(arr)) { return sliceIterator(arr, i); } else { throw new TypeError("Invalid attempt to destructure non-iterable instance"); } }; }();

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/**
	 * Created by ndyumin on 23.12.2015.
	 */

	function runUnsubscribe(subscription) {
	    if (typeof subscription === 'function') {
	        return subscription();
	    }
	    if ((typeof subscription === 'undefined' ? 'undefined' : _typeof(subscription)) === 'object') {
	        if (typeof subscription.unsubscribe === 'function') {
	            return subscription.unsubscribe();
	        }
	        return console.log('ehm...', subscription);
	    }
	    return console.log('unknown subscription type', subscription);
	}

	function wrapObservable(s$) {
	    if (typeof s$.observe === 'function') {
	        return { subscribe: s$.observe.bind(s$) };
	    }
	    if (typeof s$.onValue === 'function') {
	        return { subscribe: s$.onValue.bind(s$) };
	    }
	    return s$;
	}

	var splice = function splice(arr, o) {
	    var c = arguments.length <= 2 || arguments[2] === undefined ? 1 : arguments[2];

	    var index = arr.indexOf(o);
	    return index !== -1 ? arr.splice(index, c) : [];
	};

	function rstore(state) {
	    var observables = [];
	    var observers = [];
	    var subscriptions = [];
	    var started = false;
	    var broadcast = function broadcast(state) {
	        return observers.forEach(function (fn) {
	            return fn(state);
	        });
	    };
	    var clb = function clb(reducer) {
	        return function (update) {
	            return broadcast(state = reducer(state, update));
	        };
	    };

	    var unsubscribe = function unsubscribe(s$) {
	        splice(observables, s$, 2);

	        var _subscriptions$filter = subscriptions.filter(function (s) {
	            return s.stream$ === s$;
	        });

	        var _subscriptions$filter2 = _slicedToArray(_subscriptions$filter, 1);

	        var subs = _subscriptions$filter2[0];

	        if (typeof subs !== 'undefined') {
	            splice(subscriptions, subs);
	            runUnsubscribe(subs.unsubscribe);
	        }
	    };

	    var observe = function observe(s$, reduce) {
	        for (var _len = arguments.length, streams = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	            streams[_key - 2] = arguments[_key];
	        }

	        if (s$ && reduce) {
	            var subscription = {
	                stream$: s$,
	                unsubscribe: wrapObservable(s$).subscribe(clb(reduce))
	            };
	            subscriptions.push(subscription);
	            return observe.apply(undefined, streams);
	        }
	    };

	    var executor = function executor(next) {
	        next(state);
	        observers.push(next);
	        if (!started) {
	            started = true;
	            observe.apply(undefined, observables);
	        }
	        return _store;
	    };

	    var _store = {
	        /**
	         * @deprecated
	         * use .subscribe instead
	         */
	        stream: function stream() {
	            return {
	                onValue: (console.warn('this method will be removed in 0.3, use .subscribe instead'), executor)
	            };
	        },
	        /**
	         *
	         */
	        subscribe: executor,
	        /**
	         *
	         */
	        unsubscribe: function unsubscribe() {
	            started = false;
	            subscriptions.forEach(function (s) {
	                return runUnsubscribe(s.unsubscribe);
	            });
	            subscriptions.length = 0;
	            observers.length = 0;
	            return _store;
	        },
	        /**
	         *
	         */
	        toRx: function toRx() {
	            var RxObject = arguments.length <= 0 || arguments[0] === undefined ? Rx : arguments[0];
	            return RxObject.Observable.create(function (o) {
	                return executor(o.next.bind(o));
	            });
	        },
	        /**
	         *
	         */
	        plug: function plug() {
	            observables.push.apply(observables, arguments);
	            if (started) {
	                observe.apply(undefined, arguments);
	            }
	            return _store;
	        },
	        unplug: function unplug(stream) {
	            unsubscribe(stream);
	            return _store;
	        }
	    };

	    return _store;
	}

	module.exports = rstore;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.fromEvent = fromEvent;
	exports.interval = interval;
	exports.bus = bus;
	exports.address = address;
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

	function interval(ms) {
	    for (var _len = arguments.length, values = Array(_len > 1 ? _len - 1 : 0), _key = 1; _key < _len; _key++) {
	        values[_key - 1] = arguments[_key];
	    }

	    return {
	        subscribe: function subscribe(observer) {
	            var interval = setInterval.apply(undefined, [observer, ms].concat(values));
	            return function () {
	                return clearInterval(interval);
	            };
	        }
	    };
	}

	function bus() {
	    var _next = function next() {};
	    return {
	        subscribe: function subscribe(observer) {
	            return _next = typeof observer === 'function' ? observer : _next;
	        },
	        next: function next(value) {
	            return _next(value);
	        }
	    };
	}

	function address() {
	    var subs = [];

	    function deliver(msg) {
	        subs.forEach(function (fn) {
	            return fn(msg);
	        });
	    }

	    return {
	        send: deliver,
	        signal: function signal(msg) {
	            return function () {
	                deliver(msg);
	            };
	        },
	        subscribe: function subscribe(clb) {
	            subs.push(clb);
	            return function () {
	                subs.splice(subs.indexOf(clb), 1);
	            };
	        },
	        toRx: function toRx() {
	            var _this = this;

	            var Rx_ = arguments.length <= 0 || arguments[0] === undefined ? Rx : arguments[0];

	            return Rx_.Observable.create(function (o) {
	                return _this.subscribe(o.next.bind(o));
	            });
	        }
	    };
	}

/***/ }
/******/ ])
});
;