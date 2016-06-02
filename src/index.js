/**
 * Created by ndyumin on 23.12.2015.
 */

import lens from './lens';
import store from './store/store';
import { fromEvent, interval, bus, address } from './utils';

const lenses = {
    lens
};

const observableFactoryMethods = {
    fromEvent,
    interval,
    bus,
    address
};

module.exports = Object.assign({}, store, observableFactoryMethods, lenses);