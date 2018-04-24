import path from 'path';

import {
    PATH,
    NAMESPACE,
} from './settings';

export default {
    input: path.join(PATH.POSTPROCESSING.SRC, 'index.js'),
    output: [
        {
            format: 'umd',
            name: NAMESPACE.POSTPROCESSING,
            file: path.join(PATH.POSTPROCESSING.BUILD, `${NAMESPACE.POSTPROCESSING}.js`),
            indent: '\t'
        },

        {
            format: 'es',
            name: NAMESPACE.POSTPROCESSING,
            file: path.join(PATH.POSTPROCESSING.BUILD, `${NAMESPACE.POSTPROCESSING}.module.js`),
            indent: '\t'
        },
    ]
};
