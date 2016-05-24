/**
 * Created by ndyumin on 22.05.2016.
 */
import Type from 'union-type';
import {h} from 'virtual-dom';
import {address, wrapAddress} from './util';
import {
    model as counterModel,
    update as counterUpdate,
    view as counterView
} from './counter';

const arrayLens = index => ({
    set: (array, value) => {
        const copy = array.slice();
        copy[index] = value;
        return copy;
    },
    get: (array) => {
        return array[index];
    }
});

const arrayAt0 = arrayLens(0);
const arrayAt1 = arrayLens(1);

const T = () => true;

const Action = Type({
    TopCounter: [T],
    BottomCounter: [T],
    Reset: []
});

export const model = [
    counterModel,
    counterModel
];

export function update(s, u) {
    return Action.case({
        Reset: () => model,
        TopCounter: v => arrayAt0.set(s, counterUpdate(arrayAt0.get(s), v)),
        BottomCounter: v => arrayAt1.set(s, counterUpdate(arrayAt1.get(s), v))
    }, u);
}

export function view(address_, model) {
    return h('div', [
        counterView(wrapAddress(address_, Action.TopCounter), model[0]),
        counterView(wrapAddress(address_, Action.BottomCounter), model[1]),
        h('div', [
            'total ',
            model.reduce((x, y) => x + y)
        ]),
        h('button', {onclick: address_.signal(Action.Reset())}, [
            'reset'
        ])
    ]);
}