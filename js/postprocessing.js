(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.example = {})));
}(this, (function (exports) { 'use strict';

  var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) {
    return typeof obj;
  } : function (obj) {
    return obj && typeof Symbol === "function" && obj.constructor === Symbol && obj !== Symbol.prototype ? "symbol" : typeof obj;
  };

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
      Scene = _lowww$core.Scene,
      cameras = _lowww$core.cameras,
      Mesh = _lowww$core.Mesh,
      Composer = _lowww$core.Composer,
      Pass = _lowww$core.Pass,
      shaders = _lowww$core.shaders;
  var Icosahedron = lowww.geometries.Icosahedron;
  var _lowww$postprocessing = lowww.postprocessing,
      Noise = _lowww$postprocessing.Noise,
      tiltShift = _lowww$postprocessing.tiltShift;

  var Main = function (_Template) {
      inherits(Main, _Template);

      function Main() {
          classCallCheck(this, Main);
          return possibleConstructorReturn(this, (Main.__proto__ || Object.getPrototypeOf(Main)).apply(this, arguments));
      }

      createClass(Main, [{
          key: 'setup',
          value: function setup() {
              this.composer = new Composer();
              document.body.appendChild(this.composer.domElement);

              this.scene = new Scene();
              this.scene.fog.enable = true;

              this.camera = new cameras.Perspective();
              this.camera.position.set(0, 0, 500);
          }
      }, {
          key: 'init',
          value: function init() {
              var _this2 = this;

              var area = 100;
              var quantity = 10;
              for (var i = 0; i < quantity; i++) {
                  var x = Math.random() * area * 2 - area;
                  var y = Math.random() * area * 2 - area;
                  var z = Math.random() * area * 2 - area;

                  var size = 15 + Math.random() * 15;
                  var color = [1, 1, Math.random()];

                  var geometry = new Icosahedron(size, 1);
                  var shader = new shaders.Default({ color: color });
                  var model = new Mesh({ geometry: geometry, shader: shader });
                  model.position.set(x, y, z);
                  this.scene.add(model);
              }

              // add post processing
              // 1) create passes
              this.noise = new Pass(Noise);
              this.tiltshiftHorizontal = new Pass(tiltShift.Horizontal);
              this.tiltshiftVertical = new Pass(tiltShift.Vertical);

              // 2) add passes to compiler
              this.composer.pass(this.noise);
              this.composer.pass(this.tiltshiftHorizontal);
              this.composer.pass(this.tiltshiftVertical);

              // 3) compile passes
              this.composer.compile();

              // 4) just add some GUI controls
              this.settings = {
                  noise: {
                      enable: true,
                      amount: {
                          value: 0.04,
                          min: 0,
                          max: 1
                      }
                  },
                  tiltshift: {
                      enable: true,
                      amount: {
                          value: 256,
                          values: [64, 128, 256, 512, 1024]
                      }
                  }
              };

              // and finally automatically add parameters based on settings object
              Object.keys(this.settings).forEach(function (key) {
                  var folder = _this2.gui.addFolder(key);

                  Object.keys(_this2.settings[key]).forEach(function (prop) {
                      var shader = _this2.settings[key];

                      if (typeof shader[prop] === 'boolean') {
                          folder.add(_this2.settings[key], String(prop)).onChange(_this2.updateUniforms.bind(_this2));
                          if (shader[prop] === true) {
                              folder.open();
                          }
                      }

                      if (_typeof(shader[prop]) === 'object') {
                          if (shader[prop].min !== undefined && shader[prop].max !== undefined) {
                              folder.add(shader[prop], 'value', shader[prop].min, shader[prop].max).name(prop).onChange(_this2.updateUniforms.bind(_this2));
                          } else if (shader[prop].values !== undefined) {
                              folder.add(shader[prop], 'value', shader[prop].values).name(prop).onChange(_this2.updateUniforms.bind(_this2));
                          } else {
                              // has neither `min / max` or `values`
                              folder.add(shader[prop], 'value').name(prop).onChange(_this2.updateUniforms.bind(_this2));
                          }
                      }
                  });
              });

              this.composer.domElement.addEventListener('mousemove', this.mapMouseToScreen.bind(this), false);
              this.updateUniforms();
          }
      }, {
          key: 'updateUniforms',
          value: function updateUniforms() {
              this.noise.enable = this.settings.noise.enable;
              this.noise.setUniform('u_amount', this.settings.noise.amount.value);

              this.tiltshiftHorizontal.enable = this.settings.tiltshift.enable;
              this.tiltshiftHorizontal.setUniform('u_amount', this.settings.tiltshift.amount.value);

              this.tiltshiftVertical.enable = this.settings.tiltshift.enable;
              this.tiltshiftVertical.setUniform('u_amount', this.settings.tiltshift.amount.value);
          }
      }, {
          key: 'mapMouseToScreen',
          value: function mapMouseToScreen(e) {
              var x = e.clientX / window.innerWidth;
              var y = 1 - e.clientY / window.innerHeight;

              this.tiltshiftHorizontal.setUniform('u_xscreenpos', x);
              this.tiltshiftVertical.setUniform('u_yscreenpos', y);
          }
      }, {
          key: 'resize',
          value: function resize(width, height, ratio) {
              this.composer.setSize(width, height);
              this.composer.setRatio(ratio);
          }
      }, {
          key: 'update',
          value: function update() {
              this.composer.render(this.scene, this.camera);
          }
      }]);
      return Main;
  }(Template);

  exports.Main = Main;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
