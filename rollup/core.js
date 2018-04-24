import path from 'path';

import {
    PATH,
    NAMESPACE,
} from './settings';

export default {
    input: path.join(PATH.CORE.SRC, 'index.js'),
    output: [
        {
            format: 'umd',
            name: NAMESPACE.CORE,
            file: path.join(PATH.CORE.BUILD, `${NAMESPACE.CORE}.js`),
            indent: '\t'
        },

        {
            format: 'es',
            name: NAMESPACE.CORE,
            file: path.join(PATH.CORE.BUILD, `${NAMESPACE.CORE}.module.js`),
            indent: '\t'
        },
    ]
};
