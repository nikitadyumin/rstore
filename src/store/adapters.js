/**
 * Created by ndyumin on 01.06.2016.
 */
const {signature} = require('./constants');
const run = fn => fn();

function autodetectUnsubscribe(subscription) {
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
            subscribe: o => {
                const subs = [
                    observable.onValue(o.next),
                    //observable.onError(o.error),
                    observable.onEnd(o.complete)
                ];
                return () => subs.forEach(run);
            },
            unsubscribe: autodetectUnsubscribe
        };
    }
    return {
        subscribe: o => observable.subscribe(o),
        unsubscribe: autodetectUnsubscribe
    };
}

function rxjs5(observable) {
    return {
        subscribe: o => observable.subscribe(o),
        unsubscribe: subscription => subscription.unsubscribe()
    };
}

function rstore(observable) {
    return {
        subscribe: o => observable.subscribe(o.next),
        unsubscribe: unsubscribe => unsubscribe()
    };
}

function bacon(observable) {
    return {
        subscribe: o => observable.onValue(o.next),
        unsubscribe: unsubscribe => unsubscribe()
    };
}

function most(observable) {
    return {
        subscribe: o => observable.observe(o.next),
        unsubscribe: () => {
        }
    };
}

const factory = (type, observable) => ({
    rxjs5,
    rstore,
    bacon,
    most
}[type] || autodetect)(observable);

module.exports = {
    factory
};