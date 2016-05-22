/**
 * Created by ndyumin on 22.05.2016.
 */
import {store} from 'rstore';
import {diff, patch} from 'virtual-dom';
const createElement = require('virtual-dom/create-element');

let i = 0;
export function address() {
    const subs = [];

    function deliver(msg) {
        subs.forEach(fn => fn(msg));
    }

    return {
        $$id: i++,
        send: deliver,
        signal: function (msg) {
            return function () {
                deliver(msg)
            }
        },
        subscribe: function (clb) {
            subs.push(clb);
            return function () {
                subs.splice(subs.indexOf(clb), 1);
            }
        }
    }
}

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