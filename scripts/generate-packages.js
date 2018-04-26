const os = require('os');
const fs = require('fs');

let packageName = '';
if (process.env.PACKAGE) {
    packageName = `-${process.env.PACKAGE}`;
}

fs.readFile('package.json', 'utf8', (error, text) => {
    const pkg = JSON.parse(text);
    const json = {
        'name': `${pkg.name}${packageName}`,
        'description': 'WebGL 2 Engine extension',
        'author': pkg.author,
        'version': pkg.version,
        'main': 'src/index.js',
        'module': `build/${process.env.PACKAGE}.module.js`,
        'scripts': {
            'test': 'echo \'Error: no test specified\' && exit 0'
        },
        'devDependencies': {},
        'dependencies': {
            'gl-matrix': '^2.5.1'
        }
    }
    fs.writeFile(`packages/${process.env.PACKAGE}/package.json`, JSON.stringify(json), 'utf8', () => {});
});
