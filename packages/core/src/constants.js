/**
 * Max directional light allowed
 *
 * @static
 * @constant
 * @name MAX_DIRECTIONAL
 * @type {string}
 */
export const MAX_DIRECTIONAL = 1;

/**
 * directional light id
 *
 * @static
 * @constant
 * @name DIRECTIONAL_LIGHT
 * @type {string}
 */
export const DIRECTIONAL_LIGHT = 1000;

/**
 * basic shader id
 *
 * @static
 * @constant
 * @name SHADER_BASIC
 * @type {string}
 */
export const SHADER_BASIC = 2000;

/**
 * default shader id
 *
 * @static
 * @constant
 * @name SHADER_DEFAULT
 * @type {string}
 */
export const SHADER_DEFAULT = 2001;

/**
 * billboard shader id
 *
 * @static
 * @constant
 * @name SHADER_BILLBOARD
 * @type {string}
 */
export const SHADER_BILLBOARD = 2002;

/**
 * shadow shader id
 *
 * @static
 * @constant
 * @name SHADER_SHADOW
 * @type {string}
 */
export const SHADER_SHADOW = 2003;

/**
 * sem shader id
 *
 * @static
 * @constant
 * @name SHADER_SEM
 * @type {string}
 */
export const SHADER_SEM = 2004;

/**
 * custom shader id
 *
 * @static
 * @constant
 * @name SHADER_CUSTOM
 * @type {string}
 */
export const SHADER_CUSTOM = 2500;

/**
 * shader draw modes
 *
 * @static
 * @constant
 * @name DRAW
 * @type {object}
 * @property {number} POINTS
 * @property {number} LINES
 * @property {number} TRIANGLES
 */
export const DRAW = {
    POINTS: 0,
    LINES: 1,
    TRIANGLES: 4,
};

/**
 * triangle side
 *
 * @static
 * @constant
 * @name SIDE
 * @type {object}
 * @property {number} FRONT
 * @property {number} BACK
 * @property {number} BOTH
 */
export const SIDE = {
    FRONT: 0,
    BACK: 1,
    BOTH: 2,
};

/**
 * context types
 *
 * @static
 * @constant
 * @name CONTEXT
 * @type {object}
 * @property {number} WEBGL
 * @property {number} WEBGL2
 */
export const CONTEXT = {
    WEBGL: 'webgl',
    WEBGL2: 'webgl2',
};
