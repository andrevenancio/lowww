<p align="center">
    <img src="https://cdn.rawgit.com/andrevenancio/lowww/master/src/static/img/logo.svg" width="60px" alt="icon" />
</p>
<p align="center">lowww `WebGL2.0` engine</p>

lowww
===
<a href="https://github.com/andrevenancio/lowww/blob/master/LICENSE"><img src="https://img.shields.io/github/license/mashape/apistatus.svg" alt="licence"/></a>
<a href="https://travis-ci.org/andrevenancio/lowww"><img src="https://travis-ci.org/andrevenancio/lowww.svg" alt="Travis Status"></a>
<a href="https://david-dm.org/andrevenancio/lowww"><img src="https://david-dm.org/andrevenancio/lowww.svg" alt="Dependency Status"></a>
<a href="https://david-dm.org/andrevenancio/lowww/?type=dev"><img src="https://david-dm.org/andrevenancio/lowww/dev-status.svg" alt="devDependency Status"></a>

lowww is a `WebGL 2.0` Javascript 3D engine. This is an experimental project focused in the advantages of `WebGL 2.0` and `GLSL ES 3.0`. It falls back to `WebGL` for devices that don't yet support `WebGL 2.0`.


## About this repository
This is a monorepo where all packages are separated in the `packages/` folder and they can be imported independently as a npm module. There are several [npm scripts](https://github.com/andrevenancio/lowww/blob/master/package.json#L13) to allow you to build each module independently.

A brief explanation of the content within this monorepo can be seen below:
* `packages/` - contains all the packages part of the engine. Each package is a separate npm module.
* `scripts/` - contains all the build scripts necessary to compile the website, examples, documentation and each individual package.
* `site/` - contains the source code of the website.
* `src/` - contains the source code for the website which include the examples. This is where you should add any specific example you might want to contribute.


## Development
`npm start`


## Production
`npm build:all`
