(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory((global.lowww = global.lowww || {}, global.lowww.physics = {})));
}(this, function (exports) { 'use strict';

  /**
   * Common utilities
   * @module glMatrix
   */
  var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;
  if (!Math.hypot) Math.hypot = function () {
    var y = 0,
        i = arguments.length;

    while (i--) {
      y += arguments[i] * arguments[i];
    }

    return Math.sqrt(y);
  };

  /**
   * 3 Dimensional Vector
   * @module vec3
   */

  /**
   * Creates a new, empty vec3
   *
   * @returns {vec3} a new 3D vector
   */

  function create() {
    var out = new ARRAY_TYPE(3);

    if (ARRAY_TYPE != Float32Array) {
      out[0] = 0;
      out[1] = 0;
      out[2] = 0;
    }

    return out;
  }
  /**
   * Creates a new vec3 initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @returns {vec3} a new 3D vector
   */

  function fromValues(x, y, z) {
    var out = new ARRAY_TYPE(3);
    out[0] = x;
    out[1] = y;
    out[2] = z;
    return out;
  }
  /**
   * Copy the values from one vec3 to another
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the source vector
   * @returns {vec3} out
   */

  function copy(out, a) {
    out[0] = a[0];
    out[1] = a[1];
    out[2] = a[2];
    return out;
  }
  /**
   * Subtracts vector b from vector a
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the first operand
   * @param {vec3} b the second operand
   * @returns {vec3} out
   */

  function subtract(out, a, b) {
    out[0] = a[0] - b[0];
    out[1] = a[1] - b[1];
    out[2] = a[2] - b[2];
    return out;
  }
  /**
   * Adds two vec3's after scaling the second operand by a scalar value
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the first operand
   * @param {vec3} b the second operand
   * @param {Number} scale the amount to scale b by before adding
   * @returns {vec3} out
   */

  function scaleAndAdd(out, a, b, scale) {
    out[0] = a[0] + b[0] * scale;
    out[1] = a[1] + b[1] * scale;
    out[2] = a[2] + b[2] * scale;
    return out;
  }
  /**
   * Normalize a vec3
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a vector to normalize
   * @returns {vec3} out
   */

  function normalize(out, a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var len = x * x + y * y + z * z;

    if (len > 0) {
      //TODO: evaluate use of glm_invsqrt here?
      len = 1 / Math.sqrt(len);
    }

    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
    return out;
  }
  /**
   * Perform some operation over an array of vec3s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec3. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec3s to iterate over. If 0 iterates over entire array
   * @param {Function} fn Function to call for each vector in the array
   * @param {Object} [arg] additional argument to pass to fn
   * @returns {Array} a
   * @function
   */

  var forEach = function () {
    var vec = create();
    return function (a, stride, offset, count, fn, arg) {
      var i, l;

      if (!stride) {
        stride = 3;
      }

      if (!offset) {
        offset = 0;
      }

      if (count) {
        l = Math.min(count * stride + offset, a.length);
      } else {
        l = a.length;
      }

      for (i = offset; i < l; i += stride) {
        vec[0] = a[i];
        vec[1] = a[i + 1];
        vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];
        a[i + 1] = vec[1];
        a[i + 2] = vec[2];
      }

      return a;
    };
  }();

  // id's
  var SPHERE_COLLIDER = 'sphere-collider';
  var AABB_COLLIDER = 'aabb-collider';
  var RIGID_BODY = 'rigid-body';
  var FORCE = 'force';

  // default values
  var DEFAULT_TIMESTEP = 1 / 180;

  var tempDirection = create();

  var AABBIntersectAABB = function AABBIntersectAABB(a, b) {
      // TODO: is this the fastest thing I can do?
      var amin = fromValues(a.collider.left, a.collider.bottom, a.collider.back);
      var amax = fromValues(a.collider.right, a.collider.top, a.collider.front);

      var bmin = fromValues(b.collider.left, b.collider.bottom, b.collider.back);
      var bmax = fromValues(b.collider.right, b.collider.top, b.collider.front);

      if (amax[0] > bmin[0] && amin[0] < bmax[0] && amax[1] > bmin[1] && amin[1] < bmax[1] && amax[2] > bmin[2] && amin[2] < bmax[2]) {
          // when colliding check how much
          subtract(tempDirection, a.position, b.position);
          normalize(tempDirection, tempDirection);

          // TODO: WRONG!
          // const x1 = bmax[0] - amin[0];
          // const x2 = amin[0] - bmax[0];
          //
          // const y1 = bmax[1] - amin[1];
          // const y2 = amin[1] - bmax[1];
          //
          // const z1 = bmax[2] - amin[2];
          // const z2 = amin[2] - bmax[2];
          //
          // const x = Math.max(x1, x2);
          // const y = Math.max(y1, y2);
          // const z = Math.max(z1, z2);
          // console.log(amin, amax, bmin, bmax);
          // console.log(x1, x2, x);

          // const aa = x * y * z;
          // const bb = x + y + z;
          // // const length = vec3.squaredDistance(a.position, b.position);
          // console.log(x, y, z, aa, bb);
          // // debugger;

          // handleContact(a, b, target - length, tempDirection);
      }
  };

  var checkContacts = function checkContacts(a, b) {
      // switch (a.collider.type) {
      // case AABB_COLLIDER:
      //     // surely there's a better way
      //     if (b.collider.type === SPHERE_COLLIDER) {
      //         sphereIntersectSphere(a, b);
      //     } else if (b.collider.type === AABB_COLLIDER) {
      //         AABBIntersectAABB(a, b);
      //     }
      //     break;
      // default:
      // }
      AABBIntersectAABB(a, b);
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

  var time = 0;
  var timestep = 0;

  var currenttime = 0;
  var accumulator = 0;
  var newtime = 0;
  var frametime = 0;

  var World = function () {
      function World() {
          var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          classCallCheck(this, World);

          timestep = params.timestep || DEFAULT_TIMESTEP;
          currenttime = params.time || Date.now() / 1000;

          this.force = create();
          this.bodies = [];
          this.forces = [];

          this.paused = true;
      }

      createClass(World, [{
          key: 'add',
          value: function add(body) {
              if (body.type === RIGID_BODY) {
                  this.bodies.push(body);
              }

              if (body.type === FORCE) {
                  this.forces.push(body);
              }
          }
      }, {
          key: 'remove',
          value: function remove(body) {
              if (body.type === RIGID_BODY) {
                  var index = this.bodies.indexOf(body);
                  if (index !== -1) {
                      this.bodies.splice(index, 1);
                  }
              }

              if (body.type === FORCE) {
                  var _index = this.forces.indexOf(body);
                  if (_index !== -1) {
                      this.forces.splice(_index, 1);
                  }
              }
          }
      }, {
          key: 'pause',
          value: function pause() {
              if (this.paused === false) {
                  this.paused = true;
              }
          }
      }, {
          key: 'resume',
          value: function resume() {
              if (this.paused === true) {
                  this.paused = false;
              }
          }
      }, {
          key: 'update',
          value: function update() {
              if (this.paused) {
                  return;
              }
              newtime = Date.now() / 1000;
              frametime = newtime - currenttime;

              if (frametime > 0.25) {
                  frametime = 0.25;
              }

              currenttime = newtime;
              accumulator += frametime;

              while (accumulator >= timestep) {
                  this.step();
                  time += timestep;
                  accumulator -= timestep;
              }

              this.render();
          }

          // calculates physics

      }, {
          key: 'step',
          value: function step() {
              this.calculateWorldForces();

              // update bounding volumes (used later for collision detection)
              this.updateBounds();

              // check for collisions
              this.collision();

              // sort which bodies are awake and integrate them
              this.integrate();
          }
      }, {
          key: 'calculateWorldForces',
          value: function calculateWorldForces() {
              // calculates all forces in the world
              this.force[0] = 0;
              this.force[1] = 0;
              this.force[2] = 0;

              for (var i = 0; i < this.forces.length; i++) {
                  this.force[0] += this.forces[i].data[0];
                  this.force[1] += this.forces[i].data[1];
                  this.force[2] += this.forces[i].data[2];
              }

              for (var _i = 0; _i < this.bodies.length; _i++) {
                  this.bodies[_i].addForce(this.force);
              }

              // console.log(this.forces[0]);
          }
      }, {
          key: 'updateBounds',
          value: function updateBounds() {
              for (var i = 0; i < this.bodies.length; i++) {
                  this.bodies[i].updateBounds();
              }
          }
      }, {
          key: 'collision',
          value: function collision() {
              var a = void 0;
              var b = void 0;
              for (var i = 0; i < this.bodies.length - 1; i++) {
                  for (var j = i + 1; j < this.bodies.length; j++) {
                      a = this.bodies[i];
                      b = this.bodies[j];
                      checkContacts(a, b);
                  }
              }
          }
      }, {
          key: 'integrate',
          value: function integrate() {
              for (var i = 0; i < this.bodies.length; i++) {
                  this.bodies[i].integrate(timestep);
              }
          }
      }, {
          key: 'render',
          value: function render() {
              // console.log('render', this.time);
              for (var i = 0; i < this.bodies.length; i++) {
                  this.bodies[i].render(time);
              }
          }
      }]);
      return World;
  }();

  var RigidBody = function () {
      function RigidBody(params) {
          classCallCheck(this, RigidBody);

          if (!params.collider) {
              throw new Error('Please provide a collider');
          }

          if (!params.mesh) {
              throw new Error('Please provide a mesh');
          }

          Object.assign(this, {
              type: RIGID_BODY,
              awake: true,
              lineardrag: 0.999,
              dynamic: true,
              velocity: create(),
              acceleration: create(),
              position: create(),
              force: create()
          }, params);

          // copy mesh position
          copy(this.position, this.mesh.position.data);
      }

      createClass(RigidBody, [{
          key: 'getInversemass',
          value: function getInversemass() {
              return 1 / this.getMass();
          }
      }, {
          key: 'getMass',
          value: function getMass() {
              switch (this.collider.type) {
                  case SPHERE_COLLIDER:
                      return this.collider.radius;
                  case AABB_COLLIDER:
                      return 1;
                  default:
                      console.warn('unknown collider');
                      return 1;
              }
          }

          // copies world force into body

      }, {
          key: 'addForce',
          value: function addForce(force) {
              copy(this.force, force);
          }
      }, {
          key: 'integrate',
          value: function integrate(deltatime) {
              if (!this.awake || !this.dynamic) {
                  return;
              }

              // calculate acceleration
              var mass = this.getMass();
              this.acceleration[0] = this.force[0] / mass;
              this.acceleration[1] = this.force[1] / mass;
              this.acceleration[2] = this.force[2] / mass;

              // adding acceleration to velocity
              scaleAndAdd(this.velocity, this.velocity, this.acceleration, deltatime);

              // adding velocity to position
              scaleAndAdd(this.position, this.position, this.velocity, deltatime);

              // add drag to velocity
              this.velocity[0] *= this.lineardrag;
              this.velocity[1] *= this.lineardrag;
              this.velocity[2] *= this.lineardrag;
          }
      }, {
          key: 'updateBounds',
          value: function updateBounds() {
              this.collider.updateBounds(this.position);
          }
      }, {
          key: 'render',
          value: function render() {
              copy(this.mesh.position.data, this.position);
          }
      }]);
      return RigidBody;
  }();

  var SphereCollider = function () {
      function SphereCollider() {
          var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          classCallCheck(this, SphereCollider);

          Object.assign(this, {
              type: SPHERE_COLLIDER,
              radius: 1,
              bounds: create()
          }, params);
      }

      createClass(SphereCollider, [{
          key: 'updateBounds',
          value: function updateBounds(position) {
              // world space
              this.left = position[0] - this.radius;
              this.right = position[0] + this.radius;

              this.top = position[1] + this.radius;
              this.bottom = position[1] - this.radius;

              this.front = position[2] + this.radius;
              this.back = position[2] - this.radius;

              // local space
              this.bounds[0] = this.radius;
              this.bounds[1] = this.radius;
              this.bounds[2] = this.radius;
          }
      }]);
      return SphereCollider;
  }();

  var AABBCollider = function () {
      function AABBCollider() {
          var params = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : {};
          classCallCheck(this, AABBCollider);

          Object.assign(this, {
              type: AABB_COLLIDER,
              width: 1,
              height: 1,
              depth: 1,
              bounds: create()
          }, params);
      }

      createClass(AABBCollider, [{
          key: 'updateBounds',
          value: function updateBounds(position) {
              var width = this.width / 2;
              var height = this.height / 2;
              var depth = this.depth / 2;

              // world space
              this.left = position[0] - width;
              this.right = position[0] + width;

              this.top = position[1] + height;
              this.bottom = position[1] - height;

              this.front = position[2] + depth;
              this.back = position[2] - depth;

              // local space
              this.bounds[0] = this.width;
              this.bounds[1] = this.height;
              this.bounds[2] = this.depth;
          }
      }]);
      return AABBCollider;
  }();

  var Force = function Force() {
      var x = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 0;
      var y = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
      var z = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 0;
      classCallCheck(this, Force);

      this.type = FORCE;
      this.data = fromValues(x, y, z);
  };

  exports.AABBCollider = AABBCollider;
  exports.Force = Force;
  exports.RigidBody = RigidBody;
  exports.SphereCollider = SphereCollider;
  exports.World = World;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGh5c2ljcy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9lc20vY29tbW9uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9lc20vdmVjMy5qcyIsIi4uL3NyYy9jb25zdGFudHMuanMiLCIuLi9zcmMvY29yZS9jb250YWN0cy5qcyIsIi4uL3NyYy9jb3JlL3dvcmxkLmpzIiwiLi4vc3JjL2NvcmUvcmlnaWQtYm9keS5qcyIsIi4uL3NyYy9jb2xsaWRlcnMvc3BoZXJlLWNvbGxpZGVyLmpzIiwiLi4vc3JjL2NvbGxpZGVycy9hYWJiLWNvbGxpZGVyLmpzIiwiLi4vc3JjL2NvcmUvZm9yY2UuanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXHJcbiAqIENvbW1vbiB1dGlsaXRpZXNcclxuICogQG1vZHVsZSBnbE1hdHJpeFxyXG4gKi9cbi8vIENvbmZpZ3VyYXRpb24gQ29uc3RhbnRzXG5leHBvcnQgdmFyIEVQU0lMT04gPSAwLjAwMDAwMTtcbmV4cG9ydCB2YXIgQVJSQVlfVFlQRSA9IHR5cGVvZiBGbG9hdDMyQXJyYXkgIT09ICd1bmRlZmluZWQnID8gRmxvYXQzMkFycmF5IDogQXJyYXk7XG5leHBvcnQgdmFyIFJBTkRPTSA9IE1hdGgucmFuZG9tO1xuLyoqXHJcbiAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge1R5cGV9IHR5cGUgQXJyYXkgdHlwZSwgc3VjaCBhcyBGbG9hdDMyQXJyYXkgb3IgQXJyYXlcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXRyaXhBcnJheVR5cGUodHlwZSkge1xuICBBUlJBWV9UWVBFID0gdHlwZTtcbn1cbnZhciBkZWdyZWUgPSBNYXRoLlBJIC8gMTgwO1xuLyoqXHJcbiAqIENvbnZlcnQgRGVncmVlIFRvIFJhZGlhblxyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gYSBBbmdsZSBpbiBEZWdyZWVzXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gdG9SYWRpYW4oYSkge1xuICByZXR1cm4gYSAqIGRlZ3JlZTtcbn1cbi8qKlxyXG4gKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnRzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSB2YWx1ZSwgd2l0aGluIGFuIGFic29sdXRlXHJcbiAqIG9yIHJlbGF0aXZlIHRvbGVyYW5jZSBvZiBnbE1hdHJpeC5FUFNJTE9OIChhbiBhYnNvbHV0ZSB0b2xlcmFuY2UgaXMgdXNlZCBmb3IgdmFsdWVzIGxlc3NcclxuICogdGhhbiBvciBlcXVhbCB0byAxLjAsIGFuZCBhIHJlbGF0aXZlIHRvbGVyYW5jZSBpcyB1c2VkIGZvciBsYXJnZXIgdmFsdWVzKVxyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0gYSBUaGUgZmlyc3QgbnVtYmVyIHRvIHRlc3QuXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIFRoZSBzZWNvbmQgbnVtYmVyIHRvIHRlc3QuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBudW1iZXJzIGFyZSBhcHByb3hpbWF0ZWx5IGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIE1hdGguYWJzKGEgLSBiKSA8PSBFUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhKSwgTWF0aC5hYnMoYikpO1xufVxuaWYgKCFNYXRoLmh5cG90KSBNYXRoLmh5cG90ID0gZnVuY3Rpb24gKCkge1xuICB2YXIgeSA9IDAsXG4gICAgICBpID0gYXJndW1lbnRzLmxlbmd0aDtcblxuICB3aGlsZSAoaS0tKSB7XG4gICAgeSArPSBhcmd1bWVudHNbaV0gKiBhcmd1bWVudHNbaV07XG4gIH1cblxuICByZXR1cm4gTWF0aC5zcXJ0KHkpO1xufTsiLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcbi8qKlxyXG4gKiAzIERpbWVuc2lvbmFsIFZlY3RvclxyXG4gKiBAbW9kdWxlIHZlYzNcclxuICovXG5cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMzXHJcbiAqXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcblxuICBpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2xvbmVcclxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgdmFyIHggPSBhWzBdO1xuICB2YXIgeSA9IGFbMV07XG4gIHZhciB6ID0gYVsyXTtcbiAgcmV0dXJuIE1hdGguaHlwb3QoeCwgeSwgeik7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5LCB6KSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHksIHopIHtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBBZGRzIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2VpbFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguY2VpbChhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGZsb29yXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIHJvdW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQWRkcyB0d28gdmVjMydzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdO1xuICB2YXIgeSA9IGJbMV0gLSBhWzFdO1xuICB2YXIgeiA9IGJbMl0gLSBhWzJdO1xuICByZXR1cm4gTWF0aC5oeXBvdCh4LCB5LCB6KTtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdO1xuICB2YXIgeSA9IGJbMV0gLSBhWzFdO1xuICB2YXIgeiA9IGJbMl0gLSBhWzJdO1xuICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gIHZhciB4ID0gYVswXTtcbiAgdmFyIHkgPSBhWzFdO1xuICB2YXIgeiA9IGFbMl07XG4gIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG59XG4vKipcclxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBuZWdhdGVcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGludmVydFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgb3V0WzJdID0gMS4wIC8gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBOb3JtYWxpemUgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gIHZhciB4ID0gYVswXTtcbiAgdmFyIHkgPSBhWzFdO1xuICB2YXIgeiA9IGFbMl07XG4gIHZhciBsZW4gPSB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG5cbiAgaWYgKGxlbiA+IDApIHtcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgfVxuXG4gIG91dFswXSA9IGFbMF0gKiBsZW47XG4gIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn1cbi8qKlxyXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcbiAgdmFyIGF4ID0gYVswXSxcbiAgICAgIGF5ID0gYVsxXSxcbiAgICAgIGF6ID0gYVsyXTtcbiAgdmFyIGJ4ID0gYlswXSxcbiAgICAgIGJ5ID0gYlsxXSxcbiAgICAgIGJ6ID0gYlsyXTtcbiAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XG4gIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICB2YXIgYXggPSBhWzBdO1xuICB2YXIgYXkgPSBhWzFdO1xuICB2YXIgYXogPSBhWzJdO1xuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgaGVybWl0ZSBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGhlcm1pdGUob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gIHZhciBmYWN0b3JUaW1lczIgPSB0ICogdDtcbiAgdmFyIGZhY3RvcjEgPSBmYWN0b3JUaW1lczIgKiAoMiAqIHQgLSAzKSArIDE7XG4gIHZhciBmYWN0b3IyID0gZmFjdG9yVGltZXMyICogKHQgLSAyKSArIHQ7XG4gIHZhciBmYWN0b3IzID0gZmFjdG9yVGltZXMyICogKHQgLSAxKTtcbiAgdmFyIGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiAoMyAtIDIgKiB0KTtcbiAgb3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjQ7XG4gIG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0O1xuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGJlemllciBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGJlemllcihvdXQsIGEsIGIsIGMsIGQsIHQpIHtcbiAgdmFyIGludmVyc2VGYWN0b3IgPSAxIC0gdDtcbiAgdmFyIGludmVyc2VGYWN0b3JUaW1lc1R3byA9IGludmVyc2VGYWN0b3IgKiBpbnZlcnNlRmFjdG9yO1xuICB2YXIgZmFjdG9yVGltZXMyID0gdCAqIHQ7XG4gIHZhciBmYWN0b3IxID0gaW52ZXJzZUZhY3RvclRpbWVzVHdvICogaW52ZXJzZUZhY3RvcjtcbiAgdmFyIGZhY3RvcjIgPSAzICogdCAqIGludmVyc2VGYWN0b3JUaW1lc1R3bztcbiAgdmFyIGZhY3RvcjMgPSAzICogZmFjdG9yVGltZXMyICogaW52ZXJzZUZhY3RvcjtcbiAgdmFyIGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiB0O1xuICBvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNDtcbiAgb3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjQ7XG4gIG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xuICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcbiAgdmFyIHIgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIuMCAqIE1hdGguUEk7XG4gIHZhciB6ID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyLjAgLSAxLjA7XG4gIHZhciB6U2NhbGUgPSBNYXRoLnNxcnQoMS4wIC0geiAqIHopICogc2NhbGU7XG4gIG91dFswXSA9IE1hdGguY29zKHIpICogelNjYWxlO1xuICBvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHpTY2FsZTtcbiAgb3V0WzJdID0geiAqIHNjYWxlO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXHJcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdO1xuICB2YXIgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTtcbiAgdyA9IHcgfHwgMS4wO1xuICBvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gdztcbiAgb3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHc7XG4gIG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gdztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHttYXQzfSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdO1xuICBvdXRbMF0gPSB4ICogbVswXSArIHkgKiBtWzNdICsgeiAqIG1bNl07XG4gIG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XTtcbiAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcclxuICogQ2FuIGFsc28gYmUgdXNlZCBmb3IgZHVhbCBxdWF0ZXJuaW9ucy4gKE11bHRpcGx5IGl0IHdpdGggdGhlIHJlYWwgcGFydClcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICAvLyBiZW5jaG1hcmtzOiBodHRwczovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnMtZml4ZWRcbiAgdmFyIHF4ID0gcVswXSxcbiAgICAgIHF5ID0gcVsxXSxcbiAgICAgIHF6ID0gcVsyXSxcbiAgICAgIHF3ID0gcVszXTtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV0sXG4gICAgICB6ID0gYVsyXTsgLy8gdmFyIHF2ZWMgPSBbcXgsIHF5LCBxel07XG4gIC8vIHZhciB1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIGEpO1xuXG4gIHZhciB1dnggPSBxeSAqIHogLSBxeiAqIHksXG4gICAgICB1dnkgPSBxeiAqIHggLSBxeCAqIHosXG4gICAgICB1dnogPSBxeCAqIHkgLSBxeSAqIHg7IC8vIHZhciB1dXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCB1dik7XG5cbiAgdmFyIHV1dnggPSBxeSAqIHV2eiAtIHF6ICogdXZ5LFxuICAgICAgdXV2eSA9IHF6ICogdXZ4IC0gcXggKiB1dnosXG4gICAgICB1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eDsgLy8gdmVjMy5zY2FsZSh1diwgdXYsIDIgKiB3KTtcblxuICB2YXIgdzIgPSBxdyAqIDI7XG4gIHV2eCAqPSB3MjtcbiAgdXZ5ICo9IHcyO1xuICB1dnogKj0gdzI7IC8vIHZlYzMuc2NhbGUodXV2LCB1dXYsIDIpO1xuXG4gIHV1dnggKj0gMjtcbiAgdXV2eSAqPSAyO1xuICB1dXZ6ICo9IDI7IC8vIHJldHVybiB2ZWMzLmFkZChvdXQsIGEsIHZlYzMuYWRkKG91dCwgdXYsIHV1dikpO1xuXG4gIG91dFswXSA9IHggKyB1dnggKyB1dXZ4O1xuICBvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eTtcbiAgb3V0WzJdID0geiArIHV2eiArIHV1dno7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeC1heGlzXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCBiLCBjKSB7XG4gIHZhciBwID0gW10sXG4gICAgICByID0gW107IC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdOyAvL3BlcmZvcm0gcm90YXRpb25cblxuICByWzBdID0gcFswXTtcbiAgclsxXSA9IHBbMV0gKiBNYXRoLmNvcyhjKSAtIHBbMl0gKiBNYXRoLnNpbihjKTtcbiAgclsyXSA9IHBbMV0gKiBNYXRoLnNpbihjKSArIHBbMl0gKiBNYXRoLmNvcyhjKTsgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeS1heGlzXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCBiLCBjKSB7XG4gIHZhciBwID0gW10sXG4gICAgICByID0gW107IC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdOyAvL3BlcmZvcm0gcm90YXRpb25cblxuICByWzBdID0gcFsyXSAqIE1hdGguc2luKGMpICsgcFswXSAqIE1hdGguY29zKGMpO1xuICByWzFdID0gcFsxXTtcbiAgclsyXSA9IHBbMl0gKiBNYXRoLmNvcyhjKSAtIHBbMF0gKiBNYXRoLnNpbihjKTsgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgei1heGlzXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCBiLCBjKSB7XG4gIHZhciBwID0gW10sXG4gICAgICByID0gW107IC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdOyAvL3BlcmZvcm0gcm90YXRpb25cblxuICByWzBdID0gcFswXSAqIE1hdGguY29zKGMpIC0gcFsxXSAqIE1hdGguc2luKGMpO1xuICByWzFdID0gcFswXSAqIE1hdGguc2luKGMpICsgcFsxXSAqIE1hdGguY29zKGMpO1xuICByWzJdID0gcFsyXTsgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAzRCB2ZWN0b3JzXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYW5nbGUoYSwgYikge1xuICB2YXIgdGVtcEEgPSBmcm9tVmFsdWVzKGFbMF0sIGFbMV0sIGFbMl0pO1xuICB2YXIgdGVtcEIgPSBmcm9tVmFsdWVzKGJbMF0sIGJbMV0sIGJbMl0pO1xuICBub3JtYWxpemUodGVtcEEsIHRlbXBBKTtcbiAgbm9ybWFsaXplKHRlbXBCLCB0ZW1wQik7XG4gIHZhciBjb3NpbmUgPSBkb3QodGVtcEEsIHRlbXBCKTtcblxuICBpZiAoY29zaW5lID4gMS4wKSB7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoY29zaW5lIDwgLTEuMCkge1xuICAgIHJldHVybiBNYXRoLlBJO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBNYXRoLmFjb3MoY29zaW5lKTtcbiAgfVxufVxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gemVyb1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gemVybyhvdXQpIHtcbiAgb3V0WzBdID0gMC4wO1xuICBvdXRbMV0gPSAwLjA7XG4gIG91dFsyXSA9IDAuMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl07XG59XG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIHZhciBhMCA9IGFbMF0sXG4gICAgICBhMSA9IGFbMV0sXG4gICAgICBhMiA9IGFbMl07XG4gIHZhciBiMCA9IGJbMF0sXG4gICAgICBiMSA9IGJbMV0sXG4gICAgICBiMiA9IGJbMl07XG4gIHJldHVybiBNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiYgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKTtcbn1cbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3VidHJhY3R9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBzdWIgPSBzdWJ0cmFjdDtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBtdWwgPSBtdWx0aXBseTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgZGl2ID0gZGl2aWRlO1xuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXN0YW5jZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIGRpc3QgPSBkaXN0YW5jZTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgbGVuID0gbGVuZ3RoO1xuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcbi8qKlxyXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcclxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cclxuICogQHJldHVybnMge0FycmF5fSBhXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBmb3JFYWNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdmVjID0gY3JlYXRlKCk7XG4gIHJldHVybiBmdW5jdGlvbiAoYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgdmFyIGksIGw7XG5cbiAgICBpZiAoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gMztcbiAgICB9XG5cbiAgICBpZiAoIW9mZnNldCkge1xuICAgICAgb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoY291bnQpIHtcbiAgICAgIGwgPSBNYXRoLm1pbihjb3VudCAqIHN0cmlkZSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yIChpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgIHZlY1swXSA9IGFbaV07XG4gICAgICB2ZWNbMV0gPSBhW2kgKyAxXTtcbiAgICAgIHZlY1syXSA9IGFbaSArIDJdO1xuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICBhW2ldID0gdmVjWzBdO1xuICAgICAgYVtpICsgMV0gPSB2ZWNbMV07XG4gICAgICBhW2kgKyAyXSA9IHZlY1syXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbiAgfTtcbn0oKTsiLCIvLyBpZCdzXG5leHBvcnQgY29uc3QgU1BIRVJFX0NPTExJREVSID0gJ3NwaGVyZS1jb2xsaWRlcic7XG5leHBvcnQgY29uc3QgQUFCQl9DT0xMSURFUiA9ICdhYWJiLWNvbGxpZGVyJztcbmV4cG9ydCBjb25zdCBQTEFORV9DT0xMSURFUiA9ICdwbGFuZS1jb2xsaWRlcic7XG5leHBvcnQgY29uc3QgUklHSURfQk9EWSA9ICdyaWdpZC1ib2R5JztcbmV4cG9ydCBjb25zdCBGT1JDRSA9ICdmb3JjZSc7XG5cbi8vIGRlZmF1bHQgdmFsdWVzXG5leHBvcnQgY29uc3QgREVGQVVMVF9USU1FU1RFUCA9IDEgLyAxODA7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IFNQSEVSRV9DT0xMSURFUiwgQUFCQl9DT0xMSURFUiB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNvbnN0IHRlbXBEaXJlY3Rpb24gPSB2ZWMzLmNyZWF0ZSgpO1xuXG5leHBvcnQgY29uc3QgaGFuZGxlQ29udGFjdCA9IChhLCBiLCBkZXB0aCwgZGlyZWN0aW9uKSA9PiB7XG4gICAgY29uc3QgbXQgPSBhLmdldEludmVyc2VtYXNzKCkgKyBiLmdldEludmVyc2VtYXNzKCk7XG4gICAgY29uc3QgZjEgPSBhLmdldEludmVyc2VtYXNzKCkgLyBtdDtcbiAgICBjb25zdCBmMiA9IGIuZ2V0SW52ZXJzZW1hc3MoKSAvIG10O1xuXG4gICAgY29uc3Qgb2ZmMSA9IGRlcHRoICogZjE7XG4gICAgY29uc3Qgb2ZmMiA9IGRlcHRoICogZjI7XG5cbiAgICBhLnZlbG9jaXR5WzBdICs9IGRpcmVjdGlvblswXSAqIG9mZjE7XG4gICAgYS52ZWxvY2l0eVsxXSArPSBkaXJlY3Rpb25bMV0gKiBvZmYxO1xuICAgIGEudmVsb2NpdHlbMl0gKz0gZGlyZWN0aW9uWzJdICogb2ZmMTtcblxuICAgIGIudmVsb2NpdHlbMF0gLT0gZGlyZWN0aW9uWzBdICogb2ZmMjtcbiAgICBiLnZlbG9jaXR5WzFdIC09IGRpcmVjdGlvblsxXSAqIG9mZjI7XG4gICAgYi52ZWxvY2l0eVsyXSAtPSBkaXJlY3Rpb25bMl0gKiBvZmYyO1xuXG4gICAgLy8gcmVzdGl0dXRlXG59O1xuXG5leHBvcnQgY29uc3Qgc3BoZXJlSW50ZXJzZWN0U3BoZXJlID0gKGEsIGIpID0+IHtcbiAgICBjb25zdCByID0gYS5jb2xsaWRlci5yYWRpdXMgKiAyICsgYi5jb2xsaWRlci5yYWRpdXMgKiAyO1xuICAgIGNvbnN0IHRhcmdldCA9IHIgKiByO1xuICAgIGNvbnN0IGxlbmd0aCA9IHZlYzMuc3F1YXJlZERpc3RhbmNlKGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xuXG4gICAgaWYgKGxlbmd0aCA8IHRhcmdldCkge1xuICAgICAgICB2ZWMzLnN1YnRyYWN0KHRlbXBEaXJlY3Rpb24sIGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xuICAgICAgICB2ZWMzLm5vcm1hbGl6ZSh0ZW1wRGlyZWN0aW9uLCB0ZW1wRGlyZWN0aW9uKTtcblxuICAgICAgICBoYW5kbGVDb250YWN0KGEsIGIsIHRhcmdldCAtIGxlbmd0aCwgdGVtcERpcmVjdGlvbik7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNsYW1wID0gKG1pbiwgbWF4LCB2YWx1ZSkgPT4ge1xuICAgIHJldHVybiB2YWx1ZSA8IG1pbiA/IG1pbiA6IHZhbHVlID4gbWF4ID8gbWF4IDogdmFsdWU7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbn07XG5cbmV4cG9ydCBjb25zdCBBQUJCSW50ZXJzZWN0QUFCQiA9IChhLCBiKSA9PiB7XG4gICAgLy8gVE9ETzogaXMgdGhpcyB0aGUgZmFzdGVzdCB0aGluZyBJIGNhbiBkbz9cbiAgICBjb25zdCBhbWluID0gdmVjMy5mcm9tVmFsdWVzKFxuICAgICAgICBhLmNvbGxpZGVyLmxlZnQsXG4gICAgICAgIGEuY29sbGlkZXIuYm90dG9tLFxuICAgICAgICBhLmNvbGxpZGVyLmJhY2tcbiAgICApO1xuICAgIGNvbnN0IGFtYXggPSB2ZWMzLmZyb21WYWx1ZXMoXG4gICAgICAgIGEuY29sbGlkZXIucmlnaHQsXG4gICAgICAgIGEuY29sbGlkZXIudG9wLFxuICAgICAgICBhLmNvbGxpZGVyLmZyb250XG4gICAgKTtcblxuICAgIGNvbnN0IGJtaW4gPSB2ZWMzLmZyb21WYWx1ZXMoXG4gICAgICAgIGIuY29sbGlkZXIubGVmdCxcbiAgICAgICAgYi5jb2xsaWRlci5ib3R0b20sXG4gICAgICAgIGIuY29sbGlkZXIuYmFja1xuICAgICk7XG4gICAgY29uc3QgYm1heCA9IHZlYzMuZnJvbVZhbHVlcyhcbiAgICAgICAgYi5jb2xsaWRlci5yaWdodCxcbiAgICAgICAgYi5jb2xsaWRlci50b3AsXG4gICAgICAgIGIuY29sbGlkZXIuZnJvbnRcbiAgICApO1xuXG4gICAgaWYgKFxuICAgICAgICBhbWF4WzBdID4gYm1pblswXSAmJlxuICAgICAgICBhbWluWzBdIDwgYm1heFswXSAmJlxuICAgICAgICBhbWF4WzFdID4gYm1pblsxXSAmJlxuICAgICAgICBhbWluWzFdIDwgYm1heFsxXSAmJlxuICAgICAgICBhbWF4WzJdID4gYm1pblsyXSAmJlxuICAgICAgICBhbWluWzJdIDwgYm1heFsyXVxuICAgICkge1xuICAgICAgICAvLyB3aGVuIGNvbGxpZGluZyBjaGVjayBob3cgbXVjaFxuICAgICAgICB2ZWMzLnN1YnRyYWN0KHRlbXBEaXJlY3Rpb24sIGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xuICAgICAgICB2ZWMzLm5vcm1hbGl6ZSh0ZW1wRGlyZWN0aW9uLCB0ZW1wRGlyZWN0aW9uKTtcblxuICAgICAgICAvLyBUT0RPOiBXUk9ORyFcbiAgICAgICAgLy8gY29uc3QgeDEgPSBibWF4WzBdIC0gYW1pblswXTtcbiAgICAgICAgLy8gY29uc3QgeDIgPSBhbWluWzBdIC0gYm1heFswXTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY29uc3QgeTEgPSBibWF4WzFdIC0gYW1pblsxXTtcbiAgICAgICAgLy8gY29uc3QgeTIgPSBhbWluWzFdIC0gYm1heFsxXTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY29uc3QgejEgPSBibWF4WzJdIC0gYW1pblsyXTtcbiAgICAgICAgLy8gY29uc3QgejIgPSBhbWluWzJdIC0gYm1heFsyXTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY29uc3QgeCA9IE1hdGgubWF4KHgxLCB4Mik7XG4gICAgICAgIC8vIGNvbnN0IHkgPSBNYXRoLm1heCh5MSwgeTIpO1xuICAgICAgICAvLyBjb25zdCB6ID0gTWF0aC5tYXgoejEsIHoyKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYW1pbiwgYW1heCwgYm1pbiwgYm1heCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHgxLCB4MiwgeCk7XG5cbiAgICAgICAgLy8gY29uc3QgYWEgPSB4ICogeSAqIHo7XG4gICAgICAgIC8vIGNvbnN0IGJiID0geCArIHkgKyB6O1xuICAgICAgICAvLyAvLyBjb25zdCBsZW5ndGggPSB2ZWMzLnNxdWFyZWREaXN0YW5jZShhLnBvc2l0aW9uLCBiLnBvc2l0aW9uKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coeCwgeSwgeiwgYWEsIGJiKTtcbiAgICAgICAgLy8gLy8gZGVidWdnZXI7XG5cbiAgICAgICAgLy8gaGFuZGxlQ29udGFjdChhLCBiLCB0YXJnZXQgLSBsZW5ndGgsIHRlbXBEaXJlY3Rpb24pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja0NvbnRhY3RzID0gKGEsIGIpID0+IHtcbiAgICAvLyBzd2l0Y2ggKGEuY29sbGlkZXIudHlwZSkge1xuICAgIC8vIGNhc2UgQUFCQl9DT0xMSURFUjpcbiAgICAvLyAgICAgLy8gc3VyZWx5IHRoZXJlJ3MgYSBiZXR0ZXIgd2F5XG4gICAgLy8gICAgIGlmIChiLmNvbGxpZGVyLnR5cGUgPT09IFNQSEVSRV9DT0xMSURFUikge1xuICAgIC8vICAgICAgICAgc3BoZXJlSW50ZXJzZWN0U3BoZXJlKGEsIGIpO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGIuY29sbGlkZXIudHlwZSA9PT0gQUFCQl9DT0xMSURFUikge1xuICAgIC8vICAgICAgICAgQUFCQkludGVyc2VjdEFBQkIoYSwgYik7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgYnJlYWs7XG4gICAgLy8gZGVmYXVsdDpcbiAgICAvLyB9XG4gICAgQUFCQkludGVyc2VjdEFBQkIoYSwgYik7XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgeyBSSUdJRF9CT0RZLCBGT1JDRSwgREVGQVVMVF9USU1FU1RFUCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBjaGVja0NvbnRhY3RzIH0gZnJvbSAnLi9jb250YWN0cyc7XG5cbmxldCB0aW1lID0gMDtcbmxldCB0aW1lc3RlcCA9IDA7XG5cbmxldCBjdXJyZW50dGltZSA9IDA7XG5sZXQgYWNjdW11bGF0b3IgPSAwO1xubGV0IG5ld3RpbWUgPSAwO1xubGV0IGZyYW1ldGltZSA9IDA7XG5cbmNsYXNzIFdvcmxkIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgICAgICB0aW1lc3RlcCA9IHBhcmFtcy50aW1lc3RlcCB8fCBERUZBVUxUX1RJTUVTVEVQO1xuICAgICAgICBjdXJyZW50dGltZSA9IHBhcmFtcy50aW1lIHx8IERhdGUubm93KCkgLyAxMDAwO1xuXG4gICAgICAgIHRoaXMuZm9yY2UgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICB0aGlzLmJvZGllcyA9IFtdO1xuICAgICAgICB0aGlzLmZvcmNlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhZGQoYm9keSkge1xuICAgICAgICBpZiAoYm9keS50eXBlID09PSBSSUdJRF9CT0RZKSB7XG4gICAgICAgICAgICB0aGlzLmJvZGllcy5wdXNoKGJvZHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHkudHlwZSA9PT0gRk9SQ0UpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VzLnB1c2goYm9keSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmUoYm9keSkge1xuICAgICAgICBpZiAoYm9keS50eXBlID09PSBSSUdJRF9CT0RZKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuYm9kaWVzLmluZGV4T2YoYm9keSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2RpZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChib2R5LnR5cGUgPT09IEZPUkNFKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZm9yY2VzLmluZGV4T2YoYm9keSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICBpZiAodGhpcy5wYXVzZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXN1bWUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhdXNlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbmV3dGltZSA9IERhdGUubm93KCkgLyAxMDAwO1xuICAgICAgICBmcmFtZXRpbWUgPSBuZXd0aW1lIC0gY3VycmVudHRpbWU7XG5cbiAgICAgICAgaWYgKGZyYW1ldGltZSA+IDAuMjUpIHtcbiAgICAgICAgICAgIGZyYW1ldGltZSA9IDAuMjU7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50dGltZSA9IG5ld3RpbWU7XG4gICAgICAgIGFjY3VtdWxhdG9yICs9IGZyYW1ldGltZTtcblxuICAgICAgICB3aGlsZSAoYWNjdW11bGF0b3IgPj0gdGltZXN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgdGltZSArPSB0aW1lc3RlcDtcbiAgICAgICAgICAgIGFjY3VtdWxhdG9yIC09IHRpbWVzdGVwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICAvLyBjYWxjdWxhdGVzIHBoeXNpY3NcbiAgICBzdGVwKCkge1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZVdvcmxkRm9yY2VzKCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIGJvdW5kaW5nIHZvbHVtZXMgKHVzZWQgbGF0ZXIgZm9yIGNvbGxpc2lvbiBkZXRlY3Rpb24pXG4gICAgICAgIHRoaXMudXBkYXRlQm91bmRzKCk7XG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIGNvbGxpc2lvbnNcbiAgICAgICAgdGhpcy5jb2xsaXNpb24oKTtcblxuICAgICAgICAvLyBzb3J0IHdoaWNoIGJvZGllcyBhcmUgYXdha2UgYW5kIGludGVncmF0ZSB0aGVtXG4gICAgICAgIHRoaXMuaW50ZWdyYXRlKCk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlV29ybGRGb3JjZXMoKSB7XG4gICAgICAgIC8vIGNhbGN1bGF0ZXMgYWxsIGZvcmNlcyBpbiB0aGUgd29ybGRcbiAgICAgICAgdGhpcy5mb3JjZVswXSA9IDA7XG4gICAgICAgIHRoaXMuZm9yY2VbMV0gPSAwO1xuICAgICAgICB0aGlzLmZvcmNlWzJdID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZm9yY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlWzBdICs9IHRoaXMuZm9yY2VzW2ldLmRhdGFbMF07XG4gICAgICAgICAgICB0aGlzLmZvcmNlWzFdICs9IHRoaXMuZm9yY2VzW2ldLmRhdGFbMV07XG4gICAgICAgICAgICB0aGlzLmZvcmNlWzJdICs9IHRoaXMuZm9yY2VzW2ldLmRhdGFbMl07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJvZGllc1tpXS5hZGRGb3JjZSh0aGlzLmZvcmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZm9yY2VzWzBdKTtcbiAgICB9XG5cbiAgICB1cGRhdGVCb3VuZHMoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9kaWVzW2ldLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29sbGlzaW9uKCkge1xuICAgICAgICBsZXQgYTtcbiAgICAgICAgbGV0IGI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCB0aGlzLmJvZGllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGEgPSB0aGlzLmJvZGllc1tpXTtcbiAgICAgICAgICAgICAgICBiID0gdGhpcy5ib2RpZXNbal07XG4gICAgICAgICAgICAgICAgY2hlY2tDb250YWN0cyhhLCBiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGludGVncmF0ZSgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ib2RpZXNbaV0uaW50ZWdyYXRlKHRpbWVzdGVwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbmRlcicsIHRoaXMudGltZSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9kaWVzW2ldLnJlbmRlcih0aW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV29ybGQ7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IFJJR0lEX0JPRFksIFNQSEVSRV9DT0xMSURFUiwgQUFCQl9DT0xMSURFUiB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFJpZ2lkQm9keSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIGlmICghcGFyYW1zLmNvbGxpZGVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGEgY29sbGlkZXInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyYW1zLm1lc2gpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIHByb3ZpZGUgYSBtZXNoJyk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAgdGhpcyxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICB0eXBlOiBSSUdJRF9CT0RZLFxuICAgICAgICAgICAgICAgIGF3YWtlOiB0cnVlLFxuICAgICAgICAgICAgICAgIGxpbmVhcmRyYWc6IDAuOTk5LFxuICAgICAgICAgICAgICAgIGR5bmFtaWM6IHRydWUsXG4gICAgICAgICAgICAgICAgdmVsb2NpdHk6IHZlYzMuY3JlYXRlKCksXG4gICAgICAgICAgICAgICAgYWNjZWxlcmF0aW9uOiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIHBvc2l0aW9uOiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICAgICAgICAgIGZvcmNlOiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICApO1xuXG4gICAgICAgIC8vIGNvcHkgbWVzaCBwb3NpdGlvblxuICAgICAgICB2ZWMzLmNvcHkodGhpcy5wb3NpdGlvbiwgdGhpcy5tZXNoLnBvc2l0aW9uLmRhdGEpO1xuICAgIH1cblxuICAgIGdldEludmVyc2VtYXNzKCkge1xuICAgICAgICByZXR1cm4gMSAvIHRoaXMuZ2V0TWFzcygpO1xuICAgIH1cblxuICAgIGdldE1hc3MoKSB7XG4gICAgICAgIHN3aXRjaCAodGhpcy5jb2xsaWRlci50eXBlKSB7XG4gICAgICAgICAgICBjYXNlIFNQSEVSRV9DT0xMSURFUjpcbiAgICAgICAgICAgICAgICByZXR1cm4gdGhpcy5jb2xsaWRlci5yYWRpdXM7XG4gICAgICAgICAgICBjYXNlIEFBQkJfQ09MTElERVI6XG4gICAgICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgIGNvbnNvbGUud2FybigndW5rbm93biBjb2xsaWRlcicpO1xuICAgICAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29waWVzIHdvcmxkIGZvcmNlIGludG8gYm9keVxuICAgIGFkZEZvcmNlKGZvcmNlKSB7XG4gICAgICAgIHZlYzMuY29weSh0aGlzLmZvcmNlLCBmb3JjZSk7XG4gICAgfVxuXG4gICAgaW50ZWdyYXRlKGRlbHRhdGltZSkge1xuICAgICAgICBpZiAoIXRoaXMuYXdha2UgfHwgIXRoaXMuZHluYW1pYykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIGFjY2VsZXJhdGlvblxuICAgICAgICBjb25zdCBtYXNzID0gdGhpcy5nZXRNYXNzKCk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uWzBdID0gdGhpcy5mb3JjZVswXSAvIG1hc3M7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uWzFdID0gdGhpcy5mb3JjZVsxXSAvIG1hc3M7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uWzJdID0gdGhpcy5mb3JjZVsyXSAvIG1hc3M7XG5cbiAgICAgICAgLy8gYWRkaW5nIGFjY2VsZXJhdGlvbiB0byB2ZWxvY2l0eVxuICAgICAgICB2ZWMzLnNjYWxlQW5kQWRkKFxuICAgICAgICAgICAgdGhpcy52ZWxvY2l0eSxcbiAgICAgICAgICAgIHRoaXMudmVsb2NpdHksXG4gICAgICAgICAgICB0aGlzLmFjY2VsZXJhdGlvbixcbiAgICAgICAgICAgIGRlbHRhdGltZVxuICAgICAgICApO1xuXG4gICAgICAgIC8vIGFkZGluZyB2ZWxvY2l0eSB0byBwb3NpdGlvblxuICAgICAgICB2ZWMzLnNjYWxlQW5kQWRkKFxuICAgICAgICAgICAgdGhpcy5wb3NpdGlvbixcbiAgICAgICAgICAgIHRoaXMucG9zaXRpb24sXG4gICAgICAgICAgICB0aGlzLnZlbG9jaXR5LFxuICAgICAgICAgICAgZGVsdGF0aW1lXG4gICAgICAgICk7XG5cbiAgICAgICAgLy8gYWRkIGRyYWcgdG8gdmVsb2NpdHlcbiAgICAgICAgdGhpcy52ZWxvY2l0eVswXSAqPSB0aGlzLmxpbmVhcmRyYWc7XG4gICAgICAgIHRoaXMudmVsb2NpdHlbMV0gKj0gdGhpcy5saW5lYXJkcmFnO1xuICAgICAgICB0aGlzLnZlbG9jaXR5WzJdICo9IHRoaXMubGluZWFyZHJhZztcbiAgICB9XG5cbiAgICB1cGRhdGVCb3VuZHMoKSB7XG4gICAgICAgIHRoaXMuY29sbGlkZXIudXBkYXRlQm91bmRzKHRoaXMucG9zaXRpb24pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMubWVzaC5wb3NpdGlvbi5kYXRhLCB0aGlzLnBvc2l0aW9uKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJpZ2lkQm9keTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IHsgU1BIRVJFX0NPTExJREVSIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgU3BoZXJlQ29sbGlkZXIge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6IFNQSEVSRV9DT0xMSURFUixcbiAgICAgICAgICAgICAgICByYWRpdXM6IDEsXG4gICAgICAgICAgICAgICAgYm91bmRzOiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHBhcmFtc1xuICAgICAgICApO1xuICAgIH1cblxuICAgIHVwZGF0ZUJvdW5kcyhwb3NpdGlvbikge1xuICAgICAgICAvLyB3b3JsZCBzcGFjZVxuICAgICAgICB0aGlzLmxlZnQgPSBwb3NpdGlvblswXSAtIHRoaXMucmFkaXVzO1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcG9zaXRpb25bMF0gKyB0aGlzLnJhZGl1cztcblxuICAgICAgICB0aGlzLnRvcCA9IHBvc2l0aW9uWzFdICsgdGhpcy5yYWRpdXM7XG4gICAgICAgIHRoaXMuYm90dG9tID0gcG9zaXRpb25bMV0gLSB0aGlzLnJhZGl1cztcblxuICAgICAgICB0aGlzLmZyb250ID0gcG9zaXRpb25bMl0gKyB0aGlzLnJhZGl1cztcbiAgICAgICAgdGhpcy5iYWNrID0gcG9zaXRpb25bMl0gLSB0aGlzLnJhZGl1cztcblxuICAgICAgICAvLyBsb2NhbCBzcGFjZVxuICAgICAgICB0aGlzLmJvdW5kc1swXSA9IHRoaXMucmFkaXVzO1xuICAgICAgICB0aGlzLmJvdW5kc1sxXSA9IHRoaXMucmFkaXVzO1xuICAgICAgICB0aGlzLmJvdW5kc1syXSA9IHRoaXMucmFkaXVzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BoZXJlQ29sbGlkZXI7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IEFBQkJfQ09MTElERVIgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBBQUJCQ29sbGlkZXIge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB0aGlzLFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHR5cGU6IEFBQkJfQ09MTElERVIsXG4gICAgICAgICAgICAgICAgd2lkdGg6IDEsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgICAgIGJvdW5kczogdmVjMy5jcmVhdGUoKSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwYXJhbXNcbiAgICAgICAgKTtcbiAgICB9XG5cbiAgICB1cGRhdGVCb3VuZHMocG9zaXRpb24pIHtcbiAgICAgICAgY29uc3Qgd2lkdGggPSB0aGlzLndpZHRoIC8gMjtcbiAgICAgICAgY29uc3QgaGVpZ2h0ID0gdGhpcy5oZWlnaHQgLyAyO1xuICAgICAgICBjb25zdCBkZXB0aCA9IHRoaXMuZGVwdGggLyAyO1xuXG4gICAgICAgIC8vIHdvcmxkIHNwYWNlXG4gICAgICAgIHRoaXMubGVmdCA9IHBvc2l0aW9uWzBdIC0gd2lkdGg7XG4gICAgICAgIHRoaXMucmlnaHQgPSBwb3NpdGlvblswXSArIHdpZHRoO1xuXG4gICAgICAgIHRoaXMudG9wID0gcG9zaXRpb25bMV0gKyBoZWlnaHQ7XG4gICAgICAgIHRoaXMuYm90dG9tID0gcG9zaXRpb25bMV0gLSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5mcm9udCA9IHBvc2l0aW9uWzJdICsgZGVwdGg7XG4gICAgICAgIHRoaXMuYmFjayA9IHBvc2l0aW9uWzJdIC0gZGVwdGg7XG5cbiAgICAgICAgLy8gbG9jYWwgc3BhY2VcbiAgICAgICAgdGhpcy5ib3VuZHNbMF0gPSB0aGlzLndpZHRoO1xuICAgICAgICB0aGlzLmJvdW5kc1sxXSA9IHRoaXMuaGVpZ2h0O1xuICAgICAgICB0aGlzLmJvdW5kc1syXSA9IHRoaXMuZGVwdGg7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBBQUJCQ29sbGlkZXI7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IEZPUkNFIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgRm9yY2Uge1xuICAgIGNvbnN0cnVjdG9yKHggPSAwLCB5ID0gMCwgeiA9IDApIHtcbiAgICAgICAgdGhpcy50eXBlID0gRk9SQ0U7XG4gICAgICAgIHRoaXMuZGF0YSA9IHZlYzMuZnJvbVZhbHVlcyh4LCB5LCB6KTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvcmNlO1xuIl0sIm5hbWVzIjpbIkFSUkFZX1RZUEUiLCJGbG9hdDMyQXJyYXkiLCJBcnJheSIsIk1hdGgiLCJoeXBvdCIsInkiLCJpIiwiYXJndW1lbnRzIiwibGVuZ3RoIiwic3FydCIsImNyZWF0ZSIsIm91dCIsImdsTWF0cml4IiwiZnJvbVZhbHVlcyIsIngiLCJ6IiwiY29weSIsImEiLCJzdWJ0cmFjdCIsImIiLCJzY2FsZUFuZEFkZCIsInNjYWxlIiwibm9ybWFsaXplIiwibGVuIiwiZm9yRWFjaCIsInZlYyIsInN0cmlkZSIsIm9mZnNldCIsImNvdW50IiwiZm4iLCJhcmciLCJsIiwibWluIiwiU1BIRVJFX0NPTExJREVSIiwiQUFCQl9DT0xMSURFUiIsIlJJR0lEX0JPRFkiLCJGT1JDRSIsIkRFRkFVTFRfVElNRVNURVAiLCJ0ZW1wRGlyZWN0aW9uIiwidmVjMyIsIkFBQkJJbnRlcnNlY3RBQUJCIiwiYW1pbiIsImNvbGxpZGVyIiwibGVmdCIsImJvdHRvbSIsImJhY2siLCJhbWF4IiwicmlnaHQiLCJ0b3AiLCJmcm9udCIsImJtaW4iLCJibWF4IiwicG9zaXRpb24iLCJjaGVja0NvbnRhY3RzIiwidGltZSIsInRpbWVzdGVwIiwiY3VycmVudHRpbWUiLCJhY2N1bXVsYXRvciIsIm5ld3RpbWUiLCJmcmFtZXRpbWUiLCJXb3JsZCIsInBhcmFtcyIsIkRhdGUiLCJub3ciLCJmb3JjZSIsImJvZGllcyIsImZvcmNlcyIsInBhdXNlZCIsImJvZHkiLCJ0eXBlIiwicHVzaCIsImluZGV4IiwiaW5kZXhPZiIsInNwbGljZSIsInN0ZXAiLCJyZW5kZXIiLCJjYWxjdWxhdGVXb3JsZEZvcmNlcyIsInVwZGF0ZUJvdW5kcyIsImNvbGxpc2lvbiIsImludGVncmF0ZSIsImRhdGEiLCJhZGRGb3JjZSIsImoiLCJSaWdpZEJvZHkiLCJFcnJvciIsIm1lc2giLCJPYmplY3QiLCJhc3NpZ24iLCJhd2FrZSIsImxpbmVhcmRyYWciLCJkeW5hbWljIiwidmVsb2NpdHkiLCJhY2NlbGVyYXRpb24iLCJnZXRNYXNzIiwicmFkaXVzIiwiY29uc29sZSIsIndhcm4iLCJkZWx0YXRpbWUiLCJtYXNzIiwiU3BoZXJlQ29sbGlkZXIiLCJib3VuZHMiLCJBQUJCQ29sbGlkZXIiLCJ3aWR0aCIsImhlaWdodCIsImRlcHRoIiwiRm9yY2UiXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBOzs7O0FBSUEsRUFFTyxJQUFJQSxhQUFhLE9BQU9DLFlBQVAsS0FBd0IsV0FBeEIsR0FBc0NBLFlBQXRDLEdBQXFEQyxLQUF0RTtBQUNQLEVBaUNBLElBQUksQ0FBQ0MsS0FBS0MsS0FBVixFQUFpQkQsS0FBS0MsS0FBTCxHQUFhLFlBQVk7RUFDeEMsTUFBSUMsSUFBSSxDQUFSO0VBQUEsTUFDSUMsSUFBSUMsVUFBVUMsTUFEbEI7O0VBR0EsU0FBT0YsR0FBUCxFQUFZO0VBQ1ZELFNBQUtFLFVBQVVELENBQVYs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
