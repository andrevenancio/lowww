import { CONTEXT, MAX_DIRECTIONAL } from '../../constants';
import { getContextType } from '../../session';

const UBO = {
    scene: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return `
            uniform perScene {
                mat4 projectionMatrix;
                mat4 viewMatrix;
                vec4 fogSettings;
                vec4 fogColor;
                float iGlobalTime;
                vec4 globalClipSettings;
                vec4 globalClipPlane0;
                vec4 globalClipPlane1;
                vec4 globalClipPlane2;
            };`;
        }

        return `
        uniform mat4 projectionMatrix;
        uniform mat4 viewMatrix;
        uniform vec4 fogSettings;
        uniform vec4 fogColor;
        uniform float iGlobalTime;
        uniform vec4 globalClipSettings;
        uniform vec4 globalClipPlane0;
        uniform vec4 globalClipPlane1;
        uniform vec4 globalClipPlane2;`;
    },

    model: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return `
            uniform perModel {
                mat4 modelMatrix;
                mat4 normalMatrix;
                vec4 localClipSettings;
                vec4 localClipPlane0;
                vec4 localClipPlane1;
                vec4 localClipPlane2;
            };`;
        }
        return `
            uniform mat4 modelMatrix;
            uniform mat4 normalMatrix;
            uniform vec4 localClipSettings;
            uniform vec4 localClipPlane0;
            uniform vec4 localClipPlane1;
            uniform vec4 localClipPlane2;`;
    },

    lights: () => {
        if (getContextType() === CONTEXT.WEBGL2) {
            return `
                #define MAX_DIRECTIONAL ${MAX_DIRECTIONAL}

                struct Directional {
                    vec4 dlPosition;
                    vec4 dlColor;
                    float flIntensity;
                };

                uniform directional {
                    Directional directionalLights[MAX_DIRECTIONAL];
                };`;
        }

        return `
            #define MAX_DIRECTIONAL ${MAX_DIRECTIONAL}

            struct Directional {
                vec4 dlPosition;
                vec4 dlColor;
                float flIntensity;
            };

            uniform Directional directionalLights[MAX_DIRECTIONAL];`;
    },
};

export {
    UBO,
};
