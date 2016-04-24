import React from 'react';
import Bacon from 'baconjs';
import { render  as renderDom } from 'react-dom';
import { store } from 'rstore';

const Counter = ({model, onAdd, onSub}) => (
    <div>
        <div>{model}</div>
        <button onClick={onAdd}>+</button>
        <button onClick={onSub}>-</button>
    </div>
);

const dispatcher = () => {
    const bus = new Bacon.Bus();
    return ({
        stream: () => bus,
        add: () => bus.push(1),
        sub: () => bus.push(-1)
    });
};

const _dispatcher = dispatcher();

const render = (model) => {
    renderDom(
        <Counter model={model} onAdd={_dispatcher.add} onSub={_dispatcher.sub}/>,
        document.getElementById('root')
    )
};

store(0)
    .plug(_dispatcher.stream(), (s, a) => s + a)
    .subscribe(render);