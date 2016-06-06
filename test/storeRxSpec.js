/**
 * Created by ndyumin on 05.06.2016.
 */
"use strict";
require('babel-core/register');

const rstore = require('../src');

const Rx = require('rxjs');

describe('store', () => {
    it('sync', done => {
        rstore
            .storeRx(0)
            .plug(Rx.Observable.of(1), (s, u) => u)
            .subscribe(v => v === 1 ? done() : done(new Error(v)));
    });

    it('sync, autodetect', done => {
        rstore
            .store(0)
            .plug(Rx.Observable.of(1), (s, u) => u)
            .subscribe(v => v === 1 ? done() : done(new Error(v)));
    });

    it('async', done => {
        let i = 0;
        function test(v) {
            if (++i === 5) {
                done(v === 10 ? null : new Error('wrong value ', v));
            }
        }
        rstore
            .store(0)
            .plug(Rx.Observable.create(o => [1,2,3,4].forEach(v => setTimeout(x => o.next(x), v, v))), (s, u) => s + u)
            .subscribe(test);
    });

    it('sync, plug later', done => {
        let i = 0;
        function test(v) {
            if (++i === 2) {
                done(v === 1 ? null : new Error('wrong value ', v));
            }
        }
        const s = rstore
            .store(0)
            .subscribe(test);

        s.plug(Rx.Observable.of(1), (s, u) => u)
    });
});