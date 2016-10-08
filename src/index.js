/**
 * Created by ndyumin on 23.12.2015.
 */

import lens from './lens';
import _store from './store/stk-store-adapter';
import {flushStrategies, devtools} from 'stk';
import {fromEvent, interval, bus, address} from './utils';

const lenses = {
    lens
};

const observableFactoryMethods = {
    flushStrategies,
    devtools,
    fromEvent,
    interval,
    bus,
    address
};

module.exports = Object.assign({
    store: _store,
    storeR: _store,
    storeRx: _store,
    storeBacon: _store,
    storeMost: _store
}, observableFactoryMethods, lenses);