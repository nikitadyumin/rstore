/**
 * Created by ndyumin on 23.12.2015.
 */

const runFn = (fn, ...args) => {
    if (typeof fn === 'function') {
        fn(...args);
    }
};

function rstore(init) {
    const plugged = [];

    function stream(executor) {
        return {
            /**
             * start stream
             */
            subscribe: executor,
            /**
             * @deprecated
             * use `.subscribe` instead
             */
            stream: () => ({
                onValue: executor
            }),
            /**
             *
             * @param streams
             */
            plug: (...streams) => stream(sink => {
                plugged.push(...streams);
                const unsubs = [];
                return executor(init => {
                    unsubs.forEach(runFn);
                    unsubs.length = 0;
                    sink(init);
                    const clb = reducer => v => sink(init = reducer(init, v));

                    function _plug(s$, reducer, ..._streams) {
                        const observeMethod = s$.observe || s$.onValue || s$.subscribe;
                        const unsub = observeMethod.call(s$, clb(reducer));
                        unsubs.push(unsub);
                        if (_streams.length !== 0) {
                            _plug(..._streams);
                        }
                    }

                    _plug(...plugged);
                    return () => unsubs.forEach(runFn);
                });
            })
        };
    }

    return stream(sink => sink(init));
}

module.exports = rstore;