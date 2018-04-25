<p align="center">
    <img src="https://cdn.rawgit.com/andrevenancio/lowww/master/logo.svg" width="60px" alt="icon" />
</p>
<p align="center">lowww engine</p>

<a href="https://github.com/andrevenancio/lowww/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="licence"/></a>
<a href="https://travis-ci.org/andrevenancio/lowww"><img src="https://travis-ci.org/andrevenancio/lowww.svg" alt="Travis Status"></a>
<a href="https://david-dm.org/andrevenancio/lowww"><img src="https://david-dm.org/andrevenancio/lowww.svg" alt="Dependency Status"></a>
<a href="https://david-dm.org/andrevenancio/lowww/?type=dev"><img src="https://david-dm.org/andrevenancio/lowww/dev-status.svg" alt="devDependency Status"></a>

lowww is a `WebGL 2.0` 3D engine. This is an experimental project focused in the advantages of `WebGL 2.0` and `GLSL ES 3.0`. It falls back to `WebGL` for devices that don't yet support `WebGL 2.0`, but this functionality will be removed as soon as `WebGL 2.0` becomes standard.

All functionality is separated per package, each one in its own npm module.

## Packages
| name | package  | description
|--------|-------|------------
| `controls` | [npmjs](https://www.npmjs.com/package/lowww-controls) | Camera control utilities.
| `core` | [npmjs](https://www.npmjs.com/package/lowww) | Handles all core functionality of the engine.
| `geometries` | [npmjs](https://www.npmjs.com/package/lowww-geometries) | A collection of platonic solids and other geometries with `positions`, `indices`, `uvs` and `normals`.
| `postprocessing` | [npmjs](https://www.npmjs.com/package/lowww-postprocessing) | Postprocessing effects to use with build in `Composer` and `Pass`.


## Development
run `npm run dev:all` to run all dev tasks concurrently with an `http-server`.
To run a specific dev task you will need to enable the server manually like `npm run dev:geometries & npm run server`


## Production
run `npm build:all` to run all the build tasks and generate documentation.
