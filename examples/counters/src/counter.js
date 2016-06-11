/**
 * Created by ndyumin on 22.05.2016.
 */

import {h} from 'virtual-dom';
import {address} from 'rstore';
import Type from 'union-type';

const Action = Type({
    Inc: [],
    Dec: []
});

export const model = 0;

export function update(model, u) {
    return Action.case({
        Inc: () => model + 1,
        Dec: () => model - 1
    }, u);
}

export function view(address_, data) {
    return h('div', [
        h('button', {onclick: address_.signal(Action.Dec())}, ['-']),
        h('span', [data]),
        h('button', {onclick: address_.signal(Action.Inc())}, ['+'])
    ]);
}
