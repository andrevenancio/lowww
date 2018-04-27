# lowww-core
core functionality for the [lowww](https://github.com/andrevenancio/lowww) engine.

## Installation
`npm install --save lowww-core`


## Usage
```javascript
import { Renderer, Scene, cameras, Mesh } from 'lowww-core';
import { Box } from 'lowww-geometries';

let renderer;
let camera;
let scene;
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

    const geometry = new Box(10, 10, 10);
    mesh = new Mesh({ geometry });
    scene.add(mesh);
};

const update = () => {
    mesh.rotation.x += 0.01;
    mesh.rotation.y += 0.01;

    renderer.render(scene, camera);
    requestAnimationFrame(update.bind(this));
};
```

## Hello World
check out this [JSFiddle](https://jsfiddle.net/andrevenancio/Lq1wgvjp/).

## License
MIT
