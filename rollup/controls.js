import path from 'path';

import {
    PATH,
    NAMESPACE,
} from './settings';

export default {
    input: path.join(PATH.CONTROLS.SRC, 'index.js'),
    output: [
        {
            format: 'umd',
            name: NAMESPACE.CONTROLS,
            file: path.join(PATH.CONTROLS.BUILD, `${NAMESPACE.CONTROLS}.js`),
            indent: '\t'
        },

        {
            format: 'es',
            name: NAMESPACE.CONTROLS,
            file: path.join(PATH.CONTROLS.BUILD, `${NAMESPACE.CONTROLS}.module.js`),
            indent: '\t'
        },
    ]
};
