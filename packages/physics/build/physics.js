(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.lowww = global.lowww || {}, global.lowww.physics = {})));
}(this, (function (exports) { 'use strict';

  /**
   * Common utilities
   * @module glMatrix
   */
  var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;

  var degree = Math.PI / 180;

  /**
   * 3x3 Matrix
   * @module mat3
   */

  /**
   * Creates a new identity mat3
   *
   * @returns {mat3} a new 3x3 matrix
   */
  function create$2() {
    var out = new ARRAY_TYPE(9);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 1;
    out[5] = 0;
    out[6] = 0;
    out[7] = 0;
    out[8] = 1;
    return out;
  }

  /**
   * 3 Dimensional Vector
   * @module vec3
   */

  /**
   * Creates a new, empty vec3
   *
   * @returns {vec3} a new 3D vector
   */
  function create$4() {
    var out = new ARRAY_TYPE(3);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    return out;
  }

  /**
   * Calculates the length of a vec3
   *
   * @param {vec3} a vector to calculate length of
   * @returns {Number} length of a
   */
  function length(a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    return Math.sqrt(x * x + y * y + z * z);
  }

  /**
   * Creates a new vec3 initialized with the given values
   *
   * @param {Number} x X component
   * @param {Number} y Y component
   * @param {Number} z Z component
   * @returns {vec3} a new 3D vector
   */
  function fromValues$4(x, y, z) {
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
  function copy$4(out, a) {
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
  function subtract$4(out, a, b) {
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
      out[0] = a[0] * len;
      out[1] = a[1] * len;
      out[2] = a[2] * len;
    }
    return out;
  }

  /**
   * Calculates the dot product of two vec3's
   *
   * @param {vec3} a the first operand
   * @param {vec3} b the second operand
   * @returns {Number} dot product of a and b
   */
  function dot(a, b) {
    return a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  }

  /**
   * Computes the cross product of two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the first operand
   * @param {vec3} b the second operand
   * @returns {vec3} out
   */
  function cross(out, a, b) {
    var ax = a[0],
        ay = a[1],
        az = a[2];
    var bx = b[0],
        by = b[1],
        bz = b[2];

    out[0] = ay * bz - az * by;
    out[1] = az * bx - ax * bz;
    out[2] = ax * by - ay * bx;
    return out;
  }

  /**
   * Alias for {@link vec3.length}
   * @function
   */
  var len = length;

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
    var vec = create$4();

    return function (a, stride, offset, count, fn, arg) {
      var i = void 0,
          l = void 0;
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
        vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];
        fn(vec, vec, arg);
        a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];
      }

      return a;
    };
  }();

  /**
   * 4 Dimensional Vector
   * @module vec4
   */

  /**
   * Creates a new, empty vec4
   *
   * @returns {vec4} a new 4D vector
   */
  function create$5() {
    var out = new ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    return out;
  }

  /**
   * Normalize a vec4
   *
   * @param {vec4} out the receiving vector
   * @param {vec4} a vector to normalize
   * @returns {vec4} out
   */
  function normalize$1(out, a) {
    var x = a[0];
    var y = a[1];
    var z = a[2];
    var w = a[3];
    var len = x * x + y * y + z * z + w * w;
    if (len > 0) {
      len = 1 / Math.sqrt(len);
      out[0] = x * len;
      out[1] = y * len;
      out[2] = z * len;
      out[3] = w * len;
    }
    return out;
  }

  /**
   * Perform some operation over an array of vec4s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec4. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec4s to iterate over. If 0 iterates over entire array
   * @param {Function} fn Function to call for each vector in the array
   * @param {Object} [arg] additional argument to pass to fn
   * @returns {Array} a
   * @function
   */
  var forEach$1 = function () {
    var vec = create$5();

    return function (a, stride, offset, count, fn, arg) {
      var i = void 0,
          l = void 0;
      if (!stride) {
        stride = 4;
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
        vec[0] = a[i];vec[1] = a[i + 1];vec[2] = a[i + 2];vec[3] = a[i + 3];
        fn(vec, vec, arg);
        a[i] = vec[0];a[i + 1] = vec[1];a[i + 2] = vec[2];a[i + 3] = vec[3];
      }

      return a;
    };
  }();

  /**
   * Quaternion
   * @module quat
   */

  /**
   * Creates a new identity quat
   *
   * @returns {quat} a new quaternion
   */
  function create$6() {
    var out = new ARRAY_TYPE(4);
    out[0] = 0;
    out[1] = 0;
    out[2] = 0;
    out[3] = 1;
    return out;
  }

  /**
   * Sets a quat from the given angle and rotation axis,
   * then returns it.
   *
   * @param {quat} out the receiving quaternion
   * @param {vec3} axis the axis around which to rotate
   * @param {Number} rad the angle in radians
   * @returns {quat} out
   **/
  function setAxisAngle(out, axis, rad) {
    rad = rad * 0.5;
    var s = Math.sin(rad);
    out[0] = s * axis[0];
    out[1] = s * axis[1];
    out[2] = s * axis[2];
    out[3] = Math.cos(rad);
    return out;
  }

  /**
   * Performs a spherical linear interpolation between two quat
   *
   * @param {quat} out the receiving quaternion
   * @param {quat} a the first operand
   * @param {quat} b the second operand
   * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
   * @returns {quat} out
   */
  function slerp(out, a, b, t) {
    // benchmarks:
    //    http://jsperf.com/quaternion-slerp-implementations
    var ax = a[0],
        ay = a[1],
        az = a[2],
        aw = a[3];
    var bx = b[0],
        by = b[1],
        bz = b[2],
        bw = b[3];

    var omega = void 0,
        cosom = void 0,
        sinom = void 0,
        scale0 = void 0,
        scale1 = void 0;

    // calc cosine
    cosom = ax * bx + ay * by + az * bz + aw * bw;
    // adjust signs (if necessary)
    if (cosom < 0.0) {
      cosom = -cosom;
      bx = -bx;
      by = -by;
      bz = -bz;
      bw = -bw;
    }
    // calculate coefficients
    if (1.0 - cosom > 0.000001) {
      // standard case (slerp)
      omega = Math.acos(cosom);
      sinom = Math.sin(omega);
      scale0 = Math.sin((1.0 - t) * omega) / sinom;
      scale1 = Math.sin(t * omega) / sinom;
    } else {
      // "from" and "to" quaternions are very close
      //  ... so we can do a linear interpolation
      scale0 = 1.0 - t;
      scale1 = t;
    }
    // calculate final values
    out[0] = scale0 * ax + scale1 * bx;
    out[1] = scale0 * ay + scale1 * by;
    out[2] = scale0 * az + scale1 * bz;
    out[3] = scale0 * aw + scale1 * bw;

    return out;
  }

  /**
   * Creates a quaternion from the given 3x3 rotation matrix.
   *
   * NOTE: The resultant quaternion is not normalized, so you should be sure
   * to renormalize the quaternion yourself where necessary.
   *
   * @param {quat} out the receiving quaternion
   * @param {mat3} m rotation matrix
   * @returns {quat} out
   * @function
   */
  function fromMat3(out, m) {
    // Algorithm in Ken Shoemake's article in 1987 SIGGRAPH course notes
    // article "Quaternion Calculus and Fast Animation".
    var fTrace = m[0] + m[4] + m[8];
    var fRoot = void 0;

    if (fTrace > 0.0) {
      // |w| > 1/2, may as well choose w > 1/2
      fRoot = Math.sqrt(fTrace + 1.0); // 2w
      out[3] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot; // 1/(4w)
      out[0] = (m[5] - m[7]) * fRoot;
      out[1] = (m[6] - m[2]) * fRoot;
      out[2] = (m[1] - m[3]) * fRoot;
    } else {
      // |w| <= 1/2
      var i = 0;
      if (m[4] > m[0]) i = 1;
      if (m[8] > m[i * 3 + i]) i = 2;
      var j = (i + 1) % 3;
      var k = (i + 2) % 3;

      fRoot = Math.sqrt(m[i * 3 + i] - m[j * 3 + j] - m[k * 3 + k] + 1.0);
      out[i] = 0.5 * fRoot;
      fRoot = 0.5 / fRoot;
      out[3] = (m[j * 3 + k] - m[k * 3 + j]) * fRoot;
      out[j] = (m[j * 3 + i] + m[i * 3 + j]) * fRoot;
      out[k] = (m[k * 3 + i] + m[i * 3 + k]) * fRoot;
    }

    return out;
  }

  /**
   * Normalize a quat
   *
   * @param {quat} out the receiving quaternion
   * @param {quat} a quaternion to normalize
   * @returns {quat} out
   * @function
   */
  var normalize$2 = normalize$1;

  /**
   * Sets a quaternion to represent the shortest rotation from one
   * vector to another.
   *
   * Both vectors are assumed to be unit length.
   *
   * @param {quat} out the receiving quaternion.
   * @param {vec3} a the initial vector
   * @param {vec3} b the destination vector
   * @returns {quat} out
   */
  var rotationTo = function () {
    var tmpvec3 = create$4();
    var xUnitVec3 = fromValues$4(1, 0, 0);
    var yUnitVec3 = fromValues$4(0, 1, 0);

    return function (out, a, b) {
      var dot$$1 = dot(a, b);
      if (dot$$1 < -0.999999) {
        cross(tmpvec3, xUnitVec3, a);
        if (len(tmpvec3) < 0.000001) cross(tmpvec3, yUnitVec3, a);
        normalize(tmpvec3, tmpvec3);
        setAxisAngle(out, tmpvec3, Math.PI);
        return out;
      } else if (dot$$1 > 0.999999) {
        out[0] = 0;
        out[1] = 0;
        out[2] = 0;
        out[3] = 1;
        return out;
      } else {
        cross(tmpvec3, a, b);
        out[0] = tmpvec3[0];
        out[1] = tmpvec3[1];
        out[2] = tmpvec3[2];
        out[3] = 1 + dot$$1;
        return normalize$2(out, out);
      }
    };
  }();

  /**
   * Performs a spherical linear interpolation with two control points
   *
   * @param {quat} out the receiving quaternion
   * @param {quat} a the first operand
   * @param {quat} b the second operand
   * @param {quat} c the third operand
   * @param {quat} d the fourth operand
   * @param {Number} t interpolation amount, in the range [0-1], between the two inputs
   * @returns {quat} out
   */
  var sqlerp = function () {
    var temp1 = create$6();
    var temp2 = create$6();

    return function (out, a, b, c, d, t) {
      slerp(temp1, a, d, t);
      slerp(temp2, b, c, t);
      slerp(out, temp1, temp2, 2 * t * (1 - t));

      return out;
    };
  }();

  /**
   * Sets the specified quaternion with values corresponding to the given
   * axes. Each axis is a vec3 and is expected to be unit length and
   * perpendicular to all other specified axes.
   *
   * @param {vec3} view  the vector representing the viewing direction
   * @param {vec3} right the vector representing the local "right" direction
   * @param {vec3} up    the vector representing the local "up" direction
   * @returns {quat} out
   */
  var setAxes = function () {
    var matr = create$2();

    return function (out, view, right, up) {
      matr[0] = right[0];
      matr[3] = right[1];
      matr[6] = right[2];

      matr[1] = up[0];
      matr[4] = up[1];
      matr[7] = up[2];

      matr[2] = -view[0];
      matr[5] = -view[1];
      matr[8] = -view[2];

      return normalize$2(out, fromMat3(out, matr));
    };
  }();

  /**
   * 2 Dimensional Vector
   * @module vec2
   */

  /**
   * Creates a new, empty vec2
   *
   * @returns {vec2} a new 2D vector
   */
  function create$8() {
    var out = new ARRAY_TYPE(2);
    out[0] = 0;
    out[1] = 0;
    return out;
  }

  /**
   * Perform some operation over an array of vec2s.
   *
   * @param {Array} a the array of vectors to iterate over
   * @param {Number} stride Number of elements between the start of each vec2. If 0 assumes tightly packed
   * @param {Number} offset Number of elements to skip at the beginning of the array
   * @param {Number} count Number of vec2s to iterate over. If 0 iterates over entire array
   * @param {Function} fn Function to call for each vector in the array
   * @param {Object} [arg] additional argument to pass to fn
   * @returns {Array} a
   * @function
   */
  var forEach$2 = function () {
    var vec = create$8();

    return function (a, stride, offset, count, fn, arg) {
      var i = void 0,
          l = void 0;
      if (!stride) {
        stride = 2;
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
        vec[0] = a[i];vec[1] = a[i + 1];
        fn(vec, vec, arg);
        a[i] = vec[0];a[i + 1] = vec[1];
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

  var tempDirection = create$4();

  var AABBIntersectAABB = function AABBIntersectAABB(a, b) {
      // TODO: is this the fastest thing I can do?
      var amin = fromValues$4(a.collider.left, a.collider.bottom, a.collider.back);
      var amax = fromValues$4(a.collider.right, a.collider.top, a.collider.front);

      var bmin = fromValues$4(b.collider.left, b.collider.bottom, b.collider.back);
      var bmax = fromValues$4(b.collider.right, b.collider.top, b.collider.front);

      if (amax[0] > bmin[0] && amin[0] < bmax[0] && amax[1] > bmin[1] && amin[1] < bmax[1] && amax[2] > bmin[2] && amin[2] < bmax[2]) {
          // when colliding check how much
          subtract$4(tempDirection, a.position, b.position);
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

          this.force = create$4();
          this.bodies = [];
          this.forces = [];

          this.paused = true;
      }

      createClass(World, [{
          key: 'add',
          value: function add$$1(body) {
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
              velocity: create$4(),
              acceleration: create$4(),
              position: create$4(),
              force: create$4()
          }, params);

          // copy mesh position
          copy$4(this.position, this.mesh.position.data);
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
              copy$4(this.force, force);
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
              copy$4(this.mesh.position.data, this.position);
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
              bounds: create$4()
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
              bounds: create$4()
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
      this.data = fromValues$4(x, y, z);
  };

  // world

  exports.World = World;
  exports.RigidBody = RigidBody;
  exports.SphereCollider = SphereCollider;
  exports.AABBCollider = AABBCollider;
  exports.Force = Force;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGh5c2ljcy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L2NvbW1vbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC9tYXQzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3ZlYzMuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvdmVjNC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC9xdWF0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3ZlYzIuanMiLCIuLi9zcmMvY29uc3RhbnRzLmpzIiwiLi4vc3JjL2NvcmUvY29udGFjdHMuanMiLCIuLi9zcmMvY29yZS93b3JsZC5qcyIsIi4uL3NyYy9jb3JlL3JpZ2lkLWJvZHkuanMiLCIuLi9zcmMvY29sbGlkZXJzL3NwaGVyZS1jb2xsaWRlci5qcyIsIi4uL3NyYy9jb2xsaWRlcnMvYWFiYi1jb2xsaWRlci5qcyIsIi4uL3NyYy9jb3JlL2ZvcmNlLmpzIiwiLi4vc3JjL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxuICogQ29tbW9uIHV0aWxpdGllc1xuICogQG1vZHVsZSBnbE1hdHJpeFxuICovXG5cbi8vIENvbmZpZ3VyYXRpb24gQ29uc3RhbnRzXG5leHBvcnQgY29uc3QgRVBTSUxPTiA9IDAuMDAwMDAxO1xuZXhwb3J0IGxldCBBUlJBWV9UWVBFID0gKHR5cGVvZiBGbG9hdDMyQXJyYXkgIT09ICd1bmRlZmluZWQnKSA/IEZsb2F0MzJBcnJheSA6IEFycmF5O1xuZXhwb3J0IGNvbnN0IFJBTkRPTSA9IE1hdGgucmFuZG9tO1xuXG4vKipcbiAqIFNldHMgdGhlIHR5cGUgb2YgYXJyYXkgdXNlZCB3aGVuIGNyZWF0aW5nIG5ldyB2ZWN0b3JzIGFuZCBtYXRyaWNlc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0TWF0cml4QXJyYXlUeXBlKHR5cGUpIHtcbiAgQVJSQVlfVFlQRSA9IHR5cGU7XG59XG5cbmNvbnN0IGRlZ3JlZSA9IE1hdGguUEkgLyAxODA7XG5cbi8qKlxuICogQ29udmVydCBEZWdyZWUgVG8gUmFkaWFuXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGEgQW5nbGUgaW4gRGVncmVlc1xuICovXG5leHBvcnQgZnVuY3Rpb24gdG9SYWRpYW4oYSkge1xuICByZXR1cm4gYSAqIGRlZ3JlZTtcbn1cblxuLyoqXG4gKiBUZXN0cyB3aGV0aGVyIG9yIG5vdCB0aGUgYXJndW1lbnRzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSB2YWx1ZSwgd2l0aGluIGFuIGFic29sdXRlXG4gKiBvciByZWxhdGl2ZSB0b2xlcmFuY2Ugb2YgZ2xNYXRyaXguRVBTSUxPTiAoYW4gYWJzb2x1dGUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIHZhbHVlcyBsZXNzXG4gKiB0aGFuIG9yIGVxdWFsIHRvIDEuMCwgYW5kIGEgcmVsYXRpdmUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIGxhcmdlciB2YWx1ZXMpXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIGZpcnN0IG51bWJlciB0byB0ZXN0LlxuICogQHBhcmFtIHtOdW1iZXJ9IGIgVGhlIHNlY29uZCBudW1iZXIgdG8gdGVzdC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBudW1iZXJzIGFyZSBhcHByb3hpbWF0ZWx5IGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICByZXR1cm4gTWF0aC5hYnMoYSAtIGIpIDw9IEVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhKSwgTWF0aC5hYnMoYikpO1xufVxuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbi8qKlxuICogM3gzIE1hdHJpeFxuICogQG1vZHVsZSBtYXQzXG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IG1hdDNcbiAqXG4gKiBAcmV0dXJucyB7bWF0M30gYSBuZXcgM3gzIG1hdHJpeFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoOSk7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDE7XG4gIG91dFs1XSA9IDA7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB1cHBlci1sZWZ0IDN4MyB2YWx1ZXMgaW50byB0aGUgZ2l2ZW4gbWF0My5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIDN4MyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSAgIHRoZSBzb3VyY2UgNHg0IG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDQob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbNF07XG4gIG91dFs0XSA9IGFbNV07XG4gIG91dFs1XSA9IGFbNl07XG4gIG91dFs2XSA9IGFbOF07XG4gIG91dFs3XSA9IGFbOV07XG4gIG91dFs4XSA9IGFbMTBdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0MyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gY2xvbmVcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgbWF0MyB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgb3V0WzRdID0gYVs0XTtcbiAgb3V0WzVdID0gYVs1XTtcbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGUgYSBuZXcgbWF0MyB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcmV0dXJucyB7bWF0M30gQSBuZXcgbWF0M1xuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyhtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcbiAgb3V0WzBdID0gbTAwO1xuICBvdXRbMV0gPSBtMDE7XG4gIG91dFsyXSA9IG0wMjtcbiAgb3V0WzNdID0gbTEwO1xuICBvdXRbNF0gPSBtMTE7XG4gIG91dFs1XSA9IG0xMjtcbiAgb3V0WzZdID0gbTIwO1xuICBvdXRbN10gPSBtMjE7XG4gIG91dFs4XSA9IG0yMjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBtYXQzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMCBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAwKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMiBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAyKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAzKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMSBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA0KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMiBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA1KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMCBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA2KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMSBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAxIHBvc2l0aW9uIChpbmRleCA3KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCA4KVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgbTAwLCBtMDEsIG0wMiwgbTEwLCBtMTEsIG0xMiwgbTIwLCBtMjEsIG0yMikge1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMTA7XG4gIG91dFs0XSA9IG0xMTtcbiAgb3V0WzVdID0gbTEyO1xuICBvdXRbNl0gPSBtMjA7XG4gIG91dFs3XSA9IG0yMTtcbiAgb3V0WzhdID0gbTIyO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCBhIG1hdDMgdG8gdGhlIGlkZW50aXR5IG1hdHJpeFxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgaWYgKG91dCA9PT0gYSkge1xuICAgIGxldCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMTIgPSBhWzVdO1xuICAgIG91dFsxXSA9IGFbM107XG4gICAgb3V0WzJdID0gYVs2XTtcbiAgICBvdXRbM10gPSBhMDE7XG4gICAgb3V0WzVdID0gYVs3XTtcbiAgICBvdXRbNl0gPSBhMDI7XG4gICAgb3V0WzddID0gYTEyO1xuICB9IGVsc2Uge1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVszXTtcbiAgICBvdXRbMl0gPSBhWzZdO1xuICAgIG91dFszXSA9IGFbMV07XG4gICAgb3V0WzRdID0gYVs0XTtcbiAgICBvdXRbNV0gPSBhWzddO1xuICAgIG91dFs2XSA9IGFbMl07XG4gICAgb3V0WzddID0gYVs1XTtcbiAgICBvdXRbOF0gPSBhWzhdO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBJbnZlcnRzIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVydChvdXQsIGEpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl07XG4gIGxldCBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdO1xuICBsZXQgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICBsZXQgYjAxID0gYTIyICogYTExIC0gYTEyICogYTIxO1xuICBsZXQgYjExID0gLWEyMiAqIGExMCArIGExMiAqIGEyMDtcbiAgbGV0IGIyMSA9IGEyMSAqIGExMCAtIGExMSAqIGEyMDtcblxuICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gIGxldCBkZXQgPSBhMDAgKiBiMDEgKyBhMDEgKiBiMTEgKyBhMDIgKiBiMjE7XG5cbiAgaWYgKCFkZXQpIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuICBkZXQgPSAxLjAgLyBkZXQ7XG5cbiAgb3V0WzBdID0gYjAxICogZGV0O1xuICBvdXRbMV0gPSAoLWEyMiAqIGEwMSArIGEwMiAqIGEyMSkgKiBkZXQ7XG4gIG91dFsyXSA9IChhMTIgKiBhMDEgLSBhMDIgKiBhMTEpICogZGV0O1xuICBvdXRbM10gPSBiMTEgKiBkZXQ7XG4gIG91dFs0XSA9IChhMjIgKiBhMDAgLSBhMDIgKiBhMjApICogZGV0O1xuICBvdXRbNV0gPSAoLWExMiAqIGEwMCArIGEwMiAqIGExMCkgKiBkZXQ7XG4gIG91dFs2XSA9IGIyMSAqIGRldDtcbiAgb3V0WzddID0gKC1hMjEgKiBhMDAgKyBhMDEgKiBhMjApICogZGV0O1xuICBvdXRbOF0gPSAoYTExICogYTAwIC0gYTAxICogYTEwKSAqIGRldDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXTtcbiAgbGV0IGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV07XG4gIGxldCBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xuXG4gIG91dFswXSA9IChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpO1xuICBvdXRbMV0gPSAoYTAyICogYTIxIC0gYTAxICogYTIyKTtcbiAgb3V0WzJdID0gKGEwMSAqIGExMiAtIGEwMiAqIGExMSk7XG4gIG91dFszXSA9IChhMTIgKiBhMjAgLSBhMTAgKiBhMjIpO1xuICBvdXRbNF0gPSAoYTAwICogYTIyIC0gYTAyICogYTIwKTtcbiAgb3V0WzVdID0gKGEwMiAqIGExMCAtIGEwMCAqIGExMik7XG4gIG91dFs2XSA9IChhMTAgKiBhMjEgLSBhMTEgKiBhMjApO1xuICBvdXRbN10gPSAoYTAxICogYTIwIC0gYTAwICogYTIxKTtcbiAgb3V0WzhdID0gKGEwMCAqIGExMSAtIGEwMSAqIGExMCk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZGV0ZXJtaW5hbnQgb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkZXRlcm1pbmFudCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkZXRlcm1pbmFudChhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgcmV0dXJuIGEwMCAqIChhMjIgKiBhMTEgLSBhMTIgKiBhMjEpICsgYTAxICogKC1hMjIgKiBhMTAgKyBhMTIgKiBhMjApICsgYTAyICogKGEyMSAqIGExMCAtIGExMSAqIGEyMCk7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0MydzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgbGV0IGIwMCA9IGJbMF0sIGIwMSA9IGJbMV0sIGIwMiA9IGJbMl07XG4gIGxldCBiMTAgPSBiWzNdLCBiMTEgPSBiWzRdLCBiMTIgPSBiWzVdO1xuICBsZXQgYjIwID0gYls2XSwgYjIxID0gYls3XSwgYjIyID0gYls4XTtcblxuICBvdXRbMF0gPSBiMDAgKiBhMDAgKyBiMDEgKiBhMTAgKyBiMDIgKiBhMjA7XG4gIG91dFsxXSA9IGIwMCAqIGEwMSArIGIwMSAqIGExMSArIGIwMiAqIGEyMTtcbiAgb3V0WzJdID0gYjAwICogYTAyICsgYjAxICogYTEyICsgYjAyICogYTIyO1xuXG4gIG91dFszXSA9IGIxMCAqIGEwMCArIGIxMSAqIGExMCArIGIxMiAqIGEyMDtcbiAgb3V0WzRdID0gYjEwICogYTAxICsgYjExICogYTExICsgYjEyICogYTIxO1xuICBvdXRbNV0gPSBiMTAgKiBhMDIgKyBiMTEgKiBhMTIgKyBiMTIgKiBhMjI7XG5cbiAgb3V0WzZdID0gYjIwICogYTAwICsgYjIxICogYTEwICsgYjIyICogYTIwO1xuICBvdXRbN10gPSBiMjAgKiBhMDEgKyBiMjEgKiBhMTEgKyBiMjIgKiBhMjE7XG4gIG91dFs4XSA9IGIyMCAqIGEwMiArIGIyMSAqIGExMiArIGIyMiAqIGEyMjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2xhdGUgYSBtYXQzIGJ5IHRoZSBnaXZlbiB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gdHJhbnNsYXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IHYgdmVjdG9yIHRvIHRyYW5zbGF0ZSBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNsYXRlKG91dCwgYSwgdikge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG4gICAgeCA9IHZbMF0sIHkgPSB2WzFdO1xuXG4gIG91dFswXSA9IGEwMDtcbiAgb3V0WzFdID0gYTAxO1xuICBvdXRbMl0gPSBhMDI7XG5cbiAgb3V0WzNdID0gYTEwO1xuICBvdXRbNF0gPSBhMTE7XG4gIG91dFs1XSA9IGExMjtcblxuICBvdXRbNl0gPSB4ICogYTAwICsgeSAqIGExMCArIGEyMDtcbiAgb3V0WzddID0geCAqIGEwMSArIHkgKiBhMTEgKyBhMjE7XG4gIG91dFs4XSA9IHggKiBhMDIgKyB5ICogYTEyICsgYTIyO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXQzIGJ5IHRoZSBnaXZlbiBhbmdsZVxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGUob3V0LCBhLCByYWQpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sXG4gICAgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XSxcbiAgICBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdLFxuXG4gICAgcyA9IE1hdGguc2luKHJhZCksXG4gICAgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYyAqIGEwMCArIHMgKiBhMTA7XG4gIG91dFsxXSA9IGMgKiBhMDEgKyBzICogYTExO1xuICBvdXRbMl0gPSBjICogYTAyICsgcyAqIGExMjtcblxuICBvdXRbM10gPSBjICogYTEwIC0gcyAqIGEwMDtcbiAgb3V0WzRdID0gYyAqIGExMSAtIHMgKiBhMDE7XG4gIG91dFs1XSA9IGMgKiBhMTIgLSBzICogYTAyO1xuXG4gIG91dFs2XSA9IGEyMDtcbiAgb3V0WzddID0gYTIxO1xuICBvdXRbOF0gPSBhMjI7XG4gIHJldHVybiBvdXQ7XG59O1xuXG4vKipcbiAqIFNjYWxlcyB0aGUgbWF0MyBieSB0aGUgZGltZW5zaW9ucyBpbiB0aGUgZ2l2ZW4gdmVjMlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB0aGUgdmVjMiB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gIGxldCB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgb3V0WzBdID0geCAqIGFbMF07XG4gIG91dFsxXSA9IHggKiBhWzFdO1xuICBvdXRbMl0gPSB4ICogYVsyXTtcblxuICBvdXRbM10gPSB5ICogYVszXTtcbiAgb3V0WzRdID0geSAqIGFbNF07XG4gIG91dFs1XSA9IHkgKiBhWzVdO1xuXG4gIG91dFs2XSA9IGFbNl07XG4gIG91dFs3XSA9IGFbN107XG4gIG91dFs4XSA9IGFbOF07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQzLnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7dmVjMn0gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gdlswXTtcbiAgb3V0WzddID0gdlsxXTtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZVxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDMuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0My5yb3RhdGUoZGVzdCwgZGVzdCwgcmFkKTtcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKSwgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYztcbiAgb3V0WzFdID0gcztcbiAgb3V0WzJdID0gMDtcblxuICBvdXRbM10gPSAtcztcbiAgb3V0WzRdID0gYztcbiAgb3V0WzVdID0gMDtcblxuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciBzY2FsaW5nXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQzLnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHt2ZWMyfSB2IFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcbiAgb3V0WzBdID0gdlswXTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcblxuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB2WzFdO1xuICBvdXRbNV0gPSAwO1xuXG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29waWVzIHRoZSB2YWx1ZXMgZnJvbSBhIG1hdDJkIGludG8gYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0MmR9IGEgdGhlIG1hdHJpeCB0byBjb3B5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDJkKG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSAwO1xuXG4gIG91dFszXSA9IGFbMl07XG4gIG91dFs0XSA9IGFbM107XG4gIG91dFs1XSA9IDA7XG5cbiAgb3V0WzZdID0gYVs0XTtcbiAgb3V0WzddID0gYVs1XTtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbipcbiogQHJldHVybnMge21hdDN9IG91dFxuKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xuICBsZXQgeDIgPSB4ICsgeDtcbiAgbGV0IHkyID0geSArIHk7XG4gIGxldCB6MiA9IHogKyB6O1xuXG4gIGxldCB4eCA9IHggKiB4MjtcbiAgbGV0IHl4ID0geSAqIHgyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB6eCA9IHogKiB4MjtcbiAgbGV0IHp5ID0geiAqIHkyO1xuICBsZXQgenogPSB6ICogejI7XG4gIGxldCB3eCA9IHcgKiB4MjtcbiAgbGV0IHd5ID0gdyAqIHkyO1xuICBsZXQgd3ogPSB3ICogejI7XG5cbiAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gIG91dFszXSA9IHl4IC0gd3o7XG4gIG91dFs2XSA9IHp4ICsgd3k7XG5cbiAgb3V0WzFdID0geXggKyB3ejtcbiAgb3V0WzRdID0gMSAtIHh4IC0geno7XG4gIG91dFs3XSA9IHp5IC0gd3g7XG5cbiAgb3V0WzJdID0genggLSB3eTtcbiAgb3V0WzVdID0genkgKyB3eDtcbiAgb3V0WzhdID0gMSAtIHh4IC0geXk7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4qIENhbGN1bGF0ZXMgYSAzeDMgbm9ybWFsIG1hdHJpeCAodHJhbnNwb3NlIGludmVyc2UpIGZyb20gdGhlIDR4NCBtYXRyaXhcbipcbiogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuKiBAcGFyYW0ge21hdDR9IGEgTWF0NCB0byBkZXJpdmUgdGhlIG5vcm1hbCBtYXRyaXggZnJvbVxuKlxuKiBAcmV0dXJucyB7bWF0M30gb3V0XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbEZyb21NYXQ0KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcbiAgbGV0IGExMCA9IGFbNF0sIGExMSA9IGFbNV0sIGExMiA9IGFbNl0sIGExMyA9IGFbN107XG4gIGxldCBhMjAgPSBhWzhdLCBhMjEgPSBhWzldLCBhMjIgPSBhWzEwXSwgYTIzID0gYVsxMV07XG4gIGxldCBhMzAgPSBhWzEyXSwgYTMxID0gYVsxM10sIGEzMiA9IGFbMTRdLCBhMzMgPSBhWzE1XTtcblxuICBsZXQgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICBsZXQgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICBsZXQgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICBsZXQgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICBsZXQgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICBsZXQgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICBsZXQgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICBsZXQgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICBsZXQgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICBsZXQgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICBsZXQgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICBsZXQgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyO1xuXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgbGV0IGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGRldCA9IDEuMCAvIGRldDtcblxuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgb3V0WzFdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gIG91dFsyXSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuXG4gIG91dFszXSA9IChhMDIgKiBiMTAgLSBhMDEgKiBiMTEgLSBhMDMgKiBiMDkpICogZGV0O1xuICBvdXRbNF0gPSAoYTAwICogYjExIC0gYTAyICogYjA4ICsgYTAzICogYjA3KSAqIGRldDtcbiAgb3V0WzVdID0gKGEwMSAqIGIwOCAtIGEwMCAqIGIxMCAtIGEwMyAqIGIwNikgKiBkZXQ7XG5cbiAgb3V0WzZdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gIG91dFs3XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICBvdXRbOF0gPSAoYTMwICogYjA0IC0gYTMxICogYjAyICsgYTMzICogYjAwKSAqIGRldDtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIDJEIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSB3aWR0aCBXaWR0aCBvZiB5b3VyIGdsIGNvbnRleHRcbiAqIEBwYXJhbSB7bnVtYmVyfSBoZWlnaHQgSGVpZ2h0IG9mIGdsIGNvbnRleHRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHByb2plY3Rpb24ob3V0LCB3aWR0aCwgaGVpZ2h0KSB7XG4gICAgb3V0WzBdID0gMiAvIHdpZHRoO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgICBvdXRbM10gPSAwO1xuICAgIG91dFs0XSA9IC0yIC8gaGVpZ2h0O1xuICAgIG91dFs1XSA9IDA7XG4gICAgb3V0WzZdID0gLTE7XG4gICAgb3V0WzddID0gMTtcbiAgICBvdXRbOF0gPSAxO1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgbWF0cml4IHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAnbWF0MygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICtcbiAgICAgICAgICBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgK1xuICAgICAgICAgIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgKyBhWzhdICsgJyknO1xufVxuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvYihhKSB7XG4gIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgTWF0aC5wb3coYVs2XSwgMikgKyBNYXRoLnBvdyhhWzddLCAyKSArIE1hdGgucG93KGFbOF0sIDIpKSlcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgb3V0WzhdID0gYVs4XSArIGJbOF07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIG91dFs0XSA9IGFbNF0gLSBiWzRdO1xuICBvdXRbNV0gPSBhWzVdIC0gYls1XTtcbiAgb3V0WzZdID0gYVs2XSAtIGJbNl07XG4gIG91dFs3XSA9IGFbN10gLSBiWzddO1xuICBvdXRbOF0gPSBhWzhdIC0gYls4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuXG5cbi8qKlxuICogTXVsdGlwbHkgZWFjaCBlbGVtZW50IG9mIHRoZSBtYXRyaXggYnkgYSBzY2FsYXIuXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIG1hdHJpeCdzIGVsZW1lbnRzIGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhcihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGI7XG4gIG91dFsxXSA9IGFbMV0gKiBiO1xuICBvdXRbMl0gPSBhWzJdICogYjtcbiAgb3V0WzNdID0gYVszXSAqIGI7XG4gIG91dFs0XSA9IGFbNF0gKiBiO1xuICBvdXRbNV0gPSBhWzVdICogYjtcbiAgb3V0WzZdID0gYVs2XSAqIGI7XG4gIG91dFs3XSA9IGFbN10gKiBiO1xuICBvdXRbOF0gPSBhWzhdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQzJ3MgYWZ0ZXIgbXVsdGlwbHlpbmcgZWFjaCBlbGVtZW50IG9mIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZS5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XG4gIG91dFs0XSA9IGFbNF0gKyAoYls0XSAqIHNjYWxlKTtcbiAgb3V0WzVdID0gYVs1XSArIChiWzVdICogc2NhbGUpO1xuICBvdXRbNl0gPSBhWzZdICsgKGJbNl0gKiBzY2FsZSk7XG4gIG91dFs3XSA9IGFbN10gKyAoYls3XSAqIHNjYWxlKTtcbiAgb3V0WzhdID0gYVs4XSArIChiWzhdICogc2NhbGUpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgVGhlIGZpcnN0IG1hdHJpeC5cbiAqIEBwYXJhbSB7bWF0M30gYiBUaGUgc2Vjb25kIG1hdHJpeC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmXG4gICAgICAgICBhWzNdID09PSBiWzNdICYmIGFbNF0gPT09IGJbNF0gJiYgYVs1XSA9PT0gYls1XSAmJlxuICAgICAgICAgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddICYmIGFbOF0gPT09IGJbOF07XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXSwgYTQgPSBhWzRdLCBhNSA9IGFbNV0sIGE2ID0gYVs2XSwgYTcgPSBhWzddLCBhOCA9IGFbOF07XG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM10sIGI0ID0gYls0XSwgYjUgPSBiWzVdLCBiNiA9IGJbNl0sIGI3ID0gYls3XSwgYjggPSBiWzhdO1xuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTggLSBiOCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE4KSwgTWF0aC5hYnMoYjgpKSk7XG59XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQzLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbi8qKlxuICogMyBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBtb2R1bGUgdmVjM1xuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjM1xuICpcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xuICBvdXRbMF0gPSAwO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgbGV0IHogPSBhWzJdO1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeCwgeSwgeikge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMyk7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzMgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMyB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHksIHopIHtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNlaWxcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguY2VpbChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBmbG9vclxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWluKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7XG4gIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIHJvdW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSB2ZWN0b3IgYnlcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzMncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xuICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSArIHoqeik7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgbGV0IHogPSBiWzJdIC0gYVsyXTtcbiAgcmV0dXJuIHgqeCArIHkqeSArIHoqejtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gIGxldCB4ID0gYVswXTtcbiAgbGV0IHkgPSBhWzFdO1xuICBsZXQgeiA9IGFbMl07XG4gIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59XG5cbi8qKlxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBuZWdhdGVcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGludmVydFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgb3V0WzJdID0gMS4wIC8gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gIGxldCB4ID0gYVswXTtcbiAgbGV0IHkgPSBhWzFdO1xuICBsZXQgeiA9IGFbMl07XG4gIGxldCBsZW4gPSB4KnggKyB5KnkgKyB6Kno7XG4gIGlmIChsZW4gPiAwKSB7XG4gICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICAgIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXSArIGFbMl0gKiBiWzJdO1xufVxuXG4vKipcbiAqIENvbXB1dGVzIHRoZSBjcm9zcyBwcm9kdWN0IG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl07XG4gIGxldCBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdO1xuXG4gIG91dFswXSA9IGF5ICogYnogLSBheiAqIGJ5O1xuICBvdXRbMV0gPSBheiAqIGJ4IC0gYXggKiBiejtcbiAgb3V0WzJdID0gYXggKiBieSAtIGF5ICogYng7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBsaW5lYXIgaW50ZXJwb2xhdGlvbiBiZXR3ZWVuIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICBsZXQgYXggPSBhWzBdO1xuICBsZXQgYXkgPSBhWzFdO1xuICBsZXQgYXogPSBhWzJdO1xuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgaGVybWl0ZSBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBjIHRoZSB0aGlyZCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBoZXJtaXRlKG91dCwgYSwgYiwgYywgZCwgdCkge1xuICBsZXQgZmFjdG9yVGltZXMyID0gdCAqIHQ7XG4gIGxldCBmYWN0b3IxID0gZmFjdG9yVGltZXMyICogKDIgKiB0IC0gMykgKyAxO1xuICBsZXQgZmFjdG9yMiA9IGZhY3RvclRpbWVzMiAqICh0IC0gMikgKyB0O1xuICBsZXQgZmFjdG9yMyA9IGZhY3RvclRpbWVzMiAqICh0IC0gMSk7XG4gIGxldCBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogKDMgLSAyICogdCk7XG5cbiAgb3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjQ7XG4gIG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0O1xuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgYmV6aWVyIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGMgdGhlIHRoaXJkIG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gZCB0aGUgZm91cnRoIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGJlemllcihvdXQsIGEsIGIsIGMsIGQsIHQpIHtcbiAgbGV0IGludmVyc2VGYWN0b3IgPSAxIC0gdDtcbiAgbGV0IGludmVyc2VGYWN0b3JUaW1lc1R3byA9IGludmVyc2VGYWN0b3IgKiBpbnZlcnNlRmFjdG9yO1xuICBsZXQgZmFjdG9yVGltZXMyID0gdCAqIHQ7XG4gIGxldCBmYWN0b3IxID0gaW52ZXJzZUZhY3RvclRpbWVzVHdvICogaW52ZXJzZUZhY3RvcjtcbiAgbGV0IGZhY3RvcjIgPSAzICogdCAqIGludmVyc2VGYWN0b3JUaW1lc1R3bztcbiAgbGV0IGZhY3RvcjMgPSAzICogZmFjdG9yVGltZXMyICogaW52ZXJzZUZhY3RvcjtcbiAgbGV0IGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiB0O1xuXG4gIG91dFswXSA9IGFbMF0gKiBmYWN0b3IxICsgYlswXSAqIGZhY3RvcjIgKyBjWzBdICogZmFjdG9yMyArIGRbMF0gKiBmYWN0b3I0O1xuICBvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNDtcbiAgb3V0WzJdID0gYVsyXSAqIGZhY3RvcjEgKyBiWzJdICogZmFjdG9yMiArIGNbMl0gKiBmYWN0b3IzICsgZFsyXSAqIGZhY3RvcjQ7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgc2NhbGUpIHtcbiAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG5cbiAgbGV0IHIgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIuMCAqIE1hdGguUEk7XG4gIGxldCB6ID0gKGdsTWF0cml4LlJBTkRPTSgpICogMi4wKSAtIDEuMDtcbiAgbGV0IHpTY2FsZSA9IE1hdGguc3FydCgxLjAteip6KSAqIHNjYWxlO1xuXG4gIG91dFswXSA9IE1hdGguY29zKHIpICogelNjYWxlO1xuICBvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHpTY2FsZTtcbiAgb3V0WzJdID0geiAqIHNjYWxlO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuICBsZXQgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTtcbiAgdyA9IHcgfHwgMS4wO1xuICBvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gdztcbiAgb3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHc7XG4gIG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gdztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQzLlxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0M30gbSB0aGUgM3gzIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MyhvdXQsIGEsIG0pIHtcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG4gIG91dFswXSA9IHggKiBtWzBdICsgeSAqIG1bM10gKyB6ICogbVs2XTtcbiAgb3V0WzFdID0geCAqIG1bMV0gKyB5ICogbVs0XSArIHogKiBtWzddO1xuICBvdXRbMl0gPSB4ICogbVsyXSArIHkgKiBtWzVdICsgeiAqIG1bOF07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgcXVhdFxuICogQ2FuIGFsc28gYmUgdXNlZCBmb3IgZHVhbCBxdWF0ZXJuaW9ucy4gKE11bHRpcGx5IGl0IHdpdGggdGhlIHJlYWwgcGFydClcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge3F1YXR9IHEgcXVhdGVybmlvbiB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtUXVhdChvdXQsIGEsIHEpIHtcbiAgICAvLyBiZW5jaG1hcmtzOiBodHRwczovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnMtZml4ZWRcbiAgICBsZXQgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdO1xuICAgIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuICAgIC8vIHZhciBxdmVjID0gW3F4LCBxeSwgcXpdO1xuICAgIC8vIHZhciB1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIGEpO1xuICAgIGxldCB1dnggPSBxeSAqIHogLSBxeiAqIHksXG4gICAgICAgIHV2eSA9IHF6ICogeCAtIHF4ICogeixcbiAgICAgICAgdXZ6ID0gcXggKiB5IC0gcXkgKiB4O1xuICAgIC8vIHZhciB1dXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCB1dik7XG4gICAgbGV0IHV1dnggPSBxeSAqIHV2eiAtIHF6ICogdXZ5LFxuICAgICAgICB1dXZ5ID0gcXogKiB1dnggLSBxeCAqIHV2eixcbiAgICAgICAgdXV2eiA9IHF4ICogdXZ5IC0gcXkgKiB1dng7XG4gICAgLy8gdmVjMy5zY2FsZSh1diwgdXYsIDIgKiB3KTtcbiAgICBsZXQgdzIgPSBxdyAqIDI7XG4gICAgdXZ4ICo9IHcyO1xuICAgIHV2eSAqPSB3MjtcbiAgICB1dnogKj0gdzI7XG4gICAgLy8gdmVjMy5zY2FsZSh1dXYsIHV1diwgMik7XG4gICAgdXV2eCAqPSAyO1xuICAgIHV1dnkgKj0gMjtcbiAgICB1dXZ6ICo9IDI7XG4gICAgLy8gcmV0dXJuIHZlYzMuYWRkKG91dCwgYSwgdmVjMy5hZGQob3V0LCB1diwgdXV2KSk7XG4gICAgb3V0WzBdID0geCArIHV2eCArIHV1dng7XG4gICAgb3V0WzFdID0geSArIHV2eSArIHV1dnk7XG4gICAgb3V0WzJdID0geiArIHV2eiArIHV1dno7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB4LWF4aXNcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCBiLCBjKXtcbiAgbGV0IHAgPSBbXSwgcj1bXTtcbiAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdO1xuXG4gIC8vcGVyZm9ybSByb3RhdGlvblxuICByWzBdID0gcFswXTtcbiAgclsxXSA9IHBbMV0qTWF0aC5jb3MoYykgLSBwWzJdKk1hdGguc2luKGMpO1xuICByWzJdID0gcFsxXSpNYXRoLnNpbihjKSArIHBbMl0qTWF0aC5jb3MoYyk7XG5cbiAgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XG4gIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeS1heGlzXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgYiwgYyl7XG4gIGxldCBwID0gW10sIHI9W107XG4gIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xuICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIHBbMl0gPSBhWzJdIC0gYlsyXTtcblxuICAvL3BlcmZvcm0gcm90YXRpb25cbiAgclswXSA9IHBbMl0qTWF0aC5zaW4oYykgKyBwWzBdKk1hdGguY29zKGMpO1xuICByWzFdID0gcFsxXTtcbiAgclsyXSA9IHBbMl0qTWF0aC5jb3MoYykgLSBwWzBdKk1hdGguc2luKGMpO1xuXG4gIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cbiAgb3V0WzBdID0gclswXSArIGJbMF07XG4gIG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSByWzJdICsgYlsyXTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHotYXhpc1xuICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIGIsIGMpe1xuICBsZXQgcCA9IFtdLCByPVtdO1xuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG4gIHBbMF0gPSBhWzBdIC0gYlswXTtcbiAgcFsxXSA9IGFbMV0gLSBiWzFdO1xuICBwWzJdID0gYVsyXSAtIGJbMl07XG5cbiAgLy9wZXJmb3JtIHJvdGF0aW9uXG4gIHJbMF0gPSBwWzBdKk1hdGguY29zKGMpIC0gcFsxXSpNYXRoLnNpbihjKTtcbiAgclsxXSA9IHBbMF0qTWF0aC5zaW4oYykgKyBwWzFdKk1hdGguY29zKGMpO1xuICByWzJdID0gcFsyXTtcblxuICAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDNEIHZlY3RvcnNcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlKGEsIGIpIHtcbiAgbGV0IHRlbXBBID0gZnJvbVZhbHVlcyhhWzBdLCBhWzFdLCBhWzJdKTtcbiAgbGV0IHRlbXBCID0gZnJvbVZhbHVlcyhiWzBdLCBiWzFdLCBiWzJdKTtcblxuICBub3JtYWxpemUodGVtcEEsIHRlbXBBKTtcbiAgbm9ybWFsaXplKHRlbXBCLCB0ZW1wQik7XG5cbiAgbGV0IGNvc2luZSA9IGRvdCh0ZW1wQSwgdGVtcEIpO1xuXG4gIGlmKGNvc2luZSA+IDEuMCkge1xuICAgIHJldHVybiAwO1xuICB9XG4gIGVsc2UgaWYoY29zaW5lIDwgLTEuMCkge1xuICAgIHJldHVybiBNYXRoLlBJO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBNYXRoLmFjb3MoY29zaW5lKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAndmVjMygnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnKSc7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXTtcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl07XG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpKTtcbn1cblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZGl2ID0gZGl2aWRlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZGlzdCA9IGRpc3RhbmNlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckRpc3QgPSBzcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbGVuID0gbGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzcXJMZW4gPSBzcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMzcy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMzLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjM3MgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBmb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xuICBsZXQgdmVjID0gY3JlYXRlKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgIGxldCBpLCBsO1xuICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgIHN0cmlkZSA9IDM7XG4gICAgfVxuXG4gICAgaWYoIW9mZnNldCkge1xuICAgICAgb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICBpZihjb3VudCkge1xuICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbCA9IGEubGVuZ3RoO1xuICAgIH1cblxuICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdO1xuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICBhW2ldID0gdmVjWzBdOyBhW2krMV0gPSB2ZWNbMV07IGFbaSsyXSA9IHZlY1syXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbiAgfTtcbn0pKCk7XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuLyoqXG4gKiA0IERpbWVuc2lvbmFsIFZlY3RvclxuICogQG1vZHVsZSB2ZWM0XG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWM0XG4gKlxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjbG9uZVxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyB2ZWM0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjNH0gYSBuZXcgNEQgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKHgsIHksIHosIHcpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICBvdXRbMl0gPSB6O1xuICBvdXRbM10gPSB3O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWM0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzQgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSwgeiwgdykge1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICBvdXRbMl0gPSB6O1xuICBvdXRbM10gPSB3O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgb3V0WzNdID0gYVszXSArIGJbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU3VidHJhY3RzIHZlY3RvciBiIGZyb20gdmVjdG9yIGFcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdWJ0cmFjdChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAtIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLSBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC0gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAtIGJbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gIG91dFszXSA9IGFbM10gKiBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgb3V0WzNdID0gYVszXSAvIGJbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5jZWlsIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNlaWxcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNlaWwob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguY2VpbChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5jZWlsKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLmNlaWwoYVsyXSk7XG4gIG91dFszXSA9IE1hdGguY2VpbChhWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGZsb29yXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5mbG9vcihhWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5taW4oYVsyXSwgYlsyXSk7XG4gIG91dFszXSA9IE1hdGgubWluKGFbM10sIGJbM10pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1heGltdW0gb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgb3V0WzNdID0gTWF0aC5tYXgoYVszXSwgYlszXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byByb3VuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm91bmQob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XG4gIG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSk7XG4gIG91dFszXSA9IE1hdGgucm91bmQoYVszXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjNCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGI7XG4gIG91dFsxXSA9IGFbMV0gKiBiO1xuICBvdXRbMl0gPSBhWzJdICogYjtcbiAgb3V0WzNdID0gYVszXSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjNCdzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHNjYWxlIHRoZSBhbW91bnQgdG8gc2NhbGUgYiBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZUFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XG4gIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgbGV0IHogPSBiWzJdIC0gYVsyXTtcbiAgbGV0IHcgPSBiWzNdIC0gYVszXTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnogKyB3KncpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XG4gIGxldCB4ID0gYlswXSAtIGFbMF07XG4gIGxldCB5ID0gYlsxXSAtIGFbMV07XG4gIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gIGxldCB3ID0gYlszXSAtIGFbM107XG4gIHJldHVybiB4KnggKyB5KnkgKyB6KnogKyB3Knc7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gIGxldCB4ID0gYVswXTtcbiAgbGV0IHkgPSBhWzFdO1xuICBsZXQgeiA9IGFbMl07XG4gIGxldCB3ID0gYVszXTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnogKyB3KncpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoKGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgbGV0IHcgPSBhWzNdO1xuICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufVxuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XG4gIG91dFswXSA9IC1hWzBdO1xuICBvdXRbMV0gPSAtYVsxXTtcbiAgb3V0WzJdID0gLWFbMl07XG4gIG91dFszXSA9IC1hWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIGludmVyc2Ugb2YgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gaW52ZXJ0XG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnNlKG91dCwgYSkge1xuICBvdXRbMF0gPSAxLjAgLyBhWzBdO1xuICBvdXRbMV0gPSAxLjAgLyBhWzFdO1xuICBvdXRbMl0gPSAxLjAgLyBhWzJdO1xuICBvdXRbM10gPSAxLjAgLyBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBub3JtYWxpemVcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG5vcm1hbGl6ZShvdXQsIGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgbGV0IHcgPSBhWzNdO1xuICBsZXQgbGVuID0geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xuICBpZiAobGVuID4gMCkge1xuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICBvdXRbMF0gPSB4ICogbGVuO1xuICAgIG91dFsxXSA9IHkgKiBsZW47XG4gICAgb3V0WzJdID0geiAqIGxlbjtcbiAgICBvdXRbM10gPSB3ICogbGVuO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXSArIGFbM10gKiBiWzNdO1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgbGV0IGF4ID0gYVswXTtcbiAgbGV0IGF5ID0gYVsxXTtcbiAgbGV0IGF6ID0gYVsyXTtcbiAgbGV0IGF3ID0gYVszXTtcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgb3V0WzNdID0gYXcgKyB0ICogKGJbM10gLSBhdyk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbShvdXQsIHZlY3RvclNjYWxlKSB7XG4gIHZlY3RvclNjYWxlID0gdmVjdG9yU2NhbGUgfHwgMS4wO1xuXG4gIC8vIE1hcnNhZ2xpYSwgR2VvcmdlLiBDaG9vc2luZyBhIFBvaW50IGZyb20gdGhlIFN1cmZhY2Ugb2YgYVxuICAvLyBTcGhlcmUuIEFubi4gTWF0aC4gU3RhdGlzdC4gNDMgKDE5NzIpLCBuby4gMiwgNjQ1LS02NDYuXG4gIC8vIGh0dHA6Ly9wcm9qZWN0ZXVjbGlkLm9yZy9ldWNsaWQuYW9tcy8xMTc3NjkyNjQ0O1xuICB2YXIgdjEsIHYyLCB2MywgdjQ7XG4gIHZhciBzMSwgczI7XG4gIGRvIHtcbiAgICB2MSA9IGdsTWF0cml4LlJBTkRPTSgpICogMiAtIDE7XG4gICAgdjIgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIgLSAxO1xuICAgIHMxID0gdjEgKiB2MSArIHYyICogdjI7XG4gIH0gd2hpbGUgKHMxID49IDEpO1xuICBkbyB7XG4gICAgdjMgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIgLSAxO1xuICAgIHY0ID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICBzMiA9IHYzICogdjMgKyB2NCAqIHY0O1xuICB9IHdoaWxlIChzMiA+PSAxKTtcblxuICB2YXIgZCA9IE1hdGguc3FydCgoMSAtIHMxKSAvIHMyKTtcbiAgb3V0WzBdID0gc2NhbGUgKiB2MTtcbiAgb3V0WzFdID0gc2NhbGUgKiB2MjtcbiAgb3V0WzJdID0gc2NhbGUgKiB2MyAqIGQ7XG4gIG91dFszXSA9IHNjYWxlICogdjQgKiBkO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzQgd2l0aCBhIG1hdDQuXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl0sIHcgPSBhWzNdO1xuICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVs4XSAqIHogKyBtWzEyXSAqIHc7XG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdICogdztcbiAgb3V0WzJdID0gbVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdICogdztcbiAgb3V0WzNdID0gbVszXSAqIHggKyBtWzddICogeSArIG1bMTFdICogeiArIG1bMTVdICogdztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBxdWF0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQob3V0LCBhLCBxKSB7XG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuICBsZXQgcXggPSBxWzBdLCBxeSA9IHFbMV0sIHF6ID0gcVsyXSwgcXcgPSBxWzNdO1xuXG4gIC8vIGNhbGN1bGF0ZSBxdWF0ICogdmVjXG4gIGxldCBpeCA9IHF3ICogeCArIHF5ICogeiAtIHF6ICogeTtcbiAgbGV0IGl5ID0gcXcgKiB5ICsgcXogKiB4IC0gcXggKiB6O1xuICBsZXQgaXogPSBxdyAqIHogKyBxeCAqIHkgLSBxeSAqIHg7XG4gIGxldCBpdyA9IC1xeCAqIHggLSBxeSAqIHkgLSBxeiAqIHo7XG5cbiAgLy8gY2FsY3VsYXRlIHJlc3VsdCAqIGludmVyc2UgcXVhdFxuICBvdXRbMF0gPSBpeCAqIHF3ICsgaXcgKiAtcXggKyBpeSAqIC1xeiAtIGl6ICogLXF5O1xuICBvdXRbMV0gPSBpeSAqIHF3ICsgaXcgKiAtcXkgKyBpeiAqIC1xeCAtIGl4ICogLXF6O1xuICBvdXRbMl0gPSBpeiAqIHF3ICsgaXcgKiAtcXogKyBpeCAqIC1xeSAtIGl5ICogLXF4O1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAndmVjNCgnICsgYVswXSArICcsICcgKyBhWzFdICsgJywgJyArIGFbMl0gKyAnLCAnICsgYVszXSArICcpJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiYgYVszXSA9PT0gYlszXTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjNH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl0sIGEzID0gYVszXTtcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXTtcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMiksIE1hdGguYWJzKGIyKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMyAtIGIzKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTMpLCBNYXRoLmFicyhiMykpKTtcbn1cblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3VidHJhY3R9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHN1YiA9IHN1YnRyYWN0O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LmRpdmlkZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZGl2ID0gZGl2aWRlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZGlzdCA9IGRpc3RhbmNlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkRGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckRpc3QgPSBzcXVhcmVkRGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbGVuID0gbGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzcXJMZW4gPSBzcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWM0cy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWM0LiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjNHMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBmb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xuICBsZXQgdmVjID0gY3JlYXRlKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgIGxldCBpLCBsO1xuICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgIHN0cmlkZSA9IDQ7XG4gICAgfVxuXG4gICAgaWYoIW9mZnNldCkge1xuICAgICAgb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICBpZihjb3VudCkge1xuICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbCA9IGEubGVuZ3RoO1xuICAgIH1cblxuICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTsgdmVjWzJdID0gYVtpKzJdOyB2ZWNbM10gPSBhW2krM107XG4gICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTsgYVtpKzJdID0gdmVjWzJdOyBhW2krM10gPSB2ZWNbM107XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG4gIH07XG59KSgpO1xuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCJcbmltcG9ydCAqIGFzIG1hdDMgZnJvbSBcIi4vbWF0My5qc1wiXG5pbXBvcnQgKiBhcyB2ZWMzIGZyb20gXCIuL3ZlYzMuanNcIlxuaW1wb3J0ICogYXMgdmVjNCBmcm9tIFwiLi92ZWM0LmpzXCJcblxuLyoqXG4gKiBRdWF0ZXJuaW9uXG4gKiBAbW9kdWxlIHF1YXRcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgcXVhdFxuICpcbiAqIEByZXR1cm5zIHtxdWF0fSBhIG5ldyBxdWF0ZXJuaW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcbiAgb3V0WzBdID0gMDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgYSBxdWF0IHRvIHRoZSBpZGVudGl0eSBxdWF0ZXJuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgb3V0WzBdID0gMDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXRzIGEgcXVhdCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhbmQgcm90YXRpb24gYXhpcyxcbiAqIHRoZW4gcmV0dXJucyBpdC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyBhcm91bmQgd2hpY2ggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2V0QXhpc0FuZ2xlKG91dCwgYXhpcywgcmFkKSB7XG4gIHJhZCA9IHJhZCAqIDAuNTtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICBvdXRbMF0gPSBzICogYXhpc1swXTtcbiAgb3V0WzFdID0gcyAqIGF4aXNbMV07XG4gIG91dFsyXSA9IHMgKiBheGlzWzJdO1xuICBvdXRbM10gPSBNYXRoLmNvcyhyYWQpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdldHMgdGhlIHJvdGF0aW9uIGF4aXMgYW5kIGFuZ2xlIGZvciBhIGdpdmVuXG4gKiAgcXVhdGVybmlvbi4gSWYgYSBxdWF0ZXJuaW9uIGlzIGNyZWF0ZWQgd2l0aFxuICogIHNldEF4aXNBbmdsZSwgdGhpcyBtZXRob2Qgd2lsbCByZXR1cm4gdGhlIHNhbWVcbiAqICB2YWx1ZXMgYXMgcHJvdmlkaWVkIGluIHRoZSBvcmlnaW5hbCBwYXJhbWV0ZXIgbGlzdFxuICogIE9SIGZ1bmN0aW9uYWxseSBlcXVpdmFsZW50IHZhbHVlcy5cbiAqIEV4YW1wbGU6IFRoZSBxdWF0ZXJuaW9uIGZvcm1lZCBieSBheGlzIFswLCAwLCAxXSBhbmRcbiAqICBhbmdsZSAtOTAgaXMgdGhlIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gZm9ybWVkIGJ5XG4gKiAgWzAsIDAsIDFdIGFuZCAyNzAuIFRoaXMgbWV0aG9kIGZhdm9ycyB0aGUgbGF0dGVyLlxuICogQHBhcmFtICB7dmVjM30gb3V0X2F4aXMgIFZlY3RvciByZWNlaXZpbmcgdGhlIGF4aXMgb2Ygcm90YXRpb25cbiAqIEBwYXJhbSAge3F1YXR9IHEgICAgIFF1YXRlcm5pb24gdG8gYmUgZGVjb21wb3NlZFxuICogQHJldHVybiB7TnVtYmVyfSAgICAgQW5nbGUsIGluIHJhZGlhbnMsIG9mIHRoZSByb3RhdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZ2V0QXhpc0FuZ2xlKG91dF9heGlzLCBxKSB7XG4gIGxldCByYWQgPSBNYXRoLmFjb3MocVszXSkgKiAyLjA7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkIC8gMi4wKTtcbiAgaWYgKHMgIT0gMC4wKSB7XG4gICAgb3V0X2F4aXNbMF0gPSBxWzBdIC8gcztcbiAgICBvdXRfYXhpc1sxXSA9IHFbMV0gLyBzO1xuICAgIG91dF9heGlzWzJdID0gcVsyXSAvIHM7XG4gIH0gZWxzZSB7XG4gICAgLy8gSWYgcyBpcyB6ZXJvLCByZXR1cm4gYW55IGF4aXMgKG5vIHJvdGF0aW9uIC0gYXhpcyBkb2VzIG5vdCBtYXR0ZXIpXG4gICAgb3V0X2F4aXNbMF0gPSAxO1xuICAgIG91dF9heGlzWzFdID0gMDtcbiAgICBvdXRfYXhpc1syXSA9IDA7XG4gIH1cbiAgcmV0dXJuIHJhZDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM107XG4gIGxldCBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdLCBidyA9IGJbM107XG5cbiAgb3V0WzBdID0gYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieTtcbiAgb3V0WzFdID0gYXkgKiBidyArIGF3ICogYnkgKyBheiAqIGJ4IC0gYXggKiBiejtcbiAgb3V0WzJdID0gYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieDtcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF4ICogYnggLSBheSAqIGJ5IC0gYXogKiBiejtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gIHJhZCAqPSAwLjU7XG5cbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcbiAgbGV0IGJ4ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4O1xuICBvdXRbMV0gPSBheSAqIGJ3ICsgYXogKiBieDtcbiAgb3V0WzJdID0gYXogKiBidyAtIGF5ICogYng7XG4gIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCByYWQpIHtcbiAgcmFkICo9IDAuNTtcblxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xuICBsZXQgYnkgPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYXggKiBidyAtIGF6ICogYnk7XG4gIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5O1xuICBvdXRbMl0gPSBheiAqIGJ3ICsgYXggKiBieTtcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF5ICogYnk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIHJhZCkge1xuICByYWQgKj0gMC41O1xuXG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM107XG4gIGxldCBieiA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICBvdXRbMF0gPSBheCAqIGJ3ICsgYXkgKiBiejtcbiAgb3V0WzFdID0gYXkgKiBidyAtIGF4ICogYno7XG4gIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6O1xuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXogKiBiejtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBXIGNvbXBvbmVudCBvZiBhIHF1YXQgZnJvbSB0aGUgWCwgWSwgYW5kIFogY29tcG9uZW50cy5cbiAqIEFzc3VtZXMgdGhhdCBxdWF0ZXJuaW9uIGlzIDEgdW5pdCBpbiBsZW5ndGguXG4gKiBBbnkgZXhpc3RpbmcgVyBjb21wb25lbnQgd2lsbCBiZSBpZ25vcmVkLlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIFcgY29tcG9uZW50IG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjYWxjdWxhdGVXKG91dCwgYSkge1xuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcblxuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICBvdXRbMl0gPSB6O1xuICBvdXRbM10gPSBNYXRoLnNxcnQoTWF0aC5hYnMoMS4wIC0geCAqIHggLSB5ICogeSAtIHogKiB6KSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgLy8gYmVuY2htYXJrczpcbiAgLy8gICAgaHR0cDovL2pzcGVyZi5jb20vcXVhdGVybmlvbi1zbGVycC1pbXBsZW1lbnRhdGlvbnNcbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcbiAgbGV0IGJ4ID0gYlswXSwgYnkgPSBiWzFdLCBieiA9IGJbMl0sIGJ3ID0gYlszXTtcblxuICBsZXQgb21lZ2EsIGNvc29tLCBzaW5vbSwgc2NhbGUwLCBzY2FsZTE7XG5cbiAgLy8gY2FsYyBjb3NpbmVcbiAgY29zb20gPSBheCAqIGJ4ICsgYXkgKiBieSArIGF6ICogYnogKyBhdyAqIGJ3O1xuICAvLyBhZGp1c3Qgc2lnbnMgKGlmIG5lY2Vzc2FyeSlcbiAgaWYgKCBjb3NvbSA8IDAuMCApIHtcbiAgICBjb3NvbSA9IC1jb3NvbTtcbiAgICBieCA9IC0gYng7XG4gICAgYnkgPSAtIGJ5O1xuICAgIGJ6ID0gLSBiejtcbiAgICBidyA9IC0gYnc7XG4gIH1cbiAgLy8gY2FsY3VsYXRlIGNvZWZmaWNpZW50c1xuICBpZiAoICgxLjAgLSBjb3NvbSkgPiAwLjAwMDAwMSApIHtcbiAgICAvLyBzdGFuZGFyZCBjYXNlIChzbGVycClcbiAgICBvbWVnYSAgPSBNYXRoLmFjb3MoY29zb20pO1xuICAgIHNpbm9tICA9IE1hdGguc2luKG9tZWdhKTtcbiAgICBzY2FsZTAgPSBNYXRoLnNpbigoMS4wIC0gdCkgKiBvbWVnYSkgLyBzaW5vbTtcbiAgICBzY2FsZTEgPSBNYXRoLnNpbih0ICogb21lZ2EpIC8gc2lub207XG4gIH0gZWxzZSB7XG4gICAgLy8gXCJmcm9tXCIgYW5kIFwidG9cIiBxdWF0ZXJuaW9ucyBhcmUgdmVyeSBjbG9zZVxuICAgIC8vICAuLi4gc28gd2UgY2FuIGRvIGEgbGluZWFyIGludGVycG9sYXRpb25cbiAgICBzY2FsZTAgPSAxLjAgLSB0O1xuICAgIHNjYWxlMSA9IHQ7XG4gIH1cbiAgLy8gY2FsY3VsYXRlIGZpbmFsIHZhbHVlc1xuICBvdXRbMF0gPSBzY2FsZTAgKiBheCArIHNjYWxlMSAqIGJ4O1xuICBvdXRbMV0gPSBzY2FsZTAgKiBheSArIHNjYWxlMSAqIGJ5O1xuICBvdXRbMl0gPSBzY2FsZTAgKiBheiArIHNjYWxlMSAqIGJ6O1xuICBvdXRbM10gPSBzY2FsZTAgKiBhdyArIHNjYWxlMSAqIGJ3O1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgaW52ZXJzZSBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBpbnZlcnNlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM107XG4gIGxldCBkb3QgPSBhMCphMCArIGExKmExICsgYTIqYTIgKyBhMyphMztcbiAgbGV0IGludkRvdCA9IGRvdCA/IDEuMC9kb3QgOiAwO1xuXG4gIC8vIFRPRE86IFdvdWxkIGJlIGZhc3RlciB0byByZXR1cm4gWzAsMCwwLDBdIGltbWVkaWF0ZWx5IGlmIGRvdCA9PSAwXG5cbiAgb3V0WzBdID0gLWEwKmludkRvdDtcbiAgb3V0WzFdID0gLWExKmludkRvdDtcbiAgb3V0WzJdID0gLWEyKmludkRvdDtcbiAgb3V0WzNdID0gYTMqaW52RG90O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGNvbmp1Z2F0ZSBvZiBhIHF1YXRcbiAqIElmIHRoZSBxdWF0ZXJuaW9uIGlzIG5vcm1hbGl6ZWQsIHRoaXMgZnVuY3Rpb24gaXMgZmFzdGVyIHRoYW4gcXVhdC5pbnZlcnNlIGFuZCBwcm9kdWNlcyB0aGUgc2FtZSByZXN1bHQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgY29uanVnYXRlIG9mXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb25qdWdhdGUob3V0LCBhKSB7XG4gIG91dFswXSA9IC1hWzBdO1xuICBvdXRbMV0gPSAtYVsxXTtcbiAgb3V0WzJdID0gLWFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gM3gzIHJvdGF0aW9uIG1hdHJpeC5cbiAqXG4gKiBOT1RFOiBUaGUgcmVzdWx0YW50IHF1YXRlcm5pb24gaXMgbm90IG5vcm1hbGl6ZWQsIHNvIHlvdSBzaG91bGQgYmUgc3VyZVxuICogdG8gcmVub3JtYWxpemUgdGhlIHF1YXRlcm5pb24geW91cnNlbGYgd2hlcmUgbmVjZXNzYXJ5LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHttYXQzfSBtIHJvdGF0aW9uIG1hdHJpeFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0MyhvdXQsIG0pIHtcbiAgLy8gQWxnb3JpdGhtIGluIEtlbiBTaG9lbWFrZSdzIGFydGljbGUgaW4gMTk4NyBTSUdHUkFQSCBjb3Vyc2Ugbm90ZXNcbiAgLy8gYXJ0aWNsZSBcIlF1YXRlcm5pb24gQ2FsY3VsdXMgYW5kIEZhc3QgQW5pbWF0aW9uXCIuXG4gIGxldCBmVHJhY2UgPSBtWzBdICsgbVs0XSArIG1bOF07XG4gIGxldCBmUm9vdDtcblxuICBpZiAoIGZUcmFjZSA+IDAuMCApIHtcbiAgICAvLyB8d3wgPiAxLzIsIG1heSBhcyB3ZWxsIGNob29zZSB3ID4gMS8yXG4gICAgZlJvb3QgPSBNYXRoLnNxcnQoZlRyYWNlICsgMS4wKTsgIC8vIDJ3XG4gICAgb3V0WzNdID0gMC41ICogZlJvb3Q7XG4gICAgZlJvb3QgPSAwLjUvZlJvb3Q7ICAvLyAxLyg0dylcbiAgICBvdXRbMF0gPSAobVs1XS1tWzddKSpmUm9vdDtcbiAgICBvdXRbMV0gPSAobVs2XS1tWzJdKSpmUm9vdDtcbiAgICBvdXRbMl0gPSAobVsxXS1tWzNdKSpmUm9vdDtcbiAgfSBlbHNlIHtcbiAgICAvLyB8d3wgPD0gMS8yXG4gICAgbGV0IGkgPSAwO1xuICAgIGlmICggbVs0XSA+IG1bMF0gKVxuICAgICAgaSA9IDE7XG4gICAgaWYgKCBtWzhdID4gbVtpKjMraV0gKVxuICAgICAgaSA9IDI7XG4gICAgbGV0IGogPSAoaSsxKSUzO1xuICAgIGxldCBrID0gKGkrMiklMztcblxuICAgIGZSb290ID0gTWF0aC5zcXJ0KG1baSozK2ldLW1baiozK2pdLW1bayozK2tdICsgMS4wKTtcbiAgICBvdXRbaV0gPSAwLjUgKiBmUm9vdDtcbiAgICBmUm9vdCA9IDAuNSAvIGZSb290O1xuICAgIG91dFszXSA9IChtW2oqMytrXSAtIG1bayozK2pdKSAqIGZSb290O1xuICAgIG91dFtqXSA9IChtW2oqMytpXSArIG1baSozK2pdKSAqIGZSb290O1xuICAgIG91dFtrXSA9IChtW2sqMytpXSArIG1baSozK2tdKSAqIGZSb290O1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgcXVhdGVybmlvbiBmcm9tIHRoZSBnaXZlbiBldWxlciBhbmdsZSB4LCB5LCB6LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHt4fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFggYXhpcyBpbiBkZWdyZWVzLlxuICogQHBhcmFtIHt5fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFkgYXhpcyBpbiBkZWdyZWVzLlxuICogQHBhcmFtIHt6fSBBbmdsZSB0byByb3RhdGUgYXJvdW5kIFogYXhpcyBpbiBkZWdyZWVzLlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tRXVsZXIob3V0LCB4LCB5LCB6KSB7XG4gICAgbGV0IGhhbGZUb1JhZCA9IDAuNSAqIE1hdGguUEkgLyAxODAuMDtcbiAgICB4ICo9IGhhbGZUb1JhZDtcbiAgICB5ICo9IGhhbGZUb1JhZDtcbiAgICB6ICo9IGhhbGZUb1JhZDtcblxuICAgIGxldCBzeCA9IE1hdGguc2luKHgpO1xuICAgIGxldCBjeCA9IE1hdGguY29zKHgpO1xuICAgIGxldCBzeSA9IE1hdGguc2luKHkpO1xuICAgIGxldCBjeSA9IE1hdGguY29zKHkpO1xuICAgIGxldCBzeiA9IE1hdGguc2luKHopO1xuICAgIGxldCBjeiA9IE1hdGguY29zKHopO1xuXG4gICAgb3V0WzBdID0gc3ggKiBjeSAqIGN6IC0gY3ggKiBzeSAqIHN6O1xuICAgIG91dFsxXSA9IGN4ICogc3kgKiBjeiArIHN4ICogY3kgKiBzejtcbiAgICBvdXRbMl0gPSBjeCAqIGN5ICogc3ogLSBzeCAqIHN5ICogY3o7XG4gICAgb3V0WzNdID0gY3ggKiBjeSAqIGN6ICsgc3ggKiBzeSAqIHN6O1xuXG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgcXVhdGVuaW9uXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gJ3F1YXQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBjbG9uZSA9IHZlYzQuY2xvbmU7XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBxdWF0IGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBmcm9tVmFsdWVzID0gdmVjNC5mcm9tVmFsdWVzO1xuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBxdWF0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgc291cmNlIHF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgY29weSA9IHZlYzQuY29weTtcblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSBxdWF0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB3IFcgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNldCA9IHZlYzQuc2V0O1xuXG4vKipcbiAqIEFkZHMgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGFkZCA9IHZlYzQuYWRkO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XG5cbi8qKlxuICogU2NhbGVzIGEgcXVhdCBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNjYWxlID0gdmVjNC5zY2FsZTtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRvdCA9IHZlYzQuZG90O1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbGVycCA9IHZlYzQubGVycDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgY29uc3QgbGVuZ3RoID0gdmVjNC5sZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0Lmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbGVuID0gbGVuZ3RoO1xuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxdWFyZWRMZW5ndGggPSB2ZWM0LnNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBxdWF0LnNxdWFyZWRMZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IHNxckxlbiA9IHNxdWFyZWRMZW5ndGg7XG5cbi8qKlxuICogTm9ybWFsaXplIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXRlcm5pb24gdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG5vcm1hbGl6ZSA9IHZlYzQubm9ybWFsaXplO1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHF1YXRlcm5pb25zIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgVGhlIGZpcnN0IHF1YXRlcm5pb24uXG4gKiBAcGFyYW0ge3F1YXR9IGIgVGhlIHNlY29uZCBxdWF0ZXJuaW9uLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBjb25zdCBleGFjdEVxdWFscyA9IHZlYzQuZXhhY3RFcXVhbHM7XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgcXVhdGVybmlvbnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHtxdWF0fSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBjb25zdCBlcXVhbHMgPSB2ZWM0LmVxdWFscztcblxuLyoqXG4gKiBTZXRzIGEgcXVhdGVybmlvbiB0byByZXByZXNlbnQgdGhlIHNob3J0ZXN0IHJvdGF0aW9uIGZyb20gb25lXG4gKiB2ZWN0b3IgdG8gYW5vdGhlci5cbiAqXG4gKiBCb3RoIHZlY3RvcnMgYXJlIGFzc3VtZWQgdG8gYmUgdW5pdCBsZW5ndGguXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uLlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBpbml0aWFsIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBkZXN0aW5hdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGNvbnN0IHJvdGF0aW9uVG8gPSAoZnVuY3Rpb24oKSB7XG4gIGxldCB0bXB2ZWMzID0gdmVjMy5jcmVhdGUoKTtcbiAgbGV0IHhVbml0VmVjMyA9IHZlYzMuZnJvbVZhbHVlcygxLDAsMCk7XG4gIGxldCB5VW5pdFZlYzMgPSB2ZWMzLmZyb21WYWx1ZXMoMCwxLDApO1xuXG4gIHJldHVybiBmdW5jdGlvbihvdXQsIGEsIGIpIHtcbiAgICBsZXQgZG90ID0gdmVjMy5kb3QoYSwgYik7XG4gICAgaWYgKGRvdCA8IC0wLjk5OTk5OSkge1xuICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCB4VW5pdFZlYzMsIGEpO1xuICAgICAgaWYgKHZlYzMubGVuKHRtcHZlYzMpIDwgMC4wMDAwMDEpXG4gICAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgeVVuaXRWZWMzLCBhKTtcbiAgICAgIHZlYzMubm9ybWFsaXplKHRtcHZlYzMsIHRtcHZlYzMpO1xuICAgICAgc2V0QXhpc0FuZ2xlKG91dCwgdG1wdmVjMywgTWF0aC5QSSk7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0gZWxzZSBpZiAoZG90ID4gMC45OTk5OTkpIHtcbiAgICAgIG91dFswXSA9IDA7XG4gICAgICBvdXRbMV0gPSAwO1xuICAgICAgb3V0WzJdID0gMDtcbiAgICAgIG91dFszXSA9IDE7XG4gICAgICByZXR1cm4gb3V0O1xuICAgIH0gZWxzZSB7XG4gICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIGEsIGIpO1xuICAgICAgb3V0WzBdID0gdG1wdmVjM1swXTtcbiAgICAgIG91dFsxXSA9IHRtcHZlYzNbMV07XG4gICAgICBvdXRbMl0gPSB0bXB2ZWMzWzJdO1xuICAgICAgb3V0WzNdID0gMSArIGRvdDtcbiAgICAgIHJldHVybiBub3JtYWxpemUob3V0LCBvdXQpO1xuICAgIH1cbiAgfTtcbn0pKCk7XG5cbi8qKlxuICogUGVyZm9ybXMgYSBzcGhlcmljYWwgbGluZWFyIGludGVycG9sYXRpb24gd2l0aCB0d28gY29udHJvbCBwb2ludHNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBjIHRoZSB0aGlyZCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBjb25zdCBzcWxlcnAgPSAoZnVuY3Rpb24gKCkge1xuICBsZXQgdGVtcDEgPSBjcmVhdGUoKTtcbiAgbGV0IHRlbXAyID0gY3JlYXRlKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uIChvdXQsIGEsIGIsIGMsIGQsIHQpIHtcbiAgICBzbGVycCh0ZW1wMSwgYSwgZCwgdCk7XG4gICAgc2xlcnAodGVtcDIsIGIsIGMsIHQpO1xuICAgIHNsZXJwKG91dCwgdGVtcDEsIHRlbXAyLCAyICogdCAqICgxIC0gdCkpO1xuXG4gICAgcmV0dXJuIG91dDtcbiAgfTtcbn0oKSk7XG5cbi8qKlxuICogU2V0cyB0aGUgc3BlY2lmaWVkIHF1YXRlcm5pb24gd2l0aCB2YWx1ZXMgY29ycmVzcG9uZGluZyB0byB0aGUgZ2l2ZW5cbiAqIGF4ZXMuIEVhY2ggYXhpcyBpcyBhIHZlYzMgYW5kIGlzIGV4cGVjdGVkIHRvIGJlIHVuaXQgbGVuZ3RoIGFuZFxuICogcGVycGVuZGljdWxhciB0byBhbGwgb3RoZXIgc3BlY2lmaWVkIGF4ZXMuXG4gKlxuICogQHBhcmFtIHt2ZWMzfSB2aWV3ICB0aGUgdmVjdG9yIHJlcHJlc2VudGluZyB0aGUgdmlld2luZyBkaXJlY3Rpb25cbiAqIEBwYXJhbSB7dmVjM30gcmlnaHQgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwicmlnaHRcIiBkaXJlY3Rpb25cbiAqIEBwYXJhbSB7dmVjM30gdXAgICAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIGxvY2FsIFwidXBcIiBkaXJlY3Rpb25cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGNvbnN0IHNldEF4ZXMgPSAoZnVuY3Rpb24oKSB7XG4gIGxldCBtYXRyID0gbWF0My5jcmVhdGUoKTtcblxuICByZXR1cm4gZnVuY3Rpb24ob3V0LCB2aWV3LCByaWdodCwgdXApIHtcbiAgICBtYXRyWzBdID0gcmlnaHRbMF07XG4gICAgbWF0clszXSA9IHJpZ2h0WzFdO1xuICAgIG1hdHJbNl0gPSByaWdodFsyXTtcblxuICAgIG1hdHJbMV0gPSB1cFswXTtcbiAgICBtYXRyWzRdID0gdXBbMV07XG4gICAgbWF0cls3XSA9IHVwWzJdO1xuXG4gICAgbWF0clsyXSA9IC12aWV3WzBdO1xuICAgIG1hdHJbNV0gPSAtdmlld1sxXTtcbiAgICBtYXRyWzhdID0gLXZpZXdbMl07XG5cbiAgICByZXR1cm4gbm9ybWFsaXplKG91dCwgZnJvbU1hdDMob3V0LCBtYXRyKSk7XG4gIH07XG59KSgpO1xuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbi8qKlxuICogMiBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBtb2R1bGUgdmVjMlxuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjMlxuICpcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDIpO1xuICBvdXRbMF0gPSAwO1xuICBvdXRbMV0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDIpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMiBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBhIG5ldyAyRCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21WYWx1ZXMoeCwgeSkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMik7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIHZlYzIgdG8gYW5vdGhlclxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHNvdXJjZSB2ZWN0b3JcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMiB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSB4IFggY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2V0KG91dCwgeCwgeSkge1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIERpdmlkZXMgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjZWlsXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGZsb29yXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtaW4ob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWluKGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1pbihhWzFdLCBiWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIHJvdW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3VuZCAob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XG4gIG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMiBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGI7XG4gIG91dFsxXSA9IGFbMV0gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzIncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICB5ID0gYlsxXSAtIGFbMV07XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdLFxuICAgIHkgPSBiWzFdIC0gYVsxXTtcbiAgcmV0dXJuIHgqeCArIHkqeTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdO1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGggKGEpIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdO1xuICByZXR1cm4geCp4ICsgeSp5O1xufVxuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XG4gIG91dFswXSA9IC1hWzBdO1xuICBvdXRbMV0gPSAtYVsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGludmVydFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICB5ID0gYVsxXTtcbiAgdmFyIGxlbiA9IHgqeCArIHkqeTtcbiAgaWYgKGxlbiA+IDApIHtcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgICBvdXRbMF0gPSBhWzBdICogbGVuO1xuICAgIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkb3QgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkb3QoYSwgYikge1xuICByZXR1cm4gYVswXSAqIGJbMF0gKyBhWzFdICogYlsxXTtcbn1cblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMidzXG4gKiBOb3RlIHRoYXQgdGhlIGNyb3NzIHByb2R1Y3QgbXVzdCBieSBkZWZpbml0aW9uIHByb2R1Y2UgYSAzRCB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcbiAgdmFyIHogPSBhWzBdICogYlsxXSAtIGFbMV0gKiBiWzBdO1xuICBvdXRbMF0gPSBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSB6O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgdmFyIGF4ID0gYVswXSxcbiAgICBheSA9IGFbMV07XG4gIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSByYW5kb20gdmVjdG9yIHdpdGggdGhlIGdpdmVuIHNjYWxlXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7TnVtYmVyfSBbc2NhbGVdIExlbmd0aCBvZiB0aGUgcmVzdWx0aW5nIHZlY3Rvci4gSWYgb21taXR0ZWQsIGEgdW5pdCB2ZWN0b3Igd2lsbCBiZSByZXR1cm5lZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcmFuZG9tKG91dCwgc2NhbGUpIHtcbiAgc2NhbGUgPSBzY2FsZSB8fCAxLjA7XG4gIHZhciByID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJO1xuICBvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHNjYWxlO1xuICBvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHNjYWxlO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJ9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQyKG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHk7XG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0MmRcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDJkfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MmQob3V0LCBhLCBtKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICB5ID0gYVsxXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzJdICogeSArIG1bNF07XG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVszXSAqIHkgKyBtWzVdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDNcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQzfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MyhvdXQsIGEsIG0pIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdO1xuICBvdXRbMF0gPSBtWzBdICogeCArIG1bM10gKiB5ICsgbVs2XTtcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzRdICogeSArIG1bN107XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMiB3aXRoIGEgbWF0NFxuICogM3JkIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMCdcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQ0fSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0NChvdXQsIGEsIG0pIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzEyXTtcbiAgb3V0WzFdID0gbVsxXSAqIHggKyBtWzVdICogeSArIG1bMTNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZSBhIDJEIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMyXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIHZlYzIgcG9pbnQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgYiwgYykge1xuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG4gIGxldCBwMCA9IGFbMF0gLSBiWzBdLFxuICBwMSA9IGFbMV0gLSBiWzFdLFxuICBzaW5DID0gTWF0aC5zaW4oYyksXG4gIGNvc0MgPSBNYXRoLmNvcyhjKTtcbiAgXG4gIC8vcGVyZm9ybSByb3RhdGlvbiBhbmQgdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cbiAgb3V0WzBdID0gcDAqY29zQyAtIHAxKnNpbkMgKyBiWzBdO1xuICBvdXRbMV0gPSBwMCpzaW5DICsgcDEqY29zQyArIGJbMV07XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZXQgdGhlIGFuZ2xlIGJldHdlZW4gdHdvIDJEIHZlY3RvcnNcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gVGhlIGFuZ2xlIGluIHJhZGlhbnNcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFuZ2xlKGEsIGIpIHtcbiAgbGV0IHgxID0gYVswXSxcbiAgICB5MSA9IGFbMV0sXG4gICAgeDIgPSBiWzBdLFxuICAgIHkyID0gYlsxXTtcbiAgXG4gIGxldCBsZW4xID0geDEqeDEgKyB5MSp5MTtcbiAgaWYgKGxlbjEgPiAwKSB7XG4gICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICBsZW4xID0gMSAvIE1hdGguc3FydChsZW4xKTtcbiAgfVxuICBcbiAgbGV0IGxlbjIgPSB4Mip4MiArIHkyKnkyO1xuICBpZiAobGVuMiA+IDApIHtcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgIGxlbjIgPSAxIC8gTWF0aC5zcXJ0KGxlbjIpO1xuICB9XG4gIFxuICBsZXQgY29zaW5lID0gKHgxICogeDIgKyB5MSAqIHkyKSAqIGxlbjEgKiBsZW4yO1xuICBcbiAgXG4gIGlmKGNvc2luZSA+IDEuMCkge1xuICAgIHJldHVybiAwO1xuICB9XG4gIGVsc2UgaWYoY29zaW5lIDwgLTEuMCkge1xuICAgIHJldHVybiBNYXRoLlBJO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBNYXRoLmFjb3MoY29zaW5lKTtcbiAgfVxufVxuXG4vKipcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIHJlcHJlc2VudCBhcyBhIHN0cmluZ1xuICogQHJldHVybnMge1N0cmluZ30gc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIHRoZSB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN0cihhKSB7XG4gIHJldHVybiAndmVjMignICsgYVswXSArICcsICcgKyBhWzFdICsgJyknO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgZXhhY3RseSBoYXZlIHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV07XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXTtcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdO1xuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpKTtcbn1cblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBsZW4gPSBsZW5ndGg7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzdWIgPSBzdWJ0cmFjdDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5kaXZpZGV9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRpdiA9IGRpdmlkZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRpc3QgPSBkaXN0YW5jZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzcXJEaXN0ID0gc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzcXJMZW4gPSBzcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIFBlcmZvcm0gc29tZSBvcGVyYXRpb24gb3ZlciBhbiBhcnJheSBvZiB2ZWMycy5cbiAqXG4gKiBAcGFyYW0ge0FycmF5fSBhIHRoZSBhcnJheSBvZiB2ZWN0b3JzIHRvIGl0ZXJhdGUgb3ZlclxuICogQHBhcmFtIHtOdW1iZXJ9IHN0cmlkZSBOdW1iZXIgb2YgZWxlbWVudHMgYmV0d2VlbiB0aGUgc3RhcnQgb2YgZWFjaCB2ZWMyLiBJZiAwIGFzc3VtZXMgdGlnaHRseSBwYWNrZWRcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7TnVtYmVyfSBjb3VudCBOdW1iZXIgb2YgdmVjMnMgdG8gaXRlcmF0ZSBvdmVyLiBJZiAwIGl0ZXJhdGVzIG92ZXIgZW50aXJlIGFycmF5XG4gKiBAcGFyYW0ge0Z1bmN0aW9ufSBmbiBGdW5jdGlvbiB0byBjYWxsIGZvciBlYWNoIHZlY3RvciBpbiB0aGUgYXJyYXlcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cbiAqIEByZXR1cm5zIHtBcnJheX0gYVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBmb3JFYWNoID0gKGZ1bmN0aW9uKCkge1xuICBsZXQgdmVjID0gY3JlYXRlKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKGEsIHN0cmlkZSwgb2Zmc2V0LCBjb3VudCwgZm4sIGFyZykge1xuICAgIGxldCBpLCBsO1xuICAgIGlmKCFzdHJpZGUpIHtcbiAgICAgIHN0cmlkZSA9IDI7XG4gICAgfVxuXG4gICAgaWYoIW9mZnNldCkge1xuICAgICAgb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICBpZihjb3VudCkge1xuICAgICAgbCA9IE1hdGgubWluKChjb3VudCAqIHN0cmlkZSkgKyBvZmZzZXQsIGEubGVuZ3RoKTtcbiAgICB9IGVsc2Uge1xuICAgICAgbCA9IGEubGVuZ3RoO1xuICAgIH1cblxuICAgIGZvcihpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgIHZlY1swXSA9IGFbaV07IHZlY1sxXSA9IGFbaSsxXTtcbiAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xuICB9O1xufSkoKTtcbiIsIi8vIGlkJ3NcbmV4cG9ydCBjb25zdCBTUEhFUkVfQ09MTElERVIgPSAnc3BoZXJlLWNvbGxpZGVyJztcbmV4cG9ydCBjb25zdCBBQUJCX0NPTExJREVSID0gJ2FhYmItY29sbGlkZXInO1xuZXhwb3J0IGNvbnN0IFBMQU5FX0NPTExJREVSID0gJ3BsYW5lLWNvbGxpZGVyJztcbmV4cG9ydCBjb25zdCBSSUdJRF9CT0RZID0gJ3JpZ2lkLWJvZHknO1xuZXhwb3J0IGNvbnN0IEZPUkNFID0gJ2ZvcmNlJztcblxuLy8gZGVmYXVsdCB2YWx1ZXNcbmV4cG9ydCBjb25zdCBERUZBVUxUX1RJTUVTVEVQID0gMSAvIDE4MDtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IHsgU1BIRVJFX0NPTExJREVSLCBBQUJCX0NPTExJREVSIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY29uc3QgdGVtcERpcmVjdGlvbiA9IHZlYzMuY3JlYXRlKCk7XG5cbmV4cG9ydCBjb25zdCBoYW5kbGVDb250YWN0ID0gKGEsIGIsIGRlcHRoLCBkaXJlY3Rpb24pID0+IHtcbiAgICBjb25zdCBtdCA9IGEuZ2V0SW52ZXJzZW1hc3MoKSArIGIuZ2V0SW52ZXJzZW1hc3MoKTtcbiAgICBjb25zdCBmMSA9IGEuZ2V0SW52ZXJzZW1hc3MoKSAvIG10O1xuICAgIGNvbnN0IGYyID0gYi5nZXRJbnZlcnNlbWFzcygpIC8gbXQ7XG5cbiAgICBjb25zdCBvZmYxID0gZGVwdGggKiBmMTtcbiAgICBjb25zdCBvZmYyID0gZGVwdGggKiBmMjtcblxuICAgIGEudmVsb2NpdHlbMF0gKz0gZGlyZWN0aW9uWzBdICogb2ZmMTtcbiAgICBhLnZlbG9jaXR5WzFdICs9IGRpcmVjdGlvblsxXSAqIG9mZjE7XG4gICAgYS52ZWxvY2l0eVsyXSArPSBkaXJlY3Rpb25bMl0gKiBvZmYxO1xuXG4gICAgYi52ZWxvY2l0eVswXSAtPSBkaXJlY3Rpb25bMF0gKiBvZmYyO1xuICAgIGIudmVsb2NpdHlbMV0gLT0gZGlyZWN0aW9uWzFdICogb2ZmMjtcbiAgICBiLnZlbG9jaXR5WzJdIC09IGRpcmVjdGlvblsyXSAqIG9mZjI7XG5cbiAgICAvLyByZXN0aXR1dGVcbn07XG5cbmV4cG9ydCBjb25zdCBzcGhlcmVJbnRlcnNlY3RTcGhlcmUgPSAoYSwgYikgPT4ge1xuICAgIGNvbnN0IHIgPSAoYS5jb2xsaWRlci5yYWRpdXMgKiAyKSArIChiLmNvbGxpZGVyLnJhZGl1cyAqIDIpO1xuICAgIGNvbnN0IHRhcmdldCA9IHIgKiByO1xuICAgIGNvbnN0IGxlbmd0aCA9IHZlYzMuc3F1YXJlZERpc3RhbmNlKGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xuXG4gICAgaWYgKGxlbmd0aCA8IHRhcmdldCkge1xuICAgICAgICB2ZWMzLnN1YnRyYWN0KHRlbXBEaXJlY3Rpb24sIGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xuICAgICAgICB2ZWMzLm5vcm1hbGl6ZSh0ZW1wRGlyZWN0aW9uLCB0ZW1wRGlyZWN0aW9uKTtcblxuICAgICAgICBoYW5kbGVDb250YWN0KGEsIGIsIHRhcmdldCAtIGxlbmd0aCwgdGVtcERpcmVjdGlvbik7XG4gICAgfVxufTtcblxuZXhwb3J0IGNvbnN0IGNsYW1wID0gKG1pbiwgbWF4LCB2YWx1ZSkgPT4ge1xuICAgIHJldHVybiB2YWx1ZSA8IG1pbiA/IG1pbiA6ICh2YWx1ZSA+IG1heCA/IG1heCA6IHZhbHVlKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxufTtcblxuZXhwb3J0IGNvbnN0IEFBQkJJbnRlcnNlY3RBQUJCID0gKGEsIGIpID0+IHtcbiAgICAvLyBUT0RPOiBpcyB0aGlzIHRoZSBmYXN0ZXN0IHRoaW5nIEkgY2FuIGRvP1xuICAgIGNvbnN0IGFtaW4gPSB2ZWMzLmZyb21WYWx1ZXMoYS5jb2xsaWRlci5sZWZ0LCBhLmNvbGxpZGVyLmJvdHRvbSwgYS5jb2xsaWRlci5iYWNrKTtcbiAgICBjb25zdCBhbWF4ID0gdmVjMy5mcm9tVmFsdWVzKGEuY29sbGlkZXIucmlnaHQsIGEuY29sbGlkZXIudG9wLCBhLmNvbGxpZGVyLmZyb250KTtcblxuICAgIGNvbnN0IGJtaW4gPSB2ZWMzLmZyb21WYWx1ZXMoYi5jb2xsaWRlci5sZWZ0LCBiLmNvbGxpZGVyLmJvdHRvbSwgYi5jb2xsaWRlci5iYWNrKTtcbiAgICBjb25zdCBibWF4ID0gdmVjMy5mcm9tVmFsdWVzKGIuY29sbGlkZXIucmlnaHQsIGIuY29sbGlkZXIudG9wLCBiLmNvbGxpZGVyLmZyb250KTtcblxuICAgIGlmIChhbWF4WzBdID4gYm1pblswXSAmJlxuICAgICAgICBhbWluWzBdIDwgYm1heFswXSAmJlxuICAgICAgICBhbWF4WzFdID4gYm1pblsxXSAmJlxuICAgICAgICBhbWluWzFdIDwgYm1heFsxXSAmJlxuICAgICAgICBhbWF4WzJdID4gYm1pblsyXSAmJlxuICAgICAgICBhbWluWzJdIDwgYm1heFsyXSkge1xuICAgICAgICAvLyB3aGVuIGNvbGxpZGluZyBjaGVjayBob3cgbXVjaFxuICAgICAgICB2ZWMzLnN1YnRyYWN0KHRlbXBEaXJlY3Rpb24sIGEucG9zaXRpb24sIGIucG9zaXRpb24pO1xuICAgICAgICB2ZWMzLm5vcm1hbGl6ZSh0ZW1wRGlyZWN0aW9uLCB0ZW1wRGlyZWN0aW9uKTtcblxuICAgICAgICAvLyBUT0RPOiBXUk9ORyFcbiAgICAgICAgLy8gY29uc3QgeDEgPSBibWF4WzBdIC0gYW1pblswXTtcbiAgICAgICAgLy8gY29uc3QgeDIgPSBhbWluWzBdIC0gYm1heFswXTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY29uc3QgeTEgPSBibWF4WzFdIC0gYW1pblsxXTtcbiAgICAgICAgLy8gY29uc3QgeTIgPSBhbWluWzFdIC0gYm1heFsxXTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY29uc3QgejEgPSBibWF4WzJdIC0gYW1pblsyXTtcbiAgICAgICAgLy8gY29uc3QgejIgPSBhbWluWzJdIC0gYm1heFsyXTtcbiAgICAgICAgLy9cbiAgICAgICAgLy8gY29uc3QgeCA9IE1hdGgubWF4KHgxLCB4Mik7XG4gICAgICAgIC8vIGNvbnN0IHkgPSBNYXRoLm1heCh5MSwgeTIpO1xuICAgICAgICAvLyBjb25zdCB6ID0gTWF0aC5tYXgoejEsIHoyKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coYW1pbiwgYW1heCwgYm1pbiwgYm1heCk7XG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHgxLCB4MiwgeCk7XG5cbiAgICAgICAgLy8gY29uc3QgYWEgPSB4ICogeSAqIHo7XG4gICAgICAgIC8vIGNvbnN0IGJiID0geCArIHkgKyB6O1xuICAgICAgICAvLyAvLyBjb25zdCBsZW5ndGggPSB2ZWMzLnNxdWFyZWREaXN0YW5jZShhLnBvc2l0aW9uLCBiLnBvc2l0aW9uKTtcbiAgICAgICAgLy8gY29uc29sZS5sb2coeCwgeSwgeiwgYWEsIGJiKTtcbiAgICAgICAgLy8gLy8gZGVidWdnZXI7XG5cbiAgICAgICAgLy8gaGFuZGxlQ29udGFjdChhLCBiLCB0YXJnZXQgLSBsZW5ndGgsIHRlbXBEaXJlY3Rpb24pO1xuICAgIH1cbn07XG5cbmV4cG9ydCBjb25zdCBjaGVja0NvbnRhY3RzID0gKGEsIGIpID0+IHtcbiAgICAvLyBzd2l0Y2ggKGEuY29sbGlkZXIudHlwZSkge1xuICAgIC8vIGNhc2UgQUFCQl9DT0xMSURFUjpcbiAgICAvLyAgICAgLy8gc3VyZWx5IHRoZXJlJ3MgYSBiZXR0ZXIgd2F5XG4gICAgLy8gICAgIGlmIChiLmNvbGxpZGVyLnR5cGUgPT09IFNQSEVSRV9DT0xMSURFUikge1xuICAgIC8vICAgICAgICAgc3BoZXJlSW50ZXJzZWN0U3BoZXJlKGEsIGIpO1xuICAgIC8vICAgICB9IGVsc2UgaWYgKGIuY29sbGlkZXIudHlwZSA9PT0gQUFCQl9DT0xMSURFUikge1xuICAgIC8vICAgICAgICAgQUFCQkludGVyc2VjdEFBQkIoYSwgYik7XG4gICAgLy8gICAgIH1cbiAgICAvLyAgICAgYnJlYWs7XG4gICAgLy8gZGVmYXVsdDpcbiAgICAvLyB9XG4gICAgQUFCQkludGVyc2VjdEFBQkIoYSwgYik7XG59O1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgeyBSSUdJRF9CT0RZLCBGT1JDRSwgREVGQVVMVF9USU1FU1RFUCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5pbXBvcnQgeyBjaGVja0NvbnRhY3RzIH0gZnJvbSAnLi9jb250YWN0cyc7XG5cbmxldCB0aW1lID0gMDtcbmxldCB0aW1lc3RlcCA9IDA7XG5cbmxldCBjdXJyZW50dGltZSA9IDA7XG5sZXQgYWNjdW11bGF0b3IgPSAwO1xubGV0IG5ld3RpbWUgPSAwO1xubGV0IGZyYW1ldGltZSA9IDA7XG5cbmNsYXNzIFdvcmxkIHtcbiAgICBjb25zdHJ1Y3RvcihwYXJhbXMgPSB7fSkge1xuICAgICAgICB0aW1lc3RlcCA9IHBhcmFtcy50aW1lc3RlcCB8fCBERUZBVUxUX1RJTUVTVEVQO1xuICAgICAgICBjdXJyZW50dGltZSA9IHBhcmFtcy50aW1lIHx8IERhdGUubm93KCkgLyAxMDAwO1xuXG4gICAgICAgIHRoaXMuZm9yY2UgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICB0aGlzLmJvZGllcyA9IFtdO1xuICAgICAgICB0aGlzLmZvcmNlcyA9IFtdO1xuXG4gICAgICAgIHRoaXMucGF1c2VkID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBhZGQoYm9keSkge1xuICAgICAgICBpZiAoYm9keS50eXBlID09PSBSSUdJRF9CT0RZKSB7XG4gICAgICAgICAgICB0aGlzLmJvZGllcy5wdXNoKGJvZHkpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGJvZHkudHlwZSA9PT0gRk9SQ0UpIHtcbiAgICAgICAgICAgIHRoaXMuZm9yY2VzLnB1c2goYm9keSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZW1vdmUoYm9keSkge1xuICAgICAgICBpZiAoYm9keS50eXBlID09PSBSSUdJRF9CT0RZKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuYm9kaWVzLmluZGV4T2YoYm9keSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5ib2RpZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGlmIChib2R5LnR5cGUgPT09IEZPUkNFKSB7XG4gICAgICAgICAgICBjb25zdCBpbmRleCA9IHRoaXMuZm9yY2VzLmluZGV4T2YoYm9keSk7XG4gICAgICAgICAgICBpZiAoaW5kZXggIT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZXMuc3BsaWNlKGluZGV4LCAxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIHBhdXNlKCkge1xuICAgICAgICBpZiAodGhpcy5wYXVzZWQgPT09IGZhbHNlKSB7XG4gICAgICAgICAgICB0aGlzLnBhdXNlZCA9IHRydWU7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICByZXN1bWUoKSB7XG4gICAgICAgIGlmICh0aGlzLnBhdXNlZCA9PT0gdHJ1ZSkge1xuICAgICAgICAgICAgdGhpcy5wYXVzZWQgPSBmYWxzZTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHVwZGF0ZSgpIHtcbiAgICAgICAgaWYgKHRoaXMucGF1c2VkKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cbiAgICAgICAgbmV3dGltZSA9IERhdGUubm93KCkgLyAxMDAwO1xuICAgICAgICBmcmFtZXRpbWUgPSBuZXd0aW1lIC0gY3VycmVudHRpbWU7XG5cbiAgICAgICAgaWYgKGZyYW1ldGltZSA+IDAuMjUpIHtcbiAgICAgICAgICAgIGZyYW1ldGltZSA9IDAuMjU7XG4gICAgICAgIH1cblxuICAgICAgICBjdXJyZW50dGltZSA9IG5ld3RpbWU7XG4gICAgICAgIGFjY3VtdWxhdG9yICs9IGZyYW1ldGltZTtcblxuICAgICAgICB3aGlsZSAoYWNjdW11bGF0b3IgPj0gdGltZXN0ZXApIHtcbiAgICAgICAgICAgIHRoaXMuc3RlcCgpO1xuICAgICAgICAgICAgdGltZSArPSB0aW1lc3RlcDtcbiAgICAgICAgICAgIGFjY3VtdWxhdG9yIC09IHRpbWVzdGVwO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5yZW5kZXIoKTtcbiAgICB9XG5cbiAgICAvLyBjYWxjdWxhdGVzIHBoeXNpY3NcbiAgICBzdGVwKCkge1xuICAgICAgICB0aGlzLmNhbGN1bGF0ZVdvcmxkRm9yY2VzKCk7XG5cbiAgICAgICAgLy8gdXBkYXRlIGJvdW5kaW5nIHZvbHVtZXMgKHVzZWQgbGF0ZXIgZm9yIGNvbGxpc2lvbiBkZXRlY3Rpb24pXG4gICAgICAgIHRoaXMudXBkYXRlQm91bmRzKCk7XG5cbiAgICAgICAgLy8gY2hlY2sgZm9yIGNvbGxpc2lvbnNcbiAgICAgICAgdGhpcy5jb2xsaXNpb24oKTtcblxuICAgICAgICAvLyBzb3J0IHdoaWNoIGJvZGllcyBhcmUgYXdha2UgYW5kIGludGVncmF0ZSB0aGVtXG4gICAgICAgIHRoaXMuaW50ZWdyYXRlKCk7XG4gICAgfVxuXG4gICAgY2FsY3VsYXRlV29ybGRGb3JjZXMoKSB7XG4gICAgICAgIC8vIGNhbGN1bGF0ZXMgYWxsIGZvcmNlcyBpbiB0aGUgd29ybGRcbiAgICAgICAgdGhpcy5mb3JjZVswXSA9IDA7XG4gICAgICAgIHRoaXMuZm9yY2VbMV0gPSAwO1xuICAgICAgICB0aGlzLmZvcmNlWzJdID0gMDtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuZm9yY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmZvcmNlWzBdICs9IHRoaXMuZm9yY2VzW2ldLmRhdGFbMF07XG4gICAgICAgICAgICB0aGlzLmZvcmNlWzFdICs9IHRoaXMuZm9yY2VzW2ldLmRhdGFbMV07XG4gICAgICAgICAgICB0aGlzLmZvcmNlWzJdICs9IHRoaXMuZm9yY2VzW2ldLmRhdGFbMl07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJvZGllc1tpXS5hZGRGb3JjZSh0aGlzLmZvcmNlKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGNvbnNvbGUubG9nKHRoaXMuZm9yY2VzWzBdKTtcbiAgICB9XG5cbiAgICB1cGRhdGVCb3VuZHMoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9kaWVzW2ldLnVwZGF0ZUJvdW5kcygpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29sbGlzaW9uKCkge1xuICAgICAgICBsZXQgYTtcbiAgICAgICAgbGV0IGI7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoIC0gMTsgaSsrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBqID0gaSArIDE7IGogPCB0aGlzLmJvZGllcy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgICAgIGEgPSB0aGlzLmJvZGllc1tpXTtcbiAgICAgICAgICAgICAgICBiID0gdGhpcy5ib2RpZXNbal07XG4gICAgICAgICAgICAgICAgY2hlY2tDb250YWN0cyhhLCBiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgIH1cblxuICAgIGludGVncmF0ZSgpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ib2RpZXNbaV0uaW50ZWdyYXRlKHRpbWVzdGVwKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgLy8gY29uc29sZS5sb2coJ3JlbmRlcicsIHRoaXMudGltZSk7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgdGhpcy5ib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIHRoaXMuYm9kaWVzW2ldLnJlbmRlcih0aW1lKTtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgV29ybGQ7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IFJJR0lEX0JPRFksIFNQSEVSRV9DT0xMSURFUiwgQUFCQl9DT0xMSURFUiB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIFJpZ2lkQm9keSB7XG4gICAgY29uc3RydWN0b3IocGFyYW1zKSB7XG4gICAgICAgIGlmICghcGFyYW1zLmNvbGxpZGVyKSB7XG4gICAgICAgICAgICB0aHJvdyBuZXcgRXJyb3IoJ1BsZWFzZSBwcm92aWRlIGEgY29sbGlkZXInKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICghcGFyYW1zLm1lc2gpIHtcbiAgICAgICAgICAgIHRocm93IG5ldyBFcnJvcignUGxlYXNlIHByb3ZpZGUgYSBtZXNoJyk7XG4gICAgICAgIH1cblxuICAgICAgICBPYmplY3QuYXNzaWduKHRoaXMsIHtcbiAgICAgICAgICAgIHR5cGU6IFJJR0lEX0JPRFksXG4gICAgICAgICAgICBhd2FrZTogdHJ1ZSxcbiAgICAgICAgICAgIGxpbmVhcmRyYWc6IDAuOTk5LFxuICAgICAgICAgICAgZHluYW1pYzogdHJ1ZSxcbiAgICAgICAgICAgIHZlbG9jaXR5OiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICAgICAgYWNjZWxlcmF0aW9uOiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICAgICAgcG9zaXRpb246IHZlYzMuY3JlYXRlKCksXG4gICAgICAgICAgICBmb3JjZTogdmVjMy5jcmVhdGUoKSxcbiAgICAgICAgfSwgcGFyYW1zKTtcblxuICAgICAgICAvLyBjb3B5IG1lc2ggcG9zaXRpb25cbiAgICAgICAgdmVjMy5jb3B5KHRoaXMucG9zaXRpb24sIHRoaXMubWVzaC5wb3NpdGlvbi5kYXRhKTtcbiAgICB9XG5cbiAgICBnZXRJbnZlcnNlbWFzcygpIHtcbiAgICAgICAgcmV0dXJuIDEgLyB0aGlzLmdldE1hc3MoKTtcbiAgICB9XG5cbiAgICBnZXRNYXNzKCkge1xuICAgICAgICBzd2l0Y2ggKHRoaXMuY29sbGlkZXIudHlwZSkge1xuICAgICAgICBjYXNlIFNQSEVSRV9DT0xMSURFUjpcbiAgICAgICAgICAgIHJldHVybiB0aGlzLmNvbGxpZGVyLnJhZGl1cztcbiAgICAgICAgY2FzZSBBQUJCX0NPTExJREVSOlxuICAgICAgICAgICAgcmV0dXJuIDE7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBjb25zb2xlLndhcm4oJ3Vua25vd24gY29sbGlkZXInKTtcbiAgICAgICAgICAgIHJldHVybiAxO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gY29waWVzIHdvcmxkIGZvcmNlIGludG8gYm9keVxuICAgIGFkZEZvcmNlKGZvcmNlKSB7XG4gICAgICAgIHZlYzMuY29weSh0aGlzLmZvcmNlLCBmb3JjZSk7XG4gICAgfVxuXG4gICAgaW50ZWdyYXRlKGRlbHRhdGltZSkge1xuICAgICAgICBpZiAoIXRoaXMuYXdha2UgfHwgIXRoaXMuZHluYW1pYykge1xuICAgICAgICAgICAgcmV0dXJuO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gY2FsY3VsYXRlIGFjY2VsZXJhdGlvblxuICAgICAgICBjb25zdCBtYXNzID0gdGhpcy5nZXRNYXNzKCk7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uWzBdID0gdGhpcy5mb3JjZVswXSAvIG1hc3M7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uWzFdID0gdGhpcy5mb3JjZVsxXSAvIG1hc3M7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0aW9uWzJdID0gdGhpcy5mb3JjZVsyXSAvIG1hc3M7XG5cbiAgICAgICAgLy8gYWRkaW5nIGFjY2VsZXJhdGlvbiB0byB2ZWxvY2l0eVxuICAgICAgICB2ZWMzLnNjYWxlQW5kQWRkKHRoaXMudmVsb2NpdHksIHRoaXMudmVsb2NpdHksIHRoaXMuYWNjZWxlcmF0aW9uLCBkZWx0YXRpbWUpO1xuXG4gICAgICAgIC8vIGFkZGluZyB2ZWxvY2l0eSB0byBwb3NpdGlvblxuICAgICAgICB2ZWMzLnNjYWxlQW5kQWRkKHRoaXMucG9zaXRpb24sIHRoaXMucG9zaXRpb24sIHRoaXMudmVsb2NpdHksIGRlbHRhdGltZSk7XG5cbiAgICAgICAgLy8gYWRkIGRyYWcgdG8gdmVsb2NpdHlcbiAgICAgICAgdGhpcy52ZWxvY2l0eVswXSAqPSB0aGlzLmxpbmVhcmRyYWc7XG4gICAgICAgIHRoaXMudmVsb2NpdHlbMV0gKj0gdGhpcy5saW5lYXJkcmFnO1xuICAgICAgICB0aGlzLnZlbG9jaXR5WzJdICo9IHRoaXMubGluZWFyZHJhZztcbiAgICB9XG5cbiAgICB1cGRhdGVCb3VuZHMoKSB7XG4gICAgICAgIHRoaXMuY29sbGlkZXIudXBkYXRlQm91bmRzKHRoaXMucG9zaXRpb24pO1xuICAgIH1cblxuICAgIHJlbmRlcigpIHtcbiAgICAgICAgdmVjMy5jb3B5KHRoaXMubWVzaC5wb3NpdGlvbi5kYXRhLCB0aGlzLnBvc2l0aW9uKTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFJpZ2lkQm9keTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuaW1wb3J0IHsgU1BIRVJFX0NPTExJREVSIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgU3BoZXJlQ29sbGlkZXIge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuICAgICAgICAgICAgdHlwZTogU1BIRVJFX0NPTExJREVSLFxuICAgICAgICAgICAgcmFkaXVzOiAxLFxuICAgICAgICAgICAgYm91bmRzOiB2ZWMzLmNyZWF0ZSgpLFxuICAgICAgICB9LCBwYXJhbXMpO1xuICAgIH1cblxuICAgIHVwZGF0ZUJvdW5kcyhwb3NpdGlvbikge1xuICAgICAgICAvLyB3b3JsZCBzcGFjZVxuICAgICAgICB0aGlzLmxlZnQgPSBwb3NpdGlvblswXSAtIHRoaXMucmFkaXVzO1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcG9zaXRpb25bMF0gKyB0aGlzLnJhZGl1cztcblxuICAgICAgICB0aGlzLnRvcCA9IHBvc2l0aW9uWzFdICsgdGhpcy5yYWRpdXM7XG4gICAgICAgIHRoaXMuYm90dG9tID0gcG9zaXRpb25bMV0gLSB0aGlzLnJhZGl1cztcblxuICAgICAgICB0aGlzLmZyb250ID0gcG9zaXRpb25bMl0gKyB0aGlzLnJhZGl1cztcbiAgICAgICAgdGhpcy5iYWNrID0gcG9zaXRpb25bMl0gLSB0aGlzLnJhZGl1cztcblxuICAgICAgICAvLyBsb2NhbCBzcGFjZVxuICAgICAgICB0aGlzLmJvdW5kc1swXSA9IHRoaXMucmFkaXVzO1xuICAgICAgICB0aGlzLmJvdW5kc1sxXSA9IHRoaXMucmFkaXVzO1xuICAgICAgICB0aGlzLmJvdW5kc1syXSA9IHRoaXMucmFkaXVzO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BoZXJlQ29sbGlkZXI7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcbmltcG9ydCB7IEFBQkJfQ09MTElERVIgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jbGFzcyBBQUJCQ29sbGlkZXIge1xuICAgIGNvbnN0cnVjdG9yKHBhcmFtcyA9IHt9KSB7XG4gICAgICAgIE9iamVjdC5hc3NpZ24odGhpcywge1xuICAgICAgICAgICAgdHlwZTogQUFCQl9DT0xMSURFUixcbiAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgICAgICBib3VuZHM6IHZlYzMuY3JlYXRlKCksXG4gICAgICAgIH0sIHBhcmFtcyk7XG4gICAgfVxuXG4gICAgdXBkYXRlQm91bmRzKHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy53aWR0aCAvIDI7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuaGVpZ2h0IC8gMjtcbiAgICAgICAgY29uc3QgZGVwdGggPSB0aGlzLmRlcHRoIC8gMjtcblxuICAgICAgICAvLyB3b3JsZCBzcGFjZVxuICAgICAgICB0aGlzLmxlZnQgPSBwb3NpdGlvblswXSAtIHdpZHRoO1xuICAgICAgICB0aGlzLnJpZ2h0ID0gcG9zaXRpb25bMF0gKyB3aWR0aDtcblxuICAgICAgICB0aGlzLnRvcCA9IHBvc2l0aW9uWzFdICsgaGVpZ2h0O1xuICAgICAgICB0aGlzLmJvdHRvbSA9IHBvc2l0aW9uWzFdIC0gaGVpZ2h0O1xuXG4gICAgICAgIHRoaXMuZnJvbnQgPSBwb3NpdGlvblsyXSArIGRlcHRoO1xuICAgICAgICB0aGlzLmJhY2sgPSBwb3NpdGlvblsyXSAtIGRlcHRoO1xuXG4gICAgICAgIC8vIGxvY2FsIHNwYWNlXG4gICAgICAgIHRoaXMuYm91bmRzWzBdID0gdGhpcy53aWR0aDtcbiAgICAgICAgdGhpcy5ib3VuZHNbMV0gPSB0aGlzLmhlaWdodDtcbiAgICAgICAgdGhpcy5ib3VuZHNbMl0gPSB0aGlzLmRlcHRoO1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQUFCQkNvbGxpZGVyO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5pbXBvcnQgeyBGT1JDRSB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIEZvcmNlIHtcbiAgICBjb25zdHJ1Y3Rvcih4ID0gMCwgeSA9IDAsIHogPSAwKSB7XG4gICAgICAgIHRoaXMudHlwZSA9IEZPUkNFO1xuICAgICAgICB0aGlzLmRhdGEgPSB2ZWMzLmZyb21WYWx1ZXMoeCwgeSwgeik7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBGb3JjZTtcbiIsIi8vIHdvcmxkXG5pbXBvcnQgV29ybGQgZnJvbSAnLi9jb3JlL3dvcmxkJztcblxuLy8gYm9kaWVzXG5pbXBvcnQgUmlnaWRCb2R5IGZyb20gJy4vY29yZS9yaWdpZC1ib2R5JztcblxuLy8gY29sbGlkZXJzXG5pbXBvcnQgU3BoZXJlQ29sbGlkZXIgZnJvbSAnLi9jb2xsaWRlcnMvc3BoZXJlLWNvbGxpZGVyJztcbmltcG9ydCBBQUJCQ29sbGlkZXIgZnJvbSAnLi9jb2xsaWRlcnMvYWFiYi1jb2xsaWRlcic7XG5cbi8vIGZvcmNlc1xuaW1wb3J0IEZvcmNlIGZyb20gJy4vY29yZS9mb3JjZSc7XG5cbmV4cG9ydCB7XG4gICAgV29ybGQsXG4gICAgUmlnaWRCb2R5LFxuICAgIFNwaGVyZUNvbGxpZGVyLFxuICAgIEFBQkJDb2xsaWRlcixcbiAgICBGb3JjZSxcbn07XG4iXSwibmFtZXMiOlsiQVJSQVlfVFlQRSIsIkZsb2F0MzJBcnJheSIsIkFycmF5IiwiZGVncmVlIiwiTWF0aCIsIlBJIiwiY3JlYXRlIiwib3V0IiwiZ2xNYXRyaXgiLCJsZW5ndGgiLCJhIiwieCIsInkiLCJ6Iiwic3FydCIsImZyb21WYWx1ZXMiLCJjb3B5Iiwic3VidHJhY3QiLCJiIiwic2NhbGVBbmRBZGQiLCJzY2FsZSIsIm5vcm1hbGl6ZSIsImxlbiIsImRvdCIsImNyb3NzIiwiYXgiLCJheSIsImF6IiwiYngiLCJieSIsImJ6IiwiZm9yRWFjaCIsInZlYyIsInN0cmlkZSIsIm9mZnNldCIsImNvdW50IiwiZm4iLCJhcmciLCJpIiwibCIsIm1pbiIsInciLCJzZXRBeGlzQW5nbGUiLCJheGlzIiwicmFkIiwicyIsInNpbiIsImNvcyIsInNsZXJwIiwidCIsImF3IiwiYnciLCJvbWVnYSIsImNvc29tIiwic2lub20iLCJzY2FsZTAiLCJzY2FsZTEiLCJhY29zIiwiZnJvbU1hdDMiLCJtIiwiZlRyYWNlIiwiZlJvb3QiLCJqIiwiayIsInZlYzQiLCJyb3RhdGlvblRvIiwidG1wdmVjMyIsInZlYzMiLCJ4VW5pdFZlYzMiLCJ5VW5pdFZlYzMiLCJzcWxlcnAiLCJ0ZW1wMSIsInRlbXAyIiwiYyIsImQiLCJzZXRBeGVzIiwibWF0ciIsIm1hdDMiLCJ2aWV3IiwicmlnaHQiLCJ1cCIsIlNQSEVSRV9DT0xMSURFUiIsIkFBQkJfQ09MTElERVIiLCJSSUdJRF9CT0RZIiwiRk9SQ0UiLCJERUZBVUxUX1RJTUVTVEVQIiwidGVtcERpcmVjdGlvbiIsIkFBQkJJbnRlcnNlY3RBQUJCIiwiYW1pbiIsImNvbGxpZGVyIiwibGVmdCIsImJvdHRvbSIsImJhY2siLCJhbWF4IiwidG9wIiwiZnJvbnQiLCJibWluIiwiYm1heCIsInBvc2l0aW9uIiwiY2hlY2tDb250YWN0cyIsInRpbWUiLCJ0aW1lc3RlcCIsImN1cnJlbnR0aW1lIiwiYWNjdW11bGF0b3IiLCJuZXd0aW1lIiwiZnJhbWV0aW1lIiwiV29ybGQiLCJwYXJhbXMiLCJEYXRlIiwibm93IiwiZm9yY2UiLCJib2RpZXMiLCJmb3JjZXMiLCJwYXVzZWQiLCJib2R5IiwidHlwZSIsInB1c2giLCJpbmRleCIsImluZGV4T2YiLCJzcGxpY2UiLCJzdGVwIiwicmVuZGVyIiwiY2FsY3VsYXRlV29ybGRGb3JjZXMiLCJ1cGRhdGVCb3VuZHMiLCJjb2xsaXNpb24iLCJpbnRlZ3JhdGUiLCJkYXRhIiwiYWRkRm9yY2UiLCJSaWdpZEJvZHkiLCJFcnJvciIsIm1lc2giLCJPYmplY3QiLCJhc3NpZ24iLCJhd2FrZSIsImxpbmVhcmRyYWciLCJkeW5hbWljIiwidmVsb2NpdHkiLCJhY2NlbGVyYXRpb24iLCJnZXRNYXNzIiwicmFkaXVzIiwiY29uc29sZSIsIndhcm4iLCJkZWx0YXRpbWUiLCJtYXNzIiwiU3BoZXJlQ29sbGlkZXIiLCJib3VuZHMiLCJBQUJCQ29sbGlkZXIiLCJ3aWR0aCIsImhlaWdodCIsImRlcHRoIiwiRm9yY2UiXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBOzs7O0VBT08sSUFBSUEsYUFBYyxPQUFPQyxZQUFQLEtBQXdCLFdBQXpCLEdBQXdDQSxZQUF4QyxHQUF1REMsS0FBeEU7QUFDUDtFQVdBLElBQU1DLFNBQVNDLEtBQUtDLEVBQUwsR0FBVSxHQUF6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
