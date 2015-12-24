/**
 * Created by ndyumin on 23.12.2015.
 */

const Bacon = require('baconjs');

function rstore(init) {
    function _store(reducers) {
        const model = Bacon.update(init, ...reducers);
        return {
            plug: function (in$, reducer) {
                return _store(reducers.concat(in$, reducer));
            },
            stream: function () {
                return model;
            }
        };
    }

    return _store([]);
}

module.exports = rstore;