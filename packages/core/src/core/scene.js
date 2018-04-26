import { vec4 } from 'gl-matrix';
import Object3 from './object3';
import { Directional } from './lights';
import { DIRECTIONAL_LIGHT } from '../constants';

class Scene extends Object3 {
    constructor() {
        super();

        this.lights = {
            directional: [],
        };

        this.fog = {
            enable: false,
            color: vec4.fromValues(0, 0, 0, 1),
            start: 500,
            end: 1000,
            density: 0.00025,
        };

        this.clipping = {
            enable: false,
            planes: [
                vec4.create(),
                vec4.create(),
                vec4.create(),
            ],
        };

        // add sun
        const directional = new Directional({
            near: 1,
            far: 1000,
        });
        directional.position[0] = 125;
        directional.position[1] = 250;
        directional.position[2] = 500;
        this.addLight(directional);
    }

    addLight(light) {
        switch (light.type) {
        case DIRECTIONAL_LIGHT:
            this.lights.directional.push(light);
            break;
        default:
            // unsupported light
        }
    }

    removeLight(light) {
        const index = this.lights.directional.indexOf(light);
        if (index !== -1) {
            light.destroy();
            this.lights.directional.splice(index, 1);
        }
    }
}

export default Scene;
