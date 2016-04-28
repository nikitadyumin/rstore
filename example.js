// prints out '0' once (the initial state, that does not change)
store(0)
    .subscribe(v => console.log(v));


const one = {
    subscribe: next => next(1)
};

// prints out '0' and then '1' (0 - initial state, 1 - a value from the 'one' stream)
store(0)
    .plug(one, (s, u) => u)
    .subscribe(v => console.log(v));

const random$ = {
    subscribe: (next) => {
        const t = setInterval(()=> next(Math.random()), 300);
        return () => clearInterval(t);
    }
};

// prints out 0 and then random values endlessly
store(0)
    .plug(random$, (s, u) => u)
    .subscribe(v => console.log(v));