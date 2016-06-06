/**
 * Created by ndyumin on 05.06.2016.
 */
"use strict";
require('babel-core/register');

const rstore = require('../src');

const Rx = require('rxjs');

describe('store', () => {
    it('sync', done => {
        const s1 = rstore.store(10);
        const s2 = rstore.store(20);
        const s3 = rstore.store(30);
        rstore.store(40)
            .plug(s1, (s, u) => s + u)
            .plug(s2, (s, u) => s + u)
            .plug(s3, (s, u) => s + u)
            .subscribe(v => v === 100 ? done() : done(new Error(v)));
    });
});