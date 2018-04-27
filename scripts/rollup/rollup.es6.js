import babel from 'rollup-plugin-babel';
import path from 'path';
import replace from 'rollup-plugin-replace';
import resolve from 'rollup-plugin-node-resolve';

import pkg from '../../package.json';

const packageName = process.env.PACKAGE;
const packagePath = path.join(process.cwd(), 'packages', packageName);
const packageVersion = JSON.stringify(pkg.version);

export default {
    input: path.join(packagePath, 'src', 'index.js'),
    output: {
        format: 'es',
        name: `lowww.${packageName}`,
        file: path.join(packagePath, 'build', `${packageName}.module.js`),
    },
    watch: {
        include: path.join(packagePath, 'src', '**'),
    },
    plugins: [
        replace({
            __LIBRARY__: JSON.stringify(packageName),
            __VERSION__: packageVersion,
        }),
        resolve(),
        babel(), // allows arrow functions
    ],
};
