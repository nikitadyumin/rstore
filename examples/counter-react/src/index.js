import React from 'react';
import { render  as renderDom } from 'react-dom';
import { store, address } from 'rstore';

const Counter = ({model, onAdd, onSub}) => (
    <div>
        <button onClick={onSub}>-</button>
        <span>{model}</span>
        <button onClick={onAdd}>+</button>
    </div>
);

const updates$ = address();

const render = (model) => {
    renderDom(
        <Counter model={model} onAdd={updates$.signal(1)} onSub={updates$.signal(-1)}/>,
        document.getElementById('root')
    )
};

store(0)
    .plug(updates$, (s, a) => s + a)
    .subscribe(render);