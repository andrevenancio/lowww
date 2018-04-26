import { getContextType } from '../../session';
import { CONTEXT } from '../../constants';

const EXTENSIONS = {

    vertex: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return '';
        }
        return '';
    },

    fragment: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return '';
        }
        return `
        #extension GL_OES_standard_derivatives : enable`;
    },

};

export {
    EXTENSIONS,
};
