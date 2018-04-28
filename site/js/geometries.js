(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.example = {})));
}(this, (function (exports) { 'use strict';

  var classCallCheck = function (instance, Constructor) {
    if (!(instance instanceof Constructor)) {
      throw new TypeError("Cannot call a class as a function");
    }
  };

  var createClass = function () {
    function defineProperties(target, props) {
      for (var i = 0; i < props.length; i++) {
        var descriptor = props[i];
        descriptor.enumerable = descriptor.enumerable || false;
        descriptor.configurable = true;
        if ("value" in descriptor) descriptor.writable = true;
        Object.defineProperty(target, descriptor.key, descriptor);
      }
    }

    return function (Constructor, protoProps, staticProps) {
      if (protoProps) defineProperties(Constructor.prototype, protoProps);
      if (staticProps) defineProperties(Constructor, staticProps);
      return Constructor;
    };
  }();

  var inherits = function (subClass, superClass) {
    if (typeof superClass !== "function" && superClass !== null) {
      throw new TypeError("Super expression must either be null or a function, not " + typeof superClass);
    }

    subClass.prototype = Object.create(superClass && superClass.prototype, {
      constructor: {
        value: subClass,
        enumerable: false,
        writable: true,
        configurable: true
      }
    });
    if (superClass) Object.setPrototypeOf ? Object.setPrototypeOf(subClass, superClass) : subClass.__proto__ = superClass;
  };

  var possibleConstructorReturn = function (self, call) {
    if (!self) {
      throw new ReferenceError("this hasn't been initialised - super() hasn't been called");
    }

    return call && (typeof call === "object" || typeof call === "function") ? call : self;
  };

  /* global dat */
  var Template = function () {
      function Template() {
          classCallCheck(this, Template);

          window.addEventListener('resize', this.handleResize.bind(this), false);

          this.gui = new dat.GUI();
          this.gui.close();

          this.setup();
          this.init();
          this.handleResize();
          this.handleUpdate();
      }

      createClass(Template, [{
          key: 'handleResize',
          value: function handleResize() {
              this.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
          }
      }, {
          key: 'handleUpdate',
          value: function handleUpdate() {
              this.update();
              requestAnimationFrame(this.handleUpdate.bind(this));
          }

          // to be overriden

      }, {
          key: 'setup',
          value: function setup() {
              console.warn('please add the setup() method');
          }
      }, {
          key: 'init',
          value: function init() {
              console.warn('please add the init() method');
          }
      }, {
          key: 'resize',
          value: function resize() {
              console.warn('please add the resize() method');
          }
      }, {
          key: 'update',
          value: function update() {
              console.warn('please add the update() method');
          }
      }]);
      return Template;
  }();

  var _lowww$core = lowww.core,
      Renderer = _lowww$core.Renderer,
      Scene = _lowww$core.Scene,
      cameras = _lowww$core.cameras,
      Mesh = _lowww$core.Mesh;
  var Orbit = lowww.controls.Orbit;
  var _lowww$geometries = lowww.geometries,
      Tetrahedron = _lowww$geometries.Tetrahedron,
      Octahedron = _lowww$geometries.Octahedron,
      Hexahedron = _lowww$geometries.Hexahedron,
      Icosahedron = _lowww$geometries.Icosahedron,
      Dodecahedron = _lowww$geometries.Dodecahedron;

  var Main = function (_Template) {
      inherits(Main, _Template);

      function Main() {
          classCallCheck(this, Main);
          return possibleConstructorReturn(this, (Main.__proto__ || Object.getPrototypeOf(Main)).apply(this, arguments));
      }

      createClass(Main, [{
          key: 'setup',
          value: function setup() {
              this.renderer = new Renderer();
              document.body.appendChild(this.renderer.domElement);

              this.scene = new Scene();

              this.camera = new cameras.Perspective();
              this.camera.position.set(0, 100, 500);

              this.controls = new Orbit(this.camera, this.renderer.domElement);
          }
      }, {
          key: 'init',
          value: function init() {
              var size = 20;
              var space = 50;

              var geometry = void 0;
              var mesh = void 0;
              var meshes = [];

              // Tetrahedron
              geometry = new Tetrahedron(size, 0);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -0);
              meshes.push(mesh);

              geometry = new Tetrahedron(size, 1);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -1);
              meshes.push(mesh);

              geometry = new Tetrahedron(size, 2);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -2);
              meshes.push(mesh);

              // Octahedron
              geometry = new Octahedron(size, 0);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -0);
              meshes.push(mesh);

              geometry = new Octahedron(size, 1);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -1);
              meshes.push(mesh);

              geometry = new Octahedron(size, 2);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -2);
              meshes.push(mesh);

              // Hexahedron
              geometry = new Hexahedron(size, 0);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -0);
              meshes.push(mesh);

              geometry = new Hexahedron(size, 1);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -1);
              meshes.push(mesh);

              geometry = new Hexahedron(size, 2);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -2);
              meshes.push(mesh);

              // Icosahedron
              geometry = new Icosahedron(size, 0);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -0);
              meshes.push(mesh);

              geometry = new Icosahedron(size, 1);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -1);
              meshes.push(mesh);

              geometry = new Icosahedron(size, 2);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -2);
              meshes.push(mesh);

              // Dodecahedron
              geometry = new Dodecahedron(size, 0);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -0);
              meshes.push(mesh);

              geometry = new Dodecahedron(size, 1);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -1);
              meshes.push(mesh);

              geometry = new Dodecahedron(size, 2);
              mesh = new Mesh({ geometry: geometry });
              mesh.position.set(0, 0, space * -2);
              meshes.push(mesh);

              var cols = 5;
              var rows = 3;
              var index = 0;

              for (var i = 0; i < cols; i++) {
                  // X
                  for (var j = 0; j < rows; j++) {
                      // Z
                      var x = Math.floor(index / rows);
                      var y = 0;
                      var z = index % rows;

                      var sx = (cols - 1) * space / -2;
                      var sz = (rows - 1) * space / 2;

                      meshes[index].position.set(sx + x * space, y, sz - z * space);
                      this.scene.add(meshes[index]);
                      index++;
                  }
              }
          }
      }, {
          key: 'resize',
          value: function resize(width, height, ratio) {
              this.renderer.setSize(width, height);
              this.renderer.setRatio(ratio);
          }
      }, {
          key: 'update',
          value: function update() {
              this.controls.update();
              this.renderer.render(this.scene, this.camera);
          }
      }]);
      return Main;
  }(Template);

  exports.Main = Main;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
