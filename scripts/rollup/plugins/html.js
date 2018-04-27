import fs from 'fs';
import { minify } from 'html-minifier';

export default function replace(options = {}) {
    const {
        metadata = {
            title: '',
            description: undefined,
            url: undefined,
            thumbnail: undefined,
        },
        js = [],
        css = [],
    } = options;
    const min = options.minify || false;

    const html = [];
    html.push('<!DOCTYPE html>');
    html.push('<html lang="en">');
    html.push('   <head>');
    html.push(`       <title>${metadata.title}</title>`);
    html.push('       <meta charset="UTF-8">');
    html.push('       <meta name="viewport" content="width=device-width,initial-scale=1,maximum-scale=1,user-scalable=no">');
    html.push('       <meta name="apple-mobile-web-app-capable" content="yes">');
    html.push('       <meta name="mobile-web-app-capable" content="yes">');

    if (metadata.title && metadata.description && metadata.url && metadata.thumbnail) {
        html.push(`       <meta property="og:title" content="${metadata.title}" />`);
        html.push(`       <meta property="og:url" content="${metadata.url}" />`);
        html.push(`       <meta property="og:image" content="${metadata.thumbnail}" />`);
        html.push('       <meta property="og:image:width" content="800" />');
        html.push('       <meta property="og:image:height" content="600" />');
        html.push(`       <meta property="og:description" content="${metadata.description}" />`);
        html.push('       <meta property="og:site_name" content="Lowww"/>');

        html.push('       <meta name="twitter:card" content="summary" />');
        html.push('       <meta name="twitter:site" content="@andrevenancio" />');
        html.push('       <meta name="twitter:creator" content="@andrevenancio" />');
        html.push(`       <meta name="twitter:url" content="${metadata.url}" />`);
        html.push(`       <meta name="twitter:title" content="${metadata.title}" />`);
        html.push(`       <meta name="twitter:description" content="${metadata.description}" />`);
        html.push(`       <meta name="twitter:image" content="${metadata.thumbnail}" />`);
        html.push('       <meta name="twitter:image:width" content="800" />');
        html.push('       <meta name="twitter:image:height" content="600" />');
    }

    // inject array of css files
    css.forEach((file) => {
        html.push(`       <link rel="stylesheet" href="${file}" type="text/css" media="all" />`);
    });

    html.push('   </head>');
    html.push('   <body>');

    // inject array of javascript files
    js.forEach((file) => {
        html.push(`       <script src="${file}"></script>`);
    });

    html.push('   </body>');
    html.push('</html>');

    return {
        name: 'html',

        onwrite() {
            if (!options.output || !options.output) {
                return null;
            }

            const htmlFormatted = html.join('\n');
            let src = htmlFormatted;
            if (min) {
                const minOptions = {
                    collapseWhitespace: true,
                    minifyCSS: true,
                    minifyJS: true,
                };
                src = minify(htmlFormatted, minOptions);
            }

            fs.writeFile(options.output, src, 'utf8', () => {});

            return true;
        },
    };
}
