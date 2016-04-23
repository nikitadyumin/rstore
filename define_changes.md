### from DOM Events:
```javascript
const {store, fromEvent} = require('./dist/rstore');

const $inc = document.getElementById('inc');
const $dec = document.getElementById('dec');

store(0)
    .plug(
        fromEvent($inc, 'click'), (s, u) => s + 1,
        fromEvent($dec, 'click'), (s, u) => s - 1)
    .subscribe(v => console.log(v));
```

### from RxJS Observables:
```javascript
const {store} = require('./dist/rstore');
const Rx = require('rxjs');

const $inc = document.getElementById('inc');
const $dec = document.getElementById('dec');

store(0)
    .plug(
        Rx.Observable.fromEvent($inc, 'click'), (s, u) => s + 1,
        Rx.Observable.fromEvent($dec, 'click'), (s, u) => s - 1)
    .subscribe(v => console.log(v));
```

### from Bacon Streams
[source](https://github.com/nikitadyumin/rstore/tree/master/examples/counter)
```javascript
const {store} = require('./dist/rstore');
const Bacon = require('baconjs');

const $inc = document.getElementById('inc');
const $dec = document.getElementById('dec');

store(0)
    .plug(
        Bacon.fromEvent($inc, 'click'), (s, u) => s + 1,
        Bacon.fromEvent($dec, 'click'), (s, u) => s - 1)
    .subscribe(v => console.log(v));
```

In this example `render` is called for each model state (including the explicitly defined initial value).
