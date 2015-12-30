/**
 * Created by ndyumin on 29.12.2015.
 */

const clone = require('./clone');

function defineGetter(name) {
    return o => o[name];
}

function defineSetter(name) {
    return (o, v) => {
        const _clone = clone(o);
        _clone[name] = v;
        return _clone;
    };
}

function lens(name) {
    function _lens(getter, setter) {
        return {
            get: getter,
            set: setter,
            toggle: obj => setter(obj, !getter(obj)),
            combine: l => _lens(
                (obj) => l.get(getter(obj)),
                (obj, val) => setter(obj, l.set(getter(obj), val))
            ),
            defineMapSetter: mapper => _lens(
                getter,
                (obj, value) => setter(obj, getter(obj).map(mapper(value)))
            ),
            defineFilterSetter: filter => _lens(
                getter,
                (obj, value) => setter(obj, getter(obj).filter(filter(value)))
            )
        };
    }

    return _lens(defineGetter(name), defineSetter(name));
}

module.exports = lens;