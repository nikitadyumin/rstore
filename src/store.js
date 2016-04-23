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

function rstore(init) {
    const observables = [];
    const observers = [];
    const subscriptions = [];
    let started = false;
    const broadcast = v => observers.forEach(fn => fn(v));

    function _store(model) {
        const clb = reducer => v => broadcast(model = reducer(model, v));

        const observe = streams => {
            while (streams.length > 1) {
                const s$ = wrapObservable(streams.shift());
                const reduce = streams.shift();
                subscriptions.push(s$.subscribe(clb(reduce)));
            }
        };

        const executor = next => {
            next(model);
            observers.push(next);
            if (!started) {
                started = true;
                observe([].concat(observables));
            }
            return _store(model);
        };

        return {
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
                return _store(model);
            },
            /**
             *
             */
            plug: (...streams) => {
                observables.push(...streams);
                if (started) {
                    observe(streams);
                }
                return _store(model);
            }
        };
    }

    return _store(init);
}

module.exports = rstore;