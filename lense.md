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
