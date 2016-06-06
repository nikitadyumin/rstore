/**
 * Created by ndyumin on 06.06.2016.
 */

const symbol = typeof Symbol !== 'undefined' ? Symbol : name => ({name});

module.exports = {
    signature: symbol('rstore')
};