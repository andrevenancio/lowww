# lowww-postprocessing
Allows postprocessing effects on [lowww](https://github.com/andrevenancio/lowww) engine.

## Installation
`npm install --save lowww-postprocessing`


## Usage
```javascript
import { Composer, Scene, cameras, Pass, shaders } from 'lowww-core';
import { Icosahedron } from 'lowww-geometries';
import { Noise, tiltShift } from 'lowww-postprocessing';

let composer;
let camera;
let scene;
let mesh;

let noise;
let tiltshiftHorizontal;
let tiltshiftVertical;

init();
update();

const init = () => {
    composer = new Composer();
    composer.setSize(400, 300);
    document.body.appendChild(composer.domElement);

    camera = new cameras.Perspective();
    camera.position.set(0, 0, 500);

    scene = new Scene();

    const geometry = new Icosahedron({ radius: 100, detail: 1 });
    mesh = new Mesh({ geometry });
    scene.add(mesh);

    noise = new Pass(Noise);
    tiltshiftHorizontal = new Pass(tiltShift.Horizontal);
    tiltshiftVertical = new Pass(tiltShift.Vertical);

    composer.pass(noise);
    composer.pass(tiltshiftHorizontal);
    composer.pass(tiltshiftVertical);
    composer.compile();
};

const update = () => {
    composer.render(scene, camera);
    requestAnimationFrame(update.bind(this));
};
```


## License
MIT
