import path from 'path';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pkg from '../package.json';

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
        },

        {
            format: 'es',
            name: NAMESPACE.CONTROLS,
            file: path.join(PATH.CONTROLS.BUILD, `${NAMESPACE.CONTROLS}.module.js`),
        },
    ],
    watch: {
        include: path.join(PATH.CONTROLS.SRC, '**'),
    },
    plugins: [
        generatePackageJson({
            outputFolder: path.join(PATH.CONTROLS.ROOT),
            baseContents: {
                name: "lowww-controls",
                description: "WebGL 2 Engine",
                author: pkg.author,
                version: pkg.version,
                main: 'src/index.js',
                module: `build/${NAMESPACE.CONTROLS}.module.js`,
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
