# lowww-controls
Adds camera control utilities for the [lowww](https://github.com/andrevenancio/lowww) engine.

## Installation
`npm install --save lowww-controls`


## Usage
```javascript
import { Renderer, Scene, cameras, Mesh } from 'lowww-core';
import { Box } from 'lowww-geometries';
import { Orbit } from 'lowww-controls';

let renderer;
let camera;
let scene;
let controls;
let mesh;

init();
update();

const init = () => {
    renderer = new Renderer();
    renderer.setSize(400, 300);
    document.body.appendChild(renderer.domElement);

    camera = new cameras.Perspective();
    camera.position.set(0, 0, 500);

    scene = new Scene();

    controls = new Orbit(camera, renderer.domElement);

    const geometry = new Box({ width: 10, height: 10, depth: 10 });
    mesh = new Mesh({ geometry });
    scene.add(mesh);
};

const update = () => {
    controls.update();
    renderer.render(scene, camera);
    requestAnimationFrame(update.bind(this));
};
```


## License
MIT
