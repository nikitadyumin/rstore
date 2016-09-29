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
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;
/******/
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
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
	
	var _stkStoreAdapter = __webpack_require__(3);
	
	var _stkStoreAdapter2 = _interopRequireDefault(_stkStoreAdapter);
	
	var _utils = __webpack_require__(11);
	
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
	
	module.exports = Object.assign({
	    store: _stkStoreAdapter2.default,
	    storeR: _stkStoreAdapter2.default,
	    storeRx: _stkStoreAdapter2.default,
	    storeBacon: _stkStoreAdapter2.default,
	    storeMost: _stkStoreAdapter2.default
	}, observableFactoryMethods, lenses);

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
	 * Created by ndyumin on 29.09.2016.
	 */
	
	var _require = __webpack_require__(4);
	
	var store = _require.store;
	
	
	function fromCallbacks(next, error, complete) {
	    return {
	        next: next,
	        error: error,
	        complete: complete
	    };
	}
	
	function wrapBacon(observable) {
	    return {
	        subscribe: function subscribe(observer) {
	            if (typeof observer === 'function') {
	                observer = fromCallbacks.apply(undefined, arguments);
	            }
	
	            var subs = [observable.onValue(observer.next), observable.onEnd(observer.complete), observable.onError(observer.error)];
	            return {
	                unsubscribe: function unsubscribe() {
	                    return subs.forEach(function (fn) {
	                        return fn();
	                    });
	                }
	            };
	        }
	    };
	}
	
	function _store(initial) {
	    var instance = store(initial);
	    var _plug = instance.plug.bind(instance);
	    var _subscribe = instance.subscribe.bind(instance);
	    return Object.assign(instance, {
	        _subs: [],
	        _observers: [],
	        plug: function plug(observable, reducer) {
	
	            if (observable.onValue) {
	                observable = wrapBacon(observable);
	            }
	
	            this._subs.push({
	                observable: observable,
	                reducer: reducer,
	                subscription: _plug(observable, reducer)
	            });
	
	            for (var _len = arguments.length, streams = Array(_len > 2 ? _len - 2 : 0), _key = 2; _key < _len; _key++) {
	                streams[_key - 2] = arguments[_key];
	            }
	
	            if (streams.length) {
	                this.plug.apply(this, streams);
	            }
	            return this;
	        },
	        unplug: function unplug(observable, reducer) {
	            function unsubAndRemove(sub) {
	                sub.unsubscribe();
	                this._subs.splice(this._subs.indexOf(sub), 1);
	            }
	
	            this._subs.filter(function (sub) {
	                return typeof reducer !== 'undefined' ? sub.reducer === reducer && sub.observable === observable : sub.observable === observable;
	            }).forEach(unsubAndRemove, this);
	
	            return this;
	        },
	        subscribe: function subscribe(observer) {
	            if (typeof observer === 'function') {
	                observer = fromCallbacks.apply(undefined, arguments);
	            }
	            this._observers.push(_subscribe(observer));
	            return this;
	        },
	        reset: function reset() {
	            this._observers.forEach(function (subs) {
	                return subs.unsubscribe();
	            });
	            this._observers.length = 0;
	            return this;
	        },
	        toRx: function toRx() {
	            var RxObject = arguments.length <= 0 || arguments[0] === undefined ? Rx : arguments[0];
	
	            return RxObject.Observable.create(this.subscribe.bind(this));
	        }
	    });
	}
	
	module.exports = _store;

/***/ },
/* 4 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by ndyumin on 09.09.2016.
	 */
	
	const {
	    store,
	    eventCreatorFactory,
	    commandCreatorFactory,
	    defaultProjection
	} = __webpack_require__(5);
	
	module.exports = {
	    store,
	    eventCreatorFactory,
	    commandCreatorFactory,
	    defaultProjection
	};

/***/ },
/* 5 */
/***/ function(module, exports, __webpack_require__) {

	/**
	 * Created by ndyumin on 15.09.2016.
	 */
	
	const {removeItem} = __webpack_require__(6);
	const {fromCallbacks, notifyAll} = __webpack_require__(7);
	const symbolObservable = __webpack_require__(8);
	
	function project(events, initial) {
	    return events.reduce(function (state, event) {
	        return event.reduce(state, event.update);
	    }, initial);
	}
	
	const eventCreatorFactory = reduce => update => ({
	    reduce,
	    update
	});
	
	const commandCreatorFactory = executor => executor;
	
	function store(initial) {
	    let events = [];
	    let replicas = [];
	
	    return {
	        [symbolObservable]: function () {
	            return this;
	        },
	        _eventLog (observer) {
	            if (typeof observer === 'function') {
	                observer = fromCallbacks(...arguments);
	            }
	            replicas.push(observer);
	
	            return {
	                unsubscribe() {
	                    replicas = removeItem(replicas, observer);
	                }
	            };
	        },
	        subscribe(observer) {
	            if (typeof observer === 'function') {
	                observer = fromCallbacks(...arguments);
	            }
	
	            return this.view(project).subscribe(observer);
	        },
	        plug(observable, reducer) {
	            const event = this.eventCreatorFactory(reducer);
	            return observable.subscribe({
	                next: event
	            });
	        },
	        view(projectFn) {
	            let _viewObservers = [];
	            const onEvent = this._eventLog;
	
	            return {
	                subscribe (observer) {
	                    if (typeof observer === 'function') {
	                        observer = fromCallbacks(...arguments);
	                    }
	                    _viewObservers.push(observer);
	                    const projectAndNotify = () =>
	                        observer.next(projectFn(events, initial));
	
	                    projectAndNotify();
	
	                    const subscription = onEvent(projectAndNotify);
	
	                    return {
	                        unsubscribe() {
	                            subscription.unsubscribe();
	                            _viewObservers = removeItem(_viewObservers, observer);
	                        }
	                    };
	                }
	            }
	        },
	        transaction() {
	            const _branchRev = events.length;
	            const _altEvents = [];
	            const branch = store(initial);
	            const subs = this._eventLog(branch.dispatch);
	            const bSubs = branch._eventLog(ev => _altEvents.push(ev));
	            return {
	                store: () => branch,
	                dispatch: branch.dispatch,
	                commit: () => {
	                    subs.unsubscribe();
	                    bSubs.unsubscribe();
	                    events = events.slice(0, _branchRev).concat(_altEvents);
	                    _altEvents.length = 0;
	                    notifyAll(replicas, eventCreatorFactory(s=>s)())
	                },
	                cancel: () => {
	                    subs.unsubscribe();
	                    bSubs.unsubscribe();
	                    _altEvents.length = 0;
	                }
	            };
	        },
	        dispatch(event) {
	            events.push(event);
	            notifyAll(replicas, event);
	        },
	        commandCreatorFactory,
	        eventCreatorFactory(reduce) {
	            return update =>
	                this.dispatch({
	                    reduce,
	                    update
	                });
	        }
	    };
	}
	
	module.exports = {
	    store,
	    eventCreatorFactory,
	    commandCreatorFactory,
	    defaultProjection: project
	};

/***/ },
/* 6 */
/***/ function(module, exports) {

	/**
	 * Created by ndyumin on 15.09.2016.
	 */
	function extract(arr, obj) {
	    return arr.filter(item => Object.keys(obj).every(key => item[key] === obj[key]));
	}
	
	function removeItem(arr, item) {
	    const result = arr.slice(0);
	    const index = result.indexOf(item);
	    result.splice(index, 1);
	    return result;
	}
	
	module.exports = {
	    extract,
	    removeItem
	};

/***/ },
/* 7 */
/***/ function(module, exports) {

	/**
	 * Created by ndyumin on 15.09.2016.
	 */
	function notifyAll(observers, state) {
	    observers.forEach(o => o.next(state));
	}
	
	function fromCallbacks(next, error, complete) {
	    return {
	        next,
	        error,
	        complete
	    };
	}
	
	module.exports = {
	    notifyAll,
	    fromCallbacks
	};

/***/ },
/* 8 */
/***/ function(module, exports, __webpack_require__) {

	module.exports = __webpack_require__(9);


/***/ },
/* 9 */
/***/ function(module, exports, __webpack_require__) {

	/* WEBPACK VAR INJECTION */(function(global) {'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	
	var _ponyfill = __webpack_require__(10);
	
	var _ponyfill2 = _interopRequireDefault(_ponyfill);
	
	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }
	
	var root = undefined; /* global window */
	
	if (typeof global !== 'undefined') {
		root = global;
	} else if (typeof window !== 'undefined') {
		root = window;
	}
	
	var result = (0, _ponyfill2['default'])(root);
	exports['default'] = result;
	/* WEBPACK VAR INJECTION */}.call(exports, (function() { return this; }())))

/***/ },
/* 10 */
/***/ function(module, exports) {

	'use strict';
	
	Object.defineProperty(exports, "__esModule", {
		value: true
	});
	exports['default'] = symbolObservablePonyfill;
	function symbolObservablePonyfill(root) {
		var result;
		var _Symbol = root.Symbol;
	
		if (typeof _Symbol === 'function') {
			if (_Symbol.observable) {
				result = _Symbol.observable;
			} else {
				result = _Symbol('observable');
				_Symbol.observable = result;
			}
		} else {
			result = '@@observable';
		}
	
		return result;
	};

/***/ },
/* 11 */
/***/ function(module, exports) {

	"use strict";
	
	Object.defineProperty(exports, "__esModule", {
	    value: true
	});
	exports.fromEvent = fromEvent;
	exports.interval = interval;
	exports.address = address;
	/**
	 * Created by ndyumin on 18.04.2016.
	 */
	function fromEvent(node, eventName) {
	    return {
	        subscribe: function subscribe(observer) {
	            node.addEventListener(eventName, observer.next);
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
	            var interval = setInterval.apply(undefined, [observer.next, ms].concat(values));
	            return function () {
	                return clearInterval(interval);
	            };
	        }
	    };
	}
	
	function address() {
	    var subs = [];
	
	    function deliver(msg) {
	        subs.forEach(function (o) {
	            return o.next(msg);
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
	                return _this.subscribe(o);
	            });
	        }
	    };
	}

/***/ }
/******/ ])
});
;