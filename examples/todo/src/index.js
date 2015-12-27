/**
 * Created by ndyumin on 24.12.2015.
 */
'use strict';

require('todomvc-app-css/index.css');

const $ = require('jquery');
const Bacon = require('baconjs');
const rstore = require('rstore').store;

// UTIL

function clone(o) {
    return JSON.parse(JSON.stringify(o));
}

// ACTIONS

const taskAdd$ = $('input.new-todo').asEventStream('keypress')
    .filter(e => e.keyCode === 13)
    .map( e => $('.new-todo').val());

const clearCompleted$ = $('.clear-completed').asEventStream('click');

const itemClick$ = $('.todo-list').asEventStream('click');

const taskToggle$ = itemClick$
    .filter(e => e.target.tagName === 'INPUT')
    .map((e)=> $(e.target).closest('li').data('id'));

const taskRemove$ = itemClick$
    .filter(e => e.target.tagName === 'BUTTON')
    .map((e)=> $(e.target).closest('li').data('id'));

const filter = () => location.hash.substring(2);
const filter$ = Bacon.fromEvent(window, 'hashchange')
    .map(hash => filter())
    .startWith(filter());

// VIEW

function getVisible(tasks, filter) {
    switch (filter) {
        case '':
            return tasks;
        case 'active':
            return tasks.filter(t => !t.done);
        case 'completed':
            return tasks.filter(t => t.done);
    }
}

function render(v) {
    $('.new-todo').val('');
    const html = getVisible(v.tasks, v.filter).map(t =>
            `<li class="${t.done ? 'completed' : ''}" data-id="${t.id}">
                <div class="view">
                    <input class="toggle" type="checkbox" ${t.done ? "checked" : ""}>
                    <label>${t.name}</label>
                    <button class="destroy"></button>
                </div>
            </li>`
    ).join('');
    $('.footer')
        .find('a')
        .removeClass('selected')
        .filter('[href="#/'+v.filter+'"]')
        .addClass('selected');

    $('.main').find('ul').html(html);
    const todo = v.tasks.length - v.tasks.filter(t => t.done).length;
    $('.todo-count').find('strong').text(todo);
}

// STORE

const model = rstore({
    maxId: 1,
    filter: '',
    tasks: [
        {name: 'test the rstore', id: 0, done: false},
        {name: 'write a todo app', id: 1, done: true}
    ]
});

// DISPATCHERS

model
    .plug(taskRemove$, (s, a) => {
        const o = clone(s);
        o.tasks = o.tasks.filter(t => t.id !== a);
        return o;
    })
    .plug(clearCompleted$, (s) => {
        const o = clone(s);
        o.tasks = o.tasks.filter(t => !t.done);
        return o;
    })
    .plug(taskAdd$, (s, a) => {
        const o = clone(s);
        o.maxId += 1;
        o.tasks.push({
            name: a,
            id: o.maxId,
            done: false
        });
        return o;
    })
    .plug(taskToggle$, (s, a) => {
        const o = clone(s);
        o.tasks.filter(t => t.id === a)
            .forEach(t => t.done = !t.done);
        return o;
    })
    .plug(filter$, (s, a) => {
        const o = clone(s);
        o.filter = a;
        return o;
    })
    .stream().onValue(render);