require('babel-core/register');

const expect = require('chai').expect;
const rstore = require('../src');

const noop = () => {};

describe('factories', () => {
    it('has fromEvent subs', ()=> {
        rstore.fromEvent({
            addEventListener: (event, clb) => {
                clb(123)
            }
        }).subscribe(v => {
            expect(v).to.equal(123);
        })
    });
    it('has fromEvent and unsubs', (done)=> {
        const unsubscribe = rstore.fromEvent({
            addEventListener: noop,
            removeEventListener: done
        }).subscribe(noop);
        unsubscribe();
    });
    it('has buses for imperative event pushing', (done)=> {
        const bus = rstore.bus();
        const values = [1,2,3,4];
        function test(v) {
            const expected = values.shift();
            if (v !== expected) {
                done(new Error(`incorrect value: expected ${expected}, got ${v}`));
            }
            if (values.length === 0) {
                done();
            }
        }
        bus.subscribe(test);
        values.slice(0).forEach(bus.next);
    });
});