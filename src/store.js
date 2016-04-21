/**
 * Created by ndyumin on 23.12.2015.
 */

function runUnsub(subscription) {
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
    const plugged = [];

    function _store(model) {
        const executor = next => {
            next(model);
            const subscriptions = [];
            const reducers = [].concat(plugged);
            const clb = reducer => v => next(model = reducer(model, v));
            while (reducers.length) {
                const s$ = wrapObservable(reducers.shift());
                const reduce = reducers.shift();
                subscriptions.push(s$.subscribe(clb(reduce)));
            }
            return () => subscriptions.forEach(runUnsub);
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
            plug: (...streams) => {
                plugged.push(...streams);
                return _store(model);
            }
        };
    }

    return _store(init);
}

module.exports = rstore;