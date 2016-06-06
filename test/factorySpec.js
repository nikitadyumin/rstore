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
        }).subscribe({
            next: v => expect(v).to.equal(123)
        });
    });
    it('has fromEvent and unsubs', (done)=> {
        const unsubscribe = rstore.fromEvent({
            addEventListener: noop,
            removeEventListener: done
        }).subscribe(noop);
        unsubscribe();
    });

});