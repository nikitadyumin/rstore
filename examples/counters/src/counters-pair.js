/**
 * Created by ndyumin on 22.05.2016.
 */
import {h} from 'virtual-dom';
import {address} from './util';
import {
    model as counterModel,
    update as counterUpdate,
    view as counterView
} from './counter';

export const model = [
    counterModel,
    counterModel
];

export function update(s, u) {
    let copy = s.slice();
    switch (u.type) {
        case 'reset':
            copy = model;
            break;
        default:
            copy[u.index] = counterUpdate(copy[u.index], u.value);
            break;
    }
    return copy;
}

export function view(address_, data) {
    const counter1updates = address();
    const counter2updates = address();

    counter1updates.subscribe(v => address_.send({index: 0, value: v}));
    counter2updates.subscribe(v => address_.send({index: 1, value: v}));

    return h('div', [
        counterView(counter1updates, data[0]),
        counterView(counter2updates, data[1]),
        h('div', [
            'total ',
            data.reduce((x, y) => x + y)
        ]),
        h('button', {onclick: address_.signal({type: 'reset'})}, [
            'reset'
        ])
    ]);
}