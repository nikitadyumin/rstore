/**
 * Created by ndyumin on 29.12.2015.
 */
function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

module.exports = clone;