import babel from 'rollup-plugin-babel';
import glob from 'glob';
import path from 'path';
import resolve from 'rollup-plugin-node-resolve';

import copy from './rollup-plugins/copy';
import html from './rollup-plugins/html';

// 1)
// look through all files on the src folder
const SRC = path.join(process.cwd(), 'src');
const DEV = path.join(process.cwd(), 'dev');

const files = glob.sync(path.join(SRC, '**/*.js')).filter((entry) => {
    const temp = entry.replace(SRC, '').split('/');

    // entry point can only be src/EXAMPLE_NAME/index.js,
    if (temp[2] === 'index.js') {
        return { name: temp[1] };
    }

    return false;
});

// 2)
// create a rollup config for each example
const examples = files.map((entry) => {
    const temp = entry.replace(SRC, '').split('/');
    const name = temp[1];

    const setup = {
        input: path.join(SRC, name, 'index.js'),
        output: {
            format: 'umd',
            name: 'example',
            file: path.join(DEV, 'js', `${name}.js`),
        },
        watch: {
            include: path.join(SRC, name, '**'),
        },
        plugins: [
            resolve(),
            babel(),
            copy([
                { from: path.join(SRC, 'static'), to: path.join(DEV) },
            ]),
            html({
                output: path.join(DEV, `${name}.html`),
                metadata: {
                    title: `DEVELOPMENT | ${name}`,
                },
                css: [
                    'css/style.css',
                ],
                js: [
                    '../packages/controls/build/controls.js',
                    '../packages/core/build/core.js',
                    '../packages/geometries/build/geometries.js',
                    '../packages/postprocessing/build/postprocessing.js',
                    `js/${name}.js`,
                ],
            }),
        ],
    };

    return Object.assign({}, setup);
});

// 3)
// export an array of configs
export default examples;
