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
          window.addEventListener('focus', this.handleResume.bind(this), false);
          window.addEventListener('blur', this.handlePause.bind(this), false);

          this.gui = new dat.GUI();
          this.gui.close();

          this.setup();
          this.init();
          this.handleResize();
          this.handleResume();
      }

      createClass(Template, [{
          key: 'handleResize',
          value: function handleResize() {
              this.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
              this.update();
          }
      }, {
          key: 'handleResume',
          value: function handleResume() {
              this.raf = requestAnimationFrame(this.handleUpdate.bind(this));
              this.resume();
          }
      }, {
          key: 'handlePause',
          value: function handlePause() {
              cancelAnimationFrame(this.raf);
              this.pause();
          }
      }, {
          key: 'handleUpdate',
          value: function handleUpdate() {
              this.update();
              this.raf = requestAnimationFrame(this.handleUpdate.bind(this));
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
          key: 'pause',
          value: function pause() {}
      }, {
          key: 'resume',
          value: function resume() {}
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
      Mesh = _lowww$core.Mesh,
      shaders = _lowww$core.shaders;
  var Orbit = lowww.controls.Orbit;
  var TorusKnot = lowww.geometries.TorusKnot;
  var Basic = shaders.Basic,
      Default = shaders.Default,
      Sem = shaders.Sem;

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
              this.camera.position.set(0, 10, 20);

              this.controls = new Orbit(this.camera, this.renderer.domElement);
          }
      }, {
          key: 'init',
          value: function init() {
              var materials = [new Basic({ wireframe: true }), new Basic(), new Default(), new Sem({ map: './img/matcap/black-gloss.jpg' })];

              var geometry = new TorusKnot();
              for (var i = 0; i < materials.length; i++) {
                  var mesh = new Mesh({ geometry: geometry, shader: materials[i] });
                  mesh.position.set(3 * i - 3 * (materials.length - 1) / 2, 0, 0);
                  this.scene.add(mesh);
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
