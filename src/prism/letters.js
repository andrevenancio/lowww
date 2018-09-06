/* global TweenLite, Power2 */
const {
    Mesh,
    Model,
    shaders,
} = lowww.core;

const {
    Prism,
} = lowww.geometries;

const DURATION = 0.5;
const HEIGHT = 1;

class Letter extends Model {
    constructor() {
        super();
        this.start();
    }

    show() {
        console.log('show letter');
    }

    hide() {
        console.log('hide letter');
    }

    start() {
        console.log('start');
    }
}

class L extends Letter {
    start() {
        let width = 5;
        let height = 1;
        let depth = 1;
        let geometry = new Prism({ width, height, depth });
        const shader = new shaders.Billboard({
            fragment: `
            float WIDTH = 10.0;
            float HEIGHT = 10.0;
            float THICKNESS = 0.01;
            vec2 u_size = vec2(800.0, 600.0);

            float drawLine(vec2 p, vec2 a,vec2 b) {
                p -= a, b -= a;
                float h = clamp(dot(p, b) / dot(b, b), 0.0, 1.0);
                return length(p - b * h);
            }

            float rand(vec2 co){
                return fract(sin(dot(co.xy, vec2(12.9898, 78.233))) * 43758.5453);
            }

            void mainImage( out vec4 fragColor, in vec2 fragCoord ) {
                float color = 0.0;
                // divide the screen in square steps
                float stepW = 1.0 / WIDTH;
                float stepH = 1.0 / HEIGHT;

                int x = int(v_uv.x * WIDTH);
                int y = int(v_uv.y * HEIGHT);

                vec2 p = vec2(float(x) * stepW, float(y) * stepH);

                // draw lines
                vec2 a = p;
                vec2 b = vec2(p.x + stepW, p.y + stepH);

                if (rand(fragCoord) > 0.5) {
                    a.x = p.x + stepW;
                    b.x = p.x;
                }

                float distance = drawLine(v_uv, a, b);
                float line = smoothstep(THICKNESS / 2.0, THICKNESS / 2.0 - (2.0 / u_size.y), distance);
                color += line;

                fragColor = vec4(v_normal, 1.0); // vec4(color);
            }
            `,
        });
        this.mesh1 = new Mesh({ geometry, shader });
        this.mesh1.rotation.y = -90 * (Math.PI / 180);
        this.add(this.mesh1);

        width = 1;
        height = 1;
        depth = 2;
        geometry = new Prism({ width, height, depth });
        this.mesh2 = new Mesh({ geometry });
        this.mesh2.position.x = width * 1.5;
        this.mesh2.position.z = depth;
        this.mesh2.rotation.y = 90 * (Math.PI / 180);
        this.add(this.mesh2);

        this.hide(0);
    }

    show(duration = DURATION) {
        const t = { value: 0 };
        TweenLite.to(t, duration, {
            value: HEIGHT / 2,
            ease: Power2.easeOut,
            onUpdate: () => {
                const y = t.value;
                this.mesh1.updateVertices([y], (2 * 3) + 1); // index 0 * xyz + 1 (y)
                this.mesh1.updateVertices([y], (3 * 3) + 1); // index 0 * xyz + 1 (y)
                this.mesh2.updateVertices([y], (2 * 3) + 1); // index 0 * xyz + 1 (y)
                this.mesh2.updateVertices([y], (3 * 3) + 1); // index 0 * xyz + 1 (y)
            },
        });
    }

    hide(duration = DURATION) {
        const t = { value: HEIGHT / 2 };
        TweenLite.to(t, duration, {
            value: -HEIGHT / 2,
            ease: Power2.easeOut,
            onUpdate: () => {
                const y = t.value;
                this.mesh1.updateVertices([y], (2 * 3) + 1); // index 0 * xyz + 1 (y)
                this.mesh1.updateVertices([y], (3 * 3) + 1); // index 0 * xyz + 1 (y)
                this.mesh2.updateVertices([y], (2 * 3) + 1); // index 0 * xyz + 1 (y)
                this.mesh2.updateVertices([y], (3 * 3) + 1); // index 0 * xyz + 1 (y)
            },
        });
    }
}

class O extends Letter {
    start() { }
}

class W extends Letter {
    start() { }
}

export {
    L,
    O,
    W,
};
