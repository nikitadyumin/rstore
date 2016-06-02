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

	var _utils = __webpack_require__(5);

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
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	/**
	 * Created by ndyumin on 01.06.2016.
	 */

	var _require = __webpack_require__(4);

	var wrap = _require.wrap;


	function store(state) {
	    var subscriptions = [];
	    var observers = [];

	    var broadcast = function broadcast(state) {
	        return observers.forEach(function (fn) {
	            return fn(state);
	        });
	    };
	    var createStateUpdater = function createStateUpdater(reducer) {
	        return function (update) {
	            return broadcast(state = reducer(state, update));
	        };
	    };

	    var _store = {
	        subscribe: function subscribe(observer) {
	            return observers.push(observer), observer(state);
	        },
	        plug: function plug(observable, reducer) {
	            subscriptions.push({
	                observable: observable,
	                reducer: reducer,
	                subscription: wrap(null, observable).subscribe(createStateUpdater(reducer))
	            });
	            return _store;
	        },
	        unplug: function unplug(observable, _reducer) {
	            subscriptions.filter(function (s) {
	                return typeof _reducer !== 'undefined' ? s.reducer === _reducer && s.observable === observable : s.observable === observable;
	            }).forEach(function (s) {
	                s.unsubscribe();
	                subscriptions.splice(subscriptions.indexOf(s), 1);
	            });
	            return _store;
	        },
	        toRx: function toRx() {
	            var RxObject = arguments.length <= 0 || arguments[0] === undefined ? Rx : arguments[0];
	            return RxObject.Observable.create(function (o) {
	                return _store.subscribe(o.next.bind(o));
	            });
	        }
	    };
	    return _store;
	}

	module.exports = store;

/***/ },
/* 4 */
/***/ function(module, exports) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/**
	 * Created by ndyumin on 01.06.2016.
	 */

	function autodetectUnsubscribe(subscription) {
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

	function autodetect(observable) {
	    // most
	    if (typeof observable.observe === 'function') {
	        return {
	            subscribe: function subscribe(next) {
	                return observable.observe(next);
	            },
	            unsubscribe: function unsubscribe() {}
	        };
	    }
	    // bacon, kefir
	    if (typeof observable.onValue === 'function') {
	        return {
	            subscribe: function subscribe(next) {
	                return observable.onValue(next);
	            },
	            unsubscribe: autodetectUnsubscribe
	        };
	    }
	    // else
	    return {
	        subscribe: function subscribe(next) {
	            return observable.subscribe(next);
	        },
	        unsubscribe: function unsubscribe(subscription) {
	            return subscription.unsubscribe();
	        }
	    };
	}

	function rxjs5(observable) {
	    return {
	        subscribe: function subscribe(next) {
	            return observable.subscribe(next);
	        },
	        unsubscribe: function unsubscribe(subscription) {
	            return subscription.unsubscribe();
	        }
	    };
	}

	function rstore(observable) {
	    return {
	        subscribe: function subscribe(next) {
	            return observable.subscribe(o);
	        },
	        unsubscribe: function unsubscribe(_unsubscribe) {
	            return _unsubscribe();
	        }
	    };
	}

	function bacon(observable) {
	    return {
	        subscribe: function subscribe(next) {
	            return observable.onValue(o);
	        },
	        unsubscribe: function unsubscribe(_unsubscribe2) {
	            return _unsubscribe2();
	        }
	    };
	}

	function most(observable) {
	    return {
	        subscribe: function subscribe(next) {
	            return observable.observe(o);
	        },
	        unsubscribe: function unsubscribe() {}
	    };
	}

	var wrap = function wrap(type, observable) {
	    return ({
	        rxjs5: rxjs5,
	        rstore: rstore,
	        bacon: bacon,
	        most: most
	    }[type] || autodetect)(observable);
	};

	module.exports = {
	    wrap: wrap
	};

/***/ },
/* 5 */
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