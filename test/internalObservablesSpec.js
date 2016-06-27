/**
 * Created by ndyumin on 05.06.2016.
 */
"use strict";
require('babel-core/register');

const rstore = require('../src');

const Rx = require('rxjs');

describe('internal observables', () => {
    it('address/sends directly', done => {
        const address_ = rstore.address();
        let i = 0;

        function test(v) {
            if (++i === 2) {
                return v === 20 ? done() : done(new Error(v));
            }
        }

        rstore.store(10)
            .plug(address_, (s, u) => s + u)
            .subscribe(test);

        address_.send(10);
    });
    it('address/sends via a thunk', done => {
        const address_ = rstore.address();
        let i = 0;

        function test(v) {
            if (++i === 4) {
                return v === 40 ? done() : done(new Error(v));
            }
        }

        rstore.store(10)
            .plug(address_, (s, u) => s + u)
            .subscribe(test);

        const signal = address_.signal(10);
        signal();
        signal();
        signal();
    });
    it('address/sends via a thunk', done => {
        const address_ = rstore.address();
        let i = 0;

        function test(v) {
            if (++i === 4) {
                return v === 40 ? done() : done(new Error(v));
            }
        }

        rstore.store(10)
            .plug(address_, (s, u) => s + u)
            .subscribe(test);

        const signal = address_.signal(10);
        signal();
        signal();
        signal();
    });

    it('address/unsub from address', done => {
        const address_ = rstore.address();
        let i = 0;

        function test(_v) {
            i++;
            setTimeout(() => {
                if (i === 1) {
                    done();
                } else {
                    done(new Error('extra calls'))
                }
            }, 10);
        }

        const subs = address_.subscribe({next: test});
        address_.send(5);
        subs();
        address_.send(10);
    });

    it('address/toRx', done => {
        const address_ = rstore.address();
        let i = 0;

        function test(v) {
            i++;
            if (i === 2) {
                if (v === 30) {
                    done();
                } else {
                    done(new Error('wrong number: ' + v))
                }
            }
        }

        address_.toRx(Rx).map(x => x * 2).scan((x, y) => x + y).subscribe(test);
        address_.send(5);
        address_.send(10);
    });

    it('interval', done => {
        let i = 0;

        function test(v) {
            if (++i === 4) {
                return v === 400 ? done() : done(new Error(v));
            }
        }

        rstore.store(100)
            .plug(rstore.interval(10, 100), (s, u) => s + u)
            .subscribe(test);
    });

    it('fromEvent', done => {
        let i = 0;

        function test(v) {
            if (++i === 4) {
                return v === 103 ? done() : done(new Error(v));
            }
        }

        const node = {
            addEventListener: (name, clb) => {
                setTimeout(clb, 1, 1);
                setTimeout(clb, 1, 1);
                setTimeout(clb, 1, 1);
            }
        };
        rstore.store(100)
            .plug(rstore.fromEvent(node, 'event'), (s, u) => s + u)
            .subscribe(test);
    });
});