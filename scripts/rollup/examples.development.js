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

const examples = files.map((entry) => {
    const temp = entry.replace(SRC, '').split('/');
    const name = temp[1];

    return {
        name,
        thumb: `img/thumbnails/${name}.jpg`,
        url: `${name}.html`,
    };
});


// 2)
// create a rollup config for each example
const configs = files.map((entry) => {
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
            include: [
                path.join(SRC, 'template.js'),
                path.join(SRC, name, '**'),
            ],
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
                    title: name,
                },
                css: [
                    'css/style.css',
                ],
                js: [
                    'https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.1/dat.gui.min.js',
                    'https://cdnjs.cloudflare.com/ajax/libs/gsap/2.0.1/TweenLite.min.js',
                    '../packages/controls/build/controls.js',
                    '../packages/core/build/core.js',
                    '../packages/geometries/build/geometries.js',
                    '../packages/postprocessing/build/postprocessing.js',
                    '../packages/physics/build/physics.js',
                    `js/${name}.js`,
                ],
            }),
            html({
                output: path.join(DEV, 'index.html'),
                isIndex: true,
                metadata: {
                    title: 'DEVELOPMENT',
                },
                css: [
                    'css/style.css',
                ],
                examples,
            }),
        ],
    };

    return Object.assign({}, setup);
});

// 3)
// export an array of configs
export default configs;
