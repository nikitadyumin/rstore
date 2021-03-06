/**
 * Created by ndyumin on 18.04.2016.
 */
export function fromEvent(node, eventName) {
    return {
        subscribe: observer => {
            node.addEventListener(eventName, observer.next);
            return () => node.removeEventListener(eventName, observer);
        }
    };
}

export function interval(ms, ...values) {
    return {
        subscribe: observer => {
            const interval = setInterval(observer.next, ms, ...values);
            return () => clearInterval(interval);
        }
    };
}

export function address() {
    const subs = [];

    function deliver(msg) {
        subs.forEach(o => o.next(msg));
    }

    return {
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
        },
        toRx: function(Rx_ = Rx) {
            return Rx_.Observable.create(o => {
                return this.subscribe(o);
            });
        }
    }
}