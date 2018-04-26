import { vec4, mat4 } from 'gl-matrix';
import { library, version, setContext, getContext, setContextType, getContextType, supports } from '../session';
import { CONTEXT, MAX_DIRECTIONAL } from '../constants';
import { resize, unsupported } from '../utils/dom';
import { Ubo } from '../gl';

import Scene from './scene';
import ShadowMapRenderer from './shadow-map-renderer';

let lastProgram;

let sort = false;
const startTime = Date.now();
let WEBGL2 = false;

const time = vec4.create();
const fog = vec4.create();

const matrices = {
    view: mat4.create(),
    normal: mat4.create(),
    modelView: mat4.create(),
    inversedModelView: mat4.create(),
};

let cachedScene = null; // scene
let cachedCamera = null; // camera

class Renderer {
    constructor(props = {}) {
        this.supported = false;

        this.sorted = {
            opaque: [],
            transparent: [],
            shadow: [],
        };

        this.performance = {
            opaque: 0,
            transparent: 0,
            shadow: 0,
            vertices: 0,
            instances: 0,
        };

        this.ratio = props.ratio || window.devicePixelRatio;
        this.shadows = props.shadows || false;
        this.domElement = props.canvas || document.createElement('canvas');

        const contextType = setContextType(props.contextType);
        const gl = this.domElement.getContext(contextType, Object.assign({}, {
            antialias: false,
        }, props));

        const session = supports();

        if (gl &&
            ((session.vertexArrayObject &&
            session.instancedArrays &&
            session.standardDerivatives &&
            session.depthTextures) || window.gli !== null)
        ) {
            if (props.greeting !== false) {
                const lib = 'color:#666;font-size:x-small;font-weight:bold;';
                const parameters = 'color:#777;font-size:x-small';
                const values = 'color:#f33;font-size:x-small';
                const args = [
                    `%c${library} - %cversion: %c${version} %crunning: %c${gl.getParameter(gl.VERSION)}`,
                    lib, parameters, values, parameters, values,
               ];

                console.log(...args);
            }

            setContext(gl);

            WEBGL2 = getContextType() === CONTEXT.WEBGL2;

            this.init();
        } else {
            this.domElement = unsupported();
        }
    }

    init() {
        this.supported = true;

        if (WEBGL2) {
            this.perScene = new Ubo([
                ...mat4.create(), // projection matrix
                ...mat4.create(), // view matrix
                ...fog, // fog vec4(use_fog, start, end, density)
                ...vec4.create(), // fog color
                ...time, // vec4(iGlobalTime, EMPTY, EMPTY, EMPTY)
                ...vec4.create(), // global clip settings (use_clipping, EMPTY, EMPTY, EMPTY);
                ...vec4.create(), // global clipping plane 0
                ...vec4.create(), // global clipping plane 1
                ...vec4.create(), // global clipping plane 2
            ], 0);

            this.perModel = new Ubo([
                ...mat4.create(), // model matrix
                ...mat4.create(), // normal matrix
                ...vec4.create(), // local clip settings (use_clipping, EMPTY, EMPTY, EMPTY);
                ...vec4.create(), // local clipping plane 0
                ...vec4.create(), // local clipping plane 1
                ...vec4.create(), // local clipping plane 2
            ], 1);

            this.directional = new Ubo(new Float32Array(MAX_DIRECTIONAL * 12), 2);
        }

        // shadows
        this.shadowmap = new ShadowMapRenderer();
    }

    setSize(width, height) {
        if (!this.supported) return;
        resize(this.domElement, width, height, this.ratio);
    }

    setRatio(value) {
        this.ratio = value;
    }

    changeProgram(program) {
        const gl = getContext();
        gl.useProgram(program);

        if (WEBGL2) {
            const sLocation = gl.getUniformBlockIndex(program, 'perScene');
            const mLocation = gl.getUniformBlockIndex(program, 'perModel');
            const dLocation = gl.getUniformBlockIndex(program, 'directional');
            gl.uniformBlockBinding(program, sLocation, this.perScene.boundLocation);
            gl.uniformBlockBinding(program, mLocation, this.perModel.boundLocation);

            // is directional light in shader
            if (dLocation === this.directional.boundLocation) {
                gl.uniformBlockBinding(program, dLocation, this.directional.boundLocation);
            }
        }
    }

    draw(scene, camera, width, height) {
        if (!this.supported) return;
        // only necessary for webgl1 compatibility.
        cachedScene = scene;
        cachedCamera = camera;

        const gl = getContext();

        gl.enable(gl.DEPTH_TEST); // TODO: maybe change this to model.js ?
        gl.enable(gl.CULL_FACE); // TODO: maybe change this to model.js ?
        gl.disable(gl.BLEND); // TODO: maybe change this to model.js ?

        camera.updateCameraMatrix(width, height);

        // common matrices
        mat4.identity(matrices.view);
        mat4.lookAt(matrices.view, camera.position.data, camera.target, camera.up);

        // check if sorting is needed whilst traversing through the scene graph
        sort = scene.traverse();

        // if sorting is needed, reset stuff
        if (sort) {
            this.sorted.opaque = [];
            this.sorted.transparent = [];
            this.sorted.shadow = [];

            // can be deprecated, but its kind of cool
            this.performance.opaque = 0;
            this.performance.transparent = 0;
            this.performance.shadow = 0;
            this.performance.vertices = 0;
            this.performance.instances = 0;

            this.sort(scene);
        }

        // update time
        time[0] = (Date.now() - startTime) / 1000;
        fog[0] = scene.fog.enable;
        fog[1] = scene.fog.start;
        fog[2] = scene.fog.end;
        fog[3] = scene.fog.density;

        if (WEBGL2) {
            // bind common buffers
            this.perScene.bind();
            this.perModel.bind();
            this.directional.bind();

            this.perScene.update([
                ...camera.matrices.projection,
                ...matrices.view,
                ...fog,
                ...scene.fog.color,
                ...time,
                ...[scene.clipping.enable, 0, 0, 0],
                ...scene.clipping.planes[0],
                ...scene.clipping.planes[1],
                ...scene.clipping.planes[2],
            ]);

            for (let i = 0; i < scene.lights.directional.length; i++) {
                this.directional.update([
                    ...[...scene.lights.directional[i].position, 0],
                    ...[...scene.lights.directional[i].color, 0],
                    ...[scene.lights.directional[i].intensity, 0, 0, 0],
                ], i * 12);
            }
        }

        // update light in shadowmap
        this.shadowmap.setLightOrigin(scene.lights.directional[0].position);

        // 1) render objects to shadowmap
        if (this.renderShadow) {
            for (let i = 0; i < this.sorted.shadow.length; i++) {
                this.renderObject(this.sorted.shadow[i], this.sorted.shadow[i].program, true);
            }
            // return;
        }

        // 2) render opaque objects
        for (let i = 0; i < this.sorted.opaque.length; i++) {
            this.renderObject(this.sorted.opaque[i], this.sorted.opaque[i].program);
        }

        // 3) sort and render transparent objects
        // expensive to sort transparent items per z-index.
        this.sorted.transparent.sort((a, b) => {
            return (a.position.z - b.position.z);
        });

        for (let i = 0; i < this.sorted.transparent.length; i++) {
            this.renderObject(this.sorted.transparent[i], this.sorted.transparent[i].program);
        }

        // 4) render gui
        // TODO
    }

    rtt({
        renderTarget,
        scene,
        camera,
        clearColor = [0, 0, 0, 1],
    }) { // maybe order is important
        if (!this.supported) return;

        const gl = getContext();

        gl.bindFramebuffer(gl.FRAMEBUFFER, renderTarget.frameBuffer);

        gl.viewport(0, 0, renderTarget.width, renderTarget.height);
        gl.clearColor(...clearColor);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.draw(scene, camera, renderTarget.width, renderTarget.height);

        gl.bindTexture(gl.TEXTURE_2D, renderTarget.texture);
        gl.bindTexture(gl.TEXTURE_2D, null);

        gl.bindFramebuffer(gl.FRAMEBUFFER, null);
    }

    render(scene, camera) {
        if (!this.supported) return;
        const gl = getContext();

        // render shadows
        if (this.shadows) {
            // render scene to texture
            this.renderShadow = true;
            this.rtt({
                renderTarget: this.shadowmap.rt,
                scene,
                camera: this.shadowmap.camera,
                clearColor: [1, 1, 1, 1],
            });

            this.renderShadow = false;
        }

        // render scene
        gl.viewport(0, 0, gl.canvas.width, gl.canvas.height);
        gl.clearColor(0, 0, 0, 1);
        gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);

        this.draw(scene, camera, gl.canvas.width, gl.canvas.height);

        // TODO: render GUI objects
    }

    updateMatrices(matrix) {
        mat4.identity(matrices.modelView);
        mat4.copy(matrices.modelView, matrix);
        mat4.invert(matrices.inversedModelView, matrices.modelView);
        mat4.transpose(matrices.inversedModelView, matrices.inversedModelView);
        mat4.identity(matrices.normal);
        mat4.copy(matrices.normal, matrices.inversedModelView);
    }

    sort(object) {
        for (let i = 0; i < object.children.length; i++) {
            this.sort(object.children[i]);
        }

        if (object.visible && !(object instanceof Scene)) {
            // adds object to a opaque or transparent
            if (object.transparent) {
                this.sorted.transparent.push(object);
                this.performance.transparent++;
            } else {
                this.sorted.opaque.push(object);
                this.performance.opaque++;
            }

            // if shadows enabled on renderer, and shadows are enabled on object
            if (this.shadows && object.shadows) {
                this.sorted.shadow.push(object);
                this.performance.shadow++;
            }

            // count vertice number
            if (object.attributes.a_position) {
                this.performance.vertices += object.attributes.a_position.value.length / 3;
            }

            // count instances
            if (object.isInstance) {
                this.performance.instances += object.instanceCount;
            }
        }

        // sorting complete
        object.dirty.sorting = false;
    }

    renderObject(object, program, inShadowMap = false) {
        // its the parent node (scene.js)
        if (object.parent === null) {
            return;
        }

        this.updateMatrices(object.matrices.model);

        if (object.dirty.shader) {
            object.dirty.shader = false;

            if (program) {
                object.destroy();
            }
        }

        if (!program) {
            this.initUniformsPerModel(object);
            object.init();
            return;
        }

        if (lastProgram !== program) {
            lastProgram = program;
            this.changeProgram(lastProgram, object.type);
        }

        object.bind();

        this.updateUniformsPerModel(object);

        object.update(inShadowMap);
        object.draw();

        object.unbind();
    }

    initUniformsPerModel(object) {
        if (!WEBGL2) {
            // per scene
            object.setUniform('projectionMatrix', 'mat4', mat4.create());
            object.setUniform('viewMatrix', 'mat4', mat4.create());
            object.setUniform('fogSettings', 'vec4', fog);
            object.setUniform('fogColor', 'vec4', vec4.create());
            object.setUniform('iGlobalTime', 'float', time[0]);
            object.setUniform('globalClipSettings', 'vec4', vec4.create());
            object.setUniform('globalClipPlane0', 'vec4', vec4.create());
            object.setUniform('globalClipPlane1', 'vec4', vec4.create());
            object.setUniform('globalClipPlane2', 'vec4', vec4.create());
            // per object
            object.setUniform('modelMatrix', 'mat4', mat4.create());
            object.setUniform('normalMatrix', 'mat4', mat4.create());
            object.setUniform('localClipSettings', 'vec4', vec4.create());
            object.setUniform('localClipPlane0', 'vec4', vec4.create());
            object.setUniform('localClipPlane1', 'vec4', vec4.create());
            object.setUniform('localClipPlane2', 'vec4', vec4.create());

            // lights
            object.setUniform('dlPosition', 'vec4', vec4.create());
            object.setUniform('dlColor', 'vec4', vec4.create());
            object.setUniform('flIntensity', 'float', 0);
        }

        object.setUniform('shadowMap', 'sampler2D', 0);
        object.setUniform('shadowMatrix', 'mat4', mat4.create());
        object.setUniform('shadowNear', 'float', 0);
        object.setUniform('shadowFar', 'float', 0);
    }

    updateUniformsPerModel(object) {
        if (WEBGL2) {
            this.perModel.update([
                ...object.matrices.model,
                ...matrices.normal,
                ...[object.clipping.enable, 0, 0, 0],
                ...object.clipping.planes[0],
                ...object.clipping.planes[1],
                ...object.clipping.planes[2],
            ]);
        } else {
            // because UBO are webgl2 only, we need to manually add everything
            // as uniforms
            // per scene uniforms update
            object.uniforms.projectionMatrix.value = cachedCamera.matrices.projection;
            object.uniforms.viewMatrix.value = matrices.view;
            object.uniforms.fogSettings.value = fog;
            object.uniforms.fogColor.value = cachedScene.fog.color;
            object.uniforms.iGlobalTime.value = time[0];
            object.uniforms.globalClipSettings.value = [cachedScene.clipping.enable, 0, 0, 0];
            object.uniforms.globalClipPlane0.value = cachedScene.clipping.planes[0];
            object.uniforms.globalClipPlane1.value = cachedScene.clipping.planes[1];
            object.uniforms.globalClipPlane2.value = cachedScene.clipping.planes[2];

            // per model uniforms update
            object.uniforms.modelMatrix.value = object.matrices.model;
            object.uniforms.normalMatrix.value = matrices.normal;
            object.uniforms.localClipSettings.value = [object.clipping.enable, 0, 0, 0];
            object.uniforms.localClipPlane0.value = object.clipping.planes[0];
            object.uniforms.localClipPlane1.value = object.clipping.planes[0];
            object.uniforms.localClipPlane2.value = object.clipping.planes[0];
        }

        // test SHADOW
        object.uniforms.shadowMap.value = this.shadowmap.rt.depthTexture;
        object.uniforms.shadowMatrix.value = this.shadowmap.matrices.shadow;
        object.uniforms.shadowNear.value = this.shadowmap.camera.near;
        object.uniforms.shadowFar.value = this.shadowmap.camera.far;
    }
}

export default Renderer;
