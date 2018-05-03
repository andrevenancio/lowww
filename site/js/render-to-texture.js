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
      Mesh = _lowww$core.Mesh,
      RenderTarget = _lowww$core.RenderTarget,
      chunks = _lowww$core.chunks;
  var Orbit = lowww.controls.Orbit;
  var _lowww$geometries = lowww.geometries,
      Plane = _lowww$geometries.Plane,
      Icosahedron = _lowww$geometries.Icosahedron;
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

              // first scene to render
              this.scene1 = new Scene();

              this.camera1 = new cameras.Perspective();
              this.camera1.position.set(0, 0, 500);

              // second scene rendering plane with 1st scene as texture.
              this.scene2 = new Scene();
              this.camera2 = new cameras.Orthographic();
              this.camera2.position.z = 100;

              this.controls = new Orbit(this.camera1, this.renderer.domElement);
          }
      }, {
          key: 'init',
          value: function init() {
              // original scene
              var geometry1 = new Icosahedron(100, 1);
              var model1 = new Mesh({ geometry: geometry1 });
              this.scene1.add(model1);

              // render texture
              this.rt = new RenderTarget({
                  width: 512,
                  height: 512,
                  ratio: window.devicePixelRatio
              });

              var geometry2 = new Plane(1, 1);
              var shader = {
                  vertex: '#version 300 es\n                in vec3 a_position;\n                in vec3 a_normal;\n                in vec2 a_uv;\n\n                ' + UBO.scene() + '\n                ' + UBO.model() + '\n\n                out vec2 v_uv;\n\n                void main() {\n                    gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(a_position, 1.0);\n                    v_uv = a_uv;\n                }\n            ',

                  fragment: '#version 300 es\n                precision highp float;\n                precision highp int;\n\n                in vec2 v_uv;\n\n                uniform sampler2D u_image;\n                uniform sampler2D u_depth;\n\n                out vec4 outColor;\n\n                void main() {\n                    if (v_uv.x < 0.5) {\n                        outColor = texture(u_image, v_uv);\n                    } else {\n                        float z = texture(u_depth, v_uv).r;\n                        float n = 1.0;\n                        float f = 1000.0;\n                        float c = (2.0 * n) / (f + n - z * (f - n));\n                        outColor = vec4(vec3(c), 1.0);\n                    }\n                }\n            ',

                  uniforms: {
                      u_image: {
                          type: 'sampler2D',
                          value: this.rt.texture
                      },
                      u_depth: {
                          type: 'sampler2D',
                          value: this.rt.depthTexture
                      }
                  }
              };

              this.plane = new Mesh({ geometry: geometry2, shader: shader });
              this.scene2.add(this.plane);
          }
      }, {
          key: 'resize',
          value: function resize(width, height, ratio) {
              this.renderer.setSize(width, height);
              this.renderer.setRatio(ratio);
              this.rt.setSize(width, height);
          }
      }, {
          key: 'update',
          value: function update() {
              this.controls.update();

              // render original scene to a texture
              this.renderer.rtt({
                  renderTarget: this.rt, // the texture to render to
                  scene: this.scene1, // the scene
                  camera: this.camera1, // the camera
                  clearColor: [0, 0, 0, 1] // clear colour
              });

              // render the second scene
              this.renderer.render(this.scene2, this.camera2);
          }
      }]);
      return Main;
  }(Template);

  exports.Main = Main;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
