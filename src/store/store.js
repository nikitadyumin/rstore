/**
 * Created by ndyumin on 01.06.2016.
 */

const {factory} = require('./adapters');

function typedStore(plugObservableType, state) {
    const updaters = [];
    const observers = [];

    const broadcast = state => observers.forEach(fn => fn(state));
    const createStateUpdater = reducer => update => broadcast(state = reducer(state, update));

    function unsubAndRemove(updater) {
        updater.wrappedObservable.unsubscribe(updater.subscription);
        updaters.splice(updaters.indexOf(updater), 1);
    }

    function observe(observable, reducer, ...observables) {
        if (observable && reducer) {
            const wrappedObservable = factory(plugObservableType, observable);
            updaters.push({
                observable: observable,
                reducer: reducer,
                wrappedObservable: wrappedObservable,
                subscription: wrappedObservable.subscribe(createStateUpdater(reducer))
            });
            return observe(...observables);
        } else {
            return store_;
        }
    }

    var store_ = {
        subscribe: observer => {
            observers.push(observer);
            observer(state);
            return store_;
        },
        unsubscribe: () => {
            updaters.forEach(unsubAndRemove);
            observers.length = 0;
            return store_;
        },
        plug: observe,
        unplug: (observable, _reducer) => {
            updaters
                .filter(updater => typeof _reducer !== 'undefined'
                    ? updater.reducer === _reducer && updater.observable === observable
                    : updater.observable === observable)
                .forEach(unsubAndRemove);
            return store_;
        },
        toRx: (RxObject = Rx) => RxObject.Observable.create(o => store_.subscribe(o.next.bind(o)))
    };
    return store_;
}

module.exports = {
    store: typedStore.bind(null, null),
    storeBacon: typedStore.bind(null, 'bacon'),
    storeMost: typedStore.bind(null, 'most'),
    storeRx: typedStore.bind(null, 'rxjs5')
};
