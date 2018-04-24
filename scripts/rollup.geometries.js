import path from 'path';

import {
    PATH,
    NAMESPACE,
} from './settings';

export default {
    input: path.join(PATH.GEOMETRIES.SRC, 'index.js'),
    output: [
        {
            format: 'umd',
            name: NAMESPACE.GEOMETRIES,
            file: path.join(PATH.GEOMETRIES.BUILD, `${NAMESPACE.GEOMETRIES}.js`),
            indent: '\t'
        },

        {
            format: 'es',
            name: NAMESPACE.GEOMETRIES,
            file: path.join(PATH.GEOMETRIES.BUILD, `${NAMESPACE.GEOMETRIES}.module.js`),
            indent: '\t'
        },
    ]
};
