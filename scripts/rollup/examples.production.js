import babel from 'rollup-plugin-babel';
import glob from 'glob';
import path from 'path';
import resolve from 'rollup-plugin-node-resolve';

import copy from './rollup-plugins/copy';
import html from './rollup-plugins/html';

// 1)
// look through all files on the src folder
const SRC = path.join(process.cwd(), 'src');
const DEV = path.join(process.cwd(), 'site');

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
        plugins: [
            babel(),
            resolve(),
            copy([
                { from: path.join(SRC, 'static'), to: path.join(DEV) },
            ]),
            html({
                output: path.join(DEV, `${name}.html`),
                minify: true,
                metadata: {
                    title: name,
                    description: `lowww engine ${name} example.`,
                    thumbnail: `https://andrevenancio.github.io/lowww/img/thumbnails/${name}.jpg`,
                    url: `https://andrevenancio.github.io/lowww/${name}.html`,
                },
                css: [
                    'css/style.css',
                ],
                js: [
                    'https://cdnjs.cloudflare.com/ajax/libs/dat-gui/0.7.1/dat.gui.min.js',
                    'https://rawgit.com/andrevenancio/lowww/master/packages/controls/build/controls.min.js',
                    'https://rawgit.com/andrevenancio/lowww/master/packages/core/build/core.min.js',
                    'https://rawgit.com/andrevenancio/lowww/master/packages/geometries/build/geometries.min.js',
                    'https://rawgit.com/andrevenancio/lowww/master/packages/postprocessing/build/postprocessing.min.js',
                    'https://rawgit.com/andrevenancio/lowww/master/packages/physics/build/physics.min.js',
                    `js/${name}.js`,
                ],
            }),
            html({
                output: path.join(DEV, 'index.html'),
                minify: true,
                isIndex: true,
                metadata: {
                    title: 'lowww',
                    description: 'lowww engine example.',
                    thumbnail: 'https://andrevenancio.github.io/lowww/img/thumbnails/facebook.jpg',
                    url: 'https://andrevenancio.github.io/lowww/',
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
