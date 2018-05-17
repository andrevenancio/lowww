# lowww-physics
Adds geometries for the [lowww](https://github.com/andrevenancio/lowww) engine.

## Installation
`npm install --save lowww-physics`


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

    const geometry = new Icosahedron({ radius: 10, detail: 1 });
    mesh = new Mesh({ geometry });
    scene.add(mesh);
};

const update = () => {
    renderer.render(scene, camera);
    requestAnimationFrame(update.bind(this));
};
```

## TODO
implement Octree for sorting bodies.
(https://github.com/yomotsu/meshwalk.js/blob/master/src/core/Octree.js)
Will improve performance of loops:
```
for (let i = 0; i < this.bodies.length - 1; i++) {
    for (let j = i+1; j < this.bodies.length; j++) {
        // check collisions
    }
}
```


## License
MIT
