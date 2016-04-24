# rstore

straightforward, explicit, declarative and composable reactive store\model

## Introduction
build complex UIs with trivial steps:

1 ) describe a model (properties, initial state):

```javascript
const {store} = require('rstore'); 
const myStore = store(0);
```

2 ) define sources of changes (using `fromEvent` helper or Rx, Bacon, most streams, see [defining inputs](define_changes.md))

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

## Composability

Stores themselves can be combined: 
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
    .subscribe(render);
```
