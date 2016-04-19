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
