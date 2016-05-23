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
    let copy = s.slice();
    return Action.case({
        Reset: () => model,
        TopCounter: v => (copy[0] = counterUpdate(copy[0], v), copy),
        BottomCounter: v => (copy[1] = counterUpdate(copy[1], v), copy)
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