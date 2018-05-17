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
      chunks = _lowww$core.chunks,
      Model = _lowww$core.Model;
  var UBO = chunks.UBO;

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
              this.camera.position.set(0, 0, 10);
          }
      }, {
          key: 'init',
          value: function init() {
              var vertex = '#version 300 es\n            in vec3 a_position;\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n\n            void main() {\n                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n            }\n        ';

              var fragment = '#version 300 es\n            precision highp float;\n            precision highp int;\n\n            out vec4 outColor;\n\n            void main() {\n                outColor = vec4(1.0);\n            }\n        ';

              var model = new Model();
              model.setAttribute('a_position', 'vec3', new Float32Array([-1, -1, 0, 1, -1, 0, 0, 1, 0]));
              model.setShader(vertex, fragment);
              this.scene.add(model);
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
              this.renderer.render(this.scene, this.camera);
          }
      }]);
      return Main;
  }(Template);

  exports.Main = Main;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
