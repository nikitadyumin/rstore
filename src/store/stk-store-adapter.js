/**
 * Created by ndyumin on 29.09.2016.
 */
const {store, flushStrategies} = require('stk');

function fromCallbacks(next, error, complete) {
    return {
        next,
        error,
        complete
    };
}

function wrapBacon(observable) {
    return {
        subscribe (observer)  {
            if (typeof observer === 'function') {
                observer = fromCallbacks(...arguments);
            }

            const subs = [
                observable.onValue(observer.next),
                observable.onEnd(observer.complete),
                observable.onError(observer.error)
            ];
            return {
                unsubscribe: () => subs.forEach(fn => fn())
            };
        }
    }
}

function _store(initial, strategy = flushStrategies.immediateFlushStrategy) {
    const instance = store(initial, strategy);
    const plug = instance.plug.bind(instance);
    const subscribe = instance.subscribe.bind(instance);
    return Object.assign(instance, {
        _subs: [],
        _observers: [],
        plug(observable, reducer, ...streams) {

            if (observable.onValue) {
                observable = wrapBacon(observable)
            }

            this._subs.push({
                observable,
                reducer,
                subscription: plug(observable, reducer)
            });
            if (streams.length) {
                this.plug(...streams);
            }
            return this;
        },
        unplug(observable, reducer) {
            function unsubAndRemove(sub) {
                sub.unsubscribe();
                this._subs.splice(this._subs.indexOf(sub), 1);
            }

            this._subs
                .filter(sub => typeof reducer !== 'undefined'
                    ? sub.reducer === reducer && sub.observable === observable
                    : sub.observable === observable)
                .forEach(unsubAndRemove, this);

            return this;
        },
        subscribe(observer) {
            if (typeof observer === 'function') {
                observer = fromCallbacks(...arguments);
            }
            this._observers.push(subscribe(observer));
            return this;
        },
        reset() {
            this._observers.forEach(subs => subs.unsubscribe());
            this._observers.length = 0;
            return this;
        },
        toRx (RxObject = Rx) {
            return RxObject.Observable.create(this.subscribe.bind(this));
        }
    })
}

module.exports = _store;