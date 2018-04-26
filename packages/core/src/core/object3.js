import { vec3, mat4, quat } from 'gl-matrix';
import Vector3 from './vector3';

let uuid = 0;
let axisAngle = 0;
const quaternionAxisAngle = vec3.create();

class Object3 {
    constructor() {
        this.uid = uuid++;

        this.parent = null;
        this.children = [];

        this.position = new Vector3();
        this.rotation = new Vector3();
        this.scale = new Vector3(1, 1, 1);

        this._transparent = false;
        this._visible = true;

        this.quaternion = quat.create();

        this.target = vec3.create();
        this.up = vec3.fromValues(0, 1, 0);
        this.lookToTarget = false;

        this.matrices = {
            parent: mat4.create(),
            model: mat4.create(),
            lookAt: mat4.create(),
        };

        this.dirty = {
            sorting: false,
            transparent: false,
            attributes: false,
            shader: false,
        };

        this.sceneGraphSorter = false;
    }

    set transparent(value) {
        this.dirty.transparent = this.transparent !== value;
        this._transparent = value;
    }

    get transparent() {
        return this._transparent;
    }

    set visible(value) {
        this.dirty.sorting = this.visible !== value;
        this._visible = value;
    }

    get visible() {
        return this._visible;
    }

    updateMatrices() {
        mat4.identity(this.matrices.parent);
        mat4.identity(this.matrices.model);
        mat4.identity(this.matrices.lookAt);
        quat.identity(this.quaternion);

        if (this.parent) {
            mat4.copy(this.matrices.parent, this.parent.matrices.model);
            mat4.multiply(this.matrices.model, this.matrices.model, this.matrices.parent);
        }

        if (this.lookToTarget) {
            mat4.targetTo(this.matrices.lookAt, this.position.data, this.target, this.up);
            mat4.multiply(this.matrices.model, this.matrices.model, this.matrices.lookAt);
        } else {
            mat4.translate(this.matrices.model, this.matrices.model, this.position.data);
            quat.rotateX(this.quaternion, this.quaternion, this.rotation.x);
            quat.rotateY(this.quaternion, this.quaternion, this.rotation.y);
            quat.rotateZ(this.quaternion, this.quaternion, this.rotation.z);
            axisAngle = quat.getAxisAngle(quaternionAxisAngle, this.quaternion);
            mat4.rotate(this.matrices.model, this.matrices.model, axisAngle, quaternionAxisAngle);
        }
        mat4.scale(this.matrices.model, this.matrices.model, this.scale.data);
    }

    init() {
        // to be overriden;
    }

    add(model) {
        model.parent = this;
        this.children.push(model);
        this.dirty.sorting = true;
    }

    remove(model) {
        const index = this.children.indexOf(model);
        if (index !== -1) {
            model.destroy();
            this.children.splice(index, 1);
            this.dirty.sorting = true;
        }
    }

    traverse(object) {
        // if traversed object is the scene
        if (object === undefined) {
            object = this;
            this.sceneGraphSorter = true;
        }

        for (let i = 0; i < object.children.length; i++) {
            this.traverse(object.children[i]);
        }

        if (object.parent !== null) {
            object.updateMatrices();
        }

        // NOTE
        // to improve performance, we also check if the objects are dirty when we traverse them.
        // this avoids having a second loop through the graph scene.
        //
        // if any element gets added / removed from scene
        // or if its transparency changes, we need to sort them again into
        // opaque / transparent arrays
        if (object.dirty.sorting ||
            object.dirty.transparent) {
            object.dirty.transparent = false;
            this.sceneGraphSorter = true;
        }

        return this.sceneGraphSorter;
    }
}

export default Object3;
