import path from 'path';

const NAMESPACE = {
    CONTROLS: 'lowww.controls',
    CORE: 'lowww.core',
    GEOMETRIES: 'lowww.geometries',
    POSTPROCESSING: 'lowww.postprocessing',
};

const PATH = {
    CONTROLS: {
        BUILD: path.join(process.cwd(), 'packages', 'controls', 'build'),
        SRC: path.join(process.cwd(), 'packages', 'controls', 'src'),
    },
    CORE: {
        BUILD: path.join(process.cwd(), 'packages', 'core', 'build'),
        SRC: path.join(process.cwd(), 'packages', 'core', 'src'),
    },
    GEOMETRIES: {
        BUILD: path.join(process.cwd(), 'packages', 'geometries', 'build'),
        SRC: path.join(process.cwd(), 'packages', 'geometries', 'src'),
    },
    POSTPROCESSING: {
        BUILD: path.join(process.cwd(), 'packages', 'postprocessing', 'build'),
        SRC: path.join(process.cwd(), 'packages', 'postprocessing', 'src'),
    },
};

export {
    NAMESPACE,
    PATH,
};
