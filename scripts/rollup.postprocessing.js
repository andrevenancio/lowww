import path from 'path';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pkg from '../package.json';

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
        },

        {
            format: 'es',
            name: NAMESPACE.POSTPROCESSING,
            file: path.join(PATH.POSTPROCESSING.BUILD, `${NAMESPACE.POSTPROCESSING}.module.js`),
        },
    ],
    watch: {
        include: path.join(PATH.POSTPROCESSING.SRC, '**'),
    },
    plugins: [
        generatePackageJson({
            outputFolder: path.join(PATH.POSTPROCESSING.ROOT),
            baseContents: {
                name: "lowww-postprocessing",
                description: "WebGL 2 Engine",
                author: pkg.author,
                version: pkg.version,
                main: 'src/index.js',
                module: `build/${NAMESPACE.POSTPROCESSING}.module.js`,
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
