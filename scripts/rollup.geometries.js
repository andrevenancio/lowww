import path from 'path';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pkg from '../package.json';

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
        },

        {
            format: 'es',
            name: NAMESPACE.GEOMETRIES,
            file: path.join(PATH.GEOMETRIES.BUILD, `${NAMESPACE.GEOMETRIES}.module.js`),
        },
    ],
    watch: {
        include: path.join(PATH.GEOMETRIES.SRC, '**'),
    },
    plugins: [
        generatePackageJson({
            outputFolder: path.join(PATH.GEOMETRIES.ROOT),
            baseContents: {
                name: "lowww-geometries",
                description: "WebGL 2 Engine",
                author: pkg.author,
                version: pkg.version,
                main: 'src/index.js',
                module: `build/${NAMESPACE.GEOMETRIES}.module.js`,
                scripts: {
                    test: "echo \"Error: no test specified\" && exit 1"
                },
                devDependencies: {},
                dependencies: {
                    "gl-matrix": "^2.4.1"
                }
            },
        }),
    ]
};
