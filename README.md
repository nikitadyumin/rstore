# rstore
[![Join the chat at https://gitter.im/nikitadyumin/rstore](https://badges.gitter.im/nikitadyumin/rstore.svg)](https://gitter.im/nikitadyumin/rstore?utm_source=badge&utm_medium=badge&utm_campaign=pr-badge&utm_content=badge)
[![Build Status](https://travis-ci.org/nikitadyumin/rstore.svg?branch=master)](https://travis-ci.org/nikitadyumin/rstore)
[![Coverage Status](https://coveralls.io/repos/github/nikitadyumin/rstore/badge.svg?branch=master)](https://coveralls.io/github/nikitadyumin/rstore?branch=master)

a straightforward, explicit, declarative and composable reactive store/model

## Introduction

RStore is an observable (reactive) model.

### Reactive?
| Active | Reactive |
|---|---|
| direct query at some point in time | a subscription to all updates |
| console.log(state.getValue()) | state.subscribe(value => console.log(value)) |

In the reactive world of observables you don't have to think if something has happened by the time something else happens.
So you can concentrate on a single thing - defining a way the changes combine and map to the result.

### What are the benefits?
- a state is defined in one place 
```
store(0)
```
- every observer immediately receives a notification on a state update (including the initial state) 
```
store(0)
  .subscribe(value => console.log(value))
```
- the state can only be updated by other observables, so it changes whenever source stream produce updates
- the way updates modify the state is defined in terms of (widely adopted redux) reducers (see the interoperability section)
```
store(0)
  .plug(Rx.Observable.of(1), (x, y) => x + y)
  .subscribe(value => console.log(value))
```
- observables (sources of updates) can be defined in many ways
    - RxJS 5
    - Bacon.js
    - Most.js
    - built-in factories:
        - fromEvent(element: HTMLElement, EventName: String) => Observable of events
        - interval(n: number, ...values) => Observable that emits values every n milliseconds
        - address() => Observable that acts like an Event Bus (see [counters example](https://github.com/nikitadyumin/rstore/tree/master/examples/counters))
    - custom observer that implements [observable interface](https://github.com/zenparsing/es-observable)
- RStore stores can be combined
```
const s1 = store(1);
const s2 = store(2);
s1.plug(s2, (x, y) => x + y)
  .subscribe(value => console.log(value)); // 3
```
- RStore stores can be converted to RxJS Observables
```
store(1)
  .toRx()
  .map(x => x* 2)
  .subscribe(state => console.log(state));
```

### Example:

1 ) describe a model (properties, initial state):

```javascript
const {store} = require('rstore'); 
const myStore = store(0);
```

2 ) define sources of changes (using `fromEvent` helper or Rx, Bacon, Most.js streams, see [defining inputs](define_changes.md))

```javascript
const inc$ = fromEvent(document.getElementById('inc'), 'click');
const dec$ = fromEvent(document.getElementById('dec'), 'click');
```

3 ) define how these changes affect the model:

```javascript
myStore
    .plug(inc$, (state, _update) => state + 1)
    .plug(dec$, (state, _update) => state - 1);
```

4 ) subscribe to the store and get an updated model on every change:

```javascript
myStore.subscribe(model => console.log(model));
```

[See more examples](examples/examples.md)

## API
### Creating stores
As RStore supports multiple kinds of observables (APIs), it exports 5 store constructors:
 | constructor | description |
 |---|---|
 | store | general, with an autodetect of the observable API |
 | storeR | RStore observables |
 | storeBacon | [Bacon.js](https://baconjs.github.io/) |
 | storeMost | [Most.js](https://github.com/cujojs/most) |
 | storeRx | [RxJS5](https://github.com/ReactiveX/rxjs) |

A constructor is a function that expects a single argument - an initial model value:
It could be a primitive value
```javascript
store(0);
```
or an object
```javascript
store({
    todos: []
});
```

### RStore methods

 | method | description |
 |---|---|
 | ".plug(oObservable, fnReducer)" |  subscribes RStore to the "oObservable" and for every value calls the "fnReducer" |
 | ".unplug(oObservable, fnReducer)" | given "oObservable" and optionally "fnReducer" unsubscribes RStore from an external observer |
 | ".subscribe(fnObserver)" | subscribes to RStore - calls "fnObserver" for every state update, including an initial value |
 | ".toRx(Rx)" | converts a store to an Rx Observable |
 
## Interoperability
###RxJS5###
Observables are sources of changes
```javascript
store({
    c1 : 0,
    c2 : 0
}).plug(
    Rx.Observable.of(1), (s, u) => Object.assign({}, s, {c1: u}),
    Rx.Observable.of(2), (s, u) => Object.assign({}, s, {c2: u})
).subscribe(model => console.log(model.c1 + model.c2));
```
A store can be converted to an observable
```
store(2)
  .toRx(Rx) // Rx object, optional if Rx is global
  .map(x => x * 2)
  .subscribe(v => console.log(v)); // 4
```
###Redux###
Reducers can be reused
```javascript
const observableOfChanges = Rx.Observable.from([
      {type: 'INCREMENT'},
      {type: 'INCREMENT'},
      {type: 'DECREMENT'},
      {type: 'INCREMENT'},
]);

const reduxReducer = (state, action) => {
      switch (action.type) {
        case 'INCREMENT':
          return state + 1
        case 'DECREMENT':
          return state - 1
        default:
          return state;
      }
};

store(0)
  .plug(observableOfChanges, reduxReducer)
  .subscribe(state => console.log(state)); // 2
```

Redux store as a source of updates
```javascript

const changes = [
    {type: 'INCREMENT'},
    {type: 'INCREMENT'},
    {type: 'DECREMENT'},
    {type: 'INCREMENT'}
];

function reduxReducer (state = 0, action) {
    switch (action.type) {
        case 'INCREMENT':
            return state + 1;
        case 'DECREMENT':
            return state - 1;
        default:
            return state;
    }
}

const reduxStore = Redux.createStore(reduxReducer);

changes.forEach(m => reduxStore.dispatch(m));

rstore.store(0)
    .plug(reduxStore[Symbol.observable](), (s, u) => u)
    .subscribe(state => console.log(state)); // 4

changes.forEach(m => reduxStore.dispatch(m));
```

## Composability

As stores are Observables, they can be used as sources of changes: 

```javascript
// store 1 (counter from the previous example)
const counter1 = store(0);
const inc1$ = fromEvent(document.getElementById('inc1'), 'click');
const dec1$ = fromEvent(document.getElementById('dec1'), 'click');
counter1
    .plug(inc1$, (state, _update) => state + 1)
    .plug(dec1$, (state, _update) => state - 1);

counter1.subscribe(model => document.getElementById('res1').textContent = model);

// store 2 (a second counter, similar to counter 1)
const counter2 = store(0);
const inc2$ = fromEvent(document.getElementById('inc2'), 'click');
const dec2$ = fromEvent(document.getElementById('dec2'), 'click');
counter2
    .plug(inc2$, (state, _update) => state + 1)
    .plug(dec2$, (state, _update) => state - 1);

counter2.subscribe(model => document.getElementById('res2').textContent = model);

// a combining store, stores current states from both counters 
// notifies subscribers if any of the counter values changes 
store({
    c1 : 0,
    c2 : 0
}).plug(
    counter1, (s, u) => Object.assign({}, s, {c1: u}),
    counter2, (s, u) => Object.assign({}, s, {c2: u})
).subscribe(model => document.getElementById('total').textContent = model.c1 + model.c2);
```

[more on composability](composability.md)

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
[more on lenses](lense.md)