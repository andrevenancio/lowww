const os = require('os');
const fs = require('fs');

let packageName = '';
if (process.env.PACKAGE) {
    packageName = `-${process.env.PACKAGE}`;
}

fs.readFile('package.json', 'utf8', (error, text) => {
    const pkg = JSON.parse(text);
    const json = {
        "toplevel": true,
        "compress": {
            "passes": 2,
        },
        "output": {
            "beautify": false,
            "preamble": `/*\n${pkg.name}${packageName} - version: ${pkg.version}\nCopyright © ${(new Date).getFullYear()} ${pkg.author}\n*/`,
        },
    }
    fs.writeFile('scripts/minify-options.json', JSON.stringify(json), 'utf8', () => {});
});
