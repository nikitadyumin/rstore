'use strict';

const rstore = require('rstore').store;

const addClick$ = $('#add').asEventStream('click').map(()=>1);
const subClick$ = $('#sub').asEventStream('click').map(()=>1);

const store = rstore(0)
    .plug(addClick$, (s, a) => s + a)
    .plug(subClick$, (s, a) => s - a);

store.stream()
    .onValue(v => $('#result').text(v));
