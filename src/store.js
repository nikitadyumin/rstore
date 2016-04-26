/**
 * Created by ndyumin on 23.12.2015.
 */

function runUnsubscribe(subscription) {
    if (typeof subscription === 'function') {
        return subscription();
    }
    if (typeof subscription === 'object') {
        if (typeof subscription.unsubscribe === 'function') {
            return subscription.unsubscribe();
        }
        return console.log('ehm...', subscription);
    }
    return console.log('unknown subscription type', subscription);
}

function wrapObservable(s$) {
    if (typeof s$.observe === 'function') {
        return {subscribe: s$.observe.bind(s$)};
    }
    if (typeof s$.onValue === 'function') {
        return {subscribe: s$.onValue.bind(s$)};
    }
    return s$;
}

function rstore(state) {
    const observables = [];
    const observers = [];
    const subscriptions = [];
    let started = false;
    const broadcast = state => observers.forEach(fn => fn(state));
    const clb = reducer => update => broadcast(state = reducer(state, update));

    const observe = (s$, reduce, ...streams) => {
        if (s$ && reduce) {
            subscriptions.push(wrapObservable(s$).subscribe(clb(reduce)));
            return observe(...streams);
        }
    };

    const executor = next => {
        next(state);
        observers.push(next);
        if (!started) {
            started = true;
            observe(...observables);
        }
        return _store;
    };

    var _store = {
        /**
         * @deprecated
         * use .subscribe instead
         */
        stream: () => ({
            onValue: (console.warn('this method will be removed in 0.3, use .subscribe instead'), executor)
        }),
        /**
         *
         */
        subscribe: executor,
        /**
         *
         */
        unsubscribe: () => {
            started = false;
            subscriptions.forEach(runUnsubscribe);
            subscriptions.length = 0;
            observers.length = 0;
            return _store;
        },
        /**
         *
         */
        plug: (...streams) => {
            observables.push(...streams);
            if (started) {
                observe(...streams);
            }
            return _store;
        }
    };

    return _store;
}

module.exports = rstore;