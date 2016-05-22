/**
 * Created by ndyumin on 22.05.2016.
 */

import {h} from 'virtual-dom';
import {address} from './util';

export const model = 0;

export function update(model, u) {
    return model + u;
}

export function view(address_, data) {
    return h('div', [
        h('button', {onclick: address_.signal(-1)}, ['-']),
        h('span', [data]),
        h('button', {onclick: address_.signal(1)}, ['+'])
    ]);
}
