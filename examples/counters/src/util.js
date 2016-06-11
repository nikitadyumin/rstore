/**
 * Created by ndyumin on 22.05.2016.
 */
import {store, address} from 'rstore';
import {diff, patch} from 'virtual-dom';
const createElement = require('virtual-dom/create-element');

export function widget(el, init, update, view) {
    const address_ = address();
    let tree = view(address_, init);
    let root = el.appendChild(createElement(tree));

    return store(init)
        .plug(address_, update)
        .subscribe(model => {
            const updated = view(address_, model);
            const patches = diff(tree, updated);
            tree = updated;
            root = patch(root, patches);
        });
}

export function wrapAddress(address, type) {
    return Object.assign({}, address, {
        signal: function (msg) {
            return address.signal(type(msg));
        },
        send: function (msg) {
            return address.send(type(msg));
        }
    });
}