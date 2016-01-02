# rstore
explicit, declarative and composable store\model based on Bacon.js

## basic example
[source](https://github.com/nikitadyumin/rstore/tree/master/examples/counter)
```javascript
const $ = require('jquery');
const Bacon = require('baconjs');
const rstore = require('rstore').store;

// 1: define input streams (e.g. streams of ones produced by button clicks)
const addClick$ = Bacon.fromEventTarget($('#add'), 'click').map(() => 1);
const subClick$ = Bacon.fromEventTarget($('#sub'), 'click').map(() => 1);

// 2: define a store with the initial model (0) and ways input streams modify the model
const store = rstore(0)
    .plug(addClick$, (s, a) => s + a)
    .plug(subClick$, (s, a) => s - a);

// 3: define the way model is rendered
const render = (model) => $('#result').text(model);
store.stream().onValue(render);
```
In this example `render` is called for each model state (including the explicitely defined initial value).

## extended example (React)
In case of a need for more imperative code, Bacon.Bus can be used. It produces a stream, where values can be pushed manually:
[source](https://github.com/nikitadyumin/rstore/blob/master/examples/counter-react/src/index.js)

```javascript
import React from 'react';
import Bacon from 'baconjs';
import { render  as renderDom } from 'react-dom';
import { store } from 'rstore';

// define a React component (via render method)
const Counter = ({model, onAdd, onSub}) => (
    <div>
        <div>{model}</div>
        <button onClick={onAdd}>+</button>
        <button onClick={onSub}>-</button>
    </div>
);

// define a stream of actions and expose `add` and `sub` methods to trigger the respective actions
const actions = () => {
    const bus = new Bacon.Bus();
    return ({
        stream: () => bus,
        add: () => bus.push(1),
        sub: () => bus.push(-1)
    });
};
// instantiate the actions stream (bus)
const _actions = actions();

// define a render function
const render = (model) => {
    renderDom(
        <Counter model={model} onAdd={_actions.add} onSub={_actions.sub}/>,
        document.getElementById('root')
    )
};

// define the way actions are dispatched ('a' is a current state (value), 'b' is a value coming from the stream):
const add = (a, b) => a + b;

// define a store with an initial value, plug in the action stream and point to a render function
const _store = store(0)
    .plug(_actions.stream(), add)
    .stream().onValue(render);
```

## easy access to model fields
In many cases model modification functions are just setters that take the current state and a new value as inputs and produce a new model. It might be hard to access\update deeply nested fields as it is desirable that functions stay pure and data stays immutable.

rstore has a `lens` function that is a pair of a setter and a getter for the given field:
```javascript
const lens = require('rstore').lens;
const l = lens('a');
const o1 = {a: 11};
const o2 = {a: 22};

console.log( l.get(o1) ) // returns a value of the field 'a' in the object 'o1' (11)
console.log( l.get(o2) ) // returns a value of the field 'a' in the object 'o2' (22)

console.log( l.set(o1, 33) ) // returns a new object like 'o1', but the field 'a' is set to '33' ({a: 33}), object 'o1' stays the same
console.log( l.set(o2, 44) ) // returns a new object like 'o2', but the field 'a' is set to '44' ({a: 44}), object 'o2' stays the same
```
to provide access to nested objects, lenses can be 'combined':
```javascript
   const lens = require('rstore').lens;
   const aL = lens('a');
   const bL = lens('b');
   const abL = aL.combine(bL);
   const o = {
            a: {
                b: 'nested'
            },
            b: 'immediate'
        };
    console.log( bL.get(o) ); // returns a value of an 'b' field of the object 'o' ('immediate')
    console.log( abL.get(o) ); // returns a value of a 'b' field in the nested object ('nested')
    console.log( abL.set(o, 123) ); // returns a copy of 'o' with '.a.b' field set to 123 ({ a: { b: 123}, b: 'immediate'})
```
An example from a [todo app](https://github.com/nikitadyumin/rstore/tree/master/examples/todo):
```javascript
const rs = require('rstore');
const filterL = rs.lens('filter');
//... code here
const model = rs.store({
    maxId: 1,
    filter: '',
    tasks: [
        {name: 'test the rstore', id: 0, done: false},
        {name: 'write a todo app', id: 1, done: true}
    ]
});
//... mode code here
model
    .plug(filter$, filterL.set)
    .stream().onValue(render);
```
