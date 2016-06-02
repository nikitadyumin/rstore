/**
 * Created by ndyumin on 14.03.2016.
 */
"use strict";
require('babel-core/register');

const expect = require('chai').expect;
const rstore = require('../src');

const Bacon = require('baconjs');
const Rx = require('rxjs');
const most = require('most');

describe('store', () => {
    it('works without change sources', done=> {
        rstore.store(123).subscribe(v => v === 123 ? done() : done(new Error(v)));
    });

    it('works with 1 stream of changes', (done) => {
        const s0$ = new Bacon.Bus();

        const stream = [1, 2, 3, 4, 5, 6];
        let calls = 0;

        function test(val) {
            calls += 1;
            if (calls === stream.length + 1) {
                expect(val).to.equal(21);
                done();
            }
        }

        rstore.store(0)
            .plug(s0$, (s, u) => s + u)
            .subscribe(test);

        stream.forEach(v => s0$.push(v));
    });


    it('works with 2 streams of changes (within one .plug call)', (done) => {
        const s0$ = new Bacon.Bus();
        const s1$ = new Bacon.Bus();

        const stream1 = [1, 2, 3, 4, 5, 6];
        const stream2 = [1, 2, 3];

        let calls = 0;

        function test(val) {
            calls += 1;
            if (calls === stream1.length + stream2.length + 1) {
                expect(val).to.equal(15);
                done();
            }
        }

        rstore.store(0)
            .plug(
                s0$, (s, u) => s + u,
                s1$, (s, u) => s - u)
            .subscribe(test);

        stream1.forEach(v => setTimeout(() => s0$.push(v), 5, v));
        stream2.forEach(v => setTimeout(() => s1$.push(v), 3, v));
    });

    it('works with 2 streams of changes (in separate .plug calls)', (done) => {
        const s0$ = new Bacon.Bus();
        const s1$ = new Bacon.Bus();

        const stream1 = [1, 2, 3, 4, 5, 6];
        const stream2 = [1, 2, 3];

        let calls = 0;

        function test(val) {
            calls += 1;
            if (calls === stream1.length + stream2.length + 1) {
                expect(val).to.equal(15);
                done();
            }
        }

        rstore.store(0)
            .plug(s0$, (s, u) => s + u)
            .plug(s1$, (s, u) => s - u)
            .subscribe(test);

        stream1.forEach(v => setTimeout(() => s0$.push(v), 5, v));
        stream2.forEach(v => setTimeout(() => s1$.push(v), 3, v));
    });

    it('works with many streams of changes (in one .plug call)', (done) => {
        const s0$ = new Bacon.Bus();
        const s1$ = new Bacon.Bus();
        const s2$ = new Bacon.Bus();
        const s3$ = new Bacon.Bus();
        const s4$ = new Bacon.Bus();
        const s5$ = new Bacon.Bus();

        const stream1 = [1, 2, 3, 4, 5, 6];

        let calls = 0;

        function test(val) {
            calls += 1;
            if (calls === stream1.length * 6 + 1) {
                expect(val).to.equal(0);
                done();
            }
        }

        rstore.store(0)
            .plug(
                s0$, (s, u) => s + u,
                s1$, (s, u) => s + u,
                s2$, (s, u) => s + u,
                s3$, (s, u) => s - u,
                s4$, (s, u) => s - u,
                s5$, (s, u) => s - u)
            .subscribe(test);

        stream1.forEach(v => setTimeout(() => s0$.push(v), 7, v));
        stream1.forEach(v => setTimeout(() => s1$.push(v), 5, v));
        stream1.forEach(v => setTimeout(() => s2$.push(v), 3, v));
        stream1.forEach(v => setTimeout(() => s3$.push(v), 6, v));
        stream1.forEach(v => setTimeout(() => s4$.push(v), 4, v));
        stream1.forEach(v => setTimeout(() => s5$.push(v), 2, v));
    });

    it('works with many streams of changes (in many .plug calls)', (done) => {
        const s0$ = new Bacon.Bus();
        const s1$ = new Bacon.Bus();
        const s2$ = new Bacon.Bus();
        const s3$ = new Bacon.Bus();
        const s4$ = new Bacon.Bus();
        const s5$ = new Bacon.Bus();

        const stream1 = [1, 2, 3, 4, 5, 6];

        let calls = 0;

        function test(val) {
            calls += 1;
            if (calls === stream1.length * 6 + 1) {
                expect(val).to.equal(0);
                done();
            }
        }

        rstore.store(0)
            .plug(
                s0$, (s, u) => s + u,
                s1$, (s, u) => s - u)
            .plug(
                s2$, (s, u) => s + u,
                s3$, (s, u) => s - u)
            .plug(
                s4$, (s, u) => s + u,
                s5$, (s, u) => s - u)
            .subscribe(test);

        stream1.forEach(v => setTimeout(() => s0$.push(v), 7, v));
        stream1.forEach(v => setTimeout(() => s1$.push(v), 5, v));
        stream1.forEach(v => setTimeout(() => s2$.push(v), 3, v));
        stream1.forEach(v => setTimeout(() => s3$.push(v), 6, v));
        stream1.forEach(v => setTimeout(() => s4$.push(v), 4, v));
        stream1.forEach(v => setTimeout(() => s5$.push(v), 2, v));
    });

    it('work with nested objects via lenses (e2e)', (done) => {
        const action$ = new Bacon.Bus();
        const action2$ = new Bacon.Bus();

        const aL = rstore.lens('a');
        const axL = aL.combine(rstore.lens('x'));
        const axfL = axL.combine(rstore.lens('f'));
        const ayL = aL.combine(rstore.lens('y'));

        const answers = [
            '{"a":{"x":{"f":1},"y":2},"b":"hello"}',
            '{"a":{"x":{"f":10},"y":2},"b":"hello"}',
            '{"a":{"x":{"f":999},"y":2},"b":"hello"}',
            '{"a":{"x":{"f":999},"y":789},"b":"hello"}',
            '{"a":{"x":{"f":"sdfsdf"},"y":789},"b":"hello"}'
        ];

        function test(val) {
            expect(JSON.stringify(val)).to.equal(answers.shift());
            if (answers.length === 0) {
                done();
            }
        }

        const store = rstore.store({
                a: {
                    x: {
                        f: 1
                    },
                    y: 2
                },
                b: 'hello'
            })
            .plug(
                action$, axfL.set,
                action2$, ayL.set
            );

        store.subscribe(test);

        action$.push(10);
        action$.push(999);
        action2$.push(789);
        action$.push('sdfsdf');
    });

    it('unsubscribes correctly', (done) => {
        const values = [1, 2, 3, 4];
        const s0$ = new Bacon.Bus();
        const s1$ = Rx.Observable.create(o => {
            const timeouts = values.map(v => setTimeout(() => o.next(v), 10));
            return () => timeouts.forEach(clearInterval);
        });
        const s2$ = most.from(values);

        let calls = 0;
        const expectedCallsNumber = values.length * 3 + 1;

        function test(_value) {
            calls += 1;
            if (calls === expectedCallsNumber) {
                setTimeout(() => {
                    if (calls === expectedCallsNumber) {
                        expect(_value).to.equal(40);
                        done();
                    } else {
                        done(new Error('extra calls'))
                    }
                }, 10);
            }
        }

        const sum = (s, u) => s + u;

        rstore.store(10)
            .plug(s0$, sum)
            .plug(s1$, sum)
            .plug(s2$, sum)
            .subscribe(test);

        values.forEach(v => setTimeout(() => s0$.push(v), 0, v));
    });

    it('works with rxjs and mostjs', (done) => {
        const values = [1, 2, 3, 4];
        const s0$ = Bacon.fromArray(values); // sync
        const s1$ = Rx.Observable.from(values); // sync
        const s2$ = most.from(values); // async

        let calls = 0;
        const expectedCallsNumber = values.length + 1;

        function test(value) {
            calls += 1;
            if (calls === expectedCallsNumber) {
                setTimeout(() => {
                    if (calls === expectedCallsNumber) {
                        expect(value).to.equal(31);
                        done();
                    } else {
                        done(new Error('extra calls'))
                    }
                }, 10);
            }
        }

        const sum = (s, u) => s + u;
        rstore.store(1)
            .plug(
                s0$, sum,
                s1$, sum,
                s2$, sum
            ).subscribe(test);

    });

    it("fromEvent factory", (done)=> {
        const eventName = 'click';
        const data = 'data';
        const mock = {
            addEventListener: function (event, clb) {
                this.clb = clb;
            },
            removeEventListener: function (event, clb) {
                this.clb = null;
            },
            fireEvent: function (data) {
                this.clb(data);
            }
        };
        const obs = rstore.fromEvent(mock, eventName);
        obs.subscribe(function (v) {
            done(v === data ? null : new Error('wrong data'))
        });
        mock.fireEvent(data);
    });

    it("resubscribe (Bacon, hot)", done => {
        const values = [1, 2, 3, 4];
        const s0$ = Bacon.fromArray(values);

        let i = 0;

        function test(value) {
            if (2 === ++i) {
                setTimeout(() => {
                    done(value === 10 ? null : new Error('wrong value + ' + value));
                }, 10);
            }
        }

        const store = rstore.store(0)
            .plug(s0$, (s, u) => s + u)
            .subscribe(test);

        store.unsubscribe();
        store.subscribe(test);
    });

    it("resubscribe (Bacon, 2 hot)", done => {
        const values = [1, 2, 3, 4];
        const s0$ = Bacon.fromArray(values);
        const s1$ = Bacon.fromArray(values);

        let i = 0;

        function test(value) {
            if (2 === ++i) {
                setTimeout(() => {
                    done(value === 20 ? null : new Error('wrong value + ' + value));
                }, 10);
            }
        }

        const store = rstore.store(0)
            .plug(s0$, (s, u) => s + u)
            .plug(s1$, (s, u) => s + u)
            .subscribe(test);

        store.unsubscribe();
        store.subscribe(test);
    });

    it("resubscribe (Rx, 1 cold, 3 times)", done => {
        const values = [1, 2, 3, 4];
        const s0$ = Rx.Observable.from(values);

        let i = 0;

        function test(value) {
            if (3 === ++i) {
                setTimeout(() => {
                    done(value === 10 ? null : new Error('wrong value + ' + value));
                }, 10);
            }
        }

        const store = rstore.store(0)
            .plug(s0$, (s, u) => s + u)
            .subscribe(test);

        store.unsubscribe();
        store.subscribe(test);
        store.unsubscribe();
        store.subscribe(test);
    });

    it("plug later", done => {
        let i = 0;
        const values = [1, 2, 3, 4];
        const s0$ = Bacon.fromArray(values);
        const s1$ = Bacon.fromArray(values);
        const store = rstore.store(0)
            .plug(s0$, (s, u) => s + u)
            .subscribe(test);

        store.plug(s1$, (s, u) => s + u);

        function test(v) {
            if (++i === values.length  + 1) {
                done(v === 20 ? null : new Error(v));
            }
        }
    });

    it('stops producting values on unsubscribe', done => {
        let i = 0;
        const subs = rstore.store(0)
            .plug(rstore.interval(0), (s, u) => s + 1)
            .subscribe(test);

        function test(_v) {
            if (++i === 10) {
                subs.unsubscribe();
                setTimeout(() => i > 10 ? done(new Error('not unsubscribed')) : done(), 5);
            }
        }
    });
});