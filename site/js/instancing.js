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
      chunks = _lowww$core.chunks,
      Model = _lowww$core.Model;
  var Box = lowww.geometries.Box;
  var UBO = chunks.UBO,
      FOG = chunks.FOG,
      LIGHT = chunks.LIGHT;

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
              this.scene.fog.start = 50;
              this.scene.fog.end = 900;
              this.scene.fog.enable = true;

              this.camera = new cameras.Perspective();
              this.camera.position.set(0, 0, 500);
          }
      }, {
          key: 'init',
          value: function init() {
              var vertex = '#version 300 es\n            in vec3 a_position;\n            in vec3 a_offset;\n            in vec3 a_normal;\n            in vec3 a_color;\n\n            ' + UBO.scene() + '\n            ' + UBO.model() + '\n\n            uniform float u_distance;\n\n            out vec3 v_normal;\n            out vec4 v_color;\n\n            vec2 rotate(vec2 v, float a) {\n                float s = sin(a);\n                float c = cos(a);\n                mat2 m = mat2(c, -s, s, c);\n                return m * v;\n            }\n\n            mat4 rotationMatrix(vec3 axis, float angle) {\n                axis = normalize(axis);\n                float s = sin(angle);\n                float c = cos(angle);\n                float oc = 1.0 - c;\n\n                return mat4(oc * axis.x * axis.x + c, oc * axis.x * axis.y - axis.z * s, oc * axis.z * axis.x + axis.y * s, 0.0, oc * axis.x * axis.y + axis.z * s, oc * axis.y * axis.y + c, oc * axis.y * axis.z - axis.x * s, 0.0, oc * axis.z * axis.x - axis.y * s, oc * axis.y * axis.z + axis.x * s, oc * axis.z * axis.z + c, 0.0, 0.0, 0.0, 0.0, 1.0);\n            }\n\n            vec3 rotate(vec3 v, vec3 axis, float angle) {\n                mat4 m = rotationMatrix(axis, angle);\n                return (m * vec4(v, 1.0)).xyz;\n            }\n\n            const float PI = 3.141592653;\n\n            void main() {\n                float speed = 150.0;\n\n                vec3 offset = a_offset;\n                offset.z = mod(offset.z + (iGlobalTime * speed), u_distance) - u_distance / 2.0;\n\n                vec2 dir = normalize(offset.xy);\n                dir = rotate(dir, PI * 0.5);\n\n                vec3 axis = normalize(a_color);\n                float angle = a_color.z + iGlobalTime * mix(a_color.x, 1.0, 0.5) * 5.0;\n\n                vec3 position = rotate(a_position, axis, angle);\n                position = position + offset;\n\n                gl_Position = projectionMatrix * viewMatrix * modelMatrix * vec4(position, 1.0);\n                v_color = vec4(a_color, 1.0);\n                v_normal = normalize(mat3(normalMatrix) * rotate(a_normal, axis, angle));\n            }\n        ';

              var fragment = '#version 300 es\n            precision highp float;\n            precision highp int;\n\n            ' + UBO.scene() + '\n            ' + UBO.lights() + '\n\n            in vec3 v_normal;\n            in vec4 v_color;\n\n            out vec4 outColor;\n\n            void main() {\n                vec4 base = v_color;\n                ' + LIGHT.factory() + ';\n                ' + FOG.linear() + '\n                outColor = base;\n            }\n        ';

              // settings
              var size = 1;
              var distance = 1000; // distance of random generated x, y, z;
              var instances = 100 * 1000; // 100k

              // offsets and colors
              var offsets = [];
              var colors = [];
              for (var i = 0; i < instances; i++) {
                  var x = Math.random() * distance - distance / 2;
                  var y = Math.random() * distance - distance / 2;
                  var z = Math.random() * distance - distance / 2;
                  offsets.push(x, y, z);
                  colors.push(Math.random(), Math.random(), Math.random());
              }

              // geometry
              var geometry = new Box(size, size, size);
              this.model = new Model();
              this.model.setAttribute('a_position', 'vec3', new Float32Array(geometry.positions));
              this.model.setIndex(new Uint16Array(geometry.indices));
              this.model.setAttribute('a_normal', 'vec3', new Float32Array(geometry.normals));
              this.model.setUniform('u_distance', 'float', distance);
              this.model.setInstanceAttribute('a_offset', 'vec3', new Float32Array(offsets));
              this.model.setInstanceAttribute('a_color', 'vec3', new Float32Array(colors));
              this.model.setInstanceCount(instances);
              this.model.setShader(vertex, fragment);
              this.scene.add(this.model);
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
