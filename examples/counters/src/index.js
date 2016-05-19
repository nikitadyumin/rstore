/**
 * Created by ndyumin on 19.05.2016.
 */
import {store} from 'rstore';
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

const sum = (s, u) => s + u;

const counter = (el, init) => {

    const address_ = address();

    function update(data) {
        return h('div', [
            h('button', {onclick: address_.signal(-1)}, ['-']),
            h('span', [data]),
            h('button', {onclick: address_.signal(1)}, ['+'])
        ]);
    }

    let tree = update(init);
    let root = el.appendChild(createElement(tree));

    function render(data) {
        const updated = update(data);
        const patches = diff(tree, updated);
        tree = updated;
        root = patch(root, patches);
    }

    const store_ = store(init).plug(address_, sum);
    store_.subscribe(render);

    return store_;
};


const counter1 = counter(document.getElementById('c1'), 0);
const counter2 = counter(document.getElementById('c2'), 0);

const counters = store([0, 0])
    .plug(counter1, (s, u) => (s[0] = u, s))
    .plug(counter2, (s, u) => (s[1] = u, s));

counters.subscribe(xs => document.getElementById('result').textContent = xs.reduce(sum));