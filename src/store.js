/**
 * Created by ndyumin on 23.12.2015.
 */

const runUnsub = (fn) =>
    typeof fn === 'function'
        ? fn()
        : typeof fn === 'object'
            ? typeof fn.unsubscribe ===  'function'
                ? fn.unsubscribe()
                : console.log('ehm...', fn)
            : console.log('unknown subscription', fn);

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
                    unsubs.forEach(runUnsub);
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
                    return () => unsubs.forEach(runUnsub);
                });
            })
        };
    }

    return stream(sink => sink(init));
}

module.exports = rstore;