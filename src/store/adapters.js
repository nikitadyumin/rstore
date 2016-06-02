/**
 * Created by ndyumin on 01.06.2016.
 */
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
    // most
    if (typeof observable.observe === 'function') {
        return {
            subscribe: next => observable.observe(next),
            unsubscribe: () => {}
        };
    }
    // bacon, kefir
    if (typeof observable.onValue === 'function') {
        return {
            subscribe: next => observable.onValue(next),
            unsubscribe: autodetectUnsubscribe
        };
    }
    // else
    return  {
        subscribe: next => observable.subscribe(next),
        unsubscribe: autodetectUnsubscribe
    };
}

function rxjs5(observable) {
    return {
        subscribe: next => observable.subscribe(next),
        unsubscribe: subscription => subscription.unsubscribe()
    };
}

function rstore(observable) {
    return {
        subscribe: next => observable.subscribe(o),
        unsubscribe: unsubscribe => unsubscribe()
    };
}

function bacon(observable) {
    return {
        subscribe: next => observable.onValue(o),
        unsubscribe: unsubscribe => unsubscribe()
    };
}

function most(observable) {
    return {
        subscribe: next => observable.observe(o),
        unsubscribe: () => {}
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