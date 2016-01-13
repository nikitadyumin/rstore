const Bacon = require('baconjs');
const rstore = require('rstore');

const actions = () => {
    const bus = new Bacon.Bus();
    return ({
        stream: () => bus,
        say: (x) => bus.push(x),
        sayA: () => bus.push('A'),
        sayB: () => bus.push('B')
    });
};

const wordL = rstore.lens('word');
const values= actions();

const store = rstore.store({
    word: 'init'
}).plug(values.stream(), wordL.set);

store.stream().onValue(
    (value) => console.log(value)
);

// { word: 'init' }
values.sayA();
// { word: 'A' }
values.sayB();
// { word: 'B' }
values.sayA();
// { word: 'A' }
values.say('custom');
// { word: 'custom' }
values.sayA();
// { word: 'A' }