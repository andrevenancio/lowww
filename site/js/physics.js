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
          }
      }, {
          key: 'handleResume',
          value: function handleResume() {
              this.resume();
              this.raf = requestAnimationFrame(this.handleUpdate.bind(this));
          }
      }, {
          key: 'handlePause',
          value: function handlePause() {
              this.pause();
              cancelAnimationFrame(this.raf);
              this.update();
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
          value: function pause() {
              console.warn('please add pause() method');
          }
      }, {
          key: 'resume',
          value: function resume() {
              console.warn('please add resume() method');
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
  var Icosahedron = lowww.geometries.Icosahedron;
  var _lowww$physics = lowww.physics,
      World = _lowww$physics.World,
      Force = _lowww$physics.Force,
      RigidBody = _lowww$physics.RigidBody,
      SphereCollider = _lowww$physics.SphereCollider;

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
              this.camera.position.set(0, 0, 300);

              this.controls = new Orbit(this.camera, this.renderer.domElement);
          }
      }, {
          key: 'init',
          value: function init() {
              this.world = new World();
              // this.world.add(new Force(0, -1, 0)); // fake gravity
              this.world.add(new Force(0, -9.81, 0)); // gravity
              // this.world.add(new Force(0, -19.62, 0)); // high-gravity

              // common
              var radius = 1;
              var geometry = new Icosahedron(radius, 1);
              var collider = new SphereCollider(radius);
              var mesh = void 0;
              var body = void 0;

              // A
              mesh = new Mesh({ geometry: geometry });
              mesh.position.x = -10;
              this.scene.add(mesh);

              body = new RigidBody({ collider: collider, mesh: mesh });
              this.world.add(body);

              // B
              mesh = new Mesh({ geometry: geometry });
              mesh.position.x = 10;
              this.scene.add(mesh);

              body = new RigidBody({ collider: collider, mesh: mesh });
              this.world.add(body);
          }
      }, {
          key: 'resize',
          value: function resize(width, height, ratio) {
              this.renderer.setSize(width, height);
              this.renderer.setRatio(ratio);
          }
      }, {
          key: 'pause',
          value: function pause() {
              this.world.pause();
          }
      }, {
          key: 'resume',
          value: function resume() {
              this.world.resume();
          }
      }, {
          key: 'update',
          value: function update() {
              this.world.update();
              this.controls.update();
              this.renderer.render(this.scene, this.camera);
          }
      }]);
      return Main;
  }(Template);

  exports.Main = Main;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
