import { vec3 } from 'gl-matrix';
import Mesh from '../core/mesh';
import Model from '../core/model';
import { Basic } from '../shaders';
// import { DRAW } from '../constants';

class AxisHelper extends Model {
    constructor(props = {}) {
        super();

        const size = (props && props.size) || 1;
        const geometry = {
            positions: [],
        };

        // extract geometry
        const sx = props.model.scale.x;
        const sy = props.model.scale.y;
        const sz = props.model.scale.z;

        const length = props.model.attributes.a_normal.value.length / 3;
        for (let i = 0; i < length; i++) {
            const i3 = i * 3;
            const v0x = sx * props.model.attributes.a_position.value[i3 + 0];
            const v0y = sy * props.model.attributes.a_position.value[i3 + 1];
            const v0z = sz * props.model.attributes.a_position.value[i3 + 2];
            const nx = props.model.attributes.a_normal.value[i3 + 0];
            const ny = props.model.attributes.a_normal.value[i3 + 1];
            const nz = props.model.attributes.a_normal.value[i3 + 2];
            const v1x = v0x + (size * nx);
            const v1y = v0y + (size * ny);
            const v1z = v0z + (size * nz);
            geometry.positions = geometry.positions.concat([v0x, v0y, v0z, v1x, v1y, v1z]);
        }

        const shader = new Basic({ color: vec3.fromValues(0, 1, 1), wireframe: true });
        const n = new Mesh({ geometry, shader });
        this.add(n);

        this.reference = props.model;
        // mode = DRAW.LINES
    }

    update() {
        super.update();

        vec3.copy(this.position.data, this.reference.position.data);
        vec3.copy(this.rotation.data, this.reference.rotation.data);
        this.lookToTarget = this.reference.lookToTarget;
    }
}
export default AxisHelper;
