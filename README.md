# rstore

[![Join the chat at https://gitter.im/nikitadyumin/rstore](https://badges.gitter.im/nikitadyumin/rstore.svg)](https://gitter.im/nikitadyumin/rstore?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
explicit, declarative and composable reactive store\model

## Introduction
build complex UIs with trivial steps:

1) describe a model (properties, initial state):

```javascript
const {store} = require('rstore'); 
const myStore = store(0);
```

2) define sources of changes (using `fromEvent` helper or Rx, Bacon, most streams, see [defining inputs](define_changes.md))

```javascript
const inc$ = fromEvent(document.getElementById('inc'), 'click');
const dec$ = fromEvent(document.getElementById('dec'), 'click');
```

3) define how these changes affect the model:

```javascript
myStore
    .plug(inc$, (state, _update) => state + 1)
    .plug(dec$, (state, _update) => state - 1);
```

4) subscribe to the store and get an updated model on every change:

```javascript
myStore.subscribe(model => console.log(model));
```

## composability example
```javascript
const {store, fromEvent} = require('./dist/rstore');

const $dec = document.getElementById('dec');
const $inc = document.getElementById('inc');
const $inp = document.getElementById('inp');

const counter$ = store(0)
  .plug(
    fromEvent($dec, 'click'), (s,u) => s - 1,
    fromEvent($inc, 'click'), (s,u) => s + 1)

const label$ = store('')
  .plug(fromEvent($inp, 'change'), (s,u) => u.target.value)

store({
  n: 0,
  s: ''
}).plug(
  counter$, (s, u) => Object.assign({}, s, {n: u}),
  label$, (s, u) => Object.assign({}, s, {s: u})
).subscribe(x => console.log(x));
```

the same example with lenses (to access (nested) model fields easily)
```javascript
const {store, lens, fromEvent} = require('./dist/rstore');
const $dec = document.getElementById('dec');
const $inc = document.getElementById('inc');
const $inp = document.getElementById('inp');
const nL = lens('n');
const sL = lens('s');

const counter$ = store(0)
  .plug(
    fromEvent($dec, 'click'), (s,u) => s - 1,
    fromEvent($inc, 'click'), (s,u) => s + 1)

const label$ = store('')
  .plug(fromEvent($inp, 'change'), (s,u) => u.target.value)

store({
  n: 0,
  s: ''
}).plug(
  counter$, (s, u) => nL.set(s, u),
  label$, (s, u) => sL.set(s, u)
).subscribe(x => console.log(x));
```

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

// define a stream of actions 
// and expose `add` and `sub` methods to trigger the respective actions
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

// define the way actions are dispatched ('a' is a current state (value), 
// 'b' is a value coming from the stream):
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

// returns a value of the field 'a' in the object 'o1' (11)
console.log( l.get(o1) ) 
// returns a value of the field 'a' in the object 'o2' (22)
console.log( l.get(o2) ) 

// returns a new object like 'o1', but the field 'a' is set to '33' 
// ({a: 33}), object 'o1' stays the same
console.log( l.set(o1, 33) ) 
// returns a new object like 'o2', but the field 'a' is set to '44' 
// ({a: 44}), object 'o2' stays the same
console.log( l.set(o2, 44) ) 
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
    // returns a value of an 'b' field of the object 'o' ('immediate')
    console.log( bL.get(o) ); 
    // returns a value of a 'b' field in the nested object ('nested')
    console.log( abL.get(o) ); 
    // returns a copy of 'o' with '.a.b' field set to 123 
    // ({ a: { b: 123}, b: 'immediate'})
    console.log( abL.set(o, 123) ); 
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
