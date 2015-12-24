# rstore
rstore is a reactive store on top of Bacon.js

rstore creates reactive models:
* create a store with an initial model
* create Bacon event streams and define the way they modify the model
* render each state of the model (including an initial and each update)

### counter example (with buttons)
```javascript
const $ = require('jquery');
const Bacon = require('baconjs');
const rstore = require('rstore').store;

const addClick$ = Bacon.fromEventTarget($('#add'), 'click').map(()=>1);
const subClick$ = Bacon.fromEventTarget($('#sub'), 'click').map(()=>1);

const store = rstore(0)
    .plug(addClick$, (s, a) => s + a)
    .plug(subClick$, (s, a) => s - a);

store.stream().onValue(v => $('#result').text(v));
```

### example (manual update)
```javascript
const rstore = require('rstore').store;
const Bacon = require('baconjs');

const actions$ = new Bacon.Bus();

const store = rstore(0)
    .plug(actions$, (s, a) => s + a);

store.stream().onValue(v => console.log(v));

actions$.push(1);
actions$.push(1);
actions$.push(-1);
```
