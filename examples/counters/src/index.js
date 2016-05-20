/**
 * Created by ndyumin on 19.05.2016.
 */
import {store, fromEvent} from 'rstore';
import {h, diff, patch} from 'virtual-dom';
const createElement = require('virtual-dom/create-element');

function address() {
    const subs = [];

    function deliver(msg) {
        subs.forEach(fn => fn(msg));
    }

    return {
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

function arrayLens(index) {
    return {
        get: arr => arr[index],
        set: (arr, value) => (arr[index] = value, arr)
    };
}

const sum = (s, u) => s + u;

const counter = (el, model, lens) => {

    const address_ = address();

    function update(data) {
        return h('div', [
            h('button', {onclick: address_.signal(-1)}, ['-']),
            h('span', [data]),
            h('button', {onclick: address_.signal(1)}, ['+'])
        ]);
    }

    let tree = update(0);
    let root = el.appendChild(createElement(tree));

    function render(data) {
        const updated = update(lens.get(data));
        const patches = diff(tree, updated);
        tree = updated;
        root = patch(root, patches);
    }

    model.plug(address_, (s, u) => lens.set(s, lens.get(s) + u));
    model.subscribe(render);

    return null;
};

const counters = store([0, 0]);

counter(document.getElementById('c1'), counters, arrayLens(0));
counter(document.getElementById('c2'), counters, arrayLens(1));

counters.plug(fromEvent(document.getElementById('reset'), 'click'), () => [0, 0]);

counters.subscribe(xs => document.getElementById('result').textContent = xs.reduce(sum));