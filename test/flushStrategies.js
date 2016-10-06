/**
 * Created by ndyumin on 05.10.2016.
 */
require('babel-core/register');
const expect = require('chai').expect;
const {flushStrategies, store} = require('../src');

const sum = (x, y) => x + y;

function dispatch(event, count) {
    Array
        .from({length: count}, (_, i) => i + 1)
        .forEach(event);
}

describe('flushStrategies', () => {
    it('is triggered on every event', () => {
        let i = 0;
        const testStrategy = project => (events, initial) => (i++, [events, initial]);
        const store_ = store(0, testStrategy);
        const numberEvent = store_.eventCreatorFactory(sum);
        dispatch(numberEvent, 100);
        expect(i).to.equal(100);
    });
    it('keeps a number of events low', () => {
        const testStrategy = project => (events, initial) => {
            expect(events.length).to.equal(1);
            return [[], initial];
        };
        const store_ = store(0, testStrategy);
        const numberEvent = store_.eventCreatorFactory(sum);
        dispatch(numberEvent, 100);
    });
    it('has an immediateFlushStrategy to store only the actual state', () => {
        const store_ = store(0, function(project) {
            let i = 0;
            const strategy = flushStrategies.immediateFlushStrategy(project);

            return function(events, initial) {
                i += 1;
                const [events_, initial_] = strategy(events, initial);
                expect(events_.length).to.equal(0);
                expect(initial_).to.equal(initial + i);
                return [events_, initial_];
            }
        });
        const numberEvent = store_.eventCreatorFactory(sum);
        dispatch(numberEvent, 10);
    });
});