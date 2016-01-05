const expect = require('chai').expect;
const lens = require('../src/index').lens;

describe('lens', () => {

    it('provide a getter for the given object property', () => {
        const o1 = {a: 1},
            o2 = {a: 5},
            aL = lens('a');

        expect(aL.get(o1)).to.equal(1);
        expect(aL.get(o2)).to.equal(5);
    });

    it('provide a setter for the given object property', () => {
        const o1 = {a: 1},
            o2 = {a: 5},
            aL = lens('a');
        const o1_ = aL.set(o1, 2);
        const o1__ = aL.set(o1_, 3);
        const o2_ = aL.set(o2, 6);

        expect(o1__.a).to.equal(3);
        expect(o1_.a).to.equal(2);
        expect(o1.a).to.equal(1);
        expect(o2.a).to.equal(5);
        expect(o2_.a).to.equal(6);
    });

    it('should combine with another lens to provide access to nested fields', () => {
        const o1 = {
            a: {
                x: 'hi',
                y: 'hello'
            },
            b: 123
        };
        const o2 = {
            x: {
                a: 1,
                b: 2
            },
            y: 321
        };
        const aL = lens('a'),
            xL = lens('x'),
            axL = aL.combine(xL),
            xaL = xL.combine(aL);

        const o1_ = axL.set(o1, 'test');
        const o2_ = xaL.set(o2, 9000);

        expect(o1_.a.x).to.equal('test');
        expect(o2_.x.a).to.equal(9000);
    });

    it('should provide a shortcut for setting an array field via .map', () => {
        const o ={
            a: [1,2,3,4,5]
        };
        const aL = lens('a');
        const multL = aL.defineMapSetter(x => y => x * y);
        expect(multL.set(o, 2).a).to.deep.equal([2,4,6,8,10]);

        const tripleL = aL.defineMapSetter(() => x => 3 * x);
        expect(tripleL.set(o).a).to.deep.equal([3,6,9,12,15]);
    });

    it('should provide a shortcut for setting an array field via .filter', () => {
        const o ={
            a: [1,2,3,4,5,6]
        };
        const aL = lens('a');
        const modL = aL.defineFilterSetter(x => y => y % x);
        expect(modL.set(o, 2).a).to.deep.equal([1,3,5]);

        const mod3L = aL.defineFilterSetter(() => x => x % 3);
        expect(mod3L.set(o).a).to.deep.equal([1,2,4,5]);
    });
});