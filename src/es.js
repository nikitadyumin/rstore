/**
 * Created by ndyumin on 29.06.2016.
 */

export function event(apply) {
    return function(payload) {
        return {
            payload,
            apply
        };
    }
}

export function events(init) {
    const subs = [];
    const events = [];
    let rev = 0;


    function dispatch(event) {
        event.rev = ++rev;
        events.push(event);
        deliver(project(rev));
        return rev;
    }

    function transaction(revision) {
        function rollback() {
            const count = events.filter(e => e.rev <= revision).length;
            events.splice(count, events.length - count);
            deliver(project());
        }

        const scheduled = [];

        function run() {
            if (scheduled.length) {
                const t = scheduled.shift();
                t(run, rollback);
            }
        }

        return {
            schedule: function(executor) {
                scheduled.push(executor);
                return this;
            },
            run,
            rollback
        }
    }

    function project(rev_ = rev) {
        return events.filter(e => e.rev <= rev_).reduce((p, ev) => {
            return ev.apply(p, ev.payload);
        }, init);
    }

    function deliver(msg) {
        subs.forEach(o => o.next(msg));
    }

    return {
        transaction: () => transaction(rev),
        dispatch,
        project,
        subscribe: function (clb) {
            subs.push(clb);
            return function () {
                subs.splice(subs.indexOf(clb), 1);
            }
        },
        toRx: function(Rx_ = Rx) {
            return Rx_.Observable.create(o => {
                return this.subscribe(o);
            });
        }
    }
}