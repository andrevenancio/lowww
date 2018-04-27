# lowww-geometries
Adds geometries for the [lowww](https://github.com/andrevenancio/lowww) engine.

## Installation
`npm install --save lowww-geometries`


## Usage
```javascript
import { Renderer, Scene, cameras, Mesh } from 'lowww-core';
import { Icosahedron } from 'lowww-geometries';

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

    const geometry = new Icosahedron(10, 1);
    mesh = new Mesh({ geometry });
    scene.add(mesh);
};

const update = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(update.bind(this));
};
```


## License
MIT
