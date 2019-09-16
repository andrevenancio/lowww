const CLIPPING = {
    vertex_pre: () => {
        return `
        out vec4 local_eyespace;
        out vec4 global_eyespace;`;
    },

    vertex: () => {
        return `
        local_eyespace = modelMatrix * vec4(a_position, 1.0);
        global_eyespace = viewMatrix * modelMatrix * vec4(a_position, 1.0);`;
    },

    fragment_pre: () => {
        return `
        in vec4 local_eyespace;
        in vec4 global_eyespace;`;
    },

    fragment: () => {
        return `
        if (localClipSettings.x > 0.0) {
            if(dot(local_eyespace, localClipPlane0) < 0.0) discard;
            if(dot(local_eyespace, localClipPlane1) < 0.0) discard;
            if(dot(local_eyespace, localClipPlane2) < 0.0) discard;
        }

        if (globalClipSettings.x > 0.0) {
            if(dot(global_eyespace, globalClipPlane0) < 0.0) discard;
            if(dot(global_eyespace, globalClipPlane1) < 0.0) discard;
            if(dot(global_eyespace, globalClipPlane2) < 0.0) discard;
        }`;
    },
};

export { CLIPPING };
