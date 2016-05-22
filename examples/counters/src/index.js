/**
 * Created by ndyumin on 19.05.2016.
 */
import {model, view, update} from './counters-pair';
import {widget} from './util';

widget(
    document.body,
    model,
    update,
    view
);