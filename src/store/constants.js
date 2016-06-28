/**
 * Created by ndyumin on 06.06.2016.
 */
"use strict";

function $$Symbol(name) {
    this.name = name;
}

$$Symbol.prototype.toString = () => Object.keys(this).map(k => `${k}:${this[k]}`).join(',');

const symbol = typeof Symbol !== 'undefined' ? Symbol : name => ({name});

module.exports = {
    signature: symbol('rstore')
};