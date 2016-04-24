### Basic
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

### with lenses
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
