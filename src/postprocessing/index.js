import Template from '../template';

const {
    Scene,
    cameras,
    Mesh,
    Composer,
    Pass,
    shaders,
} = lowww.core;
const { Orbit } = lowww.controls;
const { Icosahedron } = lowww.geometries;
const { Noise, tiltShift } = lowww.postprocessing;

class Main extends Template {
    setup() {
        this.composer = new Composer();
        document.body.appendChild(this.composer.domElement);

        this.scene = new Scene();
        this.scene.fog.enable = true;

        this.camera = new cameras.Perspective();
        this.camera.position.set(0, 0, 20);

        this.controls = new Orbit(this.camera, this.composer.domElement);
    }

    init() {
        const area = 5;
        const quantity = 4;
        for (let i = 0; i < quantity; i++) {
            const x = (Math.random() * area * 2) - area;
            const y = (Math.random() * area * 2) - area;
            const z = (Math.random() * area * 2) - area;

            const color = [1, 1, Math.random()];

            const geometry = new Icosahedron({ detail: 1 });
            const shader = new shaders.Default({ color });
            const mesh = new Mesh({ geometry, shader });
            mesh.position.set(x, y, z);
            this.scene.add(mesh);
        }

        // add post processing
        // 1) create passes
        this.noise = new Pass(Noise);
        this.tiltshiftHorizontal = new Pass(tiltShift.Horizontal);
        this.tiltshiftVertical = new Pass(tiltShift.Vertical);

        // 2) add passes to compiler
        this.composer.pass(this.noise);
        this.composer.pass(this.tiltshiftHorizontal);
        this.composer.pass(this.tiltshiftVertical);

        // 3) compile passes
        this.composer.compile();

        // 4) just add some GUI controls
        this.settings = {
            noise: {
                enable: true,
                amount: {
                    value: 0.04,
                    min: 0,
                    max: 1,
                },
            },
            tiltshift: {
                enable: true,
                amount: {
                    value: 256,
                    values: [64, 128, 256, 512, 1024],
                },
            },
        };

        // and finally automatically add parameters based on settings object
        Object.keys(this.settings).forEach((key) => {
            const folder = this.gui.addFolder(key);

            Object.keys(this.settings[key]).forEach((prop) => {
                const shader = this.settings[key];

                if (typeof shader[prop] === 'boolean') {
                    folder.add(this.settings[key], String(prop))
                        .onChange(this.updateUniforms.bind(this));
                    if (shader[prop] === true) {
                        folder.open();
                    }
                }

                if (typeof shader[prop] === 'object') {
                    if (shader[prop].min !== undefined && shader[prop].max !== undefined) {
                        folder.add(shader[prop], 'value', shader[prop].min, shader[prop].max).name(prop)
                            .onChange(this.updateUniforms.bind(this));
                    } else if (shader[prop].values !== undefined) {
                        folder.add(shader[prop], 'value', shader[prop].values).name(prop)
                            .onChange(this.updateUniforms.bind(this));
                    } else {
                        // has neither `min / max` or `values`
                        folder.add(shader[prop], 'value').name(prop)
                            .onChange(this.updateUniforms.bind(this));
                    }
                }
            });
        });

        this.composer.domElement.addEventListener('mousemove', this.mapMouseToScreen.bind(this), false);
        this.updateUniforms();
    }

    updateUniforms() {
        this.noise.enable = this.settings.noise.enable;
        this.noise.setUniform('u_amount', this.settings.noise.amount.value);

        this.tiltshiftHorizontal.enable = this.settings.tiltshift.enable;
        this.tiltshiftHorizontal.setUniform('u_amount', this.settings.tiltshift.amount.value);

        this.tiltshiftVertical.enable = this.settings.tiltshift.enable;
        this.tiltshiftVertical.setUniform('u_amount', this.settings.tiltshift.amount.value);
    }

    mapMouseToScreen(e) {
        const x = e.clientX / window.innerWidth;
        const y = 1 - (e.clientY / window.innerHeight);

        this.tiltshiftHorizontal.setUniform('u_xscreenpos', x);
        this.tiltshiftVertical.setUniform('u_yscreenpos', y);
    }

    resize(width, height, ratio) {
        this.composer.setSize(width, height);
        this.composer.setRatio(ratio);
    }

    update() {
        this.controls.update();
        this.composer.render(this.scene, this.camera);
    }
}

export { Main };
