import path from 'path';
import generatePackageJson from 'rollup-plugin-generate-package-json';
import pkg from '../package.json';

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
        },

        {
            format: 'es',
            name: NAMESPACE.CORE,
            file: path.join(PATH.CORE.BUILD, `${NAMESPACE.CORE}.module.js`),
        },
    ],
    watch: {
        include: path.join(PATH.CORE.SRC, '**'),
    },
    plugins: [
        generatePackageJson({
            outputFolder: path.join(PATH.CORE.ROOT),
            baseContents: {
                name: "lowww-core",
                description: "WebGL 2 Engine",
                author: pkg.author,
                version: pkg.version,
                main: 'src/index.js',
                module: `build/${NAMESPACE.CORE}.module.js`,
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
