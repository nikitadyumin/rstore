/**
 * Created by ndyumin on 18.04.2016.
 */
export function fromEvent(node, eventName) {
    return {
        subscribe: observer => {
            node.addEventListener(eventName, observer);
            return () => node.removeEventListener(eventName, observer);
        }
    };
}

export function interval(ms, ...values) {
    return {
        subscribe: observer => {
            const interval = setInterval(observer, ms, ...values);
            return () => clearInterval(interval);
        }
    };
}

export function bus() {
    let next = () => {};
    return {
        subscribe: observer => next = typeof observer === 'function' ? observer : next,
        next: value => next(value)
    };
}