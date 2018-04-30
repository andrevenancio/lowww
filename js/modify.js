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
  var _lowww$geometries = lowww.geometries,
      Icosahedron = _lowww$geometries.Icosahedron,
      utils = _lowww$geometries.utils;

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
              this.scene.fog.enable = true;

              this.camera = new cameras.Perspective();
              this.camera.position.set(0, 0, 500);
          }
      }, {
          key: 'init',
          value: function init() {
              this.settings = {
                  data: ['none', 'modify', 'detach'],
                  modifier: 'modify'
              };

              this.gui.add(this.settings, 'modifier', this.settings.data).onChange(this.rebuild.bind(this));

              this.random = [];
              for (var i = 0; i < 3000; i++) {
                  this.random.push(Math.random() * 0.2);
              }

              this.original = new Icosahedron(60, 2);
              this.rebuild();
          }
      }, {
          key: 'rebuild',
          value: function rebuild() {
              if (this.mesh) {
                  this.scene.remove(this.mesh);
                  this.mesh = null;
              }

              var geometry = this.original;
              var vertices = 1;

              if (this.settings.modifier === 'modify') {
                  geometry = utils.Modify.modify(this.original);
                  vertices = 3 * 3 * 4; // vertices * XYZ * 4 faces (1 original + 3 generated)
              } else if (this.settings.modifier === 'detach') {
                  geometry = utils.Modify.detach(this.original);
                  vertices = 3 * 3 * 1; // vertices * XYZ * 1 faces
              }

              for (var face = 0; face < geometry.positions.length; face += vertices) {
                  var r = 1;
                  if (this.settings.modifier !== 'none') {
                      r += this.random[face % this.random.length];
                  }

                  for (var vertice = 0; vertice < vertices; vertice++) {
                      geometry.positions[face + vertice] *= r;
                  }
              }

              this.mesh = new Mesh({ geometry: geometry });
              this.scene.add(this.mesh);
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
              // this.mesh.rotation.x += 0.01;
              this.mesh.rotation.y += 0.01;
              this.renderer.render(this.scene, this.camera);
          }
      }]);
      return Main;
  }(Template);

  exports.Main = Main;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
