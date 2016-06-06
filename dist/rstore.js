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

	var _utils = __webpack_require__(6);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { default: obj }; }

	var lenses = {
	    lens: _lens2.default
	}; /**
	    * Created by ndyumin on 23.12.2015.
	    */

	var observableFactoryMethods = {
	    fromEvent: _utils.fromEvent,
	    interval: _utils.interval,
	    bus: _utils.bus,
	    address: _utils.address
	};

	module.exports = Object.assign({}, _store2.default, observableFactoryMethods, lenses);

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

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	function _toConsumableArray(arr) { if (Array.isArray(arr)) { for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) { arr2[i] = arr[i]; } return arr2; } else { return Array.from(arr); } }

	/**
	 * Created by ndyumin on 01.06.2016.
	 */

	var _require = __webpack_require__(4);

	var factory = _require.factory;

	var _require2 = __webpack_require__(5);

	var signature = _require2.signature;


	function typedStore(plugObservableType, state) {
	    var updaters = [];
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

	    function unsubAndRemove(updater) {
	        updater.wrappedObservable.unsubscribe(updater.subscription);
	        updaters.splice(updaters.indexOf(updater), 1);
	    }

	    function observe(observable, reducer) {
	        var _arguments = arguments;

	        if (observable && reducer) {
	            var _len, observables, _key;

	            var _ret = function () {
	                var synchronouslyCompleted = false;
	                var wrappedObservable = factory(plugObservableType, observable);
	                var updater = {
	                    observable: observable,
	                    reducer: reducer,
	                    wrappedObservable: wrappedObservable,
	                    subscription: wrappedObservable.subscribe({
	                        next: createStateUpdater(reducer),
	                        complete: function complete() {
	                            if (typeof updater === 'undefined') {
	                                synchronouslyCompleted = true;
	                            } else {
	                                unsubAndRemove(updater);
	                            }
	                        }
	                    })
	                };
	                if (!synchronouslyCompleted) {
	                    updaters.push(updater);
	                }

	                for (_len = _arguments.length, observables = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	                    observables[_key - 2] = _arguments[_key];
	                }

	                return {
	                    v: observe.apply(undefined, _toConsumableArray(observables))
	                };
	            }();

	            if ((typeof _ret === 'undefined' ? 'undefined' : _typeof(_ret)) === "object") return _ret.v;
	        } else {
	            return store_;
	        }
	    }

	    var store_ = {
	        $$signature: signature,
	        subscribe: function subscribe(observer) {
	            observers.push(observer);
	            observer(state);
	            return store_;
	        },
	        unsubscribe: function unsubscribe() {
	            updaters.forEach(unsubAndRemove);
	            observers.length = 0;
	            return store_;
	        },
	        plug: observe,
	        unplug: function unplug(observable, _reducer) {
	            updaters.filter(function (updater) {
	                return typeof _reducer !== 'undefined' ? updater.reducer === _reducer && updater.observable === observable : updater.observable === observable;
	            }).forEach(unsubAndRemove);
	            return store_;
	        },
	        toRx: function toRx() {
	            var RxObject = arguments.length <= 0 || arguments[0] === undefined ? Rx : arguments[0];
	            return RxObject.Observable.create(function (o) {
	                return store_.subscribe(o.next.bind(o));
	            });
	        }
	    };
	    return store_;
	}

	module.exports = {
	    store: typedStore.bind(null, null),
	    storeR: typedStore.bind(null, 'rstore'),
	    storeBacon: typedStore.bind(null, 'bacon'),
	    storeMost: typedStore.bind(null, 'most'),
	    storeRx: typedStore.bind(null, 'rxjs5')
	};

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/**
	 * Created by ndyumin on 01.06.2016.
	 */

	var _require = __webpack_require__(5);

	var signature = _require.signature;

	var run = function run(fn) {
	    return fn();
	};

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
	    //self
	    if (observable.$$signature === signature) {
	        return rstore(observable);
	    }
	    // most
	    if (typeof observable.observe === 'function') {
	        return most(observable);
	    }
	    // bacon, kefir
	    if (typeof observable.onValue === 'function') {
	        return {
	            subscribe: function subscribe(o) {
	                var subs = [observable.onValue(o.next),
	                //observable.onError(o.error),
	                observable.onEnd(o.complete)];
	                return function () {
	                    return subs.forEach(run);
	                };
	            },
	            unsubscribe: autodetectUnsubscribe
	        };
	    }
	    return {
	        subscribe: function subscribe(o) {
	            return observable.subscribe(o);
	        },
	        unsubscribe: autodetectUnsubscribe
	    };
	}

	function rxjs5(observable) {
	    return {
	        subscribe: function subscribe(o) {
	            return observable.subscribe(o);
	        },
	        unsubscribe: function unsubscribe(subscription) {
	            return subscription.unsubscribe();
	        }
	    };
	}

	function rstore(observable) {
	    return {
	        subscribe: function subscribe(o) {
	            return observable.subscribe(o.next);
	        },
	        unsubscribe: function unsubscribe(_unsubscribe) {
	            return _unsubscribe();
	        }
	    };
	}

	function bacon(observable) {
	    return {
	        subscribe: function subscribe(o) {
	            return observable.onValue(o.next);
	        },
	        unsubscribe: function unsubscribe(_unsubscribe2) {
	            return _unsubscribe2();
	        }
	    };
	}

	function most(observable) {
	    return {
	        subscribe: function subscribe(o) {
	            return observable.observe(o.next);
	        },
	        unsubscribe: function unsubscribe() {}
	    };
	}

	var factory = function factory(type, observable) {
	    return ({
	        rxjs5: rxjs5,
	        rstore: rstore,
	        bacon: bacon,
	        most: most
	    }[type] || autodetect)(observable);
	};

	module.exports = {
	    factory: factory
	};

/***/ },
/* 5 */
/***/ function(module, exports) {

	'use strict';

	/**
	 * Created by ndyumin on 06.06.2016.
	 */
	module.exports = {
	  signature: Symbol('rstore')
	};

/***/ },
/* 6 */
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