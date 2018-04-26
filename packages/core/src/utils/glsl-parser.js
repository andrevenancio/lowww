import { getContextType } from '../session';
import { CONTEXT } from '../constants';

const WORD_REGX = (word) => {
    return new RegExp(`\\b${word}\\b`, 'gi');
};

const LINE_REGX = (word) => {
    return new RegExp(`${word}`, 'gi');
};

const VERTEX = [
    {
        match: WORD_REGX('in'),
        replace: 'attribute',
    }, {
        match: WORD_REGX('out'),
        replace: 'varying',
    },
];

const FRAGMENT = [
    {
        match: WORD_REGX('in'),
        replace: 'varying',
    }, {
        match: LINE_REGX('out vec4 outColor;'),
        replace: '',
    }, {
        match: WORD_REGX('outColor'),
        replace: 'gl_FragColor',
    }, {
        match: WORD_REGX('textureProj'),
        replace: 'texture2DProj',
    }, {
        match: WORD_REGX('texture'),
        replace(shader) {
            // Find all texture defintions
            const textureGlobalRegx = new RegExp('\\btexture\\b', 'gi');

            // Find single texture definition
            const textureSingleRegx = new RegExp('\\btexture\\b', 'i');

            // Gets the texture call signature e.g texture(uTexture1, vUv);
            const textureUniformNameRegx = new RegExp(/texture\(([^)]+)\)/, 'i');

            // Get all matching occurances
            const matches = shader.match(textureGlobalRegx);
            let replacement = '';

            // If nothing matches return
            if (matches === null) return shader;

            // Replace each occurance by it's uniform type
            /* eslint-disable */
            for (const i of matches) {
                const match = shader.match(textureUniformNameRegx)[0];
                if (match) {
                    const uniformName = match.replace('texture(', '').split(',')[0];
                    let uniformType = shader.match(`(.*?) ${uniformName}`, 'i')[1].replace(/^\s+|\s+$/gm, '');
                    uniformType = uniformType.split(' ')[1];

                    switch (uniformType) {
                    case 'sampler2D':
                        replacement = 'texture2D';
                        break;
                    case 'samplerCube':
                        replacement = 'textureCube';
                        break;
                    default:
                        break;
                    }
                }
                shader = shader.replace(textureSingleRegx, replacement);
            }
            /* eslint-enable */
            return shader;
        },
    }];

const GENERIC = [{
    match: LINE_REGX('#version 300 es'),
    replace: '',
}];

const VERTEX_RULES = [...GENERIC, ...VERTEX];
const FRAGMENT_RULES = [...GENERIC, ...FRAGMENT];

/**
 *
 */
const transform = (code) => {
    return code
        // removes //
        .replace(/[ \t]*\/\/.*\n/g, '')
        // remove /* */
        .replace(/[ \t]*\/\*[\s\S]*?\*\//g, '')
        // removes multiple white spaces
        .replace(/^\s+|\s+$|\s+(?=\s)/g, '');
};

/**
 * Replaces es300 syntax to es100
 */
export default function parse(shader, shaderType) {
    if (getContextType() === CONTEXT.WEBGL2) {
        return shader;
    }

    const rules = shaderType === 'vertex' ? VERTEX_RULES : FRAGMENT_RULES;
    rules.forEach((rule) => {
        if (typeof rule.replace === 'function') {
            shader = rule.replace(shader);
        } else {
            shader = shader.replace(rule.match, rule.replace);
        }
    });

    return transform(shader);
}
