(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.lowww = global.lowww || {}, global.lowww.geometries = {})));
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
   * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
   * @module mat4
   */

  /**
   * Creates a new identity mat4
   *
   * @returns {mat4} a new 4x4 matrix
   */
  function create$3() {
    var out = new ARRAY_TYPE(16);
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }

  /**
   * Set a mat4 to the identity matrix
   *
   * @param {mat4} out the receiving matrix
   * @returns {mat4} out
   */
  function identity$3(out) {
    out[0] = 1;
    out[1] = 0;
    out[2] = 0;
    out[3] = 0;
    out[4] = 0;
    out[5] = 1;
    out[6] = 0;
    out[7] = 0;
    out[8] = 0;
    out[9] = 0;
    out[10] = 1;
    out[11] = 0;
    out[12] = 0;
    out[13] = 0;
    out[14] = 0;
    out[15] = 1;
    return out;
  }

  /**
   * Rotates a matrix by the given angle around the Y axis
   *
   * @param {mat4} out the receiving matrix
   * @param {mat4} a the matrix to rotate
   * @param {Number} rad the angle to rotate the matrix by
   * @returns {mat4} out
   */
  function rotateY(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a20 = a[8];
    var a21 = a[9];
    var a22 = a[10];
    var a23 = a[11];

    if (a !== out) {
      // If the source and destination differ, copy the unchanged rows
      out[4] = a[4];
      out[5] = a[5];
      out[6] = a[6];
      out[7] = a[7];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c - a20 * s;
    out[1] = a01 * c - a21 * s;
    out[2] = a02 * c - a22 * s;
    out[3] = a03 * c - a23 * s;
    out[8] = a00 * s + a20 * c;
    out[9] = a01 * s + a21 * c;
    out[10] = a02 * s + a22 * c;
    out[11] = a03 * s + a23 * c;
    return out;
  }

  /**
   * Rotates a matrix by the given angle around the Z axis
   *
   * @param {mat4} out the receiving matrix
   * @param {mat4} a the matrix to rotate
   * @param {Number} rad the angle to rotate the matrix by
   * @returns {mat4} out
   */
  function rotateZ(out, a, rad) {
    var s = Math.sin(rad);
    var c = Math.cos(rad);
    var a00 = a[0];
    var a01 = a[1];
    var a02 = a[2];
    var a03 = a[3];
    var a10 = a[4];
    var a11 = a[5];
    var a12 = a[6];
    var a13 = a[7];

    if (a !== out) {
      // If the source and destination differ, copy the unchanged last row
      out[8] = a[8];
      out[9] = a[9];
      out[10] = a[10];
      out[11] = a[11];
      out[12] = a[12];
      out[13] = a[13];
      out[14] = a[14];
      out[15] = a[15];
    }

    // Perform axis-specific matrix multiplication
    out[0] = a00 * c + a10 * s;
    out[1] = a01 * c + a11 * s;
    out[2] = a02 * c + a12 * s;
    out[3] = a03 * c + a13 * s;
    out[4] = a10 * c - a00 * s;
    out[5] = a11 * c - a01 * s;
    out[6] = a12 * c - a02 * s;
    out[7] = a13 * c - a03 * s;
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
   * Adds two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the first operand
   * @param {vec3} b the second operand
   * @returns {vec3} out
   */
  function add$4(out, a, b) {
    out[0] = a[0] + b[0];
    out[1] = a[1] + b[1];
    out[2] = a[2] + b[2];
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
   * Scales a vec3 by a scalar number
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the vector to scale
   * @param {Number} b amount to scale the vector by
   * @returns {vec3} out
   */
  function scale$4(out, a, b) {
    out[0] = a[0] * b;
    out[1] = a[1] * b;
    out[2] = a[2] * b;
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
   * Transforms the vec3 with a mat4.
   * 4th vector component is implicitly '1'
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the vector to transform
   * @param {mat4} m matrix to transform with
   * @returns {vec3} out
   */
  function transformMat4(out, a, m) {
    var x = a[0],
        y = a[1],
        z = a[2];
    var w = m[3] * x + m[7] * y + m[11] * z + m[15];
    w = w || 1.0;
    out[0] = (m[0] * x + m[4] * y + m[8] * z + m[12]) / w;
    out[1] = (m[1] * x + m[5] * y + m[9] * z + m[13]) / w;
    out[2] = (m[2] * x + m[6] * y + m[10] * z + m[14]) / w;
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

  var toConsumableArray = function (arr) {
    if (Array.isArray(arr)) {
      for (var i = 0, arr2 = Array(arr.length); i < arr.length; i++) arr2[i] = arr[i];

      return arr2;
    } else {
      return Array.from(arr);
    }
  };

  var Modify = function Modify() {
      classCallCheck(this, Modify);
  };

  Modify.getData = function (index, step, array) {
      var i = index * step;
      var data = [];
      for (var j = 0; j < step; j++) {
          data.push(array[i + j]);
      }

      return data;
  };

  Modify.detach = function (geometry) {
      var positions = [];
      var normals = [];
      var uvs = [];

      for (var i = 0; i < geometry.indices.length; i += 3) {
          var fa = geometry.indices[i + 0];
          var fb = geometry.indices[i + 1];
          var fc = geometry.indices[i + 2];

          // gets faces
          positions.push.apply(positions, toConsumableArray(Modify.getData(fa, 3, geometry.positions)));
          positions.push.apply(positions, toConsumableArray(Modify.getData(fb, 3, geometry.positions)));
          positions.push.apply(positions, toConsumableArray(Modify.getData(fc, 3, geometry.positions)));

          // gets normals
          normals.push.apply(normals, toConsumableArray(Modify.getData(fa, 3, geometry.normals)));
          normals.push.apply(normals, toConsumableArray(Modify.getData(fb, 3, geometry.normals)));
          normals.push.apply(normals, toConsumableArray(Modify.getData(fc, 3, geometry.normals)));

          // gets uvs
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fa, 2, geometry.uvs)));
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fb, 2, geometry.uvs)));
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fc, 2, geometry.uvs)));
      }

      return {
          positions: positions,
          normals: normals,
          uvs: uvs
      };
  };

  Modify.modify = function (geometry) {
      var positions = [];
      var normals = [];
      var uvs = [];

      for (var i = 0; i < geometry.indices.length; i += 3) {
          var fa = geometry.indices[i + 0];
          var fb = geometry.indices[i + 1];
          var fc = geometry.indices[i + 2];

          // gets faces CBA order
          positions.push.apply(positions, toConsumableArray(Modify.getData(fa, 3, geometry.positions)));
          positions.push.apply(positions, toConsumableArray(Modify.getData(fb, 3, geometry.positions)));
          positions.push.apply(positions, toConsumableArray(Modify.getData(fc, 3, geometry.positions)));

          // gets normals
          normals.push.apply(normals, toConsumableArray(Modify.getData(fa, 3, geometry.normals)));
          normals.push.apply(normals, toConsumableArray(Modify.getData(fb, 3, geometry.normals)));
          normals.push.apply(normals, toConsumableArray(Modify.getData(fc, 3, geometry.normals)));

          // gets uvs
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fa, 2, geometry.uvs)));
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fb, 2, geometry.uvs)));
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fc, 2, geometry.uvs)));

          // EXTRAS
          positions.push.apply(positions, toConsumableArray(Modify.getData(fa, 3, geometry.positions)));
          positions.push.apply(positions, toConsumableArray(Modify.getData(fc, 3, geometry.positions)));
          positions.push(0, 0, 0);
          positions.push.apply(positions, toConsumableArray(Modify.getData(fc, 3, geometry.positions)));
          positions.push.apply(positions, toConsumableArray(Modify.getData(fb, 3, geometry.positions)));
          positions.push(0, 0, 0);
          positions.push.apply(positions, toConsumableArray(Modify.getData(fb, 3, geometry.positions)));
          positions.push.apply(positions, toConsumableArray(Modify.getData(fa, 3, geometry.positions)));
          positions.push(0, 0, 0);

          normals.push.apply(normals, toConsumableArray(Modify.getData(fa, 3, geometry.normals)));
          normals.push.apply(normals, toConsumableArray(Modify.getData(fc, 3, geometry.normals)));
          normals.push(0, 0, 0);
          normals.push.apply(normals, toConsumableArray(Modify.getData(fc, 3, geometry.normals)));
          normals.push.apply(normals, toConsumableArray(Modify.getData(fb, 3, geometry.normals)));
          normals.push(0, 0, 0);
          normals.push.apply(normals, toConsumableArray(Modify.getData(fb, 3, geometry.normals)));
          normals.push.apply(normals, toConsumableArray(Modify.getData(fa, 3, geometry.normals)));
          normals.push(0, 0, 0);

          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fa, 2, geometry.uvs)));
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fc, 2, geometry.uvs)));
          uvs.push(0, 0);
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fc, 2, geometry.uvs)));
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fb, 2, geometry.uvs)));
          uvs.push(0, 0);
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fb, 2, geometry.uvs)));
          uvs.push.apply(uvs, toConsumableArray(Modify.getData(fa, 2, geometry.uvs)));
          uvs.push(0, 0);
      }

      return {
          positions: positions,
          normals: normals,
          uvs: uvs
      };
  };

  /**
   * Utilities
   * @module geometries/utils
   */

  /**
   * flattens an array or vertices
   *
   * @param {Type} type Array type, such as Float32Array or Array
   */
  function flatten(arr) {
      var output = [];
      for (var i = 0; i < arr.length; i++) {
          if (Array.isArray(arr[i]) || arr[i] instanceof Float32Array) {
              output = output.concat(flatten(arr[i]));
          } else {
              output.push(arr[i]);
          }
      }
      return output;
  }

  function unflatten(arr, amount) {
      var output = [];
      for (var i = 0; i < arr.length; i += amount) {
          var value = [];
          for (var j = 0; j < amount; j++) {
              value.push(arr[i + j]);
          }
          output.push(value);
      }
      return output;
  }

  function generateVertexNormals(positions, indices) {
      var faces = unflatten(indices, 3);
      var vertices = unflatten(positions, 3);

      var temp = [];

      var cb = create$4();
      var ab = create$4();
      var cross$$1 = create$4();

      var vA = void 0;
      var vB = void 0;
      var vC = void 0;

      for (var i = 0; i < faces.length; i++) {
          var face = faces[i];
          var a = face[0];
          var b = face[1];
          var c = face[2];

          vA = vertices[a];
          vB = vertices[b];
          vC = vertices[c];

          subtract$4(cb, vC, vB);
          subtract$4(ab, vA, vB);
          cross(cross$$1, cb, ab);

          if (temp[a] === undefined) {
              temp[a] = create$4();
          }

          if (temp[b] === undefined) {
              temp[b] = create$4();
          }

          if (temp[c] === undefined) {
              temp[c] = create$4();
          }

          add$4(temp[a], temp[a], cross$$1);
          add$4(temp[b], temp[b], cross$$1);
          add$4(temp[c], temp[c], cross$$1);
      }

      for (var _i = 0; _i < temp.length; _i++) {
          normalize(temp[_i], temp[_i]);
      }

      return flatten(temp, 3);
  }

  function mergeVertices(data) {
      var positions = unflatten(data.positions, 3);
      var verticesMap = {};
      var unique = [];
      var changes = [];

      var precisionPoints = 4; // number of decimal points, e.g. 4 for epsilon of 0.0001
      var precision = Math.pow(10, precisionPoints); // eslint-disable-line

      // remove duplicated positions
      for (var i = 0; i < positions.length; i++) {
          var v = positions[i];
          var key = '\n            ' + Math.round(v[0] * precision) + '_\n            ' + Math.round(v[1] * precision) + '_\n            ' + Math.round(v[2] * precision) + '\n        ';

          if (verticesMap[key] === undefined) {
              verticesMap[key] = i;
              unique.push(positions[i]);
              changes[i] = unique.length - 1;
          } else {
              // console.log('Duplicate vertex found. ', i, ' could be using ', verticesMap[key]);
              changes[i] = changes[verticesMap[key]];
          }
      }

      // remove duplicated faces
      var faceIndicesToRemove = [];
      var faces = unflatten(data.indices, 3);

      for (var _i2 = 0; _i2 < faces.length; _i2++) {
          var face = faces[_i2];

          face[0] = changes[face[0]];
          face[1] = changes[face[1]];
          face[2] = changes[face[2]];

          var indices = [face[0], face[1], face[2]];

          for (var n = 0; n < 3; n++) {
              if (indices[n] === indices[(n + 1) % 3]) {
                  faceIndicesToRemove.push(_i2);
                  break;
              }
          }
      }

      // remove duplicated uvs
      for (var _i3 = faceIndicesToRemove.length - 1; _i3 >= 0; _i3--) {
          var idx = faceIndicesToRemove[_i3];

          faces.splice(idx, 1);

          for (var j = 0; j < this.faceVertexUvs.length; j++) {
              this.faceVertexUvs[j].splice(idx, 1);
          }
      }

      var p = flatten(unique, 3);
      var f = flatten(faces, 3);

      return {
          positions: new Float32Array(p),
          indices: new Uint16Array(f),
          normals: new Float32Array(generateVertexNormals(p, f))
      };
  }

  var index = /*#__PURE__*/Object.freeze({
    flatten: flatten,
    unflatten: unflatten,
    generateVertexNormals: generateVertexNormals,
    mergeVertices: mergeVertices,
    Modify: Modify
  });

  var Polyhedra = function () {
      function Polyhedra(positions, faces, radius) {
          var detail = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 0;
          classCallCheck(this, Polyhedra);

          var uvs = [];

          var complex = {
              faces: unflatten(faces, 3),
              positions: unflatten(positions, 3)
          };

          var d = Math.min(detail, 4);

          while (d-- > 0) {
              complex = this.subdivide(complex);
          }

          // generate uvs
          for (var i = 0; i < complex.positions.length; i++) {
              var position = this.normalize(complex.positions[i]);
              var u = 0.5 * (-(Math.atan2(position[2], -position[0]) / Math.PI) + 1.0);
              var v = 0.5 + Math.asin(position[1]) / Math.PI;
              uvs.push([1 - u, 1 - v]);
          }

          // http://mft-dev.dk/uv-mapping-sphere/
          // this.fixPoleUVs(complex.positions, complex.faces, uvs);

          // scale positions
          positions = complex.positions; // eslint-disable-line
          for (var _i = 0; _i < positions.length; _i++) {
              // this.normalize(positions[i]);
              this.scale(positions[_i], radius);
          }

          var geometry = {
              positions: flatten(complex.positions),
              indices: flatten(complex.faces),
              normals: null,
              uvs: flatten(uvs, 2)
          };

          this.geometry = {
              positions: geometry.positions,
              indices: geometry.indices,
              normals: generateVertexNormals(geometry.positions, geometry.indices),
              uvs: flatten(uvs, 2)
          };
      }

      createClass(Polyhedra, [{
          key: 'fixPoleUVs',
          value: function fixPoleUVs(positions, cells, uvs) {
              var northIndex = this.firstYIndex(positions, 1);
              var southIndex = this.firstYIndex(positions, -1);

              if (northIndex === -1 || southIndex === -1) {
                  // could not find any poles, bail early
                  return;
              }

              var newVertices = positions.slice();
              var newUvs = uvs.slice();
              var verticeIndex = newVertices.length - 1;

              function visit(cell, poleIndex, b, c) {
                  var uv1 = uvs[b];
                  var uv2 = uvs[c];
                  uvs[poleIndex][0] = (uv1[0] + uv2[0]) / 2;
                  verticeIndex++;
                  newVertices.push(positions[poleIndex].slice());
                  newUvs.push(uvs[poleIndex].slice());
                  cell[0] = verticeIndex;
              }

              for (var i = 0; i < cells.length; i++) {
                  var cell = cells[i];
                  var a = cell[0];
                  var b = cell[1];
                  var c = cell[2];

                  if (a === northIndex) {
                      visit(cell, northIndex, b, c);
                  } else if (a === southIndex) {
                      visit(cell, southIndex, b, c);
                  }
              }

              positions = newVertices;
              uvs = newUvs;
          }
      }, {
          key: 'firstYIndex',
          value: function firstYIndex(list, value) {
              for (var i = 0; i < list.length; i++) {
                  var vec = list[i];
                  if (Math.abs(vec[1] - value) <= 1e-4) {
                      return i;
                  }
              }
              return -1;
          }
      }, {
          key: 'normalize',
          value: function normalize(vec) {
              var mag = 0;
              for (var n = 0; n < vec.length; n++) {
                  mag += vec[n] * vec[n];
              }
              mag = Math.sqrt(mag);

              // avoid dividing by zero
              if (mag === 0) {
                  return Array.apply(null, new Array(vec.length)).map(Number.prototype.valueOf, 0); // eslint-disable-line
              }

              for (var _n = 0; _n < vec.length; _n++) {
                  vec[_n] /= mag;
              }

              return vec;
          }
      }, {
          key: 'scale',
          value: function scale(vec, factor) {
              for (var n = 0; n < vec.length; n++) {
                  vec[n] *= factor;
              }
              return vec;
          }
      }, {
          key: 'subdivide',
          value: function subdivide(complex) {
              var positions = complex.positions,
                  faces = complex.faces;


              var newCells = [];
              var newPositions = [];
              var midpoints = {};
              var l = 0;

              function midpoint(a, b) {
                  return [(a[0] + b[0]) / 2, (a[1] + b[1]) / 2, (a[2] + b[2]) / 2];
              }

              function pointToKey(point) {
                  return point[0].toPrecision(6) + ',' + point[1].toPrecision(6) + ',' + point[2].toPrecision(6);
              }

              function getMidpoint(a, b) {
                  var point = midpoint(a, b);
                  var pointKey = pointToKey(point);
                  var cachedPoint = midpoints[pointKey];
                  if (cachedPoint) {
                      return cachedPoint;
                  }
                  midpoints[pointKey] = point;
                  return midpoints[pointKey];
              }

              for (var i = 0; i < faces.length; i++) {
                  var cell = faces[i];
                  var c0 = cell[0];
                  var c1 = cell[1];
                  var c2 = cell[2];
                  var v0 = positions[c0];
                  var v1 = positions[c1];
                  var v2 = positions[c2];

                  var a = getMidpoint(v0, v1);
                  var b = getMidpoint(v1, v2);
                  var c = getMidpoint(v2, v0);

                  var ai = newPositions.indexOf(a);
                  if (ai === -1) {
                      ai = l++;
                      newPositions.push(a);
                  }
                  var bi = newPositions.indexOf(b);
                  if (bi === -1) {
                      bi = l++;
                      newPositions.push(b);
                  }
                  var ci = newPositions.indexOf(c);
                  if (ci === -1) {
                      ci = l++;
                      newPositions.push(c);
                  }

                  var v0i = newPositions.indexOf(v0);
                  if (v0i === -1) {
                      v0i = l++;
                      newPositions.push(v0);
                  }
                  var v1i = newPositions.indexOf(v1);
                  if (v1i === -1) {
                      v1i = l++;
                      newPositions.push(v1);
                  }
                  var v2i = newPositions.indexOf(v2);
                  if (v2i === -1) {
                      v2i = l++;
                      newPositions.push(v2);
                  }

                  newCells.push([v0i, ai, ci]);
                  newCells.push([v1i, bi, ai]);
                  newCells.push([v2i, ci, bi]);
                  newCells.push([ai, bi, ci]);
              }

              return {
                  faces: newCells,
                  positions: newPositions
              };
          }
      }]);
      return Polyhedra;
  }();

  var Tetrahedron = function (_Polyhedra) {
      inherits(Tetrahedron, _Polyhedra);

      function Tetrahedron(props) {
          var _ret;

          classCallCheck(this, Tetrahedron);

          var settings = Object.assign({}, {
              radius: 0.5,
              detail: 0
          }, props);

          var positions = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1];

          var indices = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1];

          var _this = possibleConstructorReturn(this, (Tetrahedron.__proto__ || Object.getPrototypeOf(Tetrahedron)).call(this, positions, indices, settings.radius * 2, settings.detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Tetrahedron;
  }(Polyhedra);

  var Hexahedron = function (_Polyhedra) {
      inherits(Hexahedron, _Polyhedra);

      function Hexahedron(props) {
          var _ret;

          classCallCheck(this, Hexahedron);

          var settings = Object.assign({}, {
              radius: 0.5,
              detail: 0
          }, props);

          var r = settings.radius * 2;

          var positions = [
          // Front face
          -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0, 1.0,
          // Back face
          -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0, -1.0,
          // Top face
          -1.0, 1.0, -1.0, -1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, 1.0, -1.0,
          // Bottom face
          -1.0, -1.0, -1.0, 1.0, -1.0, -1.0, 1.0, -1.0, 1.0, -1.0, -1.0, 1.0,
          // Right face
          1.0, -1.0, -1.0, 1.0, 1.0, -1.0, 1.0, 1.0, 1.0, 1.0, -1.0, 1.0,
          // Left face
          -1.0, -1.0, -1.0, -1.0, -1.0, 1.0, -1.0, 1.0, 1.0, -1.0, 1.0, -1.0];

          for (var i = 0; i < positions.length; i += 3) {
              positions[i + 0] *= r;
              positions[i + 1] *= r;
              positions[i + 2] *= r;
          }

          var indices = [
          // Front face
          0, 1, 2, 0, 2, 3,
          // Back face
          4, 5, 6, 4, 6, 7,
          // Top face
          8, 9, 10, 8, 10, 11,
          // Bottom face
          12, 13, 14, 12, 14, 15,
          // Right face
          16, 17, 18, 16, 18, 19,
          // Left face
          20, 21, 22, 20, 22, 23];

          var _this = possibleConstructorReturn(this, (Hexahedron.__proto__ || Object.getPrototypeOf(Hexahedron)).call(this, positions, indices, r, settings.detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Hexahedron;
  }(Polyhedra);

  var Octahedron = function (_Polyhedra) {
      inherits(Octahedron, _Polyhedra);

      function Octahedron(props) {
          var _ret;

          classCallCheck(this, Octahedron);

          var settings = Object.assign({}, {
              radius: 0.5,
              detail: 0
          }, props);

          var positions = [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1];

          var indices = [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2];

          var _this = possibleConstructorReturn(this, (Octahedron.__proto__ || Object.getPrototypeOf(Octahedron)).call(this, positions, indices, settings.radius * 2, settings.detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Octahedron;
  }(Polyhedra);

  var Dodecahedron = function (_Polyhedra) {
      inherits(Dodecahedron, _Polyhedra);

      function Dodecahedron(props) {
          var _ret;

          classCallCheck(this, Dodecahedron);

          var settings = Object.assign({}, {
              radius: 0.5,
              detail: 0
          }, props);

          var t = (1 + Math.sqrt(5)) / 2;
          var r = 1 / t;

          var positions = [
          // (±1, ±1, ±1)
          -1, -1, -1, -1, -1, 1, -1, 1, -1, -1, 1, 1, 1, -1, -1, 1, -1, 1, 1, 1, -1, 1, 1, 1,

          // (0, ±1/φ, ±φ)
          0, -r, -t, 0, -r, t, 0, r, -t, 0, r, t,

          // (±1/φ, ±φ, 0)
          -r, -t, 0, -r, t, 0, r, -t, 0, r, t, 0,

          // (±φ, 0, ±1/φ)
          -t, 0, -r, t, 0, -r, -t, 0, r, t, 0, r];

          var indices = [3, 11, 7, 3, 7, 15, 3, 15, 13, 7, 19, 17, 7, 17, 6, 7, 6, 15, 17, 4, 8, 17, 8, 10, 17, 10, 6, 8, 0, 16, 8, 16, 2, 8, 2, 10, 0, 12, 1, 0, 1, 18, 0, 18, 16, 6, 10, 2, 6, 2, 13, 6, 13, 15, 2, 16, 18, 2, 18, 3, 2, 3, 13, 18, 1, 9, 18, 9, 11, 18, 11, 3, 4, 14, 12, 4, 12, 0, 4, 0, 8, 11, 9, 5, 11, 5, 19, 11, 19, 7, 19, 5, 14, 19, 14, 4, 19, 4, 17, 1, 12, 14, 1, 14, 5, 1, 5, 9];

          var _this = possibleConstructorReturn(this, (Dodecahedron.__proto__ || Object.getPrototypeOf(Dodecahedron)).call(this, positions, indices, settings.radius * 2, settings.detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Dodecahedron;
  }(Polyhedra);

  var Icosahedron = function (_Polyhedra) {
      inherits(Icosahedron, _Polyhedra);

      function Icosahedron(props) {
          var _ret;

          classCallCheck(this, Icosahedron);

          var settings = Object.assign({}, {
              radius: 0.5,
              detail: 0
          }, props);

          var t = 0.5 + Math.sqrt(5) / 2;
          var r = settings.radius * 2;

          var positions = [-1, +t, 0, +1, +t, 0, -1, -t, 0, +1, -t, 0, 0, -1, +t, 0, +1, +t, 0, -1, -t, 0, +1, -t, +t, 0, -1, +t, 0, +1, -t, 0, -1, -t, 0, +1];

          var indices = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];

          var _this = possibleConstructorReturn(this, (Icosahedron.__proto__ || Object.getPrototypeOf(Icosahedron)).call(this, positions, indices, r, settings.detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Icosahedron;
  }(Polyhedra);

  var Plane = function Plane(props) {
      classCallCheck(this, Plane);

      var settings = Object.assign({}, {
          width: 1,
          height: 1,
          subdivisionsX: 1,
          subdivisionsY: 1,
          axis: 'XY'
      }, props);

      var positions = [];
      var indices = [];
      var normals = [];
      var uvs = [];
      var index = 0;

      var w = settings.width * 2;
      var h = settings.height * 2;
      var spacerX = w / settings.subdivisionsX;
      var spacerY = h / settings.subdivisionsY;
      var offsetX = -w * 0.5;
      var offsetY = -h * 0.5;
      var spacerU = 1 / settings.subdivisionsX;
      var spacerV = 1 / settings.subdivisionsY;

      for (var y = 0; y < settings.subdivisionsY; y++) {
          for (var x = 0; x < settings.subdivisionsX; x++) {
              var triangleX = spacerX * x + offsetX;
              var triangleY = spacerY * y + offsetY;

              var u = x / settings.subdivisionsX;
              var v = y / settings.subdivisionsY;

              switch (settings.axis) {
                  case 'XZ':
                      // Facing towards y
                      positions = positions.concat([triangleX, 0, triangleY]);
                      positions = positions.concat([triangleX + spacerX, 0, triangleY]);
                      positions = positions.concat([triangleX + spacerX, 0, triangleY + spacerY]);
                      positions = positions.concat([triangleX, 0, triangleY + spacerY]);

                      normals = normals.concat([0, 1, 0]);
                      normals = normals.concat([0, 1, 0]);
                      normals = normals.concat([0, 1, 0]);
                      normals = normals.concat([0, 1, 0]);

                      uvs = uvs.concat([u, 1 - v]);
                      uvs = uvs.concat([u + spacerU, 1 - v]);
                      uvs = uvs.concat([u + spacerU, 1 - (v + spacerV)]);
                      uvs = uvs.concat([u, 1 - (v + spacerV)]);
                      break;
                  case 'YZ':
                      // Facing towards x

                      positions = positions.concat([0, triangleY, triangleX]);
                      positions = positions.concat([0, triangleY, triangleX + spacerX]);
                      positions = positions.concat([0, triangleY + spacerY, triangleX + spacerX]);
                      positions = positions.concat([0, triangleY + spacerY, triangleX]);

                      normals = normals.concat([1, 0, 0]);
                      normals = normals.concat([1, 0, 0]);
                      normals = normals.concat([1, 0, 0]);
                      normals = normals.concat([1, 0, 0]);

                      uvs = uvs.concat([1 - u, v]);
                      uvs = uvs.concat([1 - (u + spacerU), v]);
                      uvs = uvs.concat([1 - (u + spacerU), v + spacerV]);
                      uvs = uvs.concat([1 - u, v + spacerV]);
                      break;
                  default:
                      // Facing towards z
                      positions = positions.concat([triangleX, triangleY, 0]);
                      positions = positions.concat([triangleX + spacerX, triangleY, 0]);
                      positions = positions.concat([triangleX + spacerX, triangleY + spacerY, 0]);
                      positions = positions.concat([triangleX, triangleY + spacerY, 0]);

                      normals = normals.concat([0, 0, 1]);
                      normals = normals.concat([0, 0, 1]);
                      normals = normals.concat([0, 0, 1]);
                      normals = normals.concat([0, 0, 1]);

                      uvs = uvs.concat([u, v]);
                      uvs = uvs.concat([u + spacerU, v]);
                      uvs = uvs.concat([u + spacerU, v + spacerV]);
                      uvs = uvs.concat([u, v + spacerV]);
              }

              indices.push(index * 4 + 0);
              indices.push(index * 4 + 1);
              indices.push(index * 4 + 2);
              indices.push(index * 4 + 0);
              indices.push(index * 4 + 2);
              indices.push(index * 4 + 3);

              index++;
          }
      }

      return {
          positions: positions,
          indices: indices,
          normals: normals,
          uvs: uvs
      };
  };

  var Box = function Box(props) {
      classCallCheck(this, Box);

      var settings = Object.assign({}, {
          width: 1,
          height: 1,
          depth: 1
      }, props);

      var positions = [
      // Front face
      -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5, 0.5,
      // Back face
      -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5, -0.5,
      // Top face
      -0.5, 0.5, -0.5, -0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, 0.5, -0.5,
      // Bottom face
      -0.5, -0.5, -0.5, 0.5, -0.5, -0.5, 0.5, -0.5, 0.5, -0.5, -0.5, 0.5,
      // Right face
      0.5, -0.5, -0.5, 0.5, 0.5, -0.5, 0.5, 0.5, 0.5, 0.5, -0.5, 0.5,
      // Left face
      -0.5, -0.5, -0.5, -0.5, -0.5, 0.5, -0.5, 0.5, 0.5, -0.5, 0.5, -0.5];

      for (var i = 0; i < positions.length; i += 3) {
          positions[i + 0] *= settings.width;
          positions[i + 1] *= settings.height;
          positions[i + 2] *= settings.depth;
      }

      var indices = [
      // Front face
      0, 1, 2, 0, 2, 3,
      // Back face
      4, 5, 6, 4, 6, 7,
      // Top face
      8, 9, 10, 8, 10, 11,
      // Bottom face
      12, 13, 14, 12, 14, 15,
      // Right face
      16, 17, 18, 16, 18, 19,
      // Left face
      20, 21, 22, 20, 22, 23];

      var normals = [
      // Front
      0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0,
      // Back
      0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0,
      // Top
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
      // Bottom
      0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0,
      // Right
      1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 0.0,
      // Left
      -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0, -1.0, 0.0, 0.0];

      var uvs = [
      // Front face
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0,
      // Back face
      1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
      // Top face
      0.0, 1.0, 0.0, 0.0, 1.0, 0.0, 1.0, 1.0,
      // Bottom face
      1.0, 1.0, 0.0, 1.0, 0.0, 0.0, 1.0, 0.0,
      // Right face
      1.0, 0.0, 1.0, 1.0, 0.0, 1.0, 0.0, 0.0,
      // Left face
      0.0, 0.0, 1.0, 0.0, 1.0, 1.0, 0.0, 1.0];

      return {
          positions: positions,
          indices: indices,
          normals: normals,
          uvs: uvs
      };
  };

  var matRotY = create$3();
  var matRotZ = create$3();
  var up = fromValues$4(0, 1, 0);
  var tmpVec3 = create$4();

  var Sphere = function Sphere(props) {
      classCallCheck(this, Sphere);

      var settings = Object.assign({}, {
          radius: 0.5,
          segments: 8
      }, props);

      var positions = [];
      var indices = [];
      var normals = [];
      var uvs = [];

      var heightSegments = 2 + settings.segments;
      var widthSegments = 2 * heightSegments;

      for (var zStep = 0; zStep <= heightSegments; zStep++) {
          var v = zStep / heightSegments;
          var angleZ = v * Math.PI;

          for (var yStep = 0; yStep <= widthSegments; yStep++) {
              var u = yStep / widthSegments;
              var angleY = u * Math.PI * 2;

              identity$3(matRotZ);
              rotateZ(matRotZ, matRotZ, -angleZ);

              identity$3(matRotY);
              rotateY(matRotY, matRotY, angleY);

              transformMat4(tmpVec3, up, matRotZ);
              transformMat4(tmpVec3, tmpVec3, matRotY);

              scale$4(tmpVec3, tmpVec3, -(settings.radius * 2));
              positions.push.apply(positions, toConsumableArray(tmpVec3));

              normalize(tmpVec3, tmpVec3);
              normals.push.apply(normals, toConsumableArray(tmpVec3));

              uvs.push(u, v);
          }

          if (zStep > 0) {
              var vertices = positions.length / 3;
              var firstIndex = vertices - 2 * (widthSegments + 1);
              for (; firstIndex + widthSegments + 2 < vertices; firstIndex++) {
                  indices.push(firstIndex, firstIndex + 1, firstIndex + widthSegments + 1);
                  indices.push(firstIndex + widthSegments + 1, firstIndex + 1, firstIndex + widthSegments + 2);
              }
          }
      }

      return {
          positions: positions,
          indices: indices,
          normals: normals,
          uvs: uvs
      };
  };

  var Torus = function Torus(props) {
      classCallCheck(this, Torus);

      var settings = Object.assign({}, {
          radius: 1,
          tube: 0.375,
          tubularSegments: 16,
          radialSegments: 8,
          arc: Math.PI * 2
      }, props);

      var positions = [];
      var indices = [];
      var normals = [];
      var uvs = [];

      var center = create$4();
      var vertex = create$4();
      var normal = create$4();

      for (var j = 0; j <= settings.radialSegments; j++) {
          for (var i = 0; i <= settings.tubularSegments; i++) {
              var u = i / settings.tubularSegments * settings.arc;
              var v = j / settings.radialSegments * Math.PI * 2;

              vertex[0] = (settings.radius + settings.tube * Math.cos(v)) * Math.cos(u);
              vertex[1] = (settings.radius + settings.tube * Math.cos(v)) * Math.sin(u);
              vertex[2] = settings.tube * Math.sin(v);

              positions.push.apply(positions, toConsumableArray(vertex));

              center[0] = settings.radius * Math.cos(u);
              center[1] = settings.radius * Math.sin(u);
              subtract$4(normal, vertex, center);
              normalize(normal, normal);

              normals.push.apply(normals, toConsumableArray(normal));

              uvs.push(i / settings.tubularSegments);
              uvs.push(j / settings.radialSegments);
          }
      }

      for (var _j = 1; _j <= settings.radialSegments; _j++) {
          for (var _i = 1; _i <= settings.tubularSegments; _i++) {
              var a = (settings.tubularSegments + 1) * _j + (_i - 1);
              var b = (settings.tubularSegments + 1) * (_j - 1) + (_i - 1);
              var c = (settings.tubularSegments + 1) * (_j - 1) + _i;
              var d = (settings.tubularSegments + 1) * _j + _i;

              indices.push(a, b, d);
              indices.push(b, c, d);
          }
      }

      return {
          positions: positions,
          indices: indices,
          normals: normals,
          uvs: uvs
      };
  };

  var TorusKnot = function () {
      function TorusKnot(props) {
          classCallCheck(this, TorusKnot);

          var settings = Object.assign({}, {
              radius: 0.5,
              tube: 0.2,
              tubularSegments: 64,
              radialSegments: 6,
              p: 2,
              q: 3
          }, props);

          var positions = [];
          var indices = [];
          var normals = [];
          var uvs = [];

          var vertex = create$4();
          var normal = create$4();

          var P1 = create$4();
          var P2 = create$4();

          var B = create$4();
          var T = create$4();
          var N = create$4();

          for (var i = 0; i <= settings.tubularSegments; i++) {
              var u = i / settings.tubularSegments * settings.p * Math.PI * 2;
              this.calculatePositionOnCurve(u, settings.p, settings.q, settings.radius, P1);
              this.calculatePositionOnCurve(u + 0.01, settings.p, settings.q, settings.radius, P2);

              subtract$4(T, P2, P1);
              add$4(N, P2, P1);
              cross(B, T, N);
              cross(N, B, T);

              normalize(B, B);
              normalize(N, N);

              for (var j = 0; j <= settings.radialSegments; j++) {
                  var v = j / settings.radialSegments * Math.PI * 2;
                  var cx = -settings.tube * Math.cos(v);
                  var cy = settings.tube * Math.sin(v);

                  vertex[0] = P1[0] + (cx * N[0] + cy * B[0]);
                  vertex[1] = P1[1] + (cx * N[1] + cy * B[1]);
                  vertex[2] = P1[2] + (cx * N[2] + cy * B[2]);
                  positions.push.apply(positions, toConsumableArray(vertex));

                  subtract$4(normal, vertex, P1);
                  normalize(normal, normal);
                  normals.push.apply(normals, toConsumableArray(normal));

                  uvs.push(i / settings.tubularSegments, j / settings.radialSegments);
              }
          }

          for (var _j = 1; _j <= settings.tubularSegments; _j++) {
              for (var _i = 1; _i <= settings.radialSegments; _i++) {
                  var a = (settings.radialSegments + 1) * (_j - 1) + (_i - 1);
                  var b = (settings.radialSegments + 1) * _j + (_i - 1);
                  var c = (settings.radialSegments + 1) * _j + _i;
                  var d = (settings.radialSegments + 1) * (_j - 1) + _i;

                  indices.push(a, b, d);
                  indices.push(b, c, d);
              }
          }

          return {
              positions: positions,
              indices: indices,
              normals: normals,
              uvs: uvs
          };
      }

      createClass(TorusKnot, [{
          key: 'calculatePositionOnCurve',
          value: function calculatePositionOnCurve(u, p, q, radius, position) {
              var cu = Math.cos(u);
              var su = Math.sin(u);
              var quOverP = q / p * u;
              var cs = Math.cos(quOverP);

              position[0] = radius * (2 + cs) * 0.5 * cu;
              position[1] = radius * (2 + cs) * su * 0.5;
              position[2] = radius * Math.sin(quOverP) * 0.5;
          }
      }]);
      return TorusKnot;
  }();

  exports.utils = index;
  exports.Tetrahedron = Tetrahedron;
  exports.Hexahedron = Hexahedron;
  exports.Octahedron = Octahedron;
  exports.Dodecahedron = Dodecahedron;
  exports.Icosahedron = Icosahedron;
  exports.Plane = Plane;
  exports.Box = Box;
  exports.Sphere = Sphere;
  exports.Torus = Torus;
  exports.TorusKnot = TorusKnot;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvbWV0cmllcy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L2NvbW1vbi5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC9tYXQzLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L21hdDQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvdmVjMy5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvc3JjL2dsLW1hdHJpeC92ZWM0LmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9zcmMvZ2wtbWF0cml4L3F1YXQuanMiLCIuLi8uLi8uLi9ub2RlX21vZHVsZXMvZ2wtbWF0cml4L3NyYy9nbC1tYXRyaXgvdmVjMi5qcyIsIi4uL3NyYy91dGlscy9tb2RpZnkuanMiLCIuLi9zcmMvdXRpbHMvaW5kZXguanMiLCIuLi9zcmMvcG9seWhlZHJhLmpzIiwiLi4vc3JjL3RldHJhaGVkcm9uL2luZGV4LmpzIiwiLi4vc3JjL2hleGFoZWRyb24vaW5kZXguanMiLCIuLi9zcmMvb2N0YWhlZHJvbi9pbmRleC5qcyIsIi4uL3NyYy9kb2RlY2FoZWRyb24vaW5kZXguanMiLCIuLi9zcmMvaWNvc2FoZWRyb24vaW5kZXguanMiLCIuLi9zcmMvcGxhbmUvaW5kZXguanMiLCIuLi9zcmMvYm94L2luZGV4LmpzIiwiLi4vc3JjL3NwaGVyZS9pbmRleC5qcyIsIi4uL3NyYy90b3J1cy9pbmRleC5qcyIsIi4uL3NyYy90b3J1c2tub3QvaW5kZXguanMiXSwic291cmNlc0NvbnRlbnQiOlsiLyoqXG4gKiBDb21tb24gdXRpbGl0aWVzXG4gKiBAbW9kdWxlIGdsTWF0cml4XG4gKi9cblxuLy8gQ29uZmlndXJhdGlvbiBDb25zdGFudHNcbmV4cG9ydCBjb25zdCBFUFNJTE9OID0gMC4wMDAwMDE7XG5leHBvcnQgbGV0IEFSUkFZX1RZUEUgPSAodHlwZW9mIEZsb2F0MzJBcnJheSAhPT0gJ3VuZGVmaW5lZCcpID8gRmxvYXQzMkFycmF5IDogQXJyYXk7XG5leHBvcnQgY29uc3QgUkFORE9NID0gTWF0aC5yYW5kb207XG5cbi8qKlxuICogU2V0cyB0aGUgdHlwZSBvZiBhcnJheSB1c2VkIHdoZW4gY3JlYXRpbmcgbmV3IHZlY3RvcnMgYW5kIG1hdHJpY2VzXG4gKlxuICogQHBhcmFtIHtUeXBlfSB0eXBlIEFycmF5IHR5cGUsIHN1Y2ggYXMgRmxvYXQzMkFycmF5IG9yIEFycmF5XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXRNYXRyaXhBcnJheVR5cGUodHlwZSkge1xuICBBUlJBWV9UWVBFID0gdHlwZTtcbn1cblxuY29uc3QgZGVncmVlID0gTWF0aC5QSSAvIDE4MDtcblxuLyoqXG4gKiBDb252ZXJ0IERlZ3JlZSBUbyBSYWRpYW5cbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYSBBbmdsZSBpbiBEZWdyZWVzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0b1JhZGlhbihhKSB7XG4gIHJldHVybiBhICogZGVncmVlO1xufVxuXG4vKipcbiAqIFRlc3RzIHdoZXRoZXIgb3Igbm90IHRoZSBhcmd1bWVudHMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIHZhbHVlLCB3aXRoaW4gYW4gYWJzb2x1dGVcbiAqIG9yIHJlbGF0aXZlIHRvbGVyYW5jZSBvZiBnbE1hdHJpeC5FUFNJTE9OIChhbiBhYnNvbHV0ZSB0b2xlcmFuY2UgaXMgdXNlZCBmb3IgdmFsdWVzIGxlc3NcbiAqIHRoYW4gb3IgZXF1YWwgdG8gMS4wLCBhbmQgYSByZWxhdGl2ZSB0b2xlcmFuY2UgaXMgdXNlZCBmb3IgbGFyZ2VyIHZhbHVlcylcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0gYSBUaGUgZmlyc3QgbnVtYmVyIHRvIHRlc3QuXG4gKiBAcGFyYW0ge051bWJlcn0gYiBUaGUgc2Vjb25kIG51bWJlciB0byB0ZXN0LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG51bWJlcnMgYXJlIGFwcHJveGltYXRlbHkgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBNYXRoLmFicyhhIC0gYikgPD0gRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEpLCBNYXRoLmFicyhiKSk7XG59XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuLyoqXG4gKiAzeDMgTWF0cml4XG4gKiBAbW9kdWxlIG1hdDNcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0M1xuICpcbiAqIEByZXR1cm5zIHttYXQzfSBhIG5ldyAzeDMgbWF0cml4XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg5KTtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMTtcbiAgb3V0WzVdID0gMDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIHVwcGVyLWxlZnQgM3gzIHZhbHVlcyBpbnRvIHRoZSBnaXZlbiBtYXQzLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgM3gzIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhICAgdGhlIHNvdXJjZSA0eDQgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0NChvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVs0XTtcbiAgb3V0WzRdID0gYVs1XTtcbiAgb3V0WzVdID0gYVs2XTtcbiAgb3V0WzZdID0gYVs4XTtcbiAgb3V0WzddID0gYVs5XTtcbiAgb3V0WzhdID0gYVsxMF07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBtYXQzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBhIG1hdHJpeCB0byBjbG9uZVxuICogQHJldHVybnMge21hdDN9IGEgbmV3IDN4MyBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDkpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBtYXQzIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMylcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNylcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggOClcbiAqIEByZXR1cm5zIHttYXQzfSBBIG5ldyBtYXQzXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKG0wMCwgbTAxLCBtMDIsIG0xMCwgbTExLCBtMTIsIG0yMCwgbTIxLCBtMjIpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDkpO1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMTA7XG4gIG91dFs0XSA9IG0xMTtcbiAgb3V0WzVdID0gbTEyO1xuICBvdXRbNl0gPSBtMjA7XG4gIG91dFs3XSA9IG0yMTtcbiAgb3V0WzhdID0gbTIyO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIG1hdDMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge051bWJlcn0gbTAwIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDAgcG9zaXRpb24gKGluZGV4IDApXG4gKiBAcGFyYW0ge051bWJlcn0gbTAxIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDEgcG9zaXRpb24gKGluZGV4IDEpXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEwIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDAgcG9zaXRpb24gKGluZGV4IDMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDQpXG4gKiBAcGFyYW0ge051bWJlcn0gbTEyIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDIgcG9zaXRpb24gKGluZGV4IDUpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDYpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIxIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDEgcG9zaXRpb24gKGluZGV4IDcpXG4gKiBAcGFyYW0ge051bWJlcn0gbTIyIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDIgcG9zaXRpb24gKGluZGV4IDgpXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCBtMDAsIG0wMSwgbTAyLCBtMTAsIG0xMSwgbTEyLCBtMjAsIG0yMSwgbTIyKSB7XG4gIG91dFswXSA9IG0wMDtcbiAgb3V0WzFdID0gbTAxO1xuICBvdXRbMl0gPSBtMDI7XG4gIG91dFszXSA9IG0xMDtcbiAgb3V0WzRdID0gbTExO1xuICBvdXRbNV0gPSBtMTI7XG4gIG91dFs2XSA9IG0yMDtcbiAgb3V0WzddID0gbTIxO1xuICBvdXRbOF0gPSBtMjI7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IGEgbWF0MyB0byB0aGUgaWRlbnRpdHkgbWF0cml4XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGlkZW50aXR5KG91dCkge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAxO1xuICBvdXRbNV0gPSAwO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zcG9zZSB0aGUgdmFsdWVzIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zcG9zZShvdXQsIGEpIHtcbiAgLy8gSWYgd2UgYXJlIHRyYW5zcG9zaW5nIG91cnNlbHZlcyB3ZSBjYW4gc2tpcCBhIGZldyBzdGVwcyBidXQgaGF2ZSB0byBjYWNoZSBzb21lIHZhbHVlc1xuICBpZiAob3V0ID09PSBhKSB7XG4gICAgbGV0IGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGExMiA9IGFbNV07XG4gICAgb3V0WzFdID0gYVszXTtcbiAgICBvdXRbMl0gPSBhWzZdO1xuICAgIG91dFszXSA9IGEwMTtcbiAgICBvdXRbNV0gPSBhWzddO1xuICAgIG91dFs2XSA9IGEwMjtcbiAgICBvdXRbN10gPSBhMTI7XG4gIH0gZWxzZSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzNdO1xuICAgIG91dFsyXSA9IGFbNl07XG4gICAgb3V0WzNdID0gYVsxXTtcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbN107XG4gICAgb3V0WzZdID0gYVsyXTtcbiAgICBvdXRbN10gPSBhWzVdO1xuICAgIG91dFs4XSA9IGFbOF07XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEludmVydHMgYSBtYXQzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXTtcbiAgbGV0IGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV07XG4gIGxldCBhMjAgPSBhWzZdLCBhMjEgPSBhWzddLCBhMjIgPSBhWzhdO1xuXG4gIGxldCBiMDEgPSBhMjIgKiBhMTEgLSBhMTIgKiBhMjE7XG4gIGxldCBiMTEgPSAtYTIyICogYTEwICsgYTEyICogYTIwO1xuICBsZXQgYjIxID0gYTIxICogYTEwIC0gYTExICogYTIwO1xuXG4gIC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcbiAgbGV0IGRldCA9IGEwMCAqIGIwMSArIGEwMSAqIGIxMSArIGEwMiAqIGIyMTtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG4gIGRldCA9IDEuMCAvIGRldDtcblxuICBvdXRbMF0gPSBiMDEgKiBkZXQ7XG4gIG91dFsxXSA9ICgtYTIyICogYTAxICsgYTAyICogYTIxKSAqIGRldDtcbiAgb3V0WzJdID0gKGExMiAqIGEwMSAtIGEwMiAqIGExMSkgKiBkZXQ7XG4gIG91dFszXSA9IGIxMSAqIGRldDtcbiAgb3V0WzRdID0gKGEyMiAqIGEwMCAtIGEwMiAqIGEyMCkgKiBkZXQ7XG4gIG91dFs1XSA9ICgtYTEyICogYTAwICsgYTAyICogYTEwKSAqIGRldDtcbiAgb3V0WzZdID0gYjIxICogZGV0O1xuICBvdXRbN10gPSAoLWEyMSAqIGEwMCArIGEwMSAqIGEyMCkgKiBkZXQ7XG4gIG91dFs4XSA9IChhMTEgKiBhMDAgLSBhMDEgKiBhMTApICogZGV0O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGFkanVnYXRlIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkam9pbnQob3V0LCBhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdO1xuICBsZXQgYTEwID0gYVszXSwgYTExID0gYVs0XSwgYTEyID0gYVs1XTtcbiAgbGV0IGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF07XG5cbiAgb3V0WzBdID0gKGExMSAqIGEyMiAtIGExMiAqIGEyMSk7XG4gIG91dFsxXSA9IChhMDIgKiBhMjEgLSBhMDEgKiBhMjIpO1xuICBvdXRbMl0gPSAoYTAxICogYTEyIC0gYTAyICogYTExKTtcbiAgb3V0WzNdID0gKGExMiAqIGEyMCAtIGExMCAqIGEyMik7XG4gIG91dFs0XSA9IChhMDAgKiBhMjIgLSBhMDIgKiBhMjApO1xuICBvdXRbNV0gPSAoYTAyICogYTEwIC0gYTAwICogYTEyKTtcbiAgb3V0WzZdID0gKGExMCAqIGEyMSAtIGExMSAqIGEyMCk7XG4gIG91dFs3XSA9IChhMDEgKiBhMjAgLSBhMDAgKiBhMjEpO1xuICBvdXRbOF0gPSAoYTAwICogYTExIC0gYTAxICogYTEwKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl07XG4gIGxldCBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdO1xuICBsZXQgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICByZXR1cm4gYTAwICogKGEyMiAqIGExMSAtIGExMiAqIGEyMSkgKyBhMDEgKiAoLWEyMiAqIGExMCArIGExMiAqIGEyMCkgKyBhMDIgKiAoYTIxICogYTEwIC0gYTExICogYTIwKTtcbn1cblxuLyoqXG4gKiBNdWx0aXBsaWVzIHR3byBtYXQzJ3NcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl07XG4gIGxldCBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdO1xuICBsZXQgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XTtcblxuICBsZXQgYjAwID0gYlswXSwgYjAxID0gYlsxXSwgYjAyID0gYlsyXTtcbiAgbGV0IGIxMCA9IGJbM10sIGIxMSA9IGJbNF0sIGIxMiA9IGJbNV07XG4gIGxldCBiMjAgPSBiWzZdLCBiMjEgPSBiWzddLCBiMjIgPSBiWzhdO1xuXG4gIG91dFswXSA9IGIwMCAqIGEwMCArIGIwMSAqIGExMCArIGIwMiAqIGEyMDtcbiAgb3V0WzFdID0gYjAwICogYTAxICsgYjAxICogYTExICsgYjAyICogYTIxO1xuICBvdXRbMl0gPSBiMDAgKiBhMDIgKyBiMDEgKiBhMTIgKyBiMDIgKiBhMjI7XG5cbiAgb3V0WzNdID0gYjEwICogYTAwICsgYjExICogYTEwICsgYjEyICogYTIwO1xuICBvdXRbNF0gPSBiMTAgKiBhMDEgKyBiMTEgKiBhMTEgKyBiMTIgKiBhMjE7XG4gIG91dFs1XSA9IGIxMCAqIGEwMiArIGIxMSAqIGExMiArIGIxMiAqIGEyMjtcblxuICBvdXRbNl0gPSBiMjAgKiBhMDAgKyBiMjEgKiBhMTAgKyBiMjIgKiBhMjA7XG4gIG91dFs3XSA9IGIyMCAqIGEwMSArIGIyMSAqIGExMSArIGIyMiAqIGEyMTtcbiAgb3V0WzhdID0gYjIwICogYTAyICsgYjIxICogYTEyICsgYjIyICogYTIyO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zbGF0ZSBhIG1hdDMgYnkgdGhlIGdpdmVuIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcbiAqIEBwYXJhbSB7dmVjMn0gdiB2ZWN0b3IgdG8gdHJhbnNsYXRlIGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2xhdGUob3V0LCBhLCB2KSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLFxuICAgIGExMCA9IGFbM10sIGExMSA9IGFbNF0sIGExMiA9IGFbNV0sXG4gICAgYTIwID0gYVs2XSwgYTIxID0gYVs3XSwgYTIyID0gYVs4XSxcbiAgICB4ID0gdlswXSwgeSA9IHZbMV07XG5cbiAgb3V0WzBdID0gYTAwO1xuICBvdXRbMV0gPSBhMDE7XG4gIG91dFsyXSA9IGEwMjtcblxuICBvdXRbM10gPSBhMTA7XG4gIG91dFs0XSA9IGExMTtcbiAgb3V0WzVdID0gYTEyO1xuXG4gIG91dFs2XSA9IHggKiBhMDAgKyB5ICogYTEwICsgYTIwO1xuICBvdXRbN10gPSB4ICogYTAxICsgeSAqIGExMSArIGEyMTtcbiAgb3V0WzhdID0geCAqIGEwMiArIHkgKiBhMTIgKyBhMjI7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDMgYnkgdGhlIGdpdmVuIGFuZ2xlXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCkge1xuICBsZXQgYTAwID0gYVswXSwgYTAxID0gYVsxXSwgYTAyID0gYVsyXSxcbiAgICBhMTAgPSBhWzNdLCBhMTEgPSBhWzRdLCBhMTIgPSBhWzVdLFxuICAgIGEyMCA9IGFbNl0sIGEyMSA9IGFbN10sIGEyMiA9IGFbOF0sXG5cbiAgICBzID0gTWF0aC5zaW4ocmFkKSxcbiAgICBjID0gTWF0aC5jb3MocmFkKTtcblxuICBvdXRbMF0gPSBjICogYTAwICsgcyAqIGExMDtcbiAgb3V0WzFdID0gYyAqIGEwMSArIHMgKiBhMTE7XG4gIG91dFsyXSA9IGMgKiBhMDIgKyBzICogYTEyO1xuXG4gIG91dFszXSA9IGMgKiBhMTAgLSBzICogYTAwO1xuICBvdXRbNF0gPSBjICogYTExIC0gcyAqIGEwMTtcbiAgb3V0WzVdID0gYyAqIGExMiAtIHMgKiBhMDI7XG5cbiAgb3V0WzZdID0gYTIwO1xuICBvdXRbN10gPSBhMjE7XG4gIG91dFs4XSA9IGEyMjtcbiAgcmV0dXJuIG91dDtcbn07XG5cbi8qKlxuICogU2NhbGVzIHRoZSBtYXQzIGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMyXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0M30gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSB2IHRoZSB2ZWMyIHRvIHNjYWxlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIHYpIHtcbiAgbGV0IHggPSB2WzBdLCB5ID0gdlsxXTtcblxuICBvdXRbMF0gPSB4ICogYVswXTtcbiAgb3V0WzFdID0geCAqIGFbMV07XG4gIG91dFsyXSA9IHggKiBhWzJdO1xuXG4gIG91dFszXSA9IHkgKiBhWzNdO1xuICBvdXRbNF0gPSB5ICogYVs0XTtcbiAgb3V0WzVdID0geSAqIGFbNV07XG5cbiAgb3V0WzZdID0gYVs2XTtcbiAgb3V0WzddID0gYVs3XTtcbiAgb3V0WzhdID0gYVs4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3IgdHJhbnNsYXRpb25cbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQzLmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDMudHJhbnNsYXRlKGRlc3QsIGRlc3QsIHZlYyk7XG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHt2ZWMyfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVRyYW5zbGF0aW9uKG91dCwgdikge1xuICBvdXRbMF0gPSAxO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAxO1xuICBvdXRbNV0gPSAwO1xuICBvdXRbNl0gPSB2WzBdO1xuICBvdXRbN10gPSB2WzFdO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0My5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQzLnJvdGF0ZShkZXN0LCBkZXN0LCByYWQpO1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IG1hdDMgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQpIHtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpLCBjID0gTWF0aC5jb3MocmFkKTtcblxuICBvdXRbMF0gPSBjO1xuICBvdXRbMV0gPSBzO1xuICBvdXRbMl0gPSAwO1xuXG4gIG91dFszXSA9IC1zO1xuICBvdXRbNF0gPSBjO1xuICBvdXRbNV0gPSAwO1xuXG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQzLmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDMuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3ZlYzJ9IHYgU2NhbGluZyB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xuICBvdXRbMF0gPSB2WzBdO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuXG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IHZbMV07XG4gIG91dFs1XSA9IDA7XG5cbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3BpZXMgdGhlIHZhbHVlcyBmcm9tIGEgbWF0MmQgaW50byBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQyZH0gYSB0aGUgbWF0cml4IHRvIGNvcHlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tTWF0MmQob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IDA7XG5cbiAgb3V0WzNdID0gYVsyXTtcbiAgb3V0WzRdID0gYVszXTtcbiAgb3V0WzVdID0gMDtcblxuICBvdXRbNl0gPSBhWzRdO1xuICBvdXRbN10gPSBhWzVdO1xuICBvdXRbOF0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiogQ2FsY3VsYXRlcyBhIDN4MyBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gcXVhdGVybmlvblxuKlxuKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4qIEBwYXJhbSB7cXVhdH0gcSBRdWF0ZXJuaW9uIHRvIGNyZWF0ZSBtYXRyaXggZnJvbVxuKlxuKiBAcmV0dXJucyB7bWF0M30gb3V0XG4qL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xuICBsZXQgeCA9IHFbMF0sIHkgPSBxWzFdLCB6ID0gcVsyXSwgdyA9IHFbM107XG4gIGxldCB4MiA9IHggKyB4O1xuICBsZXQgeTIgPSB5ICsgeTtcbiAgbGV0IHoyID0geiArIHo7XG5cbiAgbGV0IHh4ID0geCAqIHgyO1xuICBsZXQgeXggPSB5ICogeDI7XG4gIGxldCB5eSA9IHkgKiB5MjtcbiAgbGV0IHp4ID0geiAqIHgyO1xuICBsZXQgenkgPSB6ICogeTI7XG4gIGxldCB6eiA9IHogKiB6MjtcbiAgbGV0IHd4ID0gdyAqIHgyO1xuICBsZXQgd3kgPSB3ICogeTI7XG4gIGxldCB3eiA9IHcgKiB6MjtcblxuICBvdXRbMF0gPSAxIC0geXkgLSB6ejtcbiAgb3V0WzNdID0geXggLSB3ejtcbiAgb3V0WzZdID0genggKyB3eTtcblxuICBvdXRbMV0gPSB5eCArIHd6O1xuICBvdXRbNF0gPSAxIC0geHggLSB6ejtcbiAgb3V0WzddID0genkgLSB3eDtcblxuICBvdXRbMl0gPSB6eCAtIHd5O1xuICBvdXRbNV0gPSB6eSArIHd4O1xuICBvdXRbOF0gPSAxIC0geHggLSB5eTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiogQ2FsY3VsYXRlcyBhIDN4MyBub3JtYWwgbWF0cml4ICh0cmFuc3Bvc2UgaW52ZXJzZSkgZnJvbSB0aGUgNHg0IG1hdHJpeFxuKlxuKiBAcGFyYW0ge21hdDN9IG91dCBtYXQzIHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4qIEBwYXJhbSB7bWF0NH0gYSBNYXQ0IHRvIGRlcml2ZSB0aGUgbm9ybWFsIG1hdHJpeCBmcm9tXG4qXG4qIEByZXR1cm5zIHttYXQzfSBvdXRcbiovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsRnJvbU1hdDQob3V0LCBhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICBsZXQgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gIGlmICghZGV0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICBvdXRbMV0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgb3V0WzJdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG5cbiAgb3V0WzNdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gIG91dFs0XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICBvdXRbNV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcblxuICBvdXRbNl0gPSAoYTMxICogYjA1IC0gYTMyICogYjA0ICsgYTMzICogYjAzKSAqIGRldDtcbiAgb3V0WzddID0gKGEzMiAqIGIwMiAtIGEzMCAqIGIwNSAtIGEzMyAqIGIwMSkgKiBkZXQ7XG4gIG91dFs4XSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgMkQgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQzfSBvdXQgbWF0MyBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IHdpZHRoIFdpZHRoIG9mIHlvdXIgZ2wgY29udGV4dFxuICogQHBhcmFtIHtudW1iZXJ9IGhlaWdodCBIZWlnaHQgb2YgZ2wgY29udGV4dFxuICogQHJldHVybnMge21hdDN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcHJvamVjdGlvbihvdXQsIHdpZHRoLCBoZWlnaHQpIHtcbiAgICBvdXRbMF0gPSAyIC8gd2lkdGg7XG4gICAgb3V0WzFdID0gMDtcbiAgICBvdXRbMl0gPSAwO1xuICAgIG91dFszXSA9IDA7XG4gICAgb3V0WzRdID0gLTIgLyBoZWlnaHQ7XG4gICAgb3V0WzVdID0gMDtcbiAgICBvdXRbNl0gPSAtMTtcbiAgICBvdXRbN10gPSAxO1xuICAgIG91dFs4XSA9IDE7XG4gICAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0M1xuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICdtYXQzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgK1xuICAgICAgICAgIGFbM10gKyAnLCAnICsgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArXG4gICAgICAgICAgYVs2XSArICcsICcgKyBhWzddICsgJywgJyArIGFbOF0gKyAnKSc7XG59XG5cbi8qKlxuICogUmV0dXJucyBGcm9iZW5pdXMgbm9ybSBvZiBhIG1hdDNcbiAqXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIG1hdHJpeCB0byBjYWxjdWxhdGUgRnJvYmVuaXVzIG5vcm0gb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IEZyb2Jlbml1cyBub3JtXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9iKGEpIHtcbiAgcmV0dXJuKE1hdGguc3FydChNYXRoLnBvdyhhWzBdLCAyKSArIE1hdGgucG93KGFbMV0sIDIpICsgTWF0aC5wb3coYVsyXSwgMikgKyBNYXRoLnBvdyhhWzNdLCAyKSArIE1hdGgucG93KGFbNF0sIDIpICsgTWF0aC5wb3coYVs1XSwgMikgKyBNYXRoLnBvdyhhWzZdLCAyKSArIE1hdGgucG93KGFbN10sIDIpICsgTWF0aC5wb3coYVs4XSwgMikpKVxufVxuXG4vKipcbiAqIEFkZHMgdHdvIG1hdDMnc1xuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgb3V0WzNdID0gYVszXSArIGJbM107XG4gIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xuICBvdXRbNV0gPSBhWzVdICsgYls1XTtcbiAgb3V0WzZdID0gYVs2XSArIGJbNl07XG4gIG91dFs3XSA9IGFbN10gKyBiWzddO1xuICBvdXRbOF0gPSBhWzhdICsgYls4XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgbWF0cml4IGIgZnJvbSBtYXRyaXggYVxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgb3V0WzRdID0gYVs0XSAtIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xuICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcbiAgb3V0WzddID0gYVs3XSAtIGJbN107XG4gIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xuICByZXR1cm4gb3V0O1xufVxuXG5cblxuLyoqXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cbiAqXG4gKiBAcGFyYW0ge21hdDN9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQzfSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgbWF0cml4J3MgZWxlbWVudHMgYnlcbiAqIEByZXR1cm5zIHttYXQzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5U2NhbGFyKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYjtcbiAgb3V0WzFdID0gYVsxXSAqIGI7XG4gIG91dFsyXSA9IGFbMl0gKiBiO1xuICBvdXRbM10gPSBhWzNdICogYjtcbiAgb3V0WzRdID0gYVs0XSAqIGI7XG4gIG91dFs1XSA9IGFbNV0gKiBiO1xuICBvdXRbNl0gPSBhWzZdICogYjtcbiAgb3V0WzddID0gYVs3XSAqIGI7XG4gIG91dFs4XSA9IGFbOF0gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIG1hdDMncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7bWF0M30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge21hdDN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0M30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7bWF0M30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XG4gIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcbiAgb3V0WzRdID0gYVs0XSArIChiWzRdICogc2NhbGUpO1xuICBvdXRbNV0gPSBhWzVdICsgKGJbNV0gKiBzY2FsZSk7XG4gIG91dFs2XSA9IGFbNl0gKyAoYls2XSAqIHNjYWxlKTtcbiAgb3V0WzddID0gYVs3XSArIChiWzddICogc2NhbGUpO1xuICBvdXRbOF0gPSBhWzhdICsgKGJbOF0gKiBzY2FsZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7bWF0M30gYSBUaGUgZmlyc3QgbWF0cml4LlxuICogQHBhcmFtIHttYXQzfSBiIFRoZSBzZWNvbmQgbWF0cml4LlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl0gJiZcbiAgICAgICAgIGFbM10gPT09IGJbM10gJiYgYVs0XSA9PT0gYls0XSAmJiBhWzVdID09PSBiWzVdICYmXG4gICAgICAgICBhWzZdID09PSBiWzZdICYmIGFbN10gPT09IGJbN10gJiYgYVs4XSA9PT0gYls4XTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHttYXQzfSBhIFRoZSBmaXJzdCBtYXRyaXguXG4gKiBAcGFyYW0ge21hdDN9IGIgVGhlIHNlY29uZCBtYXRyaXguXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdLCBhNCA9IGFbNF0sIGE1ID0gYVs1XSwgYTYgPSBhWzZdLCBhNyA9IGFbN10sIGE4ID0gYVs4XTtcbiAgbGV0IGIwID0gYlswXSwgYjEgPSBiWzFdLCBiMiA9IGJbMl0sIGIzID0gYlszXSwgYjQgPSBiWzRdLCBiNSA9IGJbNV0sIGI2ID0gYls2XSwgYjcgPSBiWzddLCBiOCA9IGJbOF07XG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTMgLSBiMykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE0IC0gYjQpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNSAtIGI1KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTYgLSBiNikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE3IC0gYjcpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhOCAtIGI4KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTgpLCBNYXRoLmFicyhiOCkpKTtcbn1cblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDMubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0My5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XG4iLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcblxuLyoqXG4gKiA0eDQgTWF0cml4PGJyPkZvcm1hdDogY29sdW1uLW1ham9yLCB3aGVuIHR5cGVkIG91dCBpdCBsb29rcyBsaWtlIHJvdy1tYWpvcjxicj5UaGUgbWF0cmljZXMgYXJlIGJlaW5nIHBvc3QgbXVsdGlwbGllZC5cbiAqIEBtb2R1bGUgbWF0NFxuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldyBpZGVudGl0eSBtYXQ0XG4gKlxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gMTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IDE7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDQgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgbWF0cml4IHRvIGNsb25lXG4gKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2xvbmUoYSkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMTYpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICBvdXRbOV0gPSBhWzldO1xuICBvdXRbMTBdID0gYVsxMF07XG4gIG91dFsxMV0gPSBhWzExXTtcbiAgb3V0WzEyXSA9IGFbMTJdO1xuICBvdXRbMTNdID0gYVsxM107XG4gIG91dFsxNF0gPSBhWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSBtYXQ0IHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICBvdXRbNF0gPSBhWzRdO1xuICBvdXRbNV0gPSBhWzVdO1xuICBvdXRbNl0gPSBhWzZdO1xuICBvdXRbN10gPSBhWzddO1xuICBvdXRbOF0gPSBhWzhdO1xuICBvdXRbOV0gPSBhWzldO1xuICBvdXRbMTBdID0gYVsxMF07XG4gIG91dFsxMV0gPSBhWzExXTtcbiAgb3V0WzEyXSA9IGFbMTJdO1xuICBvdXRbMTNdID0gYVsxM107XG4gIG91dFsxNF0gPSBhWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZSBhIG5ldyBtYXQ0IHdpdGggdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDMgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMylcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTMgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggNylcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggOClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggOSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTApXG4gKiBAcGFyYW0ge051bWJlcn0gbTIzIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDMgcG9zaXRpb24gKGluZGV4IDExKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMCBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAxMilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzEgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMTMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTMyIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDIgcG9zaXRpb24gKGluZGV4IDE0KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMyBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxNSlcbiAqIEByZXR1cm5zIHttYXQ0fSBBIG5ldyBtYXQ0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMTYpO1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMDM7XG4gIG91dFs0XSA9IG0xMDtcbiAgb3V0WzVdID0gbTExO1xuICBvdXRbNl0gPSBtMTI7XG4gIG91dFs3XSA9IG0xMztcbiAgb3V0WzhdID0gbTIwO1xuICBvdXRbOV0gPSBtMjE7XG4gIG91dFsxMF0gPSBtMjI7XG4gIG91dFsxMV0gPSBtMjM7XG4gIG91dFsxMl0gPSBtMzA7XG4gIG91dFsxM10gPSBtMzE7XG4gIG91dFsxNF0gPSBtMzI7XG4gIG91dFsxNV0gPSBtMzM7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0NCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDEgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDIgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDMgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMylcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTAgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggNClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTEgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggNSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTMgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggNylcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjAgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggOClcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggOSlcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjIgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggMTApXG4gKiBAcGFyYW0ge051bWJlcn0gbTIzIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDMgcG9zaXRpb24gKGluZGV4IDExKVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMCBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAxMilcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMzEgQ29tcG9uZW50IGluIGNvbHVtbiAzLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggMTMpXG4gKiBAcGFyYW0ge051bWJlcn0gbTMyIENvbXBvbmVudCBpbiBjb2x1bW4gMywgcm93IDIgcG9zaXRpb24gKGluZGV4IDE0KVxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMyBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxNSlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMDM7XG4gIG91dFs0XSA9IG0xMDtcbiAgb3V0WzVdID0gbTExO1xuICBvdXRbNl0gPSBtMTI7XG4gIG91dFs3XSA9IG0xMztcbiAgb3V0WzhdID0gbTIwO1xuICBvdXRbOV0gPSBtMjE7XG4gIG91dFsxMF0gPSBtMjI7XG4gIG91dFsxMV0gPSBtMjM7XG4gIG91dFsxMl0gPSBtMzA7XG4gIG91dFsxM10gPSBtMzE7XG4gIG91dFsxNF0gPSBtMzI7XG4gIG91dFsxNV0gPSBtMzM7XG4gIHJldHVybiBvdXQ7XG59XG5cblxuLyoqXG4gKiBTZXQgYSBtYXQ0IHRvIHRoZSBpZGVudGl0eSBtYXRyaXhcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDE7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAxO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNwb3NlIHRoZSB2YWx1ZXMgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNwb3NlKG91dCwgYSkge1xuICAvLyBJZiB3ZSBhcmUgdHJhbnNwb3Npbmcgb3Vyc2VsdmVzIHdlIGNhbiBza2lwIGEgZmV3IHN0ZXBzIGJ1dCBoYXZlIHRvIGNhY2hlIHNvbWUgdmFsdWVzXG4gIGlmIChvdXQgPT09IGEpIHtcbiAgICBsZXQgYTAxID0gYVsxXSwgYTAyID0gYVsyXSwgYTAzID0gYVszXTtcbiAgICBsZXQgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgICBsZXQgYTIzID0gYVsxMV07XG5cbiAgICBvdXRbMV0gPSBhWzRdO1xuICAgIG91dFsyXSA9IGFbOF07XG4gICAgb3V0WzNdID0gYVsxMl07XG4gICAgb3V0WzRdID0gYTAxO1xuICAgIG91dFs2XSA9IGFbOV07XG4gICAgb3V0WzddID0gYVsxM107XG4gICAgb3V0WzhdID0gYTAyO1xuICAgIG91dFs5XSA9IGExMjtcbiAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgb3V0WzEyXSA9IGEwMztcbiAgICBvdXRbMTNdID0gYTEzO1xuICAgIG91dFsxNF0gPSBhMjM7XG4gIH0gZWxzZSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzRdO1xuICAgIG91dFsyXSA9IGFbOF07XG4gICAgb3V0WzNdID0gYVsxMl07XG4gICAgb3V0WzRdID0gYVsxXTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbOV07XG4gICAgb3V0WzddID0gYVsxM107XG4gICAgb3V0WzhdID0gYVsyXTtcbiAgICBvdXRbOV0gPSBhWzZdO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgb3V0WzEyXSA9IGFbM107XG4gICAgb3V0WzEzXSA9IGFbN107XG4gICAgb3V0WzE0XSA9IGFbMTFdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogSW52ZXJ0cyBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gIGxldCBhMDAgPSBhWzBdLCBhMDEgPSBhWzFdLCBhMDIgPSBhWzJdLCBhMDMgPSBhWzNdO1xuICBsZXQgYTEwID0gYVs0XSwgYTExID0gYVs1XSwgYTEyID0gYVs2XSwgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF0sIGEyMSA9IGFbOV0sIGEyMiA9IGFbMTBdLCBhMjMgPSBhWzExXTtcbiAgbGV0IGEzMCA9IGFbMTJdLCBhMzEgPSBhWzEzXSwgYTMyID0gYVsxNF0sIGEzMyA9IGFbMTVdO1xuXG4gIGxldCBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gIGxldCBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gIGxldCBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gIGxldCBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gIGxldCBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gIGxldCBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gIGxldCBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gIGxldCBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gIGxldCBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gIGxldCBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gIGxldCBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gIGxldCBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7XG5cbiAgLy8gQ2FsY3VsYXRlIHRoZSBkZXRlcm1pbmFudFxuICBsZXQgZGV0ID0gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xuXG4gIGlmICghZGV0KSB7XG4gICAgcmV0dXJuIG51bGw7XG4gIH1cbiAgZGV0ID0gMS4wIC8gZGV0O1xuXG4gIG91dFswXSA9IChhMTEgKiBiMTEgLSBhMTIgKiBiMTAgKyBhMTMgKiBiMDkpICogZGV0O1xuICBvdXRbMV0gPSAoYTAyICogYjEwIC0gYTAxICogYjExIC0gYTAzICogYjA5KSAqIGRldDtcbiAgb3V0WzJdID0gKGEzMSAqIGIwNSAtIGEzMiAqIGIwNCArIGEzMyAqIGIwMykgKiBkZXQ7XG4gIG91dFszXSA9IChhMjIgKiBiMDQgLSBhMjEgKiBiMDUgLSBhMjMgKiBiMDMpICogZGV0O1xuICBvdXRbNF0gPSAoYTEyICogYjA4IC0gYTEwICogYjExIC0gYTEzICogYjA3KSAqIGRldDtcbiAgb3V0WzVdID0gKGEwMCAqIGIxMSAtIGEwMiAqIGIwOCArIGEwMyAqIGIwNykgKiBkZXQ7XG4gIG91dFs2XSA9IChhMzIgKiBiMDIgLSBhMzAgKiBiMDUgLSBhMzMgKiBiMDEpICogZGV0O1xuICBvdXRbN10gPSAoYTIwICogYjA1IC0gYTIyICogYjAyICsgYTIzICogYjAxKSAqIGRldDtcbiAgb3V0WzhdID0gKGExMCAqIGIxMCAtIGExMSAqIGIwOCArIGExMyAqIGIwNikgKiBkZXQ7XG4gIG91dFs5XSA9IChhMDEgKiBiMDggLSBhMDAgKiBiMTAgLSBhMDMgKiBiMDYpICogZGV0O1xuICBvdXRbMTBdID0gKGEzMCAqIGIwNCAtIGEzMSAqIGIwMiArIGEzMyAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxMV0gPSAoYTIxICogYjAyIC0gYTIwICogYjA0IC0gYTIzICogYjAwKSAqIGRldDtcbiAgb3V0WzEyXSA9IChhMTEgKiBiMDcgLSBhMTAgKiBiMDkgLSBhMTIgKiBiMDYpICogZGV0O1xuICBvdXRbMTNdID0gKGEwMCAqIGIwOSAtIGEwMSAqIGIwNyArIGEwMiAqIGIwNikgKiBkZXQ7XG4gIG91dFsxNF0gPSAoYTMxICogYjAxIC0gYTMwICogYjAzIC0gYTMyICogYjAwKSAqIGRldDtcbiAgb3V0WzE1XSA9IChhMjAgKiBiMDMgLSBhMjEgKiBiMDEgKyBhMjIgKiBiMDApICogZGV0O1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgYWRqdWdhdGUgb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgc291cmNlIG1hdHJpeFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRqb2ludChvdXQsIGEpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XG4gIGxldCBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddO1xuICBsZXQgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdO1xuICBsZXQgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XG5cbiAgb3V0WzBdICA9ICAoYTExICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgb3V0WzFdICA9IC0oYTAxICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgb3V0WzJdICA9ICAoYTAxICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTEgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgb3V0WzNdICA9IC0oYTAxICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMSAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgb3V0WzRdICA9IC0oYTEwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMCAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpKTtcbiAgb3V0WzVdICA9ICAoYTAwICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpKTtcbiAgb3V0WzZdICA9IC0oYTAwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgLSBhMTAgKiAoYTAyICogYTMzIC0gYTAzICogYTMyKSArIGEzMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgb3V0WzddICA9ICAoYTAwICogKGExMiAqIGEyMyAtIGExMyAqIGEyMikgLSBhMTAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSArIGEyMCAqIChhMDIgKiBhMTMgLSBhMDMgKiBhMTIpKTtcbiAgb3V0WzhdICA9ICAoYTEwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMzIC0gYTEzICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjMgLSBhMTMgKiBhMjEpKTtcbiAgb3V0WzldICA9IC0oYTAwICogKGEyMSAqIGEzMyAtIGEyMyAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpKTtcbiAgb3V0WzEwXSA9ICAoYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgb3V0WzExXSA9IC0oYTAwICogKGExMSAqIGEyMyAtIGExMyAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIzIC0gYTAzICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpKTtcbiAgb3V0WzEyXSA9IC0oYTEwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSArIGEzMCAqIChhMTEgKiBhMjIgLSBhMTIgKiBhMjEpKTtcbiAgb3V0WzEzXSA9ICAoYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpKTtcbiAgb3V0WzE0XSA9IC0oYTAwICogKGExMSAqIGEzMiAtIGExMiAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpKTtcbiAgb3V0WzE1XSA9ICAoYTAwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBkZXRlcm1pbmFudCBvZiBhIG1hdDRcbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRldGVybWluYW50IG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XG4gIGxldCBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddO1xuICBsZXQgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdO1xuICBsZXQgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XG5cbiAgbGV0IGIwMCA9IGEwMCAqIGExMSAtIGEwMSAqIGExMDtcbiAgbGV0IGIwMSA9IGEwMCAqIGExMiAtIGEwMiAqIGExMDtcbiAgbGV0IGIwMiA9IGEwMCAqIGExMyAtIGEwMyAqIGExMDtcbiAgbGV0IGIwMyA9IGEwMSAqIGExMiAtIGEwMiAqIGExMTtcbiAgbGV0IGIwNCA9IGEwMSAqIGExMyAtIGEwMyAqIGExMTtcbiAgbGV0IGIwNSA9IGEwMiAqIGExMyAtIGEwMyAqIGExMjtcbiAgbGV0IGIwNiA9IGEyMCAqIGEzMSAtIGEyMSAqIGEzMDtcbiAgbGV0IGIwNyA9IGEyMCAqIGEzMiAtIGEyMiAqIGEzMDtcbiAgbGV0IGIwOCA9IGEyMCAqIGEzMyAtIGEyMyAqIGEzMDtcbiAgbGV0IGIwOSA9IGEyMSAqIGEzMiAtIGEyMiAqIGEzMTtcbiAgbGV0IGIxMCA9IGEyMSAqIGEzMyAtIGEyMyAqIGEzMTtcbiAgbGV0IGIxMSA9IGEyMiAqIGEzMyAtIGEyMyAqIGEzMjtcblxuICAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG4gIHJldHVybiBiMDAgKiBiMTEgLSBiMDEgKiBiMTAgKyBiMDIgKiBiMDkgKyBiMDMgKiBiMDggLSBiMDQgKiBiMDcgKyBiMDUgKiBiMDY7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gbWF0NHNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgbGV0IGEwMCA9IGFbMF0sIGEwMSA9IGFbMV0sIGEwMiA9IGFbMl0sIGEwMyA9IGFbM107XG4gIGxldCBhMTAgPSBhWzRdLCBhMTEgPSBhWzVdLCBhMTIgPSBhWzZdLCBhMTMgPSBhWzddO1xuICBsZXQgYTIwID0gYVs4XSwgYTIxID0gYVs5XSwgYTIyID0gYVsxMF0sIGEyMyA9IGFbMTFdO1xuICBsZXQgYTMwID0gYVsxMl0sIGEzMSA9IGFbMTNdLCBhMzIgPSBhWzE0XSwgYTMzID0gYVsxNV07XG5cbiAgLy8gQ2FjaGUgb25seSB0aGUgY3VycmVudCBsaW5lIG9mIHRoZSBzZWNvbmQgbWF0cml4XG4gIGxldCBiMCAgPSBiWzBdLCBiMSA9IGJbMV0sIGIyID0gYlsyXSwgYjMgPSBiWzNdO1xuICBvdXRbMF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gIG91dFsxXSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgb3V0WzJdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICBvdXRbM10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgYjAgPSBiWzRdOyBiMSA9IGJbNV07IGIyID0gYls2XTsgYjMgPSBiWzddO1xuICBvdXRbNF0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gIG91dFs1XSA9IGIwKmEwMSArIGIxKmExMSArIGIyKmEyMSArIGIzKmEzMTtcbiAgb3V0WzZdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICBvdXRbN10gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG5cbiAgYjAgPSBiWzhdOyBiMSA9IGJbOV07IGIyID0gYlsxMF07IGIzID0gYlsxMV07XG4gIG91dFs4XSA9IGIwKmEwMCArIGIxKmExMCArIGIyKmEyMCArIGIzKmEzMDtcbiAgb3V0WzldID0gYjAqYTAxICsgYjEqYTExICsgYjIqYTIxICsgYjMqYTMxO1xuICBvdXRbMTBdID0gYjAqYTAyICsgYjEqYTEyICsgYjIqYTIyICsgYjMqYTMyO1xuICBvdXRbMTFdID0gYjAqYTAzICsgYjEqYTEzICsgYjIqYTIzICsgYjMqYTMzO1xuXG4gIGIwID0gYlsxMl07IGIxID0gYlsxM107IGIyID0gYlsxNF07IGIzID0gYlsxNV07XG4gIG91dFsxMl0gPSBiMCphMDAgKyBiMSphMTAgKyBiMiphMjAgKyBiMyphMzA7XG4gIG91dFsxM10gPSBiMCphMDEgKyBiMSphMTEgKyBiMiphMjEgKyBiMyphMzE7XG4gIG91dFsxNF0gPSBiMCphMDIgKyBiMSphMTIgKyBiMiphMjIgKyBiMyphMzI7XG4gIG91dFsxNV0gPSBiMCphMDMgKyBiMSphMTMgKyBiMiphMjMgKyBiMyphMzM7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNsYXRlIGEgbWF0NCBieSB0aGUgZ2l2ZW4gdmVjdG9yXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHRyYW5zbGF0ZVxuICogQHBhcmFtIHt2ZWMzfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcbiAgbGV0IHggPSB2WzBdLCB5ID0gdlsxXSwgeiA9IHZbMl07XG4gIGxldCBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gIGxldCBhMTAsIGExMSwgYTEyLCBhMTM7XG4gIGxldCBhMjAsIGEyMSwgYTIyLCBhMjM7XG5cbiAgaWYgKGEgPT09IG91dCkge1xuICAgIG91dFsxMl0gPSBhWzBdICogeCArIGFbNF0gKiB5ICsgYVs4XSAqIHogKyBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxXSAqIHggKyBhWzVdICogeSArIGFbOV0gKiB6ICsgYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMl0gKiB4ICsgYVs2XSAqIHkgKyBhWzEwXSAqIHogKyBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVszXSAqIHggKyBhWzddICogeSArIGFbMTFdICogeiArIGFbMTVdO1xuICB9IGVsc2Uge1xuICAgIGEwMCA9IGFbMF07IGEwMSA9IGFbMV07IGEwMiA9IGFbMl07IGEwMyA9IGFbM107XG4gICAgYTEwID0gYVs0XTsgYTExID0gYVs1XTsgYTEyID0gYVs2XTsgYTEzID0gYVs3XTtcbiAgICBhMjAgPSBhWzhdOyBhMjEgPSBhWzldOyBhMjIgPSBhWzEwXTsgYTIzID0gYVsxMV07XG5cbiAgICBvdXRbMF0gPSBhMDA7IG91dFsxXSA9IGEwMTsgb3V0WzJdID0gYTAyOyBvdXRbM10gPSBhMDM7XG4gICAgb3V0WzRdID0gYTEwOyBvdXRbNV0gPSBhMTE7IG91dFs2XSA9IGExMjsgb3V0WzddID0gYTEzO1xuICAgIG91dFs4XSA9IGEyMDsgb3V0WzldID0gYTIxOyBvdXRbMTBdID0gYTIyOyBvdXRbMTFdID0gYTIzO1xuXG4gICAgb3V0WzEyXSA9IGEwMCAqIHggKyBhMTAgKiB5ICsgYTIwICogeiArIGFbMTJdO1xuICAgIG91dFsxM10gPSBhMDEgKiB4ICsgYTExICogeSArIGEyMSAqIHogKyBhWzEzXTtcbiAgICBvdXRbMTRdID0gYTAyICogeCArIGExMiAqIHkgKyBhMjIgKiB6ICsgYVsxNF07XG4gICAgb3V0WzE1XSA9IGEwMyAqIHggKyBhMTMgKiB5ICsgYTIzICogeiArIGFbMTVdO1xuICB9XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTY2FsZXMgdGhlIG1hdDQgYnkgdGhlIGRpbWVuc2lvbnMgaW4gdGhlIGdpdmVuIHZlYzMgbm90IHVzaW5nIHZlY3Rvcml6YXRpb25cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcbiAqIEBwYXJhbSB7dmVjM30gdiB0aGUgdmVjMyB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKiovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gIGxldCB4ID0gdlswXSwgeSA9IHZbMV0sIHogPSB2WzJdO1xuXG4gIG91dFswXSA9IGFbMF0gKiB4O1xuICBvdXRbMV0gPSBhWzFdICogeDtcbiAgb3V0WzJdID0gYVsyXSAqIHg7XG4gIG91dFszXSA9IGFbM10gKiB4O1xuICBvdXRbNF0gPSBhWzRdICogeTtcbiAgb3V0WzVdID0gYVs1XSAqIHk7XG4gIG91dFs2XSA9IGFbNl0gKiB5O1xuICBvdXRbN10gPSBhWzddICogeTtcbiAgb3V0WzhdID0gYVs4XSAqIHo7XG4gIG91dFs5XSA9IGFbOV0gKiB6O1xuICBvdXRbMTBdID0gYVsxMF0gKiB6O1xuICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICBvdXRbMTJdID0gYVsxMl07XG4gIG91dFsxM10gPSBhWzEzXTtcbiAgb3V0WzE0XSA9IGFbMTRdO1xuICBvdXRbMTVdID0gYVsxNV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgdG8gcm90YXRlIGFyb3VuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlKG91dCwgYSwgcmFkLCBheGlzKSB7XG4gIGxldCB4ID0gYXhpc1swXSwgeSA9IGF4aXNbMV0sIHogPSBheGlzWzJdO1xuICBsZXQgbGVuID0gTWF0aC5zcXJ0KHggKiB4ICsgeSAqIHkgKyB6ICogeik7XG4gIGxldCBzLCBjLCB0O1xuICBsZXQgYTAwLCBhMDEsIGEwMiwgYTAzO1xuICBsZXQgYTEwLCBhMTEsIGExMiwgYTEzO1xuICBsZXQgYTIwLCBhMjEsIGEyMiwgYTIzO1xuICBsZXQgYjAwLCBiMDEsIGIwMjtcbiAgbGV0IGIxMCwgYjExLCBiMTI7XG4gIGxldCBiMjAsIGIyMSwgYjIyO1xuXG4gIGlmIChsZW4gPCBnbE1hdHJpeC5FUFNJTE9OKSB7IHJldHVybiBudWxsOyB9XG5cbiAgbGVuID0gMSAvIGxlbjtcbiAgeCAqPSBsZW47XG4gIHkgKj0gbGVuO1xuICB6ICo9IGxlbjtcblxuICBzID0gTWF0aC5zaW4ocmFkKTtcbiAgYyA9IE1hdGguY29zKHJhZCk7XG4gIHQgPSAxIC0gYztcblxuICBhMDAgPSBhWzBdOyBhMDEgPSBhWzFdOyBhMDIgPSBhWzJdOyBhMDMgPSBhWzNdO1xuICBhMTAgPSBhWzRdOyBhMTEgPSBhWzVdOyBhMTIgPSBhWzZdOyBhMTMgPSBhWzddO1xuICBhMjAgPSBhWzhdOyBhMjEgPSBhWzldOyBhMjIgPSBhWzEwXTsgYTIzID0gYVsxMV07XG5cbiAgLy8gQ29uc3RydWN0IHRoZSBlbGVtZW50cyBvZiB0aGUgcm90YXRpb24gbWF0cml4XG4gIGIwMCA9IHggKiB4ICogdCArIGM7IGIwMSA9IHkgKiB4ICogdCArIHogKiBzOyBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgYjEwID0geCAqIHkgKiB0IC0geiAqIHM7IGIxMSA9IHkgKiB5ICogdCArIGM7IGIxMiA9IHogKiB5ICogdCArIHggKiBzO1xuICBiMjAgPSB4ICogeiAqIHQgKyB5ICogczsgYjIxID0geSAqIHogKiB0IC0geCAqIHM7IGIyMiA9IHogKiB6ICogdCArIGM7XG5cbiAgLy8gUGVyZm9ybSByb3RhdGlvbi1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICBvdXRbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XG4gIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgb3V0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xuICBvdXRbNF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XG4gIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgb3V0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICBvdXRbN10gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XG4gIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgb3V0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICBvdXRbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xuICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgbGV0IGMgPSBNYXRoLmNvcyhyYWQpO1xuICBsZXQgYTEwID0gYVs0XTtcbiAgbGV0IGExMSA9IGFbNV07XG4gIGxldCBhMTIgPSBhWzZdO1xuICBsZXQgYTEzID0gYVs3XTtcbiAgbGV0IGEyMCA9IGFbOF07XG4gIGxldCBhMjEgPSBhWzldO1xuICBsZXQgYTIyID0gYVsxMF07XG4gIGxldCBhMjMgPSBhWzExXTtcblxuICBpZiAoYSAhPT0gb3V0KSB7IC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICBvdXRbMF0gID0gYVswXTtcbiAgICBvdXRbMV0gID0gYVsxXTtcbiAgICBvdXRbMl0gID0gYVsyXTtcbiAgICBvdXRbM10gID0gYVszXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH1cblxuICAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICBvdXRbNV0gPSBhMTEgKiBjICsgYTIxICogcztcbiAgb3V0WzZdID0gYTEyICogYyArIGEyMiAqIHM7XG4gIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICBvdXRbOF0gPSBhMjAgKiBjIC0gYTEwICogcztcbiAgb3V0WzldID0gYTIxICogYyAtIGExMSAqIHM7XG4gIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgb3V0WzExXSA9IGEyMyAqIGMgLSBhMTMgKiBzO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCByYWQpIHtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XG4gIGxldCBhMDAgPSBhWzBdO1xuICBsZXQgYTAxID0gYVsxXTtcbiAgbGV0IGEwMiA9IGFbMl07XG4gIGxldCBhMDMgPSBhWzNdO1xuICBsZXQgYTIwID0gYVs4XTtcbiAgbGV0IGEyMSA9IGFbOV07XG4gIGxldCBhMjIgPSBhWzEwXTtcbiAgbGV0IGEyMyA9IGFbMTFdO1xuXG4gIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xuICAgIG91dFs0XSAgPSBhWzRdO1xuICAgIG91dFs1XSAgPSBhWzVdO1xuICAgIG91dFs2XSAgPSBhWzZdO1xuICAgIG91dFs3XSAgPSBhWzddO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfVxuXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdID0gYTAwICogYyAtIGEyMCAqIHM7XG4gIG91dFsxXSA9IGEwMSAqIGMgLSBhMjEgKiBzO1xuICBvdXRbMl0gPSBhMDIgKiBjIC0gYTIyICogcztcbiAgb3V0WzNdID0gYTAzICogYyAtIGEyMyAqIHM7XG4gIG91dFs4XSA9IGEwMCAqIHMgKyBhMjAgKiBjO1xuICBvdXRbOV0gPSBhMDEgKiBzICsgYTIxICogYztcbiAgb3V0WzEwXSA9IGEwMiAqIHMgKyBhMjIgKiBjO1xuICBvdXRbMTFdID0gYTAzICogcyArIGEyMyAqIGM7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBaIGF4aXNcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWihvdXQsIGEsIHJhZCkge1xuICBsZXQgcyA9IE1hdGguc2luKHJhZCk7XG4gIGxldCBjID0gTWF0aC5jb3MocmFkKTtcbiAgbGV0IGEwMCA9IGFbMF07XG4gIGxldCBhMDEgPSBhWzFdO1xuICBsZXQgYTAyID0gYVsyXTtcbiAgbGV0IGEwMyA9IGFbM107XG4gIGxldCBhMTAgPSBhWzRdO1xuICBsZXQgYTExID0gYVs1XTtcbiAgbGV0IGExMiA9IGFbNl07XG4gIGxldCBhMTMgPSBhWzddO1xuXG4gIGlmIChhICE9PSBvdXQpIHsgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICBvdXRbOF0gID0gYVs4XTtcbiAgICBvdXRbOV0gID0gYVs5XTtcbiAgICBvdXRbMTBdID0gYVsxMF07XG4gICAgb3V0WzExXSA9IGFbMTFdO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfVxuXG4gIC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cbiAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gIG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzO1xuICBvdXRbMl0gPSBhMDIgKiBjICsgYTEyICogcztcbiAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gIG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzO1xuICBvdXRbNV0gPSBhMTEgKiBjIC0gYTAxICogcztcbiAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gIG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgZGVzdCwgdmVjKTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVHJhbnNsYXRpb24ob3V0LCB2KSB7XG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDE7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAxO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF07XG4gIG91dFsxM10gPSB2WzFdO1xuICBvdXRbMTRdID0gdlsyXTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgdmVjdG9yIHNjYWxpbmdcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQuc2NhbGUoZGVzdCwgZGVzdCwgdmVjKTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3ZlYzN9IHYgU2NhbGluZyB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21TY2FsaW5nKG91dCwgdikge1xuICBvdXRbMF0gPSB2WzBdO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSB2WzFdO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAwO1xuICBvdXRbOV0gPSAwO1xuICBvdXRbMTBdID0gdlsyXTtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIGdpdmVuIGFuZ2xlIGFyb3VuZCBhIGdpdmVuIGF4aXNcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxuICpcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xuICogICAgIG1hdDQucm90YXRlKGRlc3QsIGRlc3QsIHJhZCwgYXhpcyk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEBwYXJhbSB7dmVjM30gYXhpcyB0aGUgYXhpcyB0byByb3RhdGUgYXJvdW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb24ob3V0LCByYWQsIGF4aXMpIHtcbiAgbGV0IHggPSBheGlzWzBdLCB5ID0gYXhpc1sxXSwgeiA9IGF4aXNbMl07XG4gIGxldCBsZW4gPSBNYXRoLnNxcnQoeCAqIHggKyB5ICogeSArIHogKiB6KTtcbiAgbGV0IHMsIGMsIHQ7XG5cbiAgaWYgKGxlbiA8IGdsTWF0cml4LkVQU0lMT04pIHsgcmV0dXJuIG51bGw7IH1cblxuICBsZW4gPSAxIC8gbGVuO1xuICB4ICo9IGxlbjtcbiAgeSAqPSBsZW47XG4gIHogKj0gbGVuO1xuXG4gIHMgPSBNYXRoLnNpbihyYWQpO1xuICBjID0gTWF0aC5jb3MocmFkKTtcbiAgdCA9IDEgLSBjO1xuXG4gIC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG4gIG91dFswXSA9IHggKiB4ICogdCArIGM7XG4gIG91dFsxXSA9IHkgKiB4ICogdCArIHogKiBzO1xuICBvdXRbMl0gPSB6ICogeCAqIHQgLSB5ICogcztcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0geCAqIHkgKiB0IC0geiAqIHM7XG4gIG91dFs1XSA9IHkgKiB5ICogdCArIGM7XG4gIG91dFs2XSA9IHogKiB5ICogdCArIHggKiBzO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSB4ICogeiAqIHQgKyB5ICogcztcbiAgb3V0WzldID0geSAqIHogKiB0IC0geCAqIHM7XG4gIG91dFsxMF0gPSB6ICogeiAqIHQgKyBjO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC5yb3RhdGVYKGRlc3QsIGRlc3QsIHJhZCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21YUm90YXRpb24ob3V0LCByYWQpIHtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICBvdXRbMF0gID0gMTtcbiAgb3V0WzFdICA9IDA7XG4gIG91dFsyXSAgPSAwO1xuICBvdXRbM10gID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gYztcbiAgb3V0WzZdID0gcztcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gLXM7XG4gIG91dFsxMF0gPSBjO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFkgYXhpc1xuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC5yb3RhdGVZKGRlc3QsIGRlc3QsIHJhZCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21ZUm90YXRpb24ob3V0LCByYWQpIHtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICBvdXRbMF0gID0gYztcbiAgb3V0WzFdICA9IDA7XG4gIG91dFsyXSAgPSAtcztcbiAgb3V0WzNdICA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IDE7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IHM7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSBjO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC5yb3RhdGVaKGRlc3QsIGRlc3QsIHJhZCk7XG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21aUm90YXRpb24ob3V0LCByYWQpIHtcbiAgbGV0IHMgPSBNYXRoLnNpbihyYWQpO1xuICBsZXQgYyA9IE1hdGguY29zKHJhZCk7XG5cbiAgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuICBvdXRbMF0gID0gYztcbiAgb3V0WzFdICA9IHM7XG4gIG91dFsyXSAgPSAwO1xuICBvdXRbM10gID0gMDtcbiAgb3V0WzRdID0gLXM7XG4gIG91dFs1XSA9IGM7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAxO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uKG91dCwgcSwgdikge1xuICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xuICBsZXQgeDIgPSB4ICsgeDtcbiAgbGV0IHkyID0geSArIHk7XG4gIGxldCB6MiA9IHogKyB6O1xuXG4gIGxldCB4eCA9IHggKiB4MjtcbiAgbGV0IHh5ID0geCAqIHkyO1xuICBsZXQgeHogPSB4ICogejI7XG4gIGxldCB5eSA9IHkgKiB5MjtcbiAgbGV0IHl6ID0geSAqIHoyO1xuICBsZXQgenogPSB6ICogejI7XG4gIGxldCB3eCA9IHcgKiB4MjtcbiAgbGV0IHd5ID0gdyAqIHkyO1xuICBsZXQgd3ogPSB3ICogejI7XG5cbiAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcbiAgb3V0WzFdID0geHkgKyB3ejtcbiAgb3V0WzJdID0geHogLSB3eTtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0geHkgLSB3ejtcbiAgb3V0WzVdID0gMSAtICh4eCArIHp6KTtcbiAgb3V0WzZdID0geXogKyB3eDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geHogKyB3eTtcbiAgb3V0WzldID0geXogLSB3eDtcbiAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXTtcbiAgb3V0WzEzXSA9IHZbMV07XG4gIG91dFsxNF0gPSB2WzJdO1xuICBvdXRbMTVdID0gMTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgbWF0NCBmcm9tIGEgZHVhbCBxdWF0LlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IE1hdHJpeFxuICogQHBhcmFtIHtxdWF0Mn0gYSBEdWFsIFF1YXRlcm5pb25cbiAqIEByZXR1cm5zIHttYXQ0fSBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdDIob3V0LCBhKSB7XG4gIGxldCB0cmFuc2xhdGlvbiA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xuICBsZXQgYnggPSAtYVswXSwgYnkgPSAtYVsxXSwgYnogPSAtYVsyXSwgYncgPSBhWzNdLFxuICBheCA9IGFbNF0sIGF5ID0gYVs1XSwgYXogPSBhWzZdLCBhdyA9IGFbN107XG5cbiAgbGV0IG1hZ25pdHVkZSA9IGJ4ICogYnggKyBieSAqIGJ5ICsgYnogKiBieiArIGJ3ICogYnc7XG4gIC8vT25seSBzY2FsZSBpZiBpdCBtYWtlcyBzZW5zZVxuICBpZiAobWFnbml0dWRlID4gMCkge1xuICAgIHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMiAvIG1hZ25pdHVkZTtcbiAgICB0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDIgLyBtYWduaXR1ZGU7XG4gICAgdHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyIC8gbWFnbml0dWRlO1xuICB9IGVsc2Uge1xuICAgIHRyYW5zbGF0aW9uWzBdID0gKGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnkpICogMjtcbiAgICB0cmFuc2xhdGlvblsxXSA9IChheSAqIGJ3ICsgYXcgKiBieSArIGF6ICogYnggLSBheCAqIGJ6KSAqIDI7XG4gICAgdHJhbnNsYXRpb25bMl0gPSAoYXogKiBidyArIGF3ICogYnogKyBheCAqIGJ5IC0gYXkgKiBieCkgKiAyO1xuICB9XG4gIGZyb21Sb3RhdGlvblRyYW5zbGF0aW9uKG91dCwgYSwgdHJhbnNsYXRpb24pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvciBjb21wb25lbnQgb2YgYSB0cmFuc2Zvcm1hdGlvblxuICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcbiAqICB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmUgdGhlIHNhbWUgYXMgdGhlIHRyYW5zbGF0aW9uIHZlY3RvclxuICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgdHJhbnNsYXRpb24gY29tcG9uZW50XG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRUcmFuc2xhdGlvbihvdXQsIG1hdCkge1xuICBvdXRbMF0gPSBtYXRbMTJdO1xuICBvdXRbMV0gPSBtYXRbMTNdO1xuICBvdXRbMl0gPSBtYXRbMTRdO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cbiAqICBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGggZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZVxuICogIHdpdGggYSBub3JtYWxpemVkIFF1YXRlcm5pb24gcGFyYW10ZXIsIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZVxuICogIHRoZSBzYW1lIGFzIHRoZSBzY2FsaW5nIHZlY3RvclxuICogIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50XG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY2FsaW5nKG91dCwgbWF0KSB7XG4gIGxldCBtMTEgPSBtYXRbMF07XG4gIGxldCBtMTIgPSBtYXRbMV07XG4gIGxldCBtMTMgPSBtYXRbMl07XG4gIGxldCBtMjEgPSBtYXRbNF07XG4gIGxldCBtMjIgPSBtYXRbNV07XG4gIGxldCBtMjMgPSBtYXRbNl07XG4gIGxldCBtMzEgPSBtYXRbOF07XG4gIGxldCBtMzIgPSBtYXRbOV07XG4gIGxldCBtMzMgPSBtYXRbMTBdO1xuXG4gIG91dFswXSA9IE1hdGguc3FydChtMTEgKiBtMTEgKyBtMTIgKiBtMTIgKyBtMTMgKiBtMTMpO1xuICBvdXRbMV0gPSBNYXRoLnNxcnQobTIxICogbTIxICsgbTIyICogbTIyICsgbTIzICogbTIzKTtcbiAgb3V0WzJdID0gTWF0aC5zcXJ0KG0zMSAqIG0zMSArIG0zMiAqIG0zMiArIG0zMyAqIG0zMyk7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgcXVhdGVybmlvbiByZXByZXNlbnRpbmcgdGhlIHJvdGF0aW9uYWwgY29tcG9uZW50XG4gKiAgb2YgYSB0cmFuc2Zvcm1hdGlvbiBtYXRyaXguIElmIGEgbWF0cml4IGlzIGJ1aWx0IHdpdGhcbiAqICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbiwgdGhlIHJldHVybmVkIHF1YXRlcm5pb24gd2lsbCBiZSB0aGVcbiAqICBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIG9yaWdpbmFsbHkgc3VwcGxpZWQuXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBRdWF0ZXJuaW9uIHRvIHJlY2VpdmUgdGhlIHJvdGF0aW9uIGNvbXBvbmVudFxuICogQHBhcmFtIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxuICogQHJldHVybiB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3RhdGlvbihvdXQsIG1hdCkge1xuICAvLyBBbGdvcml0aG0gdGFrZW4gZnJvbSBodHRwOi8vd3d3LmV1Y2xpZGVhbnNwYWNlLmNvbS9tYXRocy9nZW9tZXRyeS9yb3RhdGlvbnMvY29udmVyc2lvbnMvbWF0cml4VG9RdWF0ZXJuaW9uL2luZGV4Lmh0bVxuICBsZXQgdHJhY2UgPSBtYXRbMF0gKyBtYXRbNV0gKyBtYXRbMTBdO1xuICBsZXQgUyA9IDA7XG5cbiAgaWYgKHRyYWNlID4gMCkge1xuICAgIFMgPSBNYXRoLnNxcnQodHJhY2UgKyAxLjApICogMjtcbiAgICBvdXRbM10gPSAwLjI1ICogUztcbiAgICBvdXRbMF0gPSAobWF0WzZdIC0gbWF0WzldKSAvIFM7XG4gICAgb3V0WzFdID0gKG1hdFs4XSAtIG1hdFsyXSkgLyBTO1xuICAgIG91dFsyXSA9IChtYXRbMV0gLSBtYXRbNF0pIC8gUztcbiAgfSBlbHNlIGlmICgobWF0WzBdID4gbWF0WzVdKSAmJiAobWF0WzBdID4gbWF0WzEwXSkpIHtcbiAgICBTID0gTWF0aC5zcXJ0KDEuMCArIG1hdFswXSAtIG1hdFs1XSAtIG1hdFsxMF0pICogMjtcbiAgICBvdXRbM10gPSAobWF0WzZdIC0gbWF0WzldKSAvIFM7XG4gICAgb3V0WzBdID0gMC4yNSAqIFM7XG4gICAgb3V0WzFdID0gKG1hdFsxXSArIG1hdFs0XSkgLyBTO1xuICAgIG91dFsyXSA9IChtYXRbOF0gKyBtYXRbMl0pIC8gUztcbiAgfSBlbHNlIGlmIChtYXRbNV0gPiBtYXRbMTBdKSB7XG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBtYXRbNV0gLSBtYXRbMF0gLSBtYXRbMTBdKSAqIDI7XG4gICAgb3V0WzNdID0gKG1hdFs4XSAtIG1hdFsyXSkgLyBTO1xuICAgIG91dFswXSA9IChtYXRbMV0gKyBtYXRbNF0pIC8gUztcbiAgICBvdXRbMV0gPSAwLjI1ICogUztcbiAgICBvdXRbMl0gPSAobWF0WzZdICsgbWF0WzldKSAvIFM7XG4gIH0gZWxzZSB7XG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBtYXRbMTBdIC0gbWF0WzBdIC0gbWF0WzVdKSAqIDI7XG4gICAgb3V0WzNdID0gKG1hdFsxXSAtIG1hdFs0XSkgLyBTO1xuICAgIG91dFswXSA9IChtYXRbOF0gKyBtYXRbMl0pIC8gUztcbiAgICBvdXRbMV0gPSAobWF0WzZdICsgbWF0WzldKSAvIFM7XG4gICAgb3V0WzJdID0gMC4yNSAqIFM7XG4gIH1cblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcbiAqXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCB2ZWMpO1xuICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBzIFNjYWxpbmcgdmVjdG9yXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlKG91dCwgcSwgdiwgcykge1xuICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xuICBsZXQgeDIgPSB4ICsgeDtcbiAgbGV0IHkyID0geSArIHk7XG4gIGxldCB6MiA9IHogKyB6O1xuXG4gIGxldCB4eCA9IHggKiB4MjtcbiAgbGV0IHh5ID0geCAqIHkyO1xuICBsZXQgeHogPSB4ICogejI7XG4gIGxldCB5eSA9IHkgKiB5MjtcbiAgbGV0IHl6ID0geSAqIHoyO1xuICBsZXQgenogPSB6ICogejI7XG4gIGxldCB3eCA9IHcgKiB4MjtcbiAgbGV0IHd5ID0gdyAqIHkyO1xuICBsZXQgd3ogPSB3ICogejI7XG4gIGxldCBzeCA9IHNbMF07XG4gIGxldCBzeSA9IHNbMV07XG4gIGxldCBzeiA9IHNbMl07XG5cbiAgb3V0WzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gIG91dFsxXSA9ICh4eSArIHd6KSAqIHN4O1xuICBvdXRbMl0gPSAoeHogLSB3eSkgKiBzeDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gKHh5IC0gd3opICogc3k7XG4gIG91dFs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xuICBvdXRbNl0gPSAoeXogKyB3eCkgKiBzeTtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gKHh6ICsgd3kpICogc3o7XG4gIG91dFs5XSA9ICh5eiAtIHd4KSAqIHN6O1xuICBvdXRbMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXTtcbiAgb3V0WzEzXSA9IHZbMV07XG4gIG91dFsxNF0gPSB2WzJdO1xuICBvdXRbMTVdID0gMTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHF1YXRlcm5pb24gcm90YXRpb24sIHZlY3RvciB0cmFuc2xhdGlvbiBhbmQgdmVjdG9yIHNjYWxlLCByb3RhdGluZyBhbmQgc2NhbGluZyBhcm91bmQgdGhlIGdpdmVuIG9yaWdpblxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XG4gKlxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBvcmlnaW4pO1xuICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XG4gKiAgICAgbWF0NC5tdWx0aXBseShkZXN0LCBxdWF0TWF0KTtcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG5lZ2F0aXZlT3JpZ2luKTtcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBvIFRoZSBvcmlnaW4gdmVjdG9yIGFyb3VuZCB3aGljaCB0byBzY2FsZSBhbmQgcm90YXRlXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luKG91dCwgcSwgdiwgcywgbykge1xuICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xuICBsZXQgeDIgPSB4ICsgeDtcbiAgbGV0IHkyID0geSArIHk7XG4gIGxldCB6MiA9IHogKyB6O1xuXG4gIGxldCB4eCA9IHggKiB4MjtcbiAgbGV0IHh5ID0geCAqIHkyO1xuICBsZXQgeHogPSB4ICogejI7XG4gIGxldCB5eSA9IHkgKiB5MjtcbiAgbGV0IHl6ID0geSAqIHoyO1xuICBsZXQgenogPSB6ICogejI7XG4gIGxldCB3eCA9IHcgKiB4MjtcbiAgbGV0IHd5ID0gdyAqIHkyO1xuICBsZXQgd3ogPSB3ICogejI7XG5cbiAgbGV0IHN4ID0gc1swXTtcbiAgbGV0IHN5ID0gc1sxXTtcbiAgbGV0IHN6ID0gc1syXTtcblxuICBsZXQgb3ggPSBvWzBdO1xuICBsZXQgb3kgPSBvWzFdO1xuICBsZXQgb3ogPSBvWzJdO1xuXG4gIGxldCBvdXQwID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gIGxldCBvdXQxID0gKHh5ICsgd3opICogc3g7XG4gIGxldCBvdXQyID0gKHh6IC0gd3kpICogc3g7XG4gIGxldCBvdXQ0ID0gKHh5IC0gd3opICogc3k7XG4gIGxldCBvdXQ1ID0gKDEgLSAoeHggKyB6eikpICogc3k7XG4gIGxldCBvdXQ2ID0gKHl6ICsgd3gpICogc3k7XG4gIGxldCBvdXQ4ID0gKHh6ICsgd3kpICogc3o7XG4gIGxldCBvdXQ5ID0gKHl6IC0gd3gpICogc3o7XG4gIGxldCBvdXQxMCA9ICgxIC0gKHh4ICsgeXkpKSAqIHN6O1xuXG4gIG91dFswXSA9IG91dDA7XG4gIG91dFsxXSA9IG91dDE7XG4gIG91dFsyXSA9IG91dDI7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IG91dDQ7XG4gIG91dFs1XSA9IG91dDU7XG4gIG91dFs2XSA9IG91dDY7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IG91dDg7XG4gIG91dFs5XSA9IG91dDk7XG4gIG91dFsxMF0gPSBvdXQxMDtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSB2WzBdICsgb3ggLSAob3V0MCAqIG94ICsgb3V0NCAqIG95ICsgb3V0OCAqIG96KTtcbiAgb3V0WzEzXSA9IHZbMV0gKyBveSAtIChvdXQxICogb3ggKyBvdXQ1ICogb3kgKyBvdXQ5ICogb3opO1xuICBvdXRbMTRdID0gdlsyXSArIG96IC0gKG91dDIgKiBveCArIG91dDYgKiBveSArIG91dDEwICogb3opO1xuICBvdXRbMTVdID0gMTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgYSA0eDQgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cbiAqXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUXVhdChvdXQsIHEpIHtcbiAgbGV0IHggPSBxWzBdLCB5ID0gcVsxXSwgeiA9IHFbMl0sIHcgPSBxWzNdO1xuICBsZXQgeDIgPSB4ICsgeDtcbiAgbGV0IHkyID0geSArIHk7XG4gIGxldCB6MiA9IHogKyB6O1xuXG4gIGxldCB4eCA9IHggKiB4MjtcbiAgbGV0IHl4ID0geSAqIHgyO1xuICBsZXQgeXkgPSB5ICogeTI7XG4gIGxldCB6eCA9IHogKiB4MjtcbiAgbGV0IHp5ID0geiAqIHkyO1xuICBsZXQgenogPSB6ICogejI7XG4gIGxldCB3eCA9IHcgKiB4MjtcbiAgbGV0IHd5ID0gdyAqIHkyO1xuICBsZXQgd3ogPSB3ICogejI7XG5cbiAgb3V0WzBdID0gMSAtIHl5IC0geno7XG4gIG91dFsxXSA9IHl4ICsgd3o7XG4gIG91dFsyXSA9IHp4IC0gd3k7XG4gIG91dFszXSA9IDA7XG5cbiAgb3V0WzRdID0geXggLSB3ejtcbiAgb3V0WzVdID0gMSAtIHh4IC0geno7XG4gIG91dFs2XSA9IHp5ICsgd3g7XG4gIG91dFs3XSA9IDA7XG5cbiAgb3V0WzhdID0genggKyB3eTtcbiAgb3V0WzldID0genkgLSB3eDtcbiAgb3V0WzEwXSA9IDEgLSB4eCAtIHl5O1xuICBvdXRbMTFdID0gMDtcblxuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIGZydXN0dW0gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7TnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7TnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJ1c3R1bShvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gIGxldCBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KTtcbiAgbGV0IHRiID0gMSAvICh0b3AgLSBib3R0b20pO1xuICBsZXQgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMF0gPSAobmVhciAqIDIpICogcmw7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IChuZWFyICogMikgKiB0YjtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gKHJpZ2h0ICsgbGVmdCkgKiBybDtcbiAgb3V0WzldID0gKHRvcCArIGJvdHRvbSkgKiB0YjtcbiAgb3V0WzEwXSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICBvdXRbMTFdID0gLTE7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IChmYXIgKiBuZWFyICogMikgKiBuZjtcbiAgb3V0WzE1XSA9IDA7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHtudW1iZXJ9IGZvdnkgVmVydGljYWwgZmllbGQgb2YgdmlldyBpbiByYWRpYW5zXG4gKiBAcGFyYW0ge251bWJlcn0gYXNwZWN0IEFzcGVjdCByYXRpby4gdHlwaWNhbGx5IHZpZXdwb3J0IHdpZHRoL2hlaWdodFxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcbiAgbGV0IGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMik7XG4gIGxldCBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gIG91dFswXSA9IGYgLyBhc3BlY3Q7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IGY7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgb3V0WzExXSA9IC0xO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAoMiAqIGZhciAqIG5lYXIpICogbmY7XG4gIG91dFsxNV0gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHBlcnNwZWN0aXZlIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGZpZWxkIG9mIHZpZXcuXG4gKiBUaGlzIGlzIHByaW1hcmlseSB1c2VmdWwgZm9yIGdlbmVyYXRpbmcgcHJvamVjdGlvbiBtYXRyaWNlcyB0byBiZSB1c2VkXG4gKiB3aXRoIHRoZSBzdGlsbCBleHBlcmllbWVudGFsIFdlYlZSIEFQSS5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXG4gKiBAcGFyYW0ge09iamVjdH0gZm92IE9iamVjdCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgdmFsdWVzOiB1cERlZ3JlZXMsIGRvd25EZWdyZWVzLCBsZWZ0RGVncmVlcywgcmlnaHREZWdyZWVzXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcGVyc3BlY3RpdmVGcm9tRmllbGRPZlZpZXcob3V0LCBmb3YsIG5lYXIsIGZhcikge1xuICBsZXQgdXBUYW4gPSBNYXRoLnRhbihmb3YudXBEZWdyZWVzICogTWF0aC5QSS8xODAuMCk7XG4gIGxldCBkb3duVGFuID0gTWF0aC50YW4oZm92LmRvd25EZWdyZWVzICogTWF0aC5QSS8xODAuMCk7XG4gIGxldCBsZWZ0VGFuID0gTWF0aC50YW4oZm92LmxlZnREZWdyZWVzICogTWF0aC5QSS8xODAuMCk7XG4gIGxldCByaWdodFRhbiA9IE1hdGgudGFuKGZvdi5yaWdodERlZ3JlZXMgKiBNYXRoLlBJLzE4MC4wKTtcbiAgbGV0IHhTY2FsZSA9IDIuMCAvIChsZWZ0VGFuICsgcmlnaHRUYW4pO1xuICBsZXQgeVNjYWxlID0gMi4wIC8gKHVwVGFuICsgZG93blRhbik7XG5cbiAgb3V0WzBdID0geFNjYWxlO1xuICBvdXRbMV0gPSAwLjA7XG4gIG91dFsyXSA9IDAuMDtcbiAgb3V0WzNdID0gMC4wO1xuICBvdXRbNF0gPSAwLjA7XG4gIG91dFs1XSA9IHlTY2FsZTtcbiAgb3V0WzZdID0gMC4wO1xuICBvdXRbN10gPSAwLjA7XG4gIG91dFs4XSA9IC0oKGxlZnRUYW4gLSByaWdodFRhbikgKiB4U2NhbGUgKiAwLjUpO1xuICBvdXRbOV0gPSAoKHVwVGFuIC0gZG93blRhbikgKiB5U2NhbGUgKiAwLjUpO1xuICBvdXRbMTBdID0gZmFyIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMTFdID0gLTEuMDtcbiAgb3V0WzEyXSA9IDAuMDtcbiAgb3V0WzEzXSA9IDAuMDtcbiAgb3V0WzE0XSA9IChmYXIgKiBuZWFyKSAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzE1XSA9IDAuMDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSByaWdodCBSaWdodCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHBhcmFtIHtudW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gbmVhciBOZWFyIGJvdW5kIG9mIHRoZSBmcnVzdHVtXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gb3J0aG8ob3V0LCBsZWZ0LCByaWdodCwgYm90dG9tLCB0b3AsIG5lYXIsIGZhcikge1xuICBsZXQgbHIgPSAxIC8gKGxlZnQgLSByaWdodCk7XG4gIGxldCBidCA9IDEgLyAoYm90dG9tIC0gdG9wKTtcbiAgbGV0IG5mID0gMSAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzBdID0gLTIgKiBscjtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gLTIgKiBidDtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IDIgKiBuZjtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAobGVmdCArIHJpZ2h0KSAqIGxyO1xuICBvdXRbMTNdID0gKHRvcCArIGJvdHRvbSkgKiBidDtcbiAgb3V0WzE0XSA9IChmYXIgKyBuZWFyKSAqIG5mO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZW5lcmF0ZXMgYSBsb29rLWF0IG1hdHJpeCB3aXRoIHRoZSBnaXZlbiBleWUgcG9zaXRpb24sIGZvY2FsIHBvaW50LCBhbmQgdXAgYXhpcy5cbiAqIElmIHlvdSB3YW50IGEgbWF0cml4IHRoYXQgYWN0dWFsbHkgbWFrZXMgYW4gb2JqZWN0IGxvb2sgYXQgYW5vdGhlciBvYmplY3QsIHlvdSBzaG91bGQgdXNlIHRhcmdldFRvIGluc3RlYWQuXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxuICogQHBhcmFtIHt2ZWMzfSBjZW50ZXIgUG9pbnQgdGhlIHZpZXdlciBpcyBsb29raW5nIGF0XG4gKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxvb2tBdChvdXQsIGV5ZSwgY2VudGVyLCB1cCkge1xuICBsZXQgeDAsIHgxLCB4MiwgeTAsIHkxLCB5MiwgejAsIHoxLCB6MiwgbGVuO1xuICBsZXQgZXlleCA9IGV5ZVswXTtcbiAgbGV0IGV5ZXkgPSBleWVbMV07XG4gIGxldCBleWV6ID0gZXllWzJdO1xuICBsZXQgdXB4ID0gdXBbMF07XG4gIGxldCB1cHkgPSB1cFsxXTtcbiAgbGV0IHVweiA9IHVwWzJdO1xuICBsZXQgY2VudGVyeCA9IGNlbnRlclswXTtcbiAgbGV0IGNlbnRlcnkgPSBjZW50ZXJbMV07XG4gIGxldCBjZW50ZXJ6ID0gY2VudGVyWzJdO1xuXG4gIGlmIChNYXRoLmFicyhleWV4IC0gY2VudGVyeCkgPCBnbE1hdHJpeC5FUFNJTE9OICYmXG4gICAgICBNYXRoLmFicyhleWV5IC0gY2VudGVyeSkgPCBnbE1hdHJpeC5FUFNJTE9OICYmXG4gICAgICBNYXRoLmFicyhleWV6IC0gY2VudGVyeikgPCBnbE1hdHJpeC5FUFNJTE9OKSB7XG4gICAgcmV0dXJuIGlkZW50aXR5KG91dCk7XG4gIH1cblxuICB6MCA9IGV5ZXggLSBjZW50ZXJ4O1xuICB6MSA9IGV5ZXkgLSBjZW50ZXJ5O1xuICB6MiA9IGV5ZXogLSBjZW50ZXJ6O1xuXG4gIGxlbiA9IDEgLyBNYXRoLnNxcnQoejAgKiB6MCArIHoxICogejEgKyB6MiAqIHoyKTtcbiAgejAgKj0gbGVuO1xuICB6MSAqPSBsZW47XG4gIHoyICo9IGxlbjtcblxuICB4MCA9IHVweSAqIHoyIC0gdXB6ICogejE7XG4gIHgxID0gdXB6ICogejAgLSB1cHggKiB6MjtcbiAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuICBsZW4gPSBNYXRoLnNxcnQoeDAgKiB4MCArIHgxICogeDEgKyB4MiAqIHgyKTtcbiAgaWYgKCFsZW4pIHtcbiAgICB4MCA9IDA7XG4gICAgeDEgPSAwO1xuICAgIHgyID0gMDtcbiAgfSBlbHNlIHtcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHgwICo9IGxlbjtcbiAgICB4MSAqPSBsZW47XG4gICAgeDIgKj0gbGVuO1xuICB9XG5cbiAgeTAgPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgeTEgPSB6MiAqIHgwIC0gejAgKiB4MjtcbiAgeTIgPSB6MCAqIHgxIC0gejEgKiB4MDtcblxuICBsZW4gPSBNYXRoLnNxcnQoeTAgKiB5MCArIHkxICogeTEgKyB5MiAqIHkyKTtcbiAgaWYgKCFsZW4pIHtcbiAgICB5MCA9IDA7XG4gICAgeTEgPSAwO1xuICAgIHkyID0gMDtcbiAgfSBlbHNlIHtcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHkwICo9IGxlbjtcbiAgICB5MSAqPSBsZW47XG4gICAgeTIgKj0gbGVuO1xuICB9XG5cbiAgb3V0WzBdID0geDA7XG4gIG91dFsxXSA9IHkwO1xuICBvdXRbMl0gPSB6MDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0geDE7XG4gIG91dFs1XSA9IHkxO1xuICBvdXRbNl0gPSB6MTtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geDI7XG4gIG91dFs5XSA9IHkyO1xuICBvdXRbMTBdID0gejI7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopO1xuICBvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xuICBvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopO1xuICBvdXRbMTVdID0gMTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIG1hdHJpeCB0aGF0IG1ha2VzIHNvbWV0aGluZyBsb29rIGF0IHNvbWV0aGluZyBlbHNlLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cbiAqIEBwYXJhbSB7dmVjM30gZXllIFBvc2l0aW9uIG9mIHRoZSB2aWV3ZXJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0YXJnZXRUbyhvdXQsIGV5ZSwgdGFyZ2V0LCB1cCkge1xuICBsZXQgZXlleCA9IGV5ZVswXSxcbiAgICAgIGV5ZXkgPSBleWVbMV0sXG4gICAgICBleWV6ID0gZXllWzJdLFxuICAgICAgdXB4ID0gdXBbMF0sXG4gICAgICB1cHkgPSB1cFsxXSxcbiAgICAgIHVweiA9IHVwWzJdO1xuXG4gIGxldCB6MCA9IGV5ZXggLSB0YXJnZXRbMF0sXG4gICAgICB6MSA9IGV5ZXkgLSB0YXJnZXRbMV0sXG4gICAgICB6MiA9IGV5ZXogLSB0YXJnZXRbMl07XG5cbiAgbGV0IGxlbiA9IHowKnowICsgejEqejEgKyB6Mip6MjtcbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgejAgKj0gbGVuO1xuICAgIHoxICo9IGxlbjtcbiAgICB6MiAqPSBsZW47XG4gIH1cblxuICBsZXQgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxLFxuICAgICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyLFxuICAgICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuXG4gIGxlbiA9IHgwKngwICsgeDEqeDEgKyB4Mip4MjtcbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgeDAgKj0gbGVuO1xuICAgIHgxICo9IGxlbjtcbiAgICB4MiAqPSBsZW47XG4gIH1cblxuICBvdXRbMF0gPSB4MDtcbiAgb3V0WzFdID0geDE7XG4gIG91dFsyXSA9IHgyO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgb3V0WzVdID0gejIgKiB4MCAtIHowICogeDI7XG4gIG91dFs2XSA9IHowICogeDEgLSB6MSAqIHgwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSB6MDtcbiAgb3V0WzldID0gejE7XG4gIG91dFsxMF0gPSB6MjtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSBleWV4O1xuICBvdXRbMTNdID0gZXlleTtcbiAgb3V0WzE0XSA9IGV5ZXo7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufTtcblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgbWF0NFxuICpcbiAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIG1hdHJpeFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICdtYXQ0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJywgJyArXG4gICAgICAgICAgYVs0XSArICcsICcgKyBhWzVdICsgJywgJyArIGFbNl0gKyAnLCAnICsgYVs3XSArICcsICcgK1xuICAgICAgICAgIGFbOF0gKyAnLCAnICsgYVs5XSArICcsICcgKyBhWzEwXSArICcsICcgKyBhWzExXSArICcsICcgK1xuICAgICAgICAgIGFbMTJdICsgJywgJyArIGFbMTNdICsgJywgJyArIGFbMTRdICsgJywgJyArIGFbMTVdICsgJyknO1xufVxuXG4vKipcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQ0XG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gY2FsY3VsYXRlIEZyb2Jlbml1cyBub3JtIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvYihhKSB7XG4gIHJldHVybihNYXRoLnNxcnQoTWF0aC5wb3coYVswXSwgMikgKyBNYXRoLnBvdyhhWzFdLCAyKSArIE1hdGgucG93KGFbMl0sIDIpICsgTWF0aC5wb3coYVszXSwgMikgKyBNYXRoLnBvdyhhWzRdLCAyKSArIE1hdGgucG93KGFbNV0sIDIpICsgTWF0aC5wb3coYVs2XSwgMikgKyBNYXRoLnBvdyhhWzddLCAyKSArIE1hdGgucG93KGFbOF0sIDIpICsgTWF0aC5wb3coYVs5XSwgMikgKyBNYXRoLnBvdyhhWzEwXSwgMikgKyBNYXRoLnBvdyhhWzExXSwgMikgKyBNYXRoLnBvdyhhWzEyXSwgMikgKyBNYXRoLnBvdyhhWzEzXSwgMikgKyBNYXRoLnBvdyhhWzE0XSwgMikgKyBNYXRoLnBvdyhhWzE1XSwgMikgKSlcbn1cblxuLyoqXG4gKiBBZGRzIHR3byBtYXQ0J3NcbiAqXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICBvdXRbNF0gPSBhWzRdICsgYls0XTtcbiAgb3V0WzVdID0gYVs1XSArIGJbNV07XG4gIG91dFs2XSA9IGFbNl0gKyBiWzZdO1xuICBvdXRbN10gPSBhWzddICsgYls3XTtcbiAgb3V0WzhdID0gYVs4XSArIGJbOF07XG4gIG91dFs5XSA9IGFbOV0gKyBiWzldO1xuICBvdXRbMTBdID0gYVsxMF0gKyBiWzEwXTtcbiAgb3V0WzExXSA9IGFbMTFdICsgYlsxMV07XG4gIG91dFsxMl0gPSBhWzEyXSArIGJbMTJdO1xuICBvdXRbMTNdID0gYVsxM10gKyBiWzEzXTtcbiAgb3V0WzE0XSA9IGFbMTRdICsgYlsxNF07XG4gIG91dFsxNV0gPSBhWzE1XSArIGJbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyBtYXRyaXggYiBmcm9tIG1hdHJpeCBhXG4gKlxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICBvdXRbNF0gPSBhWzRdIC0gYls0XTtcbiAgb3V0WzVdID0gYVs1XSAtIGJbNV07XG4gIG91dFs2XSA9IGFbNl0gLSBiWzZdO1xuICBvdXRbN10gPSBhWzddIC0gYls3XTtcbiAgb3V0WzhdID0gYVs4XSAtIGJbOF07XG4gIG91dFs5XSA9IGFbOV0gLSBiWzldO1xuICBvdXRbMTBdID0gYVsxMF0gLSBiWzEwXTtcbiAgb3V0WzExXSA9IGFbMTFdIC0gYlsxMV07XG4gIG91dFsxMl0gPSBhWzEyXSAtIGJbMTJdO1xuICBvdXRbMTNdID0gYVsxM10gLSBiWzEzXTtcbiAgb3V0WzE0XSA9IGFbMTRdIC0gYlsxNF07XG4gIG91dFsxNV0gPSBhWzE1XSAtIGJbMTVdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGx5IGVhY2ggZWxlbWVudCBvZiB0aGUgbWF0cml4IGJ5IGEgc2NhbGFyLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byBzY2FsZVxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxuICogQHJldHVybnMge21hdDR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIG91dFszXSA9IGFbM10gKiBiO1xuICBvdXRbNF0gPSBhWzRdICogYjtcbiAgb3V0WzVdID0gYVs1XSAqIGI7XG4gIG91dFs2XSA9IGFbNl0gKiBiO1xuICBvdXRbN10gPSBhWzddICogYjtcbiAgb3V0WzhdID0gYVs4XSAqIGI7XG4gIG91dFs5XSA9IGFbOV0gKiBiO1xuICBvdXRbMTBdID0gYVsxMF0gKiBiO1xuICBvdXRbMTFdID0gYVsxMV0gKiBiO1xuICBvdXRbMTJdID0gYVsxMl0gKiBiO1xuICBvdXRbMTNdID0gYVsxM10gKiBiO1xuICBvdXRbMTRdID0gYVsxNF0gKiBiO1xuICBvdXRbMTVdID0gYVsxNV0gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIG1hdDQncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxuICpcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIncyBlbGVtZW50cyBieSBiZWZvcmUgYWRkaW5nXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseVNjYWxhckFuZEFkZChvdXQsIGEsIGIsIHNjYWxlKSB7XG4gIG91dFswXSA9IGFbMF0gKyAoYlswXSAqIHNjYWxlKTtcbiAgb3V0WzFdID0gYVsxXSArIChiWzFdICogc2NhbGUpO1xuICBvdXRbMl0gPSBhWzJdICsgKGJbMl0gKiBzY2FsZSk7XG4gIG91dFszXSA9IGFbM10gKyAoYlszXSAqIHNjYWxlKTtcbiAgb3V0WzRdID0gYVs0XSArIChiWzRdICogc2NhbGUpO1xuICBvdXRbNV0gPSBhWzVdICsgKGJbNV0gKiBzY2FsZSk7XG4gIG91dFs2XSA9IGFbNl0gKyAoYls2XSAqIHNjYWxlKTtcbiAgb3V0WzddID0gYVs3XSArIChiWzddICogc2NhbGUpO1xuICBvdXRbOF0gPSBhWzhdICsgKGJbOF0gKiBzY2FsZSk7XG4gIG91dFs5XSA9IGFbOV0gKyAoYls5XSAqIHNjYWxlKTtcbiAgb3V0WzEwXSA9IGFbMTBdICsgKGJbMTBdICogc2NhbGUpO1xuICBvdXRbMTFdID0gYVsxMV0gKyAoYlsxMV0gKiBzY2FsZSk7XG4gIG91dFsxMl0gPSBhWzEyXSArIChiWzEyXSAqIHNjYWxlKTtcbiAgb3V0WzEzXSA9IGFbMTNdICsgKGJbMTNdICogc2NhbGUpO1xuICBvdXRbMTRdID0gYVsxNF0gKyAoYlsxNF0gKiBzY2FsZSk7XG4gIG91dFsxNV0gPSBhWzE1XSArIChiWzE1XSAqIHNjYWxlKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBtYXRyaWNlcyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXG4gKiBAcGFyYW0ge21hdDR9IGIgVGhlIHNlY29uZCBtYXRyaXguXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXSAmJiBhWzNdID09PSBiWzNdICYmXG4gICAgICAgICBhWzRdID09PSBiWzRdICYmIGFbNV0gPT09IGJbNV0gJiYgYVs2XSA9PT0gYls2XSAmJiBhWzddID09PSBiWzddICYmXG4gICAgICAgICBhWzhdID09PSBiWzhdICYmIGFbOV0gPT09IGJbOV0gJiYgYVsxMF0gPT09IGJbMTBdICYmIGFbMTFdID09PSBiWzExXSAmJlxuICAgICAgICAgYVsxMl0gPT09IGJbMTJdICYmIGFbMTNdID09PSBiWzEzXSAmJiBhWzE0XSA9PT0gYlsxNF0gJiYgYVsxNV0gPT09IGJbMTVdO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge21hdDR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cbiAqIEBwYXJhbSB7bWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSBtYXRyaWNlcyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIGxldCBhMCAgPSBhWzBdLCAgYTEgID0gYVsxXSwgIGEyICA9IGFbMl0sICBhMyAgPSBhWzNdO1xuICBsZXQgYTQgID0gYVs0XSwgIGE1ICA9IGFbNV0sICBhNiAgPSBhWzZdLCAgYTcgID0gYVs3XTtcbiAgbGV0IGE4ICA9IGFbOF0sICBhOSAgPSBhWzldLCAgYTEwID0gYVsxMF0sIGExMSA9IGFbMTFdO1xuICBsZXQgYTEyID0gYVsxMl0sIGExMyA9IGFbMTNdLCBhMTQgPSBhWzE0XSwgYTE1ID0gYVsxNV07XG5cbiAgbGV0IGIwICA9IGJbMF0sICBiMSAgPSBiWzFdLCAgYjIgID0gYlsyXSwgIGIzICA9IGJbM107XG4gIGxldCBiNCAgPSBiWzRdLCAgYjUgID0gYls1XSwgIGI2ICA9IGJbNl0sICBiNyAgPSBiWzddO1xuICBsZXQgYjggID0gYls4XSwgIGI5ICA9IGJbOV0sICBiMTAgPSBiWzEwXSwgYjExID0gYlsxMV07XG4gIGxldCBiMTIgPSBiWzEyXSwgYjEzID0gYlsxM10sIGIxNCA9IGJbMTRdLCBiMTUgPSBiWzE1XTtcblxuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMyksIE1hdGguYWJzKGIzKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTQpLCBNYXRoLmFicyhiNCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE1KSwgTWF0aC5hYnMoYjUpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNiksIE1hdGguYWJzKGI2KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTcpLCBNYXRoLmFicyhiNykpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTggLSBiOCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE4KSwgTWF0aC5hYnMoYjgpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGE5IC0gYjkpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhOSksIE1hdGguYWJzKGI5KSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMTAgLSBiMTApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTApLCBNYXRoLmFicyhiMTApKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExMSAtIGIxMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMSksIE1hdGguYWJzKGIxMSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEyIC0gYjEyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEyKSwgTWF0aC5hYnMoYjEyKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMTMgLSBiMTMpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTMpLCBNYXRoLmFicyhiMTMpKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExNCAtIGIxNCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExNCksIE1hdGguYWJzKGIxNCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTE1IC0gYjE1KSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTE1KSwgTWF0aC5hYnMoYjE1KSkpO1xufVxuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgbWF0NC5tdWx0aXBseX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbXVsID0gbXVsdGlwbHk7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayBtYXQ0LnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzdWIgPSBzdWJ0cmFjdDtcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuXG4vKipcbiAqIDMgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbW9kdWxlIHZlYzNcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzNcbiAqXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0gMDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzMgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgbGV0IHggPSBhWzBdO1xuICBsZXQgeSA9IGFbMV07XG4gIGxldCB6ID0gYVsyXTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjMyBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKHgsIHksIHopIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICBvdXRbMl0gPSB6O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMzIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzZXQob3V0LCB4LCB5LCB6KSB7XG4gIG91dFswXSA9IHg7XG4gIG91dFsxXSA9IHk7XG4gIG91dFsyXSA9IHo7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQWRkcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gYWRkKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXTtcbiAgb3V0WzFdID0gYVsxXSArIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKyBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAqIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogRGl2aWRlcyB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZGl2aWRlKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC8gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAvIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLyBiWzJdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjZWlsXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGguZmxvb3IgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gZmxvb3JcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsb29yKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmZsb29yKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmZsb29yKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLmZsb29yKGFbMl0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJldHVybnMgdGhlIG1pbmltdW0gb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMzJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byByb3VuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm91bmQob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGgucm91bmQoYVswXSk7XG4gIG91dFsxXSA9IE1hdGgucm91bmQoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGgucm91bmQoYVsyXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2NhbGVzIGEgdmVjMyBieSBhIHNjYWxhciBudW1iZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gc2NhbGVcbiAqIEBwYXJhbSB7TnVtYmVyfSBiIGFtb3VudCB0byBzY2FsZSB0aGUgdmVjdG9yIGJ5XG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzY2FsZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGI7XG4gIG91dFsxXSA9IGFbMV0gKiBiO1xuICBvdXRbMl0gPSBhWzJdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMzJ3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XG4gIG91dFsyXSA9IGFbMl0gKyAoYlsyXSAqIHNjYWxlKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRpc3RhbmNlKGEsIGIpIHtcbiAgbGV0IHggPSBiWzBdIC0gYVswXTtcbiAgbGV0IHkgPSBiWzFdIC0gYVsxXTtcbiAgbGV0IHogPSBiWzJdIC0gYVsyXTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkgKyB6KnopO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWREaXN0YW5jZShhLCBiKSB7XG4gIGxldCB4ID0gYlswXSAtIGFbMF07XG4gIGxldCB5ID0gYlsxXSAtIGFbMV07XG4gIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gIHJldHVybiB4KnggKyB5KnkgKyB6Kno7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBsZW5ndGggb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgc3F1YXJlZCBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNxdWFyZWRMZW5ndGgoYSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgbGV0IHogPSBhWzJdO1xuICByZXR1cm4geCp4ICsgeSp5ICsgeip6O1xufVxuXG4vKipcbiAqIE5lZ2F0ZXMgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbmVnYXRlXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBuZWdhdGUob3V0LCBhKSB7XG4gIG91dFswXSA9IC1hWzBdO1xuICBvdXRbMV0gPSAtYVsxXTtcbiAgb3V0WzJdID0gLWFbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gIG91dFswXSA9IDEuMCAvIGFbMF07XG4gIG91dFsxXSA9IDEuMCAvIGFbMV07XG4gIG91dFsyXSA9IDEuMCAvIGFbMl07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjM1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgbGV0IHogPSBhWzJdO1xuICBsZXQgbGVuID0geCp4ICsgeSp5ICsgeip6O1xuICBpZiAobGVuID4gMCkge1xuICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgbGVuID0gMSAvIE1hdGguc3FydChsZW4pO1xuICAgIG91dFswXSA9IGFbMF0gKiBsZW47XG4gICAgb3V0WzFdID0gYVsxXSAqIGxlbjtcbiAgICBvdXRbMl0gPSBhWzJdICogbGVuO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xuICpcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn1cblxuLyoqXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdO1xuICBsZXQgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXTtcblxuICBvdXRbMF0gPSBheSAqIGJ6IC0gYXogKiBieTtcbiAgb3V0WzFdID0gYXogKiBieCAtIGF4ICogYno7XG4gIG91dFsyXSA9IGF4ICogYnkgLSBheSAqIGJ4O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgbGluZWFyIGludGVycG9sYXRpb24gYmV0d2VlbiB0d28gdmVjMydzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbGVycChvdXQsIGEsIGIsIHQpIHtcbiAgbGV0IGF4ID0gYVswXTtcbiAgbGV0IGF5ID0gYVsxXTtcbiAgbGV0IGF6ID0gYVsyXTtcbiAgb3V0WzBdID0gYXggKyB0ICogKGJbMF0gLSBheCk7XG4gIG91dFsxXSA9IGF5ICsgdCAqIChiWzFdIC0gYXkpO1xuICBvdXRbMl0gPSBheiArIHQgKiAoYlsyXSAtIGF6KTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGhlcm1pdGUgaW50ZXJwb2xhdGlvbiB3aXRoIHR3byBjb250cm9sIHBvaW50c1xuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBkIHRoZSBmb3VydGggb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaGVybWl0ZShvdXQsIGEsIGIsIGMsIGQsIHQpIHtcbiAgbGV0IGZhY3RvclRpbWVzMiA9IHQgKiB0O1xuICBsZXQgZmFjdG9yMSA9IGZhY3RvclRpbWVzMiAqICgyICogdCAtIDMpICsgMTtcbiAgbGV0IGZhY3RvcjIgPSBmYWN0b3JUaW1lczIgKiAodCAtIDIpICsgdDtcbiAgbGV0IGZhY3RvcjMgPSBmYWN0b3JUaW1lczIgKiAodCAtIDEpO1xuICBsZXQgZmFjdG9yNCA9IGZhY3RvclRpbWVzMiAqICgzIC0gMiAqIHQpO1xuXG4gIG91dFswXSA9IGFbMF0gKiBmYWN0b3IxICsgYlswXSAqIGZhY3RvcjIgKyBjWzBdICogZmFjdG9yMyArIGRbMF0gKiBmYWN0b3I0O1xuICBvdXRbMV0gPSBhWzFdICogZmFjdG9yMSArIGJbMV0gKiBmYWN0b3IyICsgY1sxXSAqIGZhY3RvcjMgKyBkWzFdICogZmFjdG9yNDtcbiAgb3V0WzJdID0gYVsyXSAqIGZhY3RvcjEgKyBiWzJdICogZmFjdG9yMiArIGNbMl0gKiBmYWN0b3IzICsgZFsyXSAqIGZhY3RvcjQ7XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGJlemllciBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMzfSBjIHRoZSB0aGlyZCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBiZXppZXIob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gIGxldCBpbnZlcnNlRmFjdG9yID0gMSAtIHQ7XG4gIGxldCBpbnZlcnNlRmFjdG9yVGltZXNUd28gPSBpbnZlcnNlRmFjdG9yICogaW52ZXJzZUZhY3RvcjtcbiAgbGV0IGZhY3RvclRpbWVzMiA9IHQgKiB0O1xuICBsZXQgZmFjdG9yMSA9IGludmVyc2VGYWN0b3JUaW1lc1R3byAqIGludmVyc2VGYWN0b3I7XG4gIGxldCBmYWN0b3IyID0gMyAqIHQgKiBpbnZlcnNlRmFjdG9yVGltZXNUd287XG4gIGxldCBmYWN0b3IzID0gMyAqIGZhY3RvclRpbWVzMiAqIGludmVyc2VGYWN0b3I7XG4gIGxldCBmYWN0b3I0ID0gZmFjdG9yVGltZXMyICogdDtcblxuICBvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNDtcbiAgb3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjQ7XG4gIG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0O1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbShvdXQsIHNjYWxlKSB7XG4gIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xuXG4gIGxldCByID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyLjAgKiBNYXRoLlBJO1xuICBsZXQgeiA9IChnbE1hdHJpeC5SQU5ET00oKSAqIDIuMCkgLSAxLjA7XG4gIGxldCB6U2NhbGUgPSBNYXRoLnNxcnQoMS4wLXoqeikgKiBzY2FsZTtcblxuICBvdXRbMF0gPSBNYXRoLmNvcyhyKSAqIHpTY2FsZTtcbiAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiB6U2NhbGU7XG4gIG91dFsyXSA9IHogKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQ0LlxuICogNHRoIHZlY3RvciBjb21wb25lbnQgaXMgaW1wbGljaXRseSAnMSdcbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcbiAgbGV0IHcgPSBtWzNdICogeCArIG1bN10gKiB5ICsgbVsxMV0gKiB6ICsgbVsxNV07XG4gIHcgPSB3IHx8IDEuMDtcbiAgb3V0WzBdID0gKG1bMF0gKiB4ICsgbVs0XSAqIHkgKyBtWzhdICogeiArIG1bMTJdKSAvIHc7XG4gIG91dFsxXSA9IChtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSkgLyB3O1xuICBvdXRbMl0gPSAobVsyXSAqIHggKyBtWzZdICogeSArIG1bMTBdICogeiArIG1bMTRdKSAvIHc7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjMyB3aXRoIGEgbWF0My5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXG4gKiBAcGFyYW0ge21hdDN9IG0gdGhlIDN4MyBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdO1xuICBvdXRbMF0gPSB4ICogbVswXSArIHkgKiBtWzNdICsgeiAqIG1bNl07XG4gIG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XTtcbiAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcbiAqIENhbiBhbHNvIGJlIHVzZWQgZm9yIGR1YWwgcXVhdGVybmlvbnMuIChNdWx0aXBseSBpdCB3aXRoIHRoZSByZWFsIHBhcnQpXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHtxdWF0fSBxIHF1YXRlcm5pb24gdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybVF1YXQob3V0LCBhLCBxKSB7XG4gICAgLy8gYmVuY2htYXJrczogaHR0cHM6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tdHJhbnNmb3JtLXZlYzMtaW1wbGVtZW50YXRpb25zLWZpeGVkXG4gICAgbGV0IHF4ID0gcVswXSwgcXkgPSBxWzFdLCBxeiA9IHFbMl0sIHF3ID0gcVszXTtcbiAgICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcbiAgICAvLyB2YXIgcXZlYyA9IFtxeCwgcXksIHF6XTtcbiAgICAvLyB2YXIgdXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCBhKTtcbiAgICBsZXQgdXZ4ID0gcXkgKiB6IC0gcXogKiB5LFxuICAgICAgICB1dnkgPSBxeiAqIHggLSBxeCAqIHosXG4gICAgICAgIHV2eiA9IHF4ICogeSAtIHF5ICogeDtcbiAgICAvLyB2YXIgdXV2ID0gdmVjMy5jcm9zcyhbXSwgcXZlYywgdXYpO1xuICAgIGxldCB1dXZ4ID0gcXkgKiB1dnogLSBxeiAqIHV2eSxcbiAgICAgICAgdXV2eSA9IHF6ICogdXZ4IC0gcXggKiB1dnosXG4gICAgICAgIHV1dnogPSBxeCAqIHV2eSAtIHF5ICogdXZ4O1xuICAgIC8vIHZlYzMuc2NhbGUodXYsIHV2LCAyICogdyk7XG4gICAgbGV0IHcyID0gcXcgKiAyO1xuICAgIHV2eCAqPSB3MjtcbiAgICB1dnkgKj0gdzI7XG4gICAgdXZ6ICo9IHcyO1xuICAgIC8vIHZlYzMuc2NhbGUodXV2LCB1dXYsIDIpO1xuICAgIHV1dnggKj0gMjtcbiAgICB1dXZ5ICo9IDI7XG4gICAgdXV2eiAqPSAyO1xuICAgIC8vIHJldHVybiB2ZWMzLmFkZChvdXQsIGEsIHZlYzMuYWRkKG91dCwgdXYsIHV1dikpO1xuICAgIG91dFswXSA9IHggKyB1dnggKyB1dXZ4O1xuICAgIG91dFsxXSA9IHkgKyB1dnkgKyB1dXZ5O1xuICAgIG91dFsyXSA9IHogKyB1dnogKyB1dXZ6O1xuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeC1heGlzXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCBUaGUgcmVjZWl2aW5nIHZlYzNcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgdmVjMyBwb2ludCB0byByb3RhdGVcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxuICogQHBhcmFtIHtOdW1iZXJ9IGMgVGhlIGFuZ2xlIG9mIHJvdGF0aW9uXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgYiwgYyl7XG4gIGxldCBwID0gW10sIHI9W107XG4gIC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cbiAgcFswXSA9IGFbMF0gLSBiWzBdO1xuICBwWzFdID0gYVsxXSAtIGJbMV07XG4gIHBbMl0gPSBhWzJdIC0gYlsyXTtcblxuICAvL3BlcmZvcm0gcm90YXRpb25cbiAgclswXSA9IHBbMF07XG4gIHJbMV0gPSBwWzFdKk1hdGguY29zKGMpIC0gcFsyXSpNYXRoLnNpbihjKTtcbiAgclsyXSA9IHBbMV0qTWF0aC5zaW4oYykgKyBwWzJdKk1hdGguY29zKGMpO1xuXG4gIC8vdHJhbnNsYXRlIHRvIGNvcnJlY3QgcG9zaXRpb25cbiAgb3V0WzBdID0gclswXSArIGJbMF07XG4gIG91dFsxXSA9IHJbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSByWzJdICsgYlsyXTtcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZSBhIDNEIHZlY3RvciBhcm91bmQgdGhlIHktYXhpc1xuICogQHBhcmFtIHt2ZWMzfSBvdXQgVGhlIHJlY2VpdmluZyB2ZWMzXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIG9yaWdpbiBvZiB0aGUgcm90YXRpb25cbiAqIEBwYXJhbSB7TnVtYmVyfSBjIFRoZSBhbmdsZSBvZiByb3RhdGlvblxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIGIsIGMpe1xuICBsZXQgcCA9IFtdLCByPVtdO1xuICAvL1RyYW5zbGF0ZSBwb2ludCB0byB0aGUgb3JpZ2luXG4gIHBbMF0gPSBhWzBdIC0gYlswXTtcbiAgcFsxXSA9IGFbMV0gLSBiWzFdO1xuICBwWzJdID0gYVsyXSAtIGJbMl07XG5cbiAgLy9wZXJmb3JtIHJvdGF0aW9uXG4gIHJbMF0gPSBwWzJdKk1hdGguc2luKGMpICsgcFswXSpNYXRoLmNvcyhjKTtcbiAgclsxXSA9IHBbMV07XG4gIHJbMl0gPSBwWzJdKk1hdGguY29zKGMpIC0gcFswXSpNYXRoLnNpbihjKTtcblxuICAvL3RyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG5cbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGUgYSAzRCB2ZWN0b3IgYXJvdW5kIHRoZSB6LWF4aXNcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSB2ZWMzIHBvaW50IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCBiLCBjKXtcbiAgbGV0IHAgPSBbXSwgcj1bXTtcbiAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdO1xuXG4gIC8vcGVyZm9ybSByb3RhdGlvblxuICByWzBdID0gcFswXSpNYXRoLmNvcyhjKSAtIHBbMV0qTWF0aC5zaW4oYyk7XG4gIHJbMV0gPSBwWzBdKk1hdGguc2luKGMpICsgcFsxXSpNYXRoLmNvcyhjKTtcbiAgclsyXSA9IHBbMl07XG5cbiAgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuICBvdXRbMF0gPSByWzBdICsgYlswXTtcbiAgb3V0WzFdID0gclsxXSArIGJbMV07XG4gIG91dFsyXSA9IHJbMl0gKyBiWzJdO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAzRCB2ZWN0b3JzXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmdsZShhLCBiKSB7XG4gIGxldCB0ZW1wQSA9IGZyb21WYWx1ZXMoYVswXSwgYVsxXSwgYVsyXSk7XG4gIGxldCB0ZW1wQiA9IGZyb21WYWx1ZXMoYlswXSwgYlsxXSwgYlsyXSk7XG5cbiAgbm9ybWFsaXplKHRlbXBBLCB0ZW1wQSk7XG4gIG5vcm1hbGl6ZSh0ZW1wQiwgdGVtcEIpO1xuXG4gIGxldCBjb3NpbmUgPSBkb3QodGVtcEEsIHRlbXBCKTtcblxuICBpZihjb3NpbmUgPiAxLjApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICBlbHNlIGlmKGNvc2luZSA8IC0xLjApIHtcbiAgICByZXR1cm4gTWF0aC5QSTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gTWF0aC5hY29zKGNvc2luZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gJ3ZlYzMoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJyknO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBleGFjdGx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uICh3aGVuIGNvbXBhcmVkIHdpdGggPT09KVxuICpcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWMzfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBleGFjdEVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBhWzBdID09PSBiWzBdICYmIGFbMV0gPT09IGJbMV0gJiYgYVsyXSA9PT0gYlsyXTtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgbGV0IGEwID0gYVswXSwgYTEgPSBhWzFdLCBhMiA9IGFbMl07XG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdO1xuICByZXR1cm4gKE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKSk7XG59XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMzLnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzdWIgPSBzdWJ0cmFjdDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXZpZGV9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRpdiA9IGRpdmlkZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRpc3QgPSBkaXN0YW5jZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzcXJEaXN0ID0gc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGxlbiA9IGxlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzNzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgbGV0IHZlYyA9IGNyZWF0ZSgpO1xuXG4gIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICBsZXQgaSwgbDtcbiAgICBpZighc3RyaWRlKSB7XG4gICAgICBzdHJpZGUgPSAzO1xuICAgIH1cblxuICAgIGlmKCFvZmZzZXQpIHtcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgfVxuXG4gICAgaWYoY291bnQpIHtcbiAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTtcbiAgICAgIGZuKHZlYywgdmVjLCBhcmcpO1xuICAgICAgYVtpXSA9IHZlY1swXTsgYVtpKzFdID0gdmVjWzFdOyBhW2krMl0gPSB2ZWNbMl07XG4gICAgfVxuXG4gICAgcmV0dXJuIGE7XG4gIH07XG59KSgpO1xuIiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG5cbi8qKlxuICogNCBEaW1lbnNpb25hbCBWZWN0b3JcbiAqIEBtb2R1bGUgdmVjNFxuICovXG5cbi8qKlxuICogQ3JlYXRlcyBhIG5ldywgZW1wdHkgdmVjNFxuICpcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSAwO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHZlY3RvclxuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gY2xvbmVcbiAqIEByZXR1cm5zIHt2ZWM0fSBhIG5ldyA0RCB2ZWN0b3JcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDQpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgdmVjNCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3ZlYzR9IGEgbmV3IDREIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5LCB6LCB3KSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSg0KTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgb3V0WzNdID0gdztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjNCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgc291cmNlIHZlY3RvclxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgb3V0WzNdID0gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0IHRvIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHcgVyBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHksIHosIHcpIHtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgb3V0WzNdID0gdztcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gYVsyXSArIGJbMl07XG4gIG91dFszXSA9IGFbM10gKyBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFN1YnRyYWN0cyB2ZWN0b3IgYiBmcm9tIHZlY3RvciBhXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gIG91dFszXSA9IGFbM10gLSBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE11bHRpcGxpZXMgdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdICogYlswXTtcbiAgb3V0WzFdID0gYVsxXSAqIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gKiBiWzJdO1xuICBvdXRbM10gPSBhWzNdICogYlszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAvIGJbMl07XG4gIG91dFszXSA9IGFbM10gLyBiWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGguY2VpbCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBjZWlsXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjZWlsKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLmNlaWwoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguY2VpbChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5jZWlsKGFbMl0pO1xuICBvdXRbM10gPSBNYXRoLmNlaWwoYVszXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byBmbG9vclxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguZmxvb3IoYVsyXSk7XG4gIG91dFszXSA9IE1hdGguZmxvb3IoYVszXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjNCdzXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWluKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7XG4gIG91dFsyXSA9IE1hdGgubWluKGFbMl0sIGJbMl0pO1xuICBvdXRbM10gPSBNYXRoLm1pbihhWzNdLCBiWzNdKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWM0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBtYXgob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IE1hdGgubWF4KGFbMF0sIGJbMF0pO1xuICBvdXRbMV0gPSBNYXRoLm1heChhWzFdLCBiWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5tYXgoYVsyXSwgYlsyXSk7XG4gIG91dFszXSA9IE1hdGgubWF4KGFbM10sIGJbM10pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIE1hdGgucm91bmQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gcm91bmRcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdW5kKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pO1xuICBvdXRbMl0gPSBNYXRoLnJvdW5kKGFbMl0pO1xuICBvdXRbM10gPSBNYXRoLnJvdW5kKGFbM10pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIG91dFszXSA9IGFbM10gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEFkZHMgdHdvIHZlYzQncyBhZnRlciBzY2FsaW5nIHRoZSBzZWNvbmQgb3BlcmFuZCBieSBhIHNjYWxhciB2YWx1ZVxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgKGJbMF0gKiBzY2FsZSk7XG4gIG91dFsxXSA9IGFbMV0gKyAoYlsxXSAqIHNjYWxlKTtcbiAgb3V0WzJdID0gYVsyXSArIChiWzJdICogc2NhbGUpO1xuICBvdXRbM10gPSBhWzNdICsgKGJbM10gKiBzY2FsZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWM0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIGxldCB4ID0gYlswXSAtIGFbMF07XG4gIGxldCB5ID0gYlsxXSAtIGFbMV07XG4gIGxldCB6ID0gYlsyXSAtIGFbMl07XG4gIGxldCB3ID0gYlszXSAtIGFbM107XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6ICsgdyp3KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IHNxdWFyZWQgZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICBsZXQgeCA9IGJbMF0gLSBhWzBdO1xuICBsZXQgeSA9IGJbMV0gLSBhWzFdO1xuICBsZXQgeiA9IGJbMl0gLSBhWzJdO1xuICBsZXQgdyA9IGJbM10gLSBhWzNdO1xuICByZXR1cm4geCp4ICsgeSp5ICsgeip6ICsgdyp3O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBsZW5ndGggb2ZcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBsZW5ndGgoYSkge1xuICBsZXQgeCA9IGFbMF07XG4gIGxldCB5ID0gYVsxXTtcbiAgbGV0IHogPSBhWzJdO1xuICBsZXQgdyA9IGFbM107XG4gIHJldHVybiBNYXRoLnNxcnQoeCp4ICsgeSp5ICsgeip6ICsgdyp3KTtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHZlYzRcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gIGxldCB4ID0gYVswXTtcbiAgbGV0IHkgPSBhWzFdO1xuICBsZXQgeiA9IGFbMl07XG4gIGxldCB3ID0gYVszXTtcbiAgcmV0dXJuIHgqeCArIHkqeSArIHoqeiArIHcqdztcbn1cblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICBvdXRbMF0gPSAtYVswXTtcbiAgb3V0WzFdID0gLWFbMV07XG4gIG91dFsyXSA9IC1hWzJdO1xuICBvdXRbM10gPSAtYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjNFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdmVjdG9yIHRvIGludmVydFxuICogQHJldHVybnMge3ZlYzR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgb3V0WzJdID0gMS4wIC8gYVsyXTtcbiAgb3V0WzNdID0gMS4wIC8gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBOb3JtYWxpemUgYSB2ZWM0XG4gKlxuICogQHBhcmFtIHt2ZWM0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjNH0gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gIGxldCB4ID0gYVswXTtcbiAgbGV0IHkgPSBhWzFdO1xuICBsZXQgeiA9IGFbMl07XG4gIGxldCB3ID0gYVszXTtcbiAgbGV0IGxlbiA9IHgqeCArIHkqeSArIHoqeiArIHcqdztcbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgb3V0WzBdID0geCAqIGxlbjtcbiAgICBvdXRbMV0gPSB5ICogbGVuO1xuICAgIG91dFsyXSA9IHogKiBsZW47XG4gICAgb3V0WzNdID0gdyAqIGxlbjtcbiAgfVxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGRvdCBwcm9kdWN0IG9mIHR3byB2ZWM0J3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGRvdCBwcm9kdWN0IG9mIGEgYW5kIGJcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGRvdChhLCBiKSB7XG4gIHJldHVybiBhWzBdICogYlswXSArIGFbMV0gKiBiWzFdICsgYVsyXSAqIGJbMl0gKyBhWzNdICogYlszXTtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzQnc1xuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjNH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gIGxldCBheCA9IGFbMF07XG4gIGxldCBheSA9IGFbMV07XG4gIGxldCBheiA9IGFbMl07XG4gIGxldCBhdyA9IGFbM107XG4gIG91dFswXSA9IGF4ICsgdCAqIChiWzBdIC0gYXgpO1xuICBvdXRbMV0gPSBheSArIHQgKiAoYlsxXSAtIGF5KTtcbiAgb3V0WzJdID0gYXogKyB0ICogKGJbMl0gLSBheik7XG4gIG91dFszXSA9IGF3ICsgdCAqIChiWzNdIC0gYXcpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcbiAqXG4gKiBAcGFyYW0ge3ZlYzR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCB2ZWN0b3JTY2FsZSkge1xuICB2ZWN0b3JTY2FsZSA9IHZlY3RvclNjYWxlIHx8IDEuMDtcblxuICAvLyBNYXJzYWdsaWEsIEdlb3JnZS4gQ2hvb3NpbmcgYSBQb2ludCBmcm9tIHRoZSBTdXJmYWNlIG9mIGFcbiAgLy8gU3BoZXJlLiBBbm4uIE1hdGguIFN0YXRpc3QuIDQzICgxOTcyKSwgbm8uIDIsIDY0NS0tNjQ2LlxuICAvLyBodHRwOi8vcHJvamVjdGV1Y2xpZC5vcmcvZXVjbGlkLmFvbXMvMTE3NzY5MjY0NDtcbiAgdmFyIHYxLCB2MiwgdjMsIHY0O1xuICB2YXIgczEsIHMyO1xuICBkbyB7XG4gICAgdjEgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIgLSAxO1xuICAgIHYyID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICBzMSA9IHYxICogdjEgKyB2MiAqIHYyO1xuICB9IHdoaWxlIChzMSA+PSAxKTtcbiAgZG8ge1xuICAgIHYzID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyIC0gMTtcbiAgICB2NCA9IGdsTWF0cml4LlJBTkRPTSgpICogMiAtIDE7XG4gICAgczIgPSB2MyAqIHYzICsgdjQgKiB2NDtcbiAgfSB3aGlsZSAoczIgPj0gMSk7XG5cbiAgdmFyIGQgPSBNYXRoLnNxcnQoKDEgLSBzMSkgLyBzMik7XG4gIG91dFswXSA9IHNjYWxlICogdjE7XG4gIG91dFsxXSA9IHNjYWxlICogdjI7XG4gIG91dFsyXSA9IHNjYWxlICogdjMgKiBkO1xuICBvdXRbM10gPSBzY2FsZSAqIHY0ICogZDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWM0IHdpdGggYSBtYXQ0LlxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWM0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XG4gIGxldCB4ID0gYVswXSwgeSA9IGFbMV0sIHogPSBhWzJdLCB3ID0gYVszXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0gKiB3O1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bNV0gKiB5ICsgbVs5XSAqIHogKyBtWzEzXSAqIHc7XG4gIG91dFsyXSA9IG1bMl0gKiB4ICsgbVs2XSAqIHkgKyBtWzEwXSAqIHogKyBtWzE0XSAqIHc7XG4gIG91dFszXSA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XSAqIHc7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogVHJhbnNmb3JtcyB0aGUgdmVjNCB3aXRoIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7dmVjNH0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzR9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXG4gKiBAcmV0dXJucyB7dmVjNH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICBsZXQgeCA9IGFbMF0sIHkgPSBhWzFdLCB6ID0gYVsyXTtcbiAgbGV0IHF4ID0gcVswXSwgcXkgPSBxWzFdLCBxeiA9IHFbMl0sIHF3ID0gcVszXTtcblxuICAvLyBjYWxjdWxhdGUgcXVhdCAqIHZlY1xuICBsZXQgaXggPSBxdyAqIHggKyBxeSAqIHogLSBxeiAqIHk7XG4gIGxldCBpeSA9IHF3ICogeSArIHF6ICogeCAtIHF4ICogejtcbiAgbGV0IGl6ID0gcXcgKiB6ICsgcXggKiB5IC0gcXkgKiB4O1xuICBsZXQgaXcgPSAtcXggKiB4IC0gcXkgKiB5IC0gcXogKiB6O1xuXG4gIC8vIGNhbGN1bGF0ZSByZXN1bHQgKiBpbnZlcnNlIHF1YXRcbiAgb3V0WzBdID0gaXggKiBxdyArIGl3ICogLXF4ICsgaXkgKiAtcXogLSBpeiAqIC1xeTtcbiAgb3V0WzFdID0gaXkgKiBxdyArIGl3ICogLXF5ICsgaXogKiAtcXggLSBpeCAqIC1xejtcbiAgb3V0WzJdID0gaXogKiBxdyArIGl3ICogLXF6ICsgaXggKiAtcXkgLSBpeSAqIC1xeDtcbiAgb3V0WzNdID0gYVszXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gJ3ZlYzQoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcsICcgKyBhWzJdICsgJywgJyArIGFbM10gKyAnKSc7XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM107XG59XG5cbi8qKlxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXG4gKlxuICogQHBhcmFtIHt2ZWM0fSBhIFRoZSBmaXJzdCB2ZWN0b3IuXG4gKiBAcGFyYW0ge3ZlYzR9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgdmVjdG9ycyBhcmUgZXF1YWwsIGZhbHNlIG90aGVyd2lzZS5cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIGxldCBhMCA9IGFbMF0sIGExID0gYVsxXSwgYTIgPSBhWzJdLCBhMyA9IGFbM107XG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXSwgYjIgPSBiWzJdLCBiMyA9IGJbM107XG4gIHJldHVybiAoTWF0aC5hYnMoYTAgLSBiMCkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJlxuICAgICAgICAgIE1hdGguYWJzKGExIC0gYjEpIDw9IGdsTWF0cml4LkVQU0lMT04qTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiZcbiAgICAgICAgICBNYXRoLmFicyhhMiAtIGIyKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTMgLSBiMykgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSk7XG59XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWM0LnN1YnRyYWN0fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzdWIgPSBzdWJ0cmFjdDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5kaXZpZGV9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRpdiA9IGRpdmlkZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuZGlzdGFuY2V9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGRpc3QgPSBkaXN0YW5jZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZERpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzcXJEaXN0ID0gc3F1YXJlZERpc3RhbmNlO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjNC5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGxlbiA9IGxlbmd0aDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzQuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjNHMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjNC4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzRzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgbGV0IHZlYyA9IGNyZWF0ZSgpO1xuXG4gIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICBsZXQgaSwgbDtcbiAgICBpZighc3RyaWRlKSB7XG4gICAgICBzdHJpZGUgPSA0O1xuICAgIH1cblxuICAgIGlmKCFvZmZzZXQpIHtcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgfVxuXG4gICAgaWYoY291bnQpIHtcbiAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07IHZlY1syXSA9IGFbaSsyXTsgdmVjWzNdID0gYVtpKzNdO1xuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICBhW2ldID0gdmVjWzBdOyBhW2krMV0gPSB2ZWNbMV07IGFbaSsyXSA9IHZlY1syXTsgYVtpKzNdID0gdmVjWzNdO1xuICAgIH1cblxuICAgIHJldHVybiBhO1xuICB9O1xufSkoKTtcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiXG5pbXBvcnQgKiBhcyBtYXQzIGZyb20gXCIuL21hdDMuanNcIlxuaW1wb3J0ICogYXMgdmVjMyBmcm9tIFwiLi92ZWMzLmpzXCJcbmltcG9ydCAqIGFzIHZlYzQgZnJvbSBcIi4vdmVjNC5qc1wiXG5cbi8qKlxuICogUXVhdGVybmlvblxuICogQG1vZHVsZSBxdWF0XG4gKi9cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IGlkZW50aXR5IHF1YXRcbiAqXG4gKiBAcmV0dXJucyB7cXVhdH0gYSBuZXcgcXVhdGVybmlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gY3JlYXRlKCkge1xuICBsZXQgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoNCk7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0IGEgcXVhdCB0byB0aGUgaWRlbnRpdHkgcXVhdGVybmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaWRlbnRpdHkob3V0KSB7XG4gIG91dFswXSA9IDA7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogU2V0cyBhIHF1YXQgZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYW5kIHJvdGF0aW9uIGF4aXMsXG4gKiB0aGVuIHJldHVybnMgaXQuXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3ZlYzN9IGF4aXMgdGhlIGF4aXMgYXJvdW5kIHdoaWNoIHRvIHJvdGF0ZVxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgaW4gcmFkaWFuc1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICoqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldEF4aXNBbmdsZShvdXQsIGF4aXMsIHJhZCkge1xuICByYWQgPSByYWQgKiAwLjU7XG4gIGxldCBzID0gTWF0aC5zaW4ocmFkKTtcbiAgb3V0WzBdID0gcyAqIGF4aXNbMF07XG4gIG91dFsxXSA9IHMgKiBheGlzWzFdO1xuICBvdXRbMl0gPSBzICogYXhpc1syXTtcbiAgb3V0WzNdID0gTWF0aC5jb3MocmFkKTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBHZXRzIHRoZSByb3RhdGlvbiBheGlzIGFuZCBhbmdsZSBmb3IgYSBnaXZlblxuICogIHF1YXRlcm5pb24uIElmIGEgcXVhdGVybmlvbiBpcyBjcmVhdGVkIHdpdGhcbiAqICBzZXRBeGlzQW5nbGUsIHRoaXMgbWV0aG9kIHdpbGwgcmV0dXJuIHRoZSBzYW1lXG4gKiAgdmFsdWVzIGFzIHByb3ZpZGllZCBpbiB0aGUgb3JpZ2luYWwgcGFyYW1ldGVyIGxpc3RcbiAqICBPUiBmdW5jdGlvbmFsbHkgZXF1aXZhbGVudCB2YWx1ZXMuXG4gKiBFeGFtcGxlOiBUaGUgcXVhdGVybmlvbiBmb3JtZWQgYnkgYXhpcyBbMCwgMCwgMV0gYW5kXG4gKiAgYW5nbGUgLTkwIGlzIHRoZSBzYW1lIGFzIHRoZSBxdWF0ZXJuaW9uIGZvcm1lZCBieVxuICogIFswLCAwLCAxXSBhbmQgMjcwLiBUaGlzIG1ldGhvZCBmYXZvcnMgdGhlIGxhdHRlci5cbiAqIEBwYXJhbSAge3ZlYzN9IG91dF9heGlzICBWZWN0b3IgcmVjZWl2aW5nIHRoZSBheGlzIG9mIHJvdGF0aW9uXG4gKiBAcGFyYW0gIHtxdWF0fSBxICAgICBRdWF0ZXJuaW9uIHRvIGJlIGRlY29tcG9zZWRcbiAqIEByZXR1cm4ge051bWJlcn0gICAgIEFuZ2xlLCBpbiByYWRpYW5zLCBvZiB0aGUgcm90YXRpb25cbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGdldEF4aXNBbmdsZShvdXRfYXhpcywgcSkge1xuICBsZXQgcmFkID0gTWF0aC5hY29zKHFbM10pICogMi4wO1xuICBsZXQgcyA9IE1hdGguc2luKHJhZCAvIDIuMCk7XG4gIGlmIChzICE9IDAuMCkge1xuICAgIG91dF9heGlzWzBdID0gcVswXSAvIHM7XG4gICAgb3V0X2F4aXNbMV0gPSBxWzFdIC8gcztcbiAgICBvdXRfYXhpc1syXSA9IHFbMl0gLyBzO1xuICB9IGVsc2Uge1xuICAgIC8vIElmIHMgaXMgemVybywgcmV0dXJuIGFueSBheGlzIChubyByb3RhdGlvbiAtIGF4aXMgZG9lcyBub3QgbWF0dGVyKVxuICAgIG91dF9heGlzWzBdID0gMTtcbiAgICBvdXRfYXhpc1sxXSA9IDA7XG4gICAgb3V0X2F4aXNbMl0gPSAwO1xuICB9XG4gIHJldHVybiByYWQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gcXVhdCdzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIG11bHRpcGx5KG91dCwgYSwgYikge1xuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xuICBsZXQgYnggPSBiWzBdLCBieSA9IGJbMV0sIGJ6ID0gYlsyXSwgYncgPSBiWzNdO1xuXG4gIG91dFswXSA9IGF4ICogYncgKyBhdyAqIGJ4ICsgYXkgKiBieiAtIGF6ICogYnk7XG4gIG91dFsxXSA9IGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYno7XG4gIG91dFsyXSA9IGF6ICogYncgKyBhdyAqIGJ6ICsgYXggKiBieSAtIGF5ICogYng7XG4gIG91dFszXSA9IGF3ICogYncgLSBheCAqIGJ4IC0gYXkgKiBieSAtIGF6ICogYno7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUm90YXRlcyBhIHF1YXRlcm5pb24gYnkgdGhlIGdpdmVuIGFuZ2xlIGFib3V0IHRoZSBYIGF4aXNcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCBxdWF0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byByb3RhdGVcbiAqIEBwYXJhbSB7bnVtYmVyfSByYWQgYW5nbGUgKGluIHJhZGlhbnMpIHRvIHJvdGF0ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWChvdXQsIGEsIHJhZCkge1xuICByYWQgKj0gMC41O1xuXG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM107XG4gIGxldCBieCA9IE1hdGguc2luKHJhZCksIGJ3ID0gTWF0aC5jb3MocmFkKTtcblxuICBvdXRbMF0gPSBheCAqIGJ3ICsgYXcgKiBieDtcbiAgb3V0WzFdID0gYXkgKiBidyArIGF6ICogYng7XG4gIG91dFsyXSA9IGF6ICogYncgLSBheSAqIGJ4O1xuICBvdXRbM10gPSBhdyAqIGJ3IC0gYXggKiBieDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGVzIGEgcXVhdGVybmlvbiBieSB0aGUgZ2l2ZW4gYW5nbGUgYWJvdXQgdGhlIFkgYXhpc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHF1YXQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIHJvdGF0ZVxuICogQHBhcmFtIHtudW1iZXJ9IHJhZCBhbmdsZSAoaW4gcmFkaWFucykgdG8gcm90YXRlXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVZKG91dCwgYSwgcmFkKSB7XG4gIHJhZCAqPSAwLjU7XG5cbiAgbGV0IGF4ID0gYVswXSwgYXkgPSBhWzFdLCBheiA9IGFbMl0sIGF3ID0gYVszXTtcbiAgbGV0IGJ5ID0gTWF0aC5zaW4ocmFkKSwgYncgPSBNYXRoLmNvcyhyYWQpO1xuXG4gIG91dFswXSA9IGF4ICogYncgLSBheiAqIGJ5O1xuICBvdXRbMV0gPSBheSAqIGJ3ICsgYXcgKiBieTtcbiAgb3V0WzJdID0gYXogKiBidyArIGF4ICogYnk7XG4gIG91dFszXSA9IGF3ICogYncgLSBheSAqIGJ5O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFJvdGF0ZXMgYSBxdWF0ZXJuaW9uIGJ5IHRoZSBnaXZlbiBhbmdsZSBhYm91dCB0aGUgWiBheGlzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgcXVhdCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gcm90YXRlXG4gKiBAcGFyYW0ge251bWJlcn0gcmFkIGFuZ2xlIChpbiByYWRpYW5zKSB0byByb3RhdGVcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgcmFkICo9IDAuNTtcblxuICBsZXQgYXggPSBhWzBdLCBheSA9IGFbMV0sIGF6ID0gYVsyXSwgYXcgPSBhWzNdO1xuICBsZXQgYnogPSBNYXRoLnNpbihyYWQpLCBidyA9IE1hdGguY29zKHJhZCk7XG5cbiAgb3V0WzBdID0gYXggKiBidyArIGF5ICogYno7XG4gIG91dFsxXSA9IGF5ICogYncgLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheiAqIGJ3ICsgYXcgKiBiejtcbiAgb3V0WzNdID0gYXcgKiBidyAtIGF6ICogYno7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgVyBjb21wb25lbnQgb2YgYSBxdWF0IGZyb20gdGhlIFgsIFksIGFuZCBaIGNvbXBvbmVudHMuXG4gKiBBc3N1bWVzIHRoYXQgcXVhdGVybmlvbiBpcyAxIHVuaXQgaW4gbGVuZ3RoLlxuICogQW55IGV4aXN0aW5nIFcgY29tcG9uZW50IHdpbGwgYmUgaWdub3JlZC5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0IHRvIGNhbGN1bGF0ZSBXIGNvbXBvbmVudCBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2FsY3VsYXRlVyhvdXQsIGEpIHtcbiAgbGV0IHggPSBhWzBdLCB5ID0gYVsxXSwgeiA9IGFbMl07XG5cbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgb3V0WzNdID0gTWF0aC5zcXJ0KE1hdGguYWJzKDEuMCAtIHggKiB4IC0geSAqIHkgLSB6ICogeikpO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2xlcnAob3V0LCBhLCBiLCB0KSB7XG4gIC8vIGJlbmNobWFya3M6XG4gIC8vICAgIGh0dHA6Ly9qc3BlcmYuY29tL3F1YXRlcm5pb24tc2xlcnAtaW1wbGVtZW50YXRpb25zXG4gIGxldCBheCA9IGFbMF0sIGF5ID0gYVsxXSwgYXogPSBhWzJdLCBhdyA9IGFbM107XG4gIGxldCBieCA9IGJbMF0sIGJ5ID0gYlsxXSwgYnogPSBiWzJdLCBidyA9IGJbM107XG5cbiAgbGV0IG9tZWdhLCBjb3NvbSwgc2lub20sIHNjYWxlMCwgc2NhbGUxO1xuXG4gIC8vIGNhbGMgY29zaW5lXG4gIGNvc29tID0gYXggKiBieCArIGF5ICogYnkgKyBheiAqIGJ6ICsgYXcgKiBidztcbiAgLy8gYWRqdXN0IHNpZ25zIChpZiBuZWNlc3NhcnkpXG4gIGlmICggY29zb20gPCAwLjAgKSB7XG4gICAgY29zb20gPSAtY29zb207XG4gICAgYnggPSAtIGJ4O1xuICAgIGJ5ID0gLSBieTtcbiAgICBieiA9IC0gYno7XG4gICAgYncgPSAtIGJ3O1xuICB9XG4gIC8vIGNhbGN1bGF0ZSBjb2VmZmljaWVudHNcbiAgaWYgKCAoMS4wIC0gY29zb20pID4gMC4wMDAwMDEgKSB7XG4gICAgLy8gc3RhbmRhcmQgY2FzZSAoc2xlcnApXG4gICAgb21lZ2EgID0gTWF0aC5hY29zKGNvc29tKTtcbiAgICBzaW5vbSAgPSBNYXRoLnNpbihvbWVnYSk7XG4gICAgc2NhbGUwID0gTWF0aC5zaW4oKDEuMCAtIHQpICogb21lZ2EpIC8gc2lub207XG4gICAgc2NhbGUxID0gTWF0aC5zaW4odCAqIG9tZWdhKSAvIHNpbm9tO1xuICB9IGVsc2Uge1xuICAgIC8vIFwiZnJvbVwiIGFuZCBcInRvXCIgcXVhdGVybmlvbnMgYXJlIHZlcnkgY2xvc2VcbiAgICAvLyAgLi4uIHNvIHdlIGNhbiBkbyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uXG4gICAgc2NhbGUwID0gMS4wIC0gdDtcbiAgICBzY2FsZTEgPSB0O1xuICB9XG4gIC8vIGNhbGN1bGF0ZSBmaW5hbCB2YWx1ZXNcbiAgb3V0WzBdID0gc2NhbGUwICogYXggKyBzY2FsZTEgKiBieDtcbiAgb3V0WzFdID0gc2NhbGUwICogYXkgKyBzY2FsZTEgKiBieTtcbiAgb3V0WzJdID0gc2NhbGUwICogYXogKyBzY2FsZTEgKiBiejtcbiAgb3V0WzNdID0gc2NhbGUwICogYXcgKyBzY2FsZTEgKiBidztcblxuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIGludmVyc2Ugb2YgYSBxdWF0XG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdCB0byBjYWxjdWxhdGUgaW52ZXJzZSBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJ0KG91dCwgYSkge1xuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV0sIGEyID0gYVsyXSwgYTMgPSBhWzNdO1xuICBsZXQgZG90ID0gYTAqYTAgKyBhMSphMSArIGEyKmEyICsgYTMqYTM7XG4gIGxldCBpbnZEb3QgPSBkb3QgPyAxLjAvZG90IDogMDtcblxuICAvLyBUT0RPOiBXb3VsZCBiZSBmYXN0ZXIgdG8gcmV0dXJuIFswLDAsMCwwXSBpbW1lZGlhdGVseSBpZiBkb3QgPT0gMFxuXG4gIG91dFswXSA9IC1hMCppbnZEb3Q7XG4gIG91dFsxXSA9IC1hMSppbnZEb3Q7XG4gIG91dFsyXSA9IC1hMippbnZEb3Q7XG4gIG91dFszXSA9IGEzKmludkRvdDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBjb25qdWdhdGUgb2YgYSBxdWF0XG4gKiBJZiB0aGUgcXVhdGVybmlvbiBpcyBub3JtYWxpemVkLCB0aGlzIGZ1bmN0aW9uIGlzIGZhc3RlciB0aGFuIHF1YXQuaW52ZXJzZSBhbmQgcHJvZHVjZXMgdGhlIHNhbWUgcmVzdWx0LlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHF1YXQgdG8gY2FsY3VsYXRlIGNvbmp1Z2F0ZSBvZlxuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY29uanVnYXRlKG91dCwgYSkge1xuICBvdXRbMF0gPSAtYVswXTtcbiAgb3V0WzFdID0gLWFbMV07XG4gIG91dFsyXSA9IC1hWzJdO1xuICBvdXRbM10gPSBhWzNdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBxdWF0ZXJuaW9uIGZyb20gdGhlIGdpdmVuIDN4MyByb3RhdGlvbiBtYXRyaXguXG4gKlxuICogTk9URTogVGhlIHJlc3VsdGFudCBxdWF0ZXJuaW9uIGlzIG5vdCBub3JtYWxpemVkLCBzbyB5b3Ugc2hvdWxkIGJlIHN1cmVcbiAqIHRvIHJlbm9ybWFsaXplIHRoZSBxdWF0ZXJuaW9uIHlvdXJzZWxmIHdoZXJlIG5lY2Vzc2FyeS5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7bWF0M30gbSByb3RhdGlvbiBtYXRyaXhcbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbU1hdDMob3V0LCBtKSB7XG4gIC8vIEFsZ29yaXRobSBpbiBLZW4gU2hvZW1ha2UncyBhcnRpY2xlIGluIDE5ODcgU0lHR1JBUEggY291cnNlIG5vdGVzXG4gIC8vIGFydGljbGUgXCJRdWF0ZXJuaW9uIENhbGN1bHVzIGFuZCBGYXN0IEFuaW1hdGlvblwiLlxuICBsZXQgZlRyYWNlID0gbVswXSArIG1bNF0gKyBtWzhdO1xuICBsZXQgZlJvb3Q7XG5cbiAgaWYgKCBmVHJhY2UgPiAwLjAgKSB7XG4gICAgLy8gfHd8ID4gMS8yLCBtYXkgYXMgd2VsbCBjaG9vc2UgdyA+IDEvMlxuICAgIGZSb290ID0gTWF0aC5zcXJ0KGZUcmFjZSArIDEuMCk7ICAvLyAyd1xuICAgIG91dFszXSA9IDAuNSAqIGZSb290O1xuICAgIGZSb290ID0gMC41L2ZSb290OyAgLy8gMS8oNHcpXG4gICAgb3V0WzBdID0gKG1bNV0tbVs3XSkqZlJvb3Q7XG4gICAgb3V0WzFdID0gKG1bNl0tbVsyXSkqZlJvb3Q7XG4gICAgb3V0WzJdID0gKG1bMV0tbVszXSkqZlJvb3Q7XG4gIH0gZWxzZSB7XG4gICAgLy8gfHd8IDw9IDEvMlxuICAgIGxldCBpID0gMDtcbiAgICBpZiAoIG1bNF0gPiBtWzBdIClcbiAgICAgIGkgPSAxO1xuICAgIGlmICggbVs4XSA+IG1baSozK2ldIClcbiAgICAgIGkgPSAyO1xuICAgIGxldCBqID0gKGkrMSklMztcbiAgICBsZXQgayA9IChpKzIpJTM7XG5cbiAgICBmUm9vdCA9IE1hdGguc3FydChtW2kqMytpXS1tW2oqMytqXS1tW2sqMytrXSArIDEuMCk7XG4gICAgb3V0W2ldID0gMC41ICogZlJvb3Q7XG4gICAgZlJvb3QgPSAwLjUgLyBmUm9vdDtcbiAgICBvdXRbM10gPSAobVtqKjMra10gLSBtW2sqMytqXSkgKiBmUm9vdDtcbiAgICBvdXRbal0gPSAobVtqKjMraV0gKyBtW2kqMytqXSkgKiBmUm9vdDtcbiAgICBvdXRba10gPSAobVtrKjMraV0gKyBtW2kqMytrXSkgKiBmUm9vdDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ3JlYXRlcyBhIHF1YXRlcm5pb24gZnJvbSB0aGUgZ2l2ZW4gZXVsZXIgYW5nbGUgeCwgeSwgei5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7eH0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBYIGF4aXMgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7eX0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBZIGF4aXMgaW4gZGVncmVlcy5cbiAqIEBwYXJhbSB7en0gQW5nbGUgdG8gcm90YXRlIGFyb3VuZCBaIGF4aXMgaW4gZGVncmVlcy5cbiAqIEByZXR1cm5zIHtxdWF0fSBvdXRcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgZnVuY3Rpb24gZnJvbUV1bGVyKG91dCwgeCwgeSwgeikge1xuICAgIGxldCBoYWxmVG9SYWQgPSAwLjUgKiBNYXRoLlBJIC8gMTgwLjA7XG4gICAgeCAqPSBoYWxmVG9SYWQ7XG4gICAgeSAqPSBoYWxmVG9SYWQ7XG4gICAgeiAqPSBoYWxmVG9SYWQ7XG5cbiAgICBsZXQgc3ggPSBNYXRoLnNpbih4KTtcbiAgICBsZXQgY3ggPSBNYXRoLmNvcyh4KTtcbiAgICBsZXQgc3kgPSBNYXRoLnNpbih5KTtcbiAgICBsZXQgY3kgPSBNYXRoLmNvcyh5KTtcbiAgICBsZXQgc3ogPSBNYXRoLnNpbih6KTtcbiAgICBsZXQgY3ogPSBNYXRoLmNvcyh6KTtcblxuICAgIG91dFswXSA9IHN4ICogY3kgKiBjeiAtIGN4ICogc3kgKiBzejtcbiAgICBvdXRbMV0gPSBjeCAqIHN5ICogY3ogKyBzeCAqIGN5ICogc3o7XG4gICAgb3V0WzJdID0gY3ggKiBjeSAqIHN6IC0gc3ggKiBzeSAqIGN6O1xuICAgIG91dFszXSA9IGN4ICogY3kgKiBjeiArIHN4ICogc3kgKiBzejtcblxuICAgIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyBhIHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiBhIHF1YXRlbmlvblxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXG4gKiBAcmV0dXJucyB7U3RyaW5nfSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgdGhlIHZlY3RvclxuICovXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICdxdWF0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJyknO1xufVxuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHZhbHVlcyBmcm9tIGFuIGV4aXN0aW5nIHF1YXRlcm5pb25cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgcXVhdGVybmlvbiB0byBjbG9uZVxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgY2xvbmUgPSB2ZWM0LmNsb25lO1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcgcXVhdCBpbml0aWFsaXplZCB3aXRoIHRoZSBnaXZlbiB2YWx1ZXNcbiAqXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IGEgbmV3IHF1YXRlcm5pb25cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZnJvbVZhbHVlcyA9IHZlYzQuZnJvbVZhbHVlcztcblxuLyoqXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgcXVhdCB0byBhbm90aGVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIHNvdXJjZSBxdWF0ZXJuaW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGNvcHkgPSB2ZWM0LmNvcHk7XG5cbi8qKlxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgcXVhdCB0byB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB6IFogY29tcG9uZW50XG4gKiBAcGFyYW0ge051bWJlcn0gdyBXIGNvbXBvbmVudFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzZXQgPSB2ZWM0LnNldDtcblxuLyoqXG4gKiBBZGRzIHR3byBxdWF0J3NcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBhZGQgPSB2ZWM0LmFkZDtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHF1YXQubXVsdGlwbHl9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IG11bCA9IG11bHRpcGx5O1xuXG4vKipcbiAqIFNjYWxlcyBhIHF1YXQgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzY2FsZSA9IHZlYzQuc2NhbGU7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkb3QgPSB2ZWM0LmRvdDtcblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHF1YXQnc1xuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvblxuICogQHBhcmFtIHtxdWF0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3F1YXR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGxlcnAgPSB2ZWM0LmxlcnA7XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgcXVhdFxuICpcbiAqIEBwYXJhbSB7cXVhdH0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGNvbnN0IGxlbmd0aCA9IHZlYzQubGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5sZW5ndGh9XG4gKiBAZnVuY3Rpb25cbiAqL1xuZXhwb3J0IGNvbnN0IGxlbiA9IGxlbmd0aDtcblxuLyoqXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGxlbmd0aCBvZiBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBsZW5ndGggb2YgYVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzcXVhcmVkTGVuZ3RoID0gdmVjNC5zcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgcXVhdC5zcXVhcmVkTGVuZ3RofVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBzcXJMZW4gPSBzcXVhcmVkTGVuZ3RoO1xuXG4vKipcbiAqIE5vcm1hbGl6ZSBhIHF1YXRcbiAqXG4gKiBAcGFyYW0ge3F1YXR9IG91dCB0aGUgcmVjZWl2aW5nIHF1YXRlcm5pb25cbiAqIEBwYXJhbSB7cXVhdH0gYSBxdWF0ZXJuaW9uIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3F1YXR9IG91dFxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBub3JtYWxpemUgPSB2ZWM0Lm5vcm1hbGl6ZTtcblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSBxdWF0ZXJuaW9ucyBoYXZlIGV4YWN0bHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24gKHdoZW4gY29tcGFyZWQgd2l0aCA9PT0pXG4gKlxuICogQHBhcmFtIHtxdWF0fSBhIFRoZSBmaXJzdCBxdWF0ZXJuaW9uLlxuICogQHBhcmFtIHtxdWF0fSBiIFRoZSBzZWNvbmQgcXVhdGVybmlvbi5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgY29uc3QgZXhhY3RFcXVhbHMgPSB2ZWM0LmV4YWN0RXF1YWxzO1xuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHF1YXRlcm5pb25zIGhhdmUgYXBwcm94aW1hdGVseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbi5cbiAqXG4gKiBAcGFyYW0ge3F1YXR9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7cXVhdH0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgY29uc3QgZXF1YWxzID0gdmVjNC5lcXVhbHM7XG5cbi8qKlxuICogU2V0cyBhIHF1YXRlcm5pb24gdG8gcmVwcmVzZW50IHRoZSBzaG9ydGVzdCByb3RhdGlvbiBmcm9tIG9uZVxuICogdmVjdG9yIHRvIGFub3RoZXIuXG4gKlxuICogQm90aCB2ZWN0b3JzIGFyZSBhc3N1bWVkIHRvIGJlIHVuaXQgbGVuZ3RoLlxuICpcbiAqIEBwYXJhbSB7cXVhdH0gb3V0IHRoZSByZWNlaXZpbmcgcXVhdGVybmlvbi5cbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgaW5pdGlhbCB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgZGVzdGluYXRpb24gdmVjdG9yXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBjb25zdCByb3RhdGlvblRvID0gKGZ1bmN0aW9uKCkge1xuICBsZXQgdG1wdmVjMyA9IHZlYzMuY3JlYXRlKCk7XG4gIGxldCB4VW5pdFZlYzMgPSB2ZWMzLmZyb21WYWx1ZXMoMSwwLDApO1xuICBsZXQgeVVuaXRWZWMzID0gdmVjMy5mcm9tVmFsdWVzKDAsMSwwKTtcblxuICByZXR1cm4gZnVuY3Rpb24ob3V0LCBhLCBiKSB7XG4gICAgbGV0IGRvdCA9IHZlYzMuZG90KGEsIGIpO1xuICAgIGlmIChkb3QgPCAtMC45OTk5OTkpIHtcbiAgICAgIHZlYzMuY3Jvc3ModG1wdmVjMywgeFVuaXRWZWMzLCBhKTtcbiAgICAgIGlmICh2ZWMzLmxlbih0bXB2ZWMzKSA8IDAuMDAwMDAxKVxuICAgICAgICB2ZWMzLmNyb3NzKHRtcHZlYzMsIHlVbml0VmVjMywgYSk7XG4gICAgICB2ZWMzLm5vcm1hbGl6ZSh0bXB2ZWMzLCB0bXB2ZWMzKTtcbiAgICAgIHNldEF4aXNBbmdsZShvdXQsIHRtcHZlYzMsIE1hdGguUEkpO1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9IGVsc2UgaWYgKGRvdCA+IDAuOTk5OTk5KSB7XG4gICAgICBvdXRbMF0gPSAwO1xuICAgICAgb3V0WzFdID0gMDtcbiAgICAgIG91dFsyXSA9IDA7XG4gICAgICBvdXRbM10gPSAxO1xuICAgICAgcmV0dXJuIG91dDtcbiAgICB9IGVsc2Uge1xuICAgICAgdmVjMy5jcm9zcyh0bXB2ZWMzLCBhLCBiKTtcbiAgICAgIG91dFswXSA9IHRtcHZlYzNbMF07XG4gICAgICBvdXRbMV0gPSB0bXB2ZWMzWzFdO1xuICAgICAgb3V0WzJdID0gdG1wdmVjM1syXTtcbiAgICAgIG91dFszXSA9IDEgKyBkb3Q7XG4gICAgICByZXR1cm4gbm9ybWFsaXplKG91dCwgb3V0KTtcbiAgICB9XG4gIH07XG59KSgpO1xuXG4vKipcbiAqIFBlcmZvcm1zIGEgc3BoZXJpY2FsIGxpbmVhciBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXG4gKlxuICogQHBhcmFtIHtxdWF0fSBvdXQgdGhlIHJlY2VpdmluZyBxdWF0ZXJuaW9uXG4gKiBAcGFyYW0ge3F1YXR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7cXVhdH0gYyB0aGUgdGhpcmQgb3BlcmFuZFxuICogQHBhcmFtIHtxdWF0fSBkIHRoZSBmb3VydGggb3BlcmFuZFxuICogQHBhcmFtIHtOdW1iZXJ9IHQgaW50ZXJwb2xhdGlvbiBhbW91bnQsIGluIHRoZSByYW5nZSBbMC0xXSwgYmV0d2VlbiB0aGUgdHdvIGlucHV0c1xuICogQHJldHVybnMge3F1YXR9IG91dFxuICovXG5leHBvcnQgY29uc3Qgc3FsZXJwID0gKGZ1bmN0aW9uICgpIHtcbiAgbGV0IHRlbXAxID0gY3JlYXRlKCk7XG4gIGxldCB0ZW1wMiA9IGNyZWF0ZSgpO1xuXG4gIHJldHVybiBmdW5jdGlvbiAob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gICAgc2xlcnAodGVtcDEsIGEsIGQsIHQpO1xuICAgIHNsZXJwKHRlbXAyLCBiLCBjLCB0KTtcbiAgICBzbGVycChvdXQsIHRlbXAxLCB0ZW1wMiwgMiAqIHQgKiAoMSAtIHQpKTtcblxuICAgIHJldHVybiBvdXQ7XG4gIH07XG59KCkpO1xuXG4vKipcbiAqIFNldHMgdGhlIHNwZWNpZmllZCBxdWF0ZXJuaW9uIHdpdGggdmFsdWVzIGNvcnJlc3BvbmRpbmcgdG8gdGhlIGdpdmVuXG4gKiBheGVzLiBFYWNoIGF4aXMgaXMgYSB2ZWMzIGFuZCBpcyBleHBlY3RlZCB0byBiZSB1bml0IGxlbmd0aCBhbmRcbiAqIHBlcnBlbmRpY3VsYXIgdG8gYWxsIG90aGVyIHNwZWNpZmllZCBheGVzLlxuICpcbiAqIEBwYXJhbSB7dmVjM30gdmlldyAgdGhlIHZlY3RvciByZXByZXNlbnRpbmcgdGhlIHZpZXdpbmcgZGlyZWN0aW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHJpZ2h0IHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhbCBcInJpZ2h0XCIgZGlyZWN0aW9uXG4gKiBAcGFyYW0ge3ZlYzN9IHVwICAgIHRoZSB2ZWN0b3IgcmVwcmVzZW50aW5nIHRoZSBsb2NhbCBcInVwXCIgZGlyZWN0aW9uXG4gKiBAcmV0dXJucyB7cXVhdH0gb3V0XG4gKi9cbmV4cG9ydCBjb25zdCBzZXRBeGVzID0gKGZ1bmN0aW9uKCkge1xuICBsZXQgbWF0ciA9IG1hdDMuY3JlYXRlKCk7XG5cbiAgcmV0dXJuIGZ1bmN0aW9uKG91dCwgdmlldywgcmlnaHQsIHVwKSB7XG4gICAgbWF0clswXSA9IHJpZ2h0WzBdO1xuICAgIG1hdHJbM10gPSByaWdodFsxXTtcbiAgICBtYXRyWzZdID0gcmlnaHRbMl07XG5cbiAgICBtYXRyWzFdID0gdXBbMF07XG4gICAgbWF0cls0XSA9IHVwWzFdO1xuICAgIG1hdHJbN10gPSB1cFsyXTtcblxuICAgIG1hdHJbMl0gPSAtdmlld1swXTtcbiAgICBtYXRyWzVdID0gLXZpZXdbMV07XG4gICAgbWF0cls4XSA9IC12aWV3WzJdO1xuXG4gICAgcmV0dXJuIG5vcm1hbGl6ZShvdXQsIGZyb21NYXQzKG91dCwgbWF0cikpO1xuICB9O1xufSkoKTtcbiIsImltcG9ydCAqIGFzIGdsTWF0cml4IGZyb20gXCIuL2NvbW1vbi5qc1wiO1xuXG4vKipcbiAqIDIgRGltZW5zaW9uYWwgVmVjdG9yXG4gKiBAbW9kdWxlIHZlYzJcbiAqL1xuXG4vKipcbiAqIENyZWF0ZXMgYSBuZXcsIGVtcHR5IHZlYzJcbiAqXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgyKTtcbiAgb3V0WzBdID0gMDtcbiAgb3V0WzFdID0gMDtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB2YWx1ZXMgZnJvbSBhbiBleGlzdGluZyB2ZWN0b3JcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIGNsb25lXG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIGxldCBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgyKTtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBDcmVhdGVzIGEgbmV3IHZlYzIgaW5pdGlhbGl6ZWQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXG4gKlxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcbiAqIEBwYXJhbSB7TnVtYmVyfSB5IFkgY29tcG9uZW50XG4gKiBAcmV0dXJucyB7dmVjMn0gYSBuZXcgMkQgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKHgsIHkpIHtcbiAgbGV0IG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDIpO1xuICBvdXRbMF0gPSB4O1xuICBvdXRbMV0gPSB5O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIENvcHkgdGhlIHZhbHVlcyBmcm9tIG9uZSB2ZWMyIHRvIGFub3RoZXJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBzb3VyY2UgdmVjdG9yXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBjb3B5KG91dCwgYSkge1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzIgdG8gdGhlIGdpdmVuIHZhbHVlc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHkpIHtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhZGQob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTXVsdGlwbGllcyB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHkob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiWzBdO1xuICBvdXRbMV0gPSBhWzFdICogYlsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBEaXZpZGVzIHR3byB2ZWMyJ3NcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7dmVjMn0gb3V0XG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXZpZGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLyBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC8gYlsxXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2VpbFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5mbG9vciB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBmbG9vclxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gZmxvb3Iob3V0LCBhKSB7XG4gIG91dFswXSA9IE1hdGguZmxvb3IoYVswXSk7XG4gIG91dFsxXSA9IE1hdGguZmxvb3IoYVsxXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWluaW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWluKG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1pbihhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5taW4oYVsxXSwgYlsxXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgbWF4aW11bSBvZiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbWF4KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBNYXRoLm1heChhWzBdLCBiWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5tYXgoYVsxXSwgYlsxXSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTWF0aC5yb3VuZCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byByb3VuZFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gcm91bmQgKG91dCwgYSkge1xuICBvdXRbMF0gPSBNYXRoLnJvdW5kKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLnJvdW5kKGFbMV0pO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFNjYWxlcyBhIHZlYzIgYnkgYSBzY2FsYXIgbnVtYmVyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHNjYWxlXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBBZGRzIHR3byB2ZWMyJ3MgYWZ0ZXIgc2NhbGluZyB0aGUgc2Vjb25kIG9wZXJhbmQgYnkgYSBzY2FsYXIgdmFsdWVcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiIGJ5IGJlZm9yZSBhZGRpbmdcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHNjYWxlQW5kQWRkKG91dCwgYSwgYiwgc2NhbGUpIHtcbiAgb3V0WzBdID0gYVswXSArIChiWzBdICogc2NhbGUpO1xuICBvdXRbMV0gPSBhWzFdICsgKGJbMV0gKiBzY2FsZSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZXVjbGlkaWFuIGRpc3RhbmNlIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBkaXN0YW5jZShhLCBiKSB7XG4gIHZhciB4ID0gYlswXSAtIGFbMF0sXG4gICAgeSA9IGJbMV0gLSBhWzFdO1xuICByZXR1cm4gTWF0aC5zcXJ0KHgqeCArIHkqeSk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgc3F1YXJlZCBldWNsaWRpYW4gZGlzdGFuY2UgYmV0d2VlbiB0d28gdmVjMidzXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHRoZSBmaXJzdCBvcGVyYW5kXG4gKiBAcGFyYW0ge3ZlYzJ9IGIgdGhlIHNlY29uZCBvcGVyYW5kXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGRpc3RhbmNlIGJldHdlZW4gYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZERpc3RhbmNlKGEsIGIpIHtcbiAgdmFyIHggPSBiWzBdIC0gYVswXSxcbiAgICB5ID0gYlsxXSAtIGFbMV07XG4gIHJldHVybiB4KnggKyB5Knk7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIGxlbmd0aCBvZlxuICogQHJldHVybnMge051bWJlcn0gbGVuZ3RoIG9mIGFcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlbmd0aChhKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICB5ID0gYVsxXTtcbiAgcmV0dXJuIE1hdGguc3FydCh4KnggKyB5KnkpO1xufVxuXG4vKipcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB2ZWN0b3IgdG8gY2FsY3VsYXRlIHNxdWFyZWQgbGVuZ3RoIG9mXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkTGVuZ3RoIChhKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICB5ID0gYVsxXTtcbiAgcmV0dXJuIHgqeCArIHkqeTtcbn1cblxuLyoqXG4gKiBOZWdhdGVzIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5lZ2F0ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbmVnYXRlKG91dCwgYSkge1xuICBvdXRbMF0gPSAtYVswXTtcbiAgb3V0WzFdID0gLWFbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogUmV0dXJucyB0aGUgaW52ZXJzZSBvZiB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzJcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byBpbnZlcnRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGludmVyc2Uob3V0LCBhKSB7XG4gIG91dFswXSA9IDEuMCAvIGFbMF07XG4gIG91dFsxXSA9IDEuMCAvIGFbMV07XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogTm9ybWFsaXplIGEgdmVjMlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdmVjdG9yIHRvIG5vcm1hbGl6ZVxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gbm9ybWFsaXplKG91dCwgYSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIHZhciBsZW4gPSB4KnggKyB5Knk7XG4gIGlmIChsZW4gPiAwKSB7XG4gICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgb3V0WzBdID0gYVswXSAqIGxlbjtcbiAgICBvdXRbMV0gPSBhWzFdICogbGVuO1xuICB9XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge051bWJlcn0gZG90IHByb2R1Y3Qgb2YgYSBhbmQgYlxuICovXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV07XG59XG5cbi8qKlxuICogQ29tcHV0ZXMgdGhlIGNyb3NzIHByb2R1Y3Qgb2YgdHdvIHZlYzInc1xuICogTm90ZSB0aGF0IHRoZSBjcm9zcyBwcm9kdWN0IG11c3QgYnkgZGVmaW5pdGlvbiBwcm9kdWNlIGEgM0QgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxuICogQHBhcmFtIHt2ZWMyfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxuICogQHJldHVybnMge3ZlYzN9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gY3Jvc3Mob3V0LCBhLCBiKSB7XG4gIHZhciB6ID0gYVswXSAqIGJbMV0gLSBhWzFdICogYlswXTtcbiAgb3V0WzBdID0gb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzInc1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGxlcnAob3V0LCBhLCBiLCB0KSB7XG4gIHZhciBheCA9IGFbMF0sXG4gICAgYXkgPSBhWzFdO1xuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2VuZXJhdGVzIGEgcmFuZG9tIHZlY3RvciB3aXRoIHRoZSBnaXZlbiBzY2FsZVxuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge051bWJlcn0gW3NjYWxlXSBMZW5ndGggb2YgdGhlIHJlc3VsdGluZyB2ZWN0b3IuIElmIG9tbWl0dGVkLCBhIHVuaXQgdmVjdG9yIHdpbGwgYmUgcmV0dXJuZWRcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJhbmRvbShvdXQsIHNjYWxlKSB7XG4gIHNjYWxlID0gc2NhbGUgfHwgMS4wO1xuICB2YXIgciA9IGdsTWF0cml4LlJBTkRPTSgpICogMi4wICogTWF0aC5QSTtcbiAgb3V0WzBdID0gTWF0aC5jb3MocikgKiBzY2FsZTtcbiAgb3V0WzFdID0gTWF0aC5zaW4ocikgKiBzY2FsZTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQyXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyfSBtIG1hdHJpeCB0byB0cmFuc2Zvcm0gd2l0aFxuICogQHJldHVybnMge3ZlYzJ9IG91dFxuICovXG5leHBvcnQgZnVuY3Rpb24gdHJhbnNmb3JtTWF0MihvdXQsIGEsIG0pIHtcbiAgdmFyIHggPSBhWzBdLFxuICAgIHkgPSBhWzFdO1xuICBvdXRbMF0gPSBtWzBdICogeCArIG1bMl0gKiB5O1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5O1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDJkXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxuICogQHBhcmFtIHttYXQyZH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDJkKG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgeSA9IGFbMV07XG4gIG91dFswXSA9IG1bMF0gKiB4ICsgbVsyXSAqIHkgKyBtWzRdO1xuICBvdXRbMV0gPSBtWzFdICogeCArIG1bM10gKiB5ICsgbVs1XTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMyIHdpdGggYSBtYXQzXG4gKiAzcmQgdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0M30gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDMob3V0LCBhLCBtKSB7XG4gIHZhciB4ID0gYVswXSxcbiAgICB5ID0gYVsxXTtcbiAgb3V0WzBdID0gbVswXSAqIHggKyBtWzNdICogeSArIG1bNl07XG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs0XSAqIHkgKyBtWzddO1xuICByZXR1cm4gb3V0O1xufVxuXG4vKipcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzIgd2l0aCBhIG1hdDRcbiAqIDNyZCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzAnXG4gKiA0dGggdmVjdG9yIGNvbXBvbmVudCBpcyBpbXBsaWNpdGx5ICcxJ1xuICpcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cbiAqIEBwYXJhbSB7bWF0NH0gbSBtYXRyaXggdG8gdHJhbnNmb3JtIHdpdGhcbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zZm9ybU1hdDQob3V0LCBhLCBtKSB7XG4gIGxldCB4ID0gYVswXTtcbiAgbGV0IHkgPSBhWzFdO1xuICBvdXRbMF0gPSBtWzBdICogeCArIG1bNF0gKiB5ICsgbVsxMl07XG4gIG91dFsxXSA9IG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzEzXTtcbiAgcmV0dXJuIG91dDtcbn1cblxuLyoqXG4gKiBSb3RhdGUgYSAyRCB2ZWN0b3JcbiAqIEBwYXJhbSB7dmVjMn0gb3V0IFRoZSByZWNlaXZpbmcgdmVjMlxuICogQHBhcmFtIHt2ZWMyfSBhIFRoZSB2ZWMyIHBvaW50IHRvIHJvdGF0ZVxuICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBvcmlnaW4gb2YgdGhlIHJvdGF0aW9uXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cbiAqIEByZXR1cm5zIHt2ZWMyfSBvdXRcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIGIsIGMpIHtcbiAgLy9UcmFuc2xhdGUgcG9pbnQgdG8gdGhlIG9yaWdpblxuICBsZXQgcDAgPSBhWzBdIC0gYlswXSxcbiAgcDEgPSBhWzFdIC0gYlsxXSxcbiAgc2luQyA9IE1hdGguc2luKGMpLFxuICBjb3NDID0gTWF0aC5jb3MoYyk7XG4gIFxuICAvL3BlcmZvcm0gcm90YXRpb24gYW5kIHRyYW5zbGF0ZSB0byBjb3JyZWN0IHBvc2l0aW9uXG4gIG91dFswXSA9IHAwKmNvc0MgLSBwMSpzaW5DICsgYlswXTtcbiAgb3V0WzFdID0gcDAqc2luQyArIHAxKmNvc0MgKyBiWzFdO1xuXG4gIHJldHVybiBvdXQ7XG59XG5cbi8qKlxuICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAyRCB2ZWN0b3JzXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IG9wZXJhbmRcbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIG9wZXJhbmRcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBhbmdsZShhLCBiKSB7XG4gIGxldCB4MSA9IGFbMF0sXG4gICAgeTEgPSBhWzFdLFxuICAgIHgyID0gYlswXSxcbiAgICB5MiA9IGJbMV07XG4gIFxuICBsZXQgbGVuMSA9IHgxKngxICsgeTEqeTE7XG4gIGlmIChsZW4xID4gMCkge1xuICAgIC8vVE9ETzogZXZhbHVhdGUgdXNlIG9mIGdsbV9pbnZzcXJ0IGhlcmU/XG4gICAgbGVuMSA9IDEgLyBNYXRoLnNxcnQobGVuMSk7XG4gIH1cbiAgXG4gIGxldCBsZW4yID0geDIqeDIgKyB5Mip5MjtcbiAgaWYgKGxlbjIgPiAwKSB7XG4gICAgLy9UT0RPOiBldmFsdWF0ZSB1c2Ugb2YgZ2xtX2ludnNxcnQgaGVyZT9cbiAgICBsZW4yID0gMSAvIE1hdGguc3FydChsZW4yKTtcbiAgfVxuICBcbiAgbGV0IGNvc2luZSA9ICh4MSAqIHgyICsgeTEgKiB5MikgKiBsZW4xICogbGVuMjtcbiAgXG4gIFxuICBpZihjb3NpbmUgPiAxLjApIHtcbiAgICByZXR1cm4gMDtcbiAgfVxuICBlbHNlIGlmKGNvc2luZSA8IC0xLjApIHtcbiAgICByZXR1cm4gTWF0aC5QSTtcbiAgfSBlbHNlIHtcbiAgICByZXR1cm4gTWF0aC5hY29zKGNvc2luZSk7XG4gIH1cbn1cblxuLyoqXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXG4gKlxuICogQHBhcmFtIHt2ZWMyfSBhIHZlY3RvciB0byByZXByZXNlbnQgYXMgYSBzdHJpbmdcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBzdHIoYSkge1xuICByZXR1cm4gJ3ZlYzIoJyArIGFbMF0gKyAnLCAnICsgYVsxXSArICcpJztcbn1cblxuLyoqXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGV4YWN0bHkgaGF2ZSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcbiAqXG4gKiBAcGFyYW0ge3ZlYzJ9IGEgVGhlIGZpcnN0IHZlY3Rvci5cbiAqIEBwYXJhbSB7dmVjMn0gYiBUaGUgc2Vjb25kIHZlY3Rvci5cbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxuICovXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdO1xufVxuXG4vKipcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIHZlY3RvcnMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxuICpcbiAqIEBwYXJhbSB7dmVjMn0gYSBUaGUgZmlyc3QgdmVjdG9yLlxuICogQHBhcmFtIHt2ZWMyfSBiIFRoZSBzZWNvbmQgdmVjdG9yLlxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXG4gKi9cbmV4cG9ydCBmdW5jdGlvbiBlcXVhbHMoYSwgYikge1xuICBsZXQgYTAgPSBhWzBdLCBhMSA9IGFbMV07XG4gIGxldCBiMCA9IGJbMF0sIGIxID0gYlsxXTtcbiAgcmV0dXJuIChNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OKk1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTApLCBNYXRoLmFicyhiMCkpICYmXG4gICAgICAgICAgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTipNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExKSwgTWF0aC5hYnMoYjEpKSk7XG59XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmxlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgbGVuID0gbGVuZ3RoO1xuXG4vKipcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMi5zdWJ0cmFjdH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3ViID0gc3VidHJhY3Q7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLm11bHRpcGx5fVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBtdWwgPSBtdWx0aXBseTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuZGl2aWRlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXYgPSBkaXZpZGU7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLmRpc3RhbmNlfVxuICogQGZ1bmN0aW9uXG4gKi9cbmV4cG9ydCBjb25zdCBkaXN0ID0gZGlzdGFuY2U7XG5cbi8qKlxuICogQWxpYXMgZm9yIHtAbGluayB2ZWMyLnNxdWFyZWREaXN0YW5jZX1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcblxuLyoqXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzIuc3F1YXJlZExlbmd0aH1cbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3Qgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcblxuLyoqXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjMnMuXG4gKlxuICogQHBhcmFtIHtBcnJheX0gYSB0aGUgYXJyYXkgb2YgdmVjdG9ycyB0byBpdGVyYXRlIG92ZXJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMi4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXG4gKiBAcGFyYW0ge051bWJlcn0gb2Zmc2V0IE51bWJlciBvZiBlbGVtZW50cyB0byBza2lwIGF0IHRoZSBiZWdpbm5pbmcgb2YgdGhlIGFycmF5XG4gKiBAcGFyYW0ge051bWJlcn0gY291bnQgTnVtYmVyIG9mIHZlYzJzIHRvIGl0ZXJhdGUgb3Zlci4gSWYgMCBpdGVyYXRlcyBvdmVyIGVudGlyZSBhcnJheVxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XG4gKiBAcGFyYW0ge09iamVjdH0gW2FyZ10gYWRkaXRpb25hbCBhcmd1bWVudCB0byBwYXNzIHRvIGZuXG4gKiBAcmV0dXJucyB7QXJyYXl9IGFcbiAqIEBmdW5jdGlvblxuICovXG5leHBvcnQgY29uc3QgZm9yRWFjaCA9IChmdW5jdGlvbigpIHtcbiAgbGV0IHZlYyA9IGNyZWF0ZSgpO1xuXG4gIHJldHVybiBmdW5jdGlvbihhLCBzdHJpZGUsIG9mZnNldCwgY291bnQsIGZuLCBhcmcpIHtcbiAgICBsZXQgaSwgbDtcbiAgICBpZighc3RyaWRlKSB7XG4gICAgICBzdHJpZGUgPSAyO1xuICAgIH1cblxuICAgIGlmKCFvZmZzZXQpIHtcbiAgICAgIG9mZnNldCA9IDA7XG4gICAgfVxuXG4gICAgaWYoY291bnQpIHtcbiAgICAgIGwgPSBNYXRoLm1pbigoY291bnQgKiBzdHJpZGUpICsgb2Zmc2V0LCBhLmxlbmd0aCk7XG4gICAgfSBlbHNlIHtcbiAgICAgIGwgPSBhLmxlbmd0aDtcbiAgICB9XG5cbiAgICBmb3IoaSA9IG9mZnNldDsgaSA8IGw7IGkgKz0gc3RyaWRlKSB7XG4gICAgICB2ZWNbMF0gPSBhW2ldOyB2ZWNbMV0gPSBhW2krMV07XG4gICAgICBmbih2ZWMsIHZlYywgYXJnKTtcbiAgICAgIGFbaV0gPSB2ZWNbMF07IGFbaSsxXSA9IHZlY1sxXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbiAgfTtcbn0pKCk7XG4iLCJjbGFzcyBNb2RpZnkge1xuICAgIHN0YXRpYyBnZXREYXRhID0gKGluZGV4LCBzdGVwLCBhcnJheSkgPT4ge1xuICAgICAgICBjb25zdCBpID0gaW5kZXggKiBzdGVwO1xuICAgICAgICBjb25zdCBkYXRhID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc3RlcDsgaisrKSB7XG4gICAgICAgICAgICBkYXRhLnB1c2goYXJyYXlbaSArIGpdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH1cblxuICAgIHN0YXRpYyBkZXRhY2ggPSAoZ2VvbWV0cnkpID0+IHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgICAgIGNvbnN0IG5vcm1hbHMgPSBbXTtcbiAgICAgICAgY29uc3QgdXZzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnZW9tZXRyeS5pbmRpY2VzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgICAgICBjb25zdCBmYSA9IGdlb21ldHJ5LmluZGljZXNbaSArIDBdO1xuICAgICAgICAgICAgY29uc3QgZmIgPSBnZW9tZXRyeS5pbmRpY2VzW2kgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IGZjID0gZ2VvbWV0cnkuaW5kaWNlc1tpICsgMl07XG5cbiAgICAgICAgICAgIC8vIGdldHMgZmFjZXNcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZiLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcblxuICAgICAgICAgICAgLy8gZ2V0cyBub3JtYWxzXG4gICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmEsIDMsIGdlb21ldHJ5Lm5vcm1hbHMpKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMywgZ2VvbWV0cnkubm9ybWFscykpO1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAzLCBnZW9tZXRyeS5ub3JtYWxzKSk7XG5cbiAgICAgICAgICAgIC8vIGdldHMgdXZzXG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYSwgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYywgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgbm9ybWFscyxcbiAgICAgICAgICAgIHV2cyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICAvLyBldmVyeSBmYWNlICgzIHBvaW50cykgYmVjb21lcyAxIHRldHJhaGVkcm9uXG4gICAgc3RhdGljIG1vZGlmeSA9IChnZW9tZXRyeSkgPT4ge1xuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3Qgbm9ybWFscyA9IFtdO1xuICAgICAgICBjb25zdCB1dnMgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdlb21ldHJ5LmluZGljZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGNvbnN0IGZhID0gZ2VvbWV0cnkuaW5kaWNlc1tpICsgMF07XG4gICAgICAgICAgICBjb25zdCBmYiA9IGdlb21ldHJ5LmluZGljZXNbaSArIDFdO1xuICAgICAgICAgICAgY29uc3QgZmMgPSBnZW9tZXRyeS5pbmRpY2VzW2kgKyAyXTtcblxuICAgICAgICAgICAgLy8gZ2V0cyBmYWNlcyBDQkEgb3JkZXJcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZiLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcblxuICAgICAgICAgICAgLy8gZ2V0cyBub3JtYWxzXG4gICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmEsIDMsIGdlb21ldHJ5Lm5vcm1hbHMpKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMywgZ2VvbWV0cnkubm9ybWFscykpO1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAzLCBnZW9tZXRyeS5ub3JtYWxzKSk7XG5cbiAgICAgICAgICAgIC8vIGdldHMgdXZzXG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYSwgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYywgMiwgZ2VvbWV0cnkudXZzKSk7XG5cbiAgICAgICAgICAgIC8vIEVYVFJBU1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmEsIDMsIGdlb21ldHJ5LnBvc2l0aW9ucykpO1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmMsIDMsIGdlb21ldHJ5LnBvc2l0aW9ucykpO1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goMCwgMCwgMCk7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYywgMywgZ2VvbWV0cnkucG9zaXRpb25zKSk7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMywgZ2VvbWV0cnkucG9zaXRpb25zKSk7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCgwLCAwLCAwKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZiLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKDAsIDAsIDApO1xuXG4gICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmEsIDMsIGdlb21ldHJ5Lm5vcm1hbHMpKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYywgMywgZ2VvbWV0cnkubm9ybWFscykpO1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKDAsIDAsIDApO1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAzLCBnZW9tZXRyeS5ub3JtYWxzKSk7XG4gICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmIsIDMsIGdlb21ldHJ5Lm5vcm1hbHMpKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCgwLCAwLCAwKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMywgZ2VvbWV0cnkubm9ybWFscykpO1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAzLCBnZW9tZXRyeS5ub3JtYWxzKSk7XG4gICAgICAgICAgICBub3JtYWxzLnB1c2goMCwgMCwgMCk7XG5cbiAgICAgICAgICAgIHV2cy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAyLCBnZW9tZXRyeS51dnMpKTtcbiAgICAgICAgICAgIHV2cy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAyLCBnZW9tZXRyeS51dnMpKTtcbiAgICAgICAgICAgIHV2cy5wdXNoKDAsIDApO1xuICAgICAgICAgICAgdXZzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmMsIDIsIGdlb21ldHJ5LnV2cykpO1xuICAgICAgICAgICAgdXZzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmIsIDIsIGdlb21ldHJ5LnV2cykpO1xuICAgICAgICAgICAgdXZzLnB1c2goMCwgMCk7XG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYSwgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgICAgICB1dnMucHVzaCgwLCAwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwb3NpdGlvbnMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IHsgTW9kaWZ5IH07XG4iLCIvKipcbiAqIFV0aWxpdGllc1xuICogQG1vZHVsZSBnZW9tZXRyaWVzL3V0aWxzXG4gKi9cblxuaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbi8qKlxuICogZmxhdHRlbnMgYW4gYXJyYXkgb3IgdmVydGljZXNcbiAqXG4gKiBAcGFyYW0ge1R5cGV9IHR5cGUgQXJyYXkgdHlwZSwgc3VjaCBhcyBGbG9hdDMyQXJyYXkgb3IgQXJyYXlcbiAqL1xuZXhwb3J0IGZ1bmN0aW9uIGZsYXR0ZW4oYXJyKSB7XG4gICAgbGV0IG91dHB1dCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGlmIChBcnJheS5pc0FycmF5KGFycltpXSkgfHwgYXJyW2ldIGluc3RhbmNlb2YgRmxvYXQzMkFycmF5KSB7XG4gICAgICAgICAgICBvdXRwdXQgPSBvdXRwdXQuY29uY2F0KGZsYXR0ZW4oYXJyW2ldKSk7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICBvdXRwdXQucHVzaChhcnJbaV0pO1xuICAgICAgICB9XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiB1bmZsYXR0ZW4oYXJyLCBhbW91bnQpIHtcbiAgICBjb25zdCBvdXRwdXQgPSBbXTtcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyci5sZW5ndGg7IGkgKz0gYW1vdW50KSB7XG4gICAgICAgIGNvbnN0IHZhbHVlID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgYW1vdW50OyBqKyspIHtcbiAgICAgICAgICAgIHZhbHVlLnB1c2goYXJyW2kgKyBqXSk7XG4gICAgICAgIH1cbiAgICAgICAgb3V0cHV0LnB1c2godmFsdWUpO1xuICAgIH1cbiAgICByZXR1cm4gb3V0cHV0O1xufVxuXG5leHBvcnQgZnVuY3Rpb24gZ2VuZXJhdGVWZXJ0ZXhOb3JtYWxzKHBvc2l0aW9ucywgaW5kaWNlcykge1xuICAgIGNvbnN0IGZhY2VzID0gdW5mbGF0dGVuKGluZGljZXMsIDMpO1xuICAgIGNvbnN0IHZlcnRpY2VzID0gdW5mbGF0dGVuKHBvc2l0aW9ucywgMyk7XG5cbiAgICBjb25zdCB0ZW1wID0gW107XG5cbiAgICBjb25zdCBjYiA9IHZlYzMuY3JlYXRlKCk7XG4gICAgY29uc3QgYWIgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgIGNvbnN0IGNyb3NzID0gdmVjMy5jcmVhdGUoKTtcblxuICAgIGxldCB2QTtcbiAgICBsZXQgdkI7XG4gICAgbGV0IHZDO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBmYWNlID0gZmFjZXNbaV07XG4gICAgICAgIGNvbnN0IGEgPSBmYWNlWzBdO1xuICAgICAgICBjb25zdCBiID0gZmFjZVsxXTtcbiAgICAgICAgY29uc3QgYyA9IGZhY2VbMl07XG5cbiAgICAgICAgdkEgPSB2ZXJ0aWNlc1thXTtcbiAgICAgICAgdkIgPSB2ZXJ0aWNlc1tiXTtcbiAgICAgICAgdkMgPSB2ZXJ0aWNlc1tjXTtcblxuICAgICAgICB2ZWMzLnN1YnRyYWN0KGNiLCB2QywgdkIpO1xuICAgICAgICB2ZWMzLnN1YnRyYWN0KGFiLCB2QSwgdkIpO1xuICAgICAgICB2ZWMzLmNyb3NzKGNyb3NzLCBjYiwgYWIpO1xuXG4gICAgICAgIGlmICh0ZW1wW2FdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRlbXBbYV0gPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKHRlbXBbYl0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGVtcFtiXSA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGVtcFtjXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0ZW1wW2NdID0gdmVjMy5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHZlYzMuYWRkKHRlbXBbYV0sIHRlbXBbYV0sIGNyb3NzKTtcbiAgICAgICAgdmVjMy5hZGQodGVtcFtiXSwgdGVtcFtiXSwgY3Jvc3MpO1xuICAgICAgICB2ZWMzLmFkZCh0ZW1wW2NdLCB0ZW1wW2NdLCBjcm9zcyk7XG4gICAgfVxuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0ZW1wLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIHZlYzMubm9ybWFsaXplKHRlbXBbaV0sIHRlbXBbaV0pO1xuICAgIH1cblxuICAgIHJldHVybiBmbGF0dGVuKHRlbXAsIDMpO1xufVxuXG5leHBvcnQgZnVuY3Rpb24gbWVyZ2VWZXJ0aWNlcyhkYXRhKSB7XG4gICAgY29uc3QgcG9zaXRpb25zID0gdW5mbGF0dGVuKGRhdGEucG9zaXRpb25zLCAzKTtcbiAgICBjb25zdCB2ZXJ0aWNlc01hcCA9IHt9O1xuICAgIGNvbnN0IHVuaXF1ZSA9IFtdO1xuICAgIGNvbnN0IGNoYW5nZXMgPSBbXTtcblxuICAgIGNvbnN0IHByZWNpc2lvblBvaW50cyA9IDQ7IC8vIG51bWJlciBvZiBkZWNpbWFsIHBvaW50cywgZS5nLiA0IGZvciBlcHNpbG9uIG9mIDAuMDAwMVxuICAgIGNvbnN0IHByZWNpc2lvbiA9IE1hdGgucG93KDEwLCBwcmVjaXNpb25Qb2ludHMpOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG5cbiAgICAvLyByZW1vdmUgZHVwbGljYXRlZCBwb3NpdGlvbnNcbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCB2ID0gcG9zaXRpb25zW2ldO1xuICAgICAgICBjb25zdCBrZXkgPSBgXG4gICAgICAgICAgICAke01hdGgucm91bmQodlswXSAqIHByZWNpc2lvbil9X1xuICAgICAgICAgICAgJHtNYXRoLnJvdW5kKHZbMV0gKiBwcmVjaXNpb24pfV9cbiAgICAgICAgICAgICR7TWF0aC5yb3VuZCh2WzJdICogcHJlY2lzaW9uKX1cbiAgICAgICAgYDtcblxuICAgICAgICBpZiAodmVydGljZXNNYXBba2V5XSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB2ZXJ0aWNlc01hcFtrZXldID0gaTtcbiAgICAgICAgICAgIHVuaXF1ZS5wdXNoKHBvc2l0aW9uc1tpXSk7XG4gICAgICAgICAgICBjaGFuZ2VzW2ldID0gdW5pcXVlLmxlbmd0aCAtIDE7XG4gICAgICAgIH0gZWxzZSB7XG4gICAgICAgICAgICAvLyBjb25zb2xlLmxvZygnRHVwbGljYXRlIHZlcnRleCBmb3VuZC4gJywgaSwgJyBjb3VsZCBiZSB1c2luZyAnLCB2ZXJ0aWNlc01hcFtrZXldKTtcbiAgICAgICAgICAgIGNoYW5nZXNbaV0gPSBjaGFuZ2VzW3ZlcnRpY2VzTWFwW2tleV1dO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGR1cGxpY2F0ZWQgZmFjZXNcbiAgICBjb25zdCBmYWNlSW5kaWNlc1RvUmVtb3ZlID0gW107XG4gICAgY29uc3QgZmFjZXMgPSB1bmZsYXR0ZW4oZGF0YS5pbmRpY2VzLCAzKTtcblxuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmFjZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgY29uc3QgZmFjZSA9IGZhY2VzW2ldO1xuXG4gICAgICAgIGZhY2VbMF0gPSBjaGFuZ2VzW2ZhY2VbMF1dO1xuICAgICAgICBmYWNlWzFdID0gY2hhbmdlc1tmYWNlWzFdXTtcbiAgICAgICAgZmFjZVsyXSA9IGNoYW5nZXNbZmFjZVsyXV07XG5cbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IFtmYWNlWzBdLCBmYWNlWzFdLCBmYWNlWzJdXTtcblxuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IDM7IG4rKykge1xuICAgICAgICAgICAgaWYgKGluZGljZXNbbl0gPT09IGluZGljZXNbKG4gKyAxKSAlIDNdKSB7XG4gICAgICAgICAgICAgICAgZmFjZUluZGljZXNUb1JlbW92ZS5wdXNoKGkpO1xuICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxuXG4gICAgLy8gcmVtb3ZlIGR1cGxpY2F0ZWQgdXZzXG4gICAgZm9yIChsZXQgaSA9IGZhY2VJbmRpY2VzVG9SZW1vdmUubGVuZ3RoIC0gMTsgaSA+PSAwOyBpLS0pIHtcbiAgICAgICAgY29uc3QgaWR4ID0gZmFjZUluZGljZXNUb1JlbW92ZVtpXTtcblxuICAgICAgICBmYWNlcy5zcGxpY2UoaWR4LCAxKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8IHRoaXMuZmFjZVZlcnRleFV2cy5sZW5ndGg7IGorKykge1xuICAgICAgICAgICAgdGhpcy5mYWNlVmVydGV4VXZzW2pdLnNwbGljZShpZHgsIDEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgY29uc3QgcCA9IGZsYXR0ZW4odW5pcXVlLCAzKTtcbiAgICBjb25zdCBmID0gZmxhdHRlbihmYWNlcywgMyk7XG5cbiAgICByZXR1cm4ge1xuICAgICAgICBwb3NpdGlvbnM6IG5ldyBGbG9hdDMyQXJyYXkocCksXG4gICAgICAgIGluZGljZXM6IG5ldyBVaW50MTZBcnJheShmKSxcbiAgICAgICAgbm9ybWFsczogbmV3IEZsb2F0MzJBcnJheShnZW5lcmF0ZVZlcnRleE5vcm1hbHMocCwgZikpLFxuICAgIH07XG59XG5cbmV4cG9ydCB7IE1vZGlmeSB9IGZyb20gJy4vbW9kaWZ5JztcbiIsImltcG9ydCB7IGdlbmVyYXRlVmVydGV4Tm9ybWFscywgZmxhdHRlbiwgdW5mbGF0dGVuIH0gZnJvbSAnLi91dGlscyc7XG5cbmNsYXNzIFBvbHloZWRyYSB7XG4gICAgY29uc3RydWN0b3IocG9zaXRpb25zLCBmYWNlcywgcmFkaXVzLCBkZXRhaWwgPSAwKSB7XG4gICAgICAgIGNvbnN0IHV2cyA9IFtdO1xuXG4gICAgICAgIGxldCBjb21wbGV4ID0ge1xuICAgICAgICAgICAgZmFjZXM6IHVuZmxhdHRlbihmYWNlcywgMyksXG4gICAgICAgICAgICBwb3NpdGlvbnM6IHVuZmxhdHRlbihwb3NpdGlvbnMsIDMpLFxuICAgICAgICB9O1xuXG4gICAgICAgIGxldCBkID0gTWF0aC5taW4oZGV0YWlsLCA0KTtcblxuICAgICAgICB3aGlsZSAoZC0tID4gMCkge1xuICAgICAgICAgICAgY29tcGxleCA9IHRoaXMuc3ViZGl2aWRlKGNvbXBsZXgpO1xuICAgICAgICB9XG5cbiAgICAgICAgLy8gZ2VuZXJhdGUgdXZzXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY29tcGxleC5wb3NpdGlvbnMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHBvc2l0aW9uID0gdGhpcy5ub3JtYWxpemUoY29tcGxleC5wb3NpdGlvbnNbaV0pO1xuICAgICAgICAgICAgY29uc3QgdSA9IDAuNSAqICgtKE1hdGguYXRhbjIocG9zaXRpb25bMl0sIC1wb3NpdGlvblswXSkgLyBNYXRoLlBJKSArIDEuMCk7XG4gICAgICAgICAgICBjb25zdCB2ID0gMC41ICsgKE1hdGguYXNpbihwb3NpdGlvblsxXSkgLyBNYXRoLlBJKTtcbiAgICAgICAgICAgIHV2cy5wdXNoKFsxIC0gdSwgMSAtIHZdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIC8vIGh0dHA6Ly9tZnQtZGV2LmRrL3V2LW1hcHBpbmctc3BoZXJlL1xuICAgICAgICAvLyB0aGlzLmZpeFBvbGVVVnMoY29tcGxleC5wb3NpdGlvbnMsIGNvbXBsZXguZmFjZXMsIHV2cyk7XG5cbiAgICAgICAgLy8gc2NhbGUgcG9zaXRpb25zXG4gICAgICAgIHBvc2l0aW9ucyA9IGNvbXBsZXgucG9zaXRpb25zOyAvLyBlc2xpbnQtZGlzYWJsZS1saW5lXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICAvLyB0aGlzLm5vcm1hbGl6ZShwb3NpdGlvbnNbaV0pO1xuICAgICAgICAgICAgdGhpcy5zY2FsZShwb3NpdGlvbnNbaV0sIHJhZGl1cyk7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBnZW9tZXRyeSA9IHtcbiAgICAgICAgICAgIHBvc2l0aW9uczogZmxhdHRlbihjb21wbGV4LnBvc2l0aW9ucyksXG4gICAgICAgICAgICBpbmRpY2VzOiBmbGF0dGVuKGNvbXBsZXguZmFjZXMpLFxuICAgICAgICAgICAgbm9ybWFsczogbnVsbCxcbiAgICAgICAgICAgIHV2czogZmxhdHRlbih1dnMsIDIpLFxuICAgICAgICB9O1xuXG4gICAgICAgIHRoaXMuZ2VvbWV0cnkgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IGdlb21ldHJ5LnBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXM6IGdlb21ldHJ5LmluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzOiBnZW5lcmF0ZVZlcnRleE5vcm1hbHMoZ2VvbWV0cnkucG9zaXRpb25zLCBnZW9tZXRyeS5pbmRpY2VzKSxcbiAgICAgICAgICAgIHV2czogZmxhdHRlbih1dnMsIDIpLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGZpeFBvbGVVVnMocG9zaXRpb25zLCBjZWxscywgdXZzKSB7XG4gICAgICAgIGNvbnN0IG5vcnRoSW5kZXggPSB0aGlzLmZpcnN0WUluZGV4KHBvc2l0aW9ucywgMSk7XG4gICAgICAgIGNvbnN0IHNvdXRoSW5kZXggPSB0aGlzLmZpcnN0WUluZGV4KHBvc2l0aW9ucywgLTEpO1xuXG4gICAgICAgIGlmIChub3J0aEluZGV4ID09PSAtMSB8fCBzb3V0aEluZGV4ID09PSAtMSkge1xuICAgICAgICAgICAgLy8gY291bGQgbm90IGZpbmQgYW55IHBvbGVzLCBiYWlsIGVhcmx5XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBuZXdWZXJ0aWNlcyA9IHBvc2l0aW9ucy5zbGljZSgpO1xuICAgICAgICBjb25zdCBuZXdVdnMgPSB1dnMuc2xpY2UoKTtcbiAgICAgICAgbGV0IHZlcnRpY2VJbmRleCA9IG5ld1ZlcnRpY2VzLmxlbmd0aCAtIDE7XG5cbiAgICAgICAgZnVuY3Rpb24gdmlzaXQoY2VsbCwgcG9sZUluZGV4LCBiLCBjKSB7XG4gICAgICAgICAgICBjb25zdCB1djEgPSB1dnNbYl07XG4gICAgICAgICAgICBjb25zdCB1djIgPSB1dnNbY107XG4gICAgICAgICAgICB1dnNbcG9sZUluZGV4XVswXSA9ICh1djFbMF0gKyB1djJbMF0pIC8gMjtcbiAgICAgICAgICAgIHZlcnRpY2VJbmRleCsrO1xuICAgICAgICAgICAgbmV3VmVydGljZXMucHVzaChwb3NpdGlvbnNbcG9sZUluZGV4XS5zbGljZSgpKTtcbiAgICAgICAgICAgIG5ld1V2cy5wdXNoKHV2c1twb2xlSW5kZXhdLnNsaWNlKCkpO1xuICAgICAgICAgICAgY2VsbFswXSA9IHZlcnRpY2VJbmRleDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgY2VsbHMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSBjZWxsc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGEgPSBjZWxsWzBdO1xuICAgICAgICAgICAgY29uc3QgYiA9IGNlbGxbMV07XG4gICAgICAgICAgICBjb25zdCBjID0gY2VsbFsyXTtcblxuICAgICAgICAgICAgaWYgKGEgPT09IG5vcnRoSW5kZXgpIHtcbiAgICAgICAgICAgICAgICB2aXNpdChjZWxsLCBub3J0aEluZGV4LCBiLCBjKTtcbiAgICAgICAgICAgIH0gZWxzZSBpZiAoYSA9PT0gc291dGhJbmRleCkge1xuICAgICAgICAgICAgICAgIHZpc2l0KGNlbGwsIHNvdXRoSW5kZXgsIGIsIGMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcG9zaXRpb25zID0gbmV3VmVydGljZXM7XG4gICAgICAgIHV2cyA9IG5ld1V2cztcbiAgICB9XG5cbiAgICBmaXJzdFlJbmRleChsaXN0LCB2YWx1ZSkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGxpc3QubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IHZlYyA9IGxpc3RbaV07XG4gICAgICAgICAgICBpZiAoTWF0aC5hYnModmVjWzFdIC0gdmFsdWUpIDw9IDFlLTQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gaTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuICAgICAgICByZXR1cm4gLTE7XG4gICAgfVxuXG4gICAgbm9ybWFsaXplKHZlYykge1xuICAgICAgICBsZXQgbWFnID0gMDtcbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCB2ZWMubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIG1hZyArPSB2ZWNbbl0gKiB2ZWNbbl07XG4gICAgICAgIH1cbiAgICAgICAgbWFnID0gTWF0aC5zcXJ0KG1hZyk7XG5cbiAgICAgICAgLy8gYXZvaWQgZGl2aWRpbmcgYnkgemVyb1xuICAgICAgICBpZiAobWFnID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm4gQXJyYXkuYXBwbHkobnVsbCwgbmV3IEFycmF5KHZlYy5sZW5ndGgpKS5tYXAoTnVtYmVyLnByb3RvdHlwZS52YWx1ZU9mLCAwKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCB2ZWMubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIHZlY1tuXSAvPSBtYWc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmVjO1xuICAgIH1cblxuICAgIHNjYWxlKHZlYywgZmFjdG9yKSB7XG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgdmVjLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICB2ZWNbbl0gKj0gZmFjdG9yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZWM7XG4gICAgfVxuXG4gICAgc3ViZGl2aWRlKGNvbXBsZXgpIHtcbiAgICAgICAgY29uc3QgeyBwb3NpdGlvbnMsIGZhY2VzIH0gPSBjb21wbGV4O1xuXG4gICAgICAgIGNvbnN0IG5ld0NlbGxzID0gW107XG4gICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCBtaWRwb2ludHMgPSB7fTtcbiAgICAgICAgbGV0IGwgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIG1pZHBvaW50KGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICAgICAgKGFbMF0gKyBiWzBdKSAvIDIsIChhWzFdICsgYlsxXSkgLyAyLCAoYVsyXSArIGJbMl0pIC8gMixcbiAgICAgICAgICAgIF07XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBwb2ludFRvS2V5KHBvaW50KSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cG9pbnRbMF0udG9QcmVjaXNpb24oNil9LCR7cG9pbnRbMV0udG9QcmVjaXNpb24oNil9LCR7cG9pbnRbMl0udG9QcmVjaXNpb24oNil9YDtcbiAgICAgICAgfVxuXG4gICAgICAgIGZ1bmN0aW9uIGdldE1pZHBvaW50KGEsIGIpIHtcbiAgICAgICAgICAgIGNvbnN0IHBvaW50ID0gbWlkcG9pbnQoYSwgYik7XG4gICAgICAgICAgICBjb25zdCBwb2ludEtleSA9IHBvaW50VG9LZXkocG9pbnQpO1xuICAgICAgICAgICAgY29uc3QgY2FjaGVkUG9pbnQgPSBtaWRwb2ludHNbcG9pbnRLZXldO1xuICAgICAgICAgICAgaWYgKGNhY2hlZFBvaW50KSB7XG4gICAgICAgICAgICAgICAgcmV0dXJuIGNhY2hlZFBvaW50O1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbWlkcG9pbnRzW3BvaW50S2V5XSA9IHBvaW50O1xuICAgICAgICAgICAgcmV0dXJuIG1pZHBvaW50c1twb2ludEtleV07XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZhY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBjZWxsID0gZmFjZXNbaV07XG4gICAgICAgICAgICBjb25zdCBjMCA9IGNlbGxbMF07XG4gICAgICAgICAgICBjb25zdCBjMSA9IGNlbGxbMV07XG4gICAgICAgICAgICBjb25zdCBjMiA9IGNlbGxbMl07XG4gICAgICAgICAgICBjb25zdCB2MCA9IHBvc2l0aW9uc1tjMF07XG4gICAgICAgICAgICBjb25zdCB2MSA9IHBvc2l0aW9uc1tjMV07XG4gICAgICAgICAgICBjb25zdCB2MiA9IHBvc2l0aW9uc1tjMl07XG5cbiAgICAgICAgICAgIGNvbnN0IGEgPSBnZXRNaWRwb2ludCh2MCwgdjEpO1xuICAgICAgICAgICAgY29uc3QgYiA9IGdldE1pZHBvaW50KHYxLCB2Mik7XG4gICAgICAgICAgICBjb25zdCBjID0gZ2V0TWlkcG9pbnQodjIsIHYwKTtcblxuICAgICAgICAgICAgbGV0IGFpID0gbmV3UG9zaXRpb25zLmluZGV4T2YoYSk7XG4gICAgICAgICAgICBpZiAoYWkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgYWkgPSBsKys7XG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb25zLnB1c2goYSk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgYmkgPSBuZXdQb3NpdGlvbnMuaW5kZXhPZihiKTtcbiAgICAgICAgICAgIGlmIChiaSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBiaSA9IGwrKztcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbnMucHVzaChiKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBjaSA9IG5ld1Bvc2l0aW9ucy5pbmRleE9mKGMpO1xuICAgICAgICAgICAgaWYgKGNpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGNpID0gbCsrO1xuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9ucy5wdXNoKGMpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBsZXQgdjBpID0gbmV3UG9zaXRpb25zLmluZGV4T2YodjApO1xuICAgICAgICAgICAgaWYgKHYwaSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB2MGkgPSBsKys7XG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb25zLnB1c2godjApO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHYxaSA9IG5ld1Bvc2l0aW9ucy5pbmRleE9mKHYxKTtcbiAgICAgICAgICAgIGlmICh2MWkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdjFpID0gbCsrO1xuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9ucy5wdXNoKHYxKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCB2MmkgPSBuZXdQb3NpdGlvbnMuaW5kZXhPZih2Mik7XG4gICAgICAgICAgICBpZiAodjJpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHYyaSA9IGwrKztcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbnMucHVzaCh2Mik7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIG5ld0NlbGxzLnB1c2goW3YwaSwgYWksIGNpXSk7XG4gICAgICAgICAgICBuZXdDZWxscy5wdXNoKFt2MWksIGJpLCBhaV0pO1xuICAgICAgICAgICAgbmV3Q2VsbHMucHVzaChbdjJpLCBjaSwgYmldKTtcbiAgICAgICAgICAgIG5ld0NlbGxzLnB1c2goW2FpLCBiaSwgY2ldKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBmYWNlczogbmV3Q2VsbHMsXG4gICAgICAgICAgICBwb3NpdGlvbnM6IG5ld1Bvc2l0aW9ucyxcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFBvbHloZWRyYTtcbiIsImltcG9ydCBQb2x5aGVkcmEgZnJvbSAnLi4vcG9seWhlZHJhJztcblxuY2xhc3MgVGV0cmFoZWRyb24gZXh0ZW5kcyBQb2x5aGVkcmEge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgcmFkaXVzOiAwLjUsXG4gICAgICAgICAgICBkZXRhaWw6IDAsXG4gICAgICAgIH0sIHByb3BzKTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXG4gICAgICAgICAgICAxLCAxLCAxLFxuICAgICAgICAgICAgLTEsIC0xLCAxLFxuICAgICAgICAgICAgLTEsIDEsIC0xLFxuICAgICAgICAgICAgMSwgLTEsIC0xLFxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBbXG4gICAgICAgICAgICAyLCAxLCAwLFxuICAgICAgICAgICAgMCwgMywgMixcbiAgICAgICAgICAgIDEsIDMsIDAsXG4gICAgICAgICAgICAyLCAzLCAxLFxuICAgICAgICBdO1xuXG4gICAgICAgIHN1cGVyKHBvc2l0aW9ucywgaW5kaWNlcywgc2V0dGluZ3MucmFkaXVzICogMiwgc2V0dGluZ3MuZGV0YWlsKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZW9tZXRyeTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRldHJhaGVkcm9uO1xuIiwiaW1wb3J0IFBvbHloZWRyYSBmcm9tICcuLi9wb2x5aGVkcmEnO1xuXG5jbGFzcyBIZXhhaGVkcm9uIGV4dGVuZHMgUG9seWhlZHJhIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIHJhZGl1czogMC41LFxuICAgICAgICAgICAgZGV0YWlsOiAwLFxuICAgICAgICB9LCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgciA9IHNldHRpbmdzLnJhZGl1cyAqIDI7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgLy8gRnJvbnQgZmFjZVxuICAgICAgICAgICAgLTEuMCwgLTEuMCwgMS4wLCAxLjAsIC0xLjAsIDEuMCwgMS4wLCAxLjAsIDEuMCwgLTEuMCwgMS4wLCAxLjAsXG4gICAgICAgICAgICAvLyBCYWNrIGZhY2VcbiAgICAgICAgICAgIC0xLjAsIC0xLjAsIC0xLjAsIC0xLjAsIDEuMCwgLTEuMCwgMS4wLCAxLjAsIC0xLjAsIDEuMCwgLTEuMCwgLTEuMCxcbiAgICAgICAgICAgIC8vIFRvcCBmYWNlXG4gICAgICAgICAgICAtMS4wLCAxLjAsIC0xLjAsIC0xLjAsIDEuMCwgMS4wLCAxLjAsIDEuMCwgMS4wLCAxLjAsIDEuMCwgLTEuMCxcbiAgICAgICAgICAgIC8vIEJvdHRvbSBmYWNlXG4gICAgICAgICAgICAtMS4wLCAtMS4wLCAtMS4wLCAxLjAsIC0xLjAsIC0xLjAsIDEuMCwgLTEuMCwgMS4wLCAtMS4wLCAtMS4wLCAxLjAsXG4gICAgICAgICAgICAvLyBSaWdodCBmYWNlXG4gICAgICAgICAgICAxLjAsIC0xLjAsIC0xLjAsIDEuMCwgMS4wLCAtMS4wLCAxLjAsIDEuMCwgMS4wLCAxLjAsIC0xLjAsIDEuMCxcbiAgICAgICAgICAgIC8vIExlZnQgZmFjZVxuICAgICAgICAgICAgLTEuMCwgLTEuMCwgLTEuMCwgLTEuMCwgLTEuMCwgMS4wLCAtMS4wLCAxLjAsIDEuMCwgLTEuMCwgMS4wLCAtMS4wLFxuICAgICAgICBdO1xuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zaXRpb25zLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgICAgICBwb3NpdGlvbnNbaSArIDBdICo9IHI7XG4gICAgICAgICAgICBwb3NpdGlvbnNbaSArIDFdICo9IHI7XG4gICAgICAgICAgICBwb3NpdGlvbnNbaSArIDJdICo9IHI7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbmRpY2VzID0gW1xuICAgICAgICAgICAgLy8gRnJvbnQgZmFjZVxuICAgICAgICAgICAgMCwgMSwgMiwgMCwgMiwgMyxcbiAgICAgICAgICAgIC8vIEJhY2sgZmFjZVxuICAgICAgICAgICAgNCwgNSwgNiwgNCwgNiwgNyxcbiAgICAgICAgICAgIC8vIFRvcCBmYWNlXG4gICAgICAgICAgICA4LCA5LCAxMCwgOCwgMTAsIDExLFxuICAgICAgICAgICAgLy8gQm90dG9tIGZhY2VcbiAgICAgICAgICAgIDEyLCAxMywgMTQsIDEyLCAxNCwgMTUsXG4gICAgICAgICAgICAvLyBSaWdodCBmYWNlXG4gICAgICAgICAgICAxNiwgMTcsIDE4LCAxNiwgMTgsIDE5LFxuICAgICAgICAgICAgLy8gTGVmdCBmYWNlXG4gICAgICAgICAgICAyMCwgMjEsIDIyLCAyMCwgMjIsIDIzLFxuICAgICAgICBdO1xuXG4gICAgICAgIHN1cGVyKHBvc2l0aW9ucywgaW5kaWNlcywgciwgc2V0dGluZ3MuZGV0YWlsKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZW9tZXRyeTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEhleGFoZWRyb247XG4iLCJpbXBvcnQgUG9seWhlZHJhIGZyb20gJy4uL3BvbHloZWRyYSc7XG5cbmNsYXNzIE9jdGFoZWRyb24gZXh0ZW5kcyBQb2x5aGVkcmEge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgcmFkaXVzOiAwLjUsXG4gICAgICAgICAgICBkZXRhaWw6IDAsXG4gICAgICAgIH0sIHByb3BzKTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXG4gICAgICAgICAgICAxLCAwLCAwLCAtMSwgMCwgMCwgMCwgMSwgMCxcbiAgICAgICAgICAgIDAsIC0xLCAwLCAwLCAwLCAxLCAwLCAwLCAtMSxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCBpbmRpY2VzID0gW1xuICAgICAgICAgICAgMCwgMiwgNCwgMCwgNCwgMywgMCwgMywgNSxcbiAgICAgICAgICAgIDAsIDUsIDIsIDEsIDIsIDUsIDEsIDUsIDMsXG4gICAgICAgICAgICAxLCAzLCA0LCAxLCA0LCAyLFxuICAgICAgICBdO1xuXG4gICAgICAgIHN1cGVyKHBvc2l0aW9ucywgaW5kaWNlcywgc2V0dGluZ3MucmFkaXVzICogMiwgc2V0dGluZ3MuZGV0YWlsKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZW9tZXRyeTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IE9jdGFoZWRyb247XG4iLCJpbXBvcnQgUG9seWhlZHJhIGZyb20gJy4uL3BvbHloZWRyYSc7XG5cbmNsYXNzIERvZGVjYWhlZHJvbiBleHRlbmRzIFBvbHloZWRyYSB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICByYWRpdXM6IDAuNSxcbiAgICAgICAgICAgIGRldGFpbDogMCxcbiAgICAgICAgfSwgcHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHQgPSAoMSArIE1hdGguc3FydCg1KSkgLyAyO1xuICAgICAgICBjb25zdCByID0gMSAvIHQ7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgLy8gKMKxMSwgwrExLCDCsTEpXG4gICAgICAgICAgICAtMSwgLTEsIC0xLCAtMSwgLTEsIDEsXG4gICAgICAgICAgICAtMSwgMSwgLTEsIC0xLCAxLCAxLFxuICAgICAgICAgICAgMSwgLTEsIC0xLCAxLCAtMSwgMSxcbiAgICAgICAgICAgIDEsIDEsIC0xLCAxLCAxLCAxLFxuXG4gICAgICAgICAgICAvLyAoMCwgwrExL8+GLCDCsc+GKVxuICAgICAgICAgICAgMCwgLXIsIC10LCAwLCAtciwgdCxcbiAgICAgICAgICAgIDAsIHIsIC10LCAwLCByLCB0LFxuXG4gICAgICAgICAgICAvLyAowrExL8+GLCDCsc+GLCAwKVxuICAgICAgICAgICAgLXIsIC10LCAwLCAtciwgdCwgMCxcbiAgICAgICAgICAgIHIsIC10LCAwLCByLCB0LCAwLFxuXG4gICAgICAgICAgICAvLyAowrHPhiwgMCwgwrExL8+GKVxuICAgICAgICAgICAgLXQsIDAsIC1yLCB0LCAwLCAtcixcbiAgICAgICAgICAgIC10LCAwLCByLCB0LCAwLCByLFxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBbXG4gICAgICAgICAgICAzLCAxMSwgNywgMywgNywgMTUsIDMsIDE1LCAxMyxcbiAgICAgICAgICAgIDcsIDE5LCAxNywgNywgMTcsIDYsIDcsIDYsIDE1LFxuICAgICAgICAgICAgMTcsIDQsIDgsIDE3LCA4LCAxMCwgMTcsIDEwLCA2LFxuICAgICAgICAgICAgOCwgMCwgMTYsIDgsIDE2LCAyLCA4LCAyLCAxMCxcbiAgICAgICAgICAgIDAsIDEyLCAxLCAwLCAxLCAxOCwgMCwgMTgsIDE2LFxuICAgICAgICAgICAgNiwgMTAsIDIsIDYsIDIsIDEzLCA2LCAxMywgMTUsXG4gICAgICAgICAgICAyLCAxNiwgMTgsIDIsIDE4LCAzLCAyLCAzLCAxMyxcbiAgICAgICAgICAgIDE4LCAxLCA5LCAxOCwgOSwgMTEsIDE4LCAxMSwgMyxcbiAgICAgICAgICAgIDQsIDE0LCAxMiwgNCwgMTIsIDAsIDQsIDAsIDgsXG4gICAgICAgICAgICAxMSwgOSwgNSwgMTEsIDUsIDE5LCAxMSwgMTksIDcsXG4gICAgICAgICAgICAxOSwgNSwgMTQsIDE5LCAxNCwgNCwgMTksIDQsIDE3LFxuICAgICAgICAgICAgMSwgMTIsIDE0LCAxLCAxNCwgNSwgMSwgNSwgOSxcbiAgICAgICAgXTtcblxuICAgICAgICBzdXBlcihwb3NpdGlvbnMsIGluZGljZXMsIHNldHRpbmdzLnJhZGl1cyAqIDIsIHNldHRpbmdzLmRldGFpbCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbWV0cnk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBEb2RlY2FoZWRyb247XG4iLCJpbXBvcnQgUG9seWhlZHJhIGZyb20gJy4uL3BvbHloZWRyYSc7XG5cbmNsYXNzIEljb3NhaGVkcm9uIGV4dGVuZHMgUG9seWhlZHJhIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIHJhZGl1czogMC41LFxuICAgICAgICAgICAgZGV0YWlsOiAwLFxuICAgICAgICB9LCBwcm9wcyk7XG5cbiAgICAgICAgY29uc3QgdCA9IDAuNSArIChNYXRoLnNxcnQoNSkgLyAyKTtcbiAgICAgICAgY29uc3QgciA9IHNldHRpbmdzLnJhZGl1cyAqIDI7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgLTEsICt0LCAwLFxuICAgICAgICAgICAgKzEsICt0LCAwLFxuICAgICAgICAgICAgLTEsIC10LCAwLFxuICAgICAgICAgICAgKzEsIC10LCAwLFxuICAgICAgICAgICAgMCwgLTEsICt0LFxuICAgICAgICAgICAgMCwgKzEsICt0LFxuICAgICAgICAgICAgMCwgLTEsIC10LFxuICAgICAgICAgICAgMCwgKzEsIC10LFxuICAgICAgICAgICAgK3QsIDAsIC0xLFxuICAgICAgICAgICAgK3QsIDAsICsxLFxuICAgICAgICAgICAgLXQsIDAsIC0xLFxuICAgICAgICAgICAgLXQsIDAsICsxLFxuICAgICAgICBdO1xuXG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBbXG4gICAgICAgICAgICAwLCAxMSwgNSxcbiAgICAgICAgICAgIDAsIDUsIDEsXG4gICAgICAgICAgICAwLCAxLCA3LFxuICAgICAgICAgICAgMCwgNywgMTAsXG4gICAgICAgICAgICAwLCAxMCwgMTEsXG4gICAgICAgICAgICAxLCA1LCA5LFxuICAgICAgICAgICAgNSwgMTEsIDQsXG4gICAgICAgICAgICAxMSwgMTAsIDIsXG4gICAgICAgICAgICAxMCwgNywgNixcbiAgICAgICAgICAgIDcsIDEsIDgsXG4gICAgICAgICAgICAzLCA5LCA0LFxuICAgICAgICAgICAgMywgNCwgMixcbiAgICAgICAgICAgIDMsIDIsIDYsXG4gICAgICAgICAgICAzLCA2LCA4LFxuICAgICAgICAgICAgMywgOCwgOSxcbiAgICAgICAgICAgIDQsIDksIDUsXG4gICAgICAgICAgICAyLCA0LCAxMSxcbiAgICAgICAgICAgIDYsIDIsIDEwLFxuICAgICAgICAgICAgOCwgNiwgNyxcbiAgICAgICAgICAgIDksIDgsIDEsXG4gICAgICAgIF07XG5cbiAgICAgICAgc3VwZXIocG9zaXRpb25zLCBpbmRpY2VzLCByLCBzZXR0aW5ncy5kZXRhaWwpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdlb21ldHJ5O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSWNvc2FoZWRyb247XG4iLCJjbGFzcyBQbGFuZSB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICB3aWR0aDogMSxcbiAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgIHN1YmRpdmlzaW9uc1g6IDEsXG4gICAgICAgICAgICBzdWJkaXZpc2lvbnNZOiAxLFxuICAgICAgICAgICAgYXhpczogJ1hZJyxcbiAgICAgICAgfSwgcHJvcHMpO1xuXG4gICAgICAgIGxldCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IFtdO1xuICAgICAgICBsZXQgbm9ybWFscyA9IFtdO1xuICAgICAgICBsZXQgdXZzID0gW107XG4gICAgICAgIGxldCBpbmRleCA9IDA7XG5cbiAgICAgICAgY29uc3QgdyA9IHNldHRpbmdzLndpZHRoICogMjtcbiAgICAgICAgY29uc3QgaCA9IHNldHRpbmdzLmhlaWdodCAqIDI7XG4gICAgICAgIGNvbnN0IHNwYWNlclggPSB3IC8gc2V0dGluZ3Muc3ViZGl2aXNpb25zWDtcbiAgICAgICAgY29uc3Qgc3BhY2VyWSA9IGggLyBzZXR0aW5ncy5zdWJkaXZpc2lvbnNZO1xuICAgICAgICBjb25zdCBvZmZzZXRYID0gLXcgKiAwLjU7XG4gICAgICAgIGNvbnN0IG9mZnNldFkgPSAtaCAqIDAuNTtcbiAgICAgICAgY29uc3Qgc3BhY2VyVSA9IDEgLyBzZXR0aW5ncy5zdWJkaXZpc2lvbnNYO1xuICAgICAgICBjb25zdCBzcGFjZXJWID0gMSAvIHNldHRpbmdzLnN1YmRpdmlzaW9uc1k7XG5cbiAgICAgICAgZm9yIChsZXQgeSA9IDA7IHkgPCBzZXR0aW5ncy5zdWJkaXZpc2lvbnNZOyB5KyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IHggPSAwOyB4IDwgc2V0dGluZ3Muc3ViZGl2aXNpb25zWDsgeCsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJpYW5nbGVYID0gKHNwYWNlclggKiB4KSArIG9mZnNldFg7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJpYW5nbGVZID0gKHNwYWNlclkgKiB5KSArIG9mZnNldFk7XG5cbiAgICAgICAgICAgICAgICBjb25zdCB1ID0geCAvIHNldHRpbmdzLnN1YmRpdmlzaW9uc1g7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IHkgLyBzZXR0aW5ncy5zdWJkaXZpc2lvbnNZO1xuXG4gICAgICAgICAgICAgICAgc3dpdGNoIChzZXR0aW5ncy5heGlzKSB7XG4gICAgICAgICAgICAgICAgY2FzZSAnWFonOlxuICAgICAgICAgICAgICAgICAgICAvLyBGYWNpbmcgdG93YXJkcyB5XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoW3RyaWFuZ2xlWCwgMCwgdHJpYW5nbGVZXSk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoW3RyaWFuZ2xlWCArIHNwYWNlclgsIDAsIHRyaWFuZ2xlWV0pO1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KFt0cmlhbmdsZVggKyBzcGFjZXJYLCAwLCB0cmlhbmdsZVkgKyBzcGFjZXJZXSk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoW3RyaWFuZ2xlWCwgMCwgdHJpYW5nbGVZICsgc3BhY2VyWV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbHMgPSBub3JtYWxzLmNvbmNhdChbMCwgMSwgMF0pO1xuICAgICAgICAgICAgICAgICAgICBub3JtYWxzID0gbm9ybWFscy5jb25jYXQoWzAsIDEsIDBdKTtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFswLCAxLCAwXSk7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbHMgPSBub3JtYWxzLmNvbmNhdChbMCwgMSwgMF0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UsIDEgLSB2XSk7XG4gICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UgKyBzcGFjZXJVLCAxIC0gdl0pO1xuICAgICAgICAgICAgICAgICAgICB1dnMgPSB1dnMuY29uY2F0KFt1ICsgc3BhY2VyVSwgMSAtICh2ICsgc3BhY2VyVildKTtcbiAgICAgICAgICAgICAgICAgICAgdXZzID0gdXZzLmNvbmNhdChbdSwgMSAtICh2ICsgc3BhY2VyVildKTtcbiAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgY2FzZSAnWVonOlxuICAgICAgICAgICAgICAgICAgICAvLyBGYWNpbmcgdG93YXJkcyB4XG5cbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChbMCwgdHJpYW5nbGVZLCB0cmlhbmdsZVhdKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChbMCwgdHJpYW5nbGVZLCB0cmlhbmdsZVggKyBzcGFjZXJYXSk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoWzAsIHRyaWFuZ2xlWSArIHNwYWNlclksIHRyaWFuZ2xlWCArIHNwYWNlclhdKTtcbiAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChbMCwgdHJpYW5nbGVZICsgc3BhY2VyWSwgdHJpYW5nbGVYXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFsxLCAwLCAwXSk7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbHMgPSBub3JtYWxzLmNvbmNhdChbMSwgMCwgMF0pO1xuICAgICAgICAgICAgICAgICAgICBub3JtYWxzID0gbm9ybWFscy5jb25jYXQoWzEsIDAsIDBdKTtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFsxLCAwLCAwXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgdXZzID0gdXZzLmNvbmNhdChbMSAtIHUsIHZdKTtcbiAgICAgICAgICAgICAgICAgICAgdXZzID0gdXZzLmNvbmNhdChbMSAtICh1ICsgc3BhY2VyVSksIHZdKTtcbiAgICAgICAgICAgICAgICAgICAgdXZzID0gdXZzLmNvbmNhdChbMSAtICh1ICsgc3BhY2VyVSksIHYgKyBzcGFjZXJWXSk7XG4gICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoWzEgLSB1LCB2ICsgc3BhY2VyVl0pO1xuICAgICAgICAgICAgICAgICAgICBicmVhaztcbiAgICAgICAgICAgICAgICBkZWZhdWx0OlxuICAgICAgICAgICAgICAgICAgICAvLyBGYWNpbmcgdG93YXJkcyB6XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoW3RyaWFuZ2xlWCwgdHJpYW5nbGVZLCAwXSk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoW3RyaWFuZ2xlWCArIHNwYWNlclgsIHRyaWFuZ2xlWSwgMF0pO1xuICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KFt0cmlhbmdsZVggKyBzcGFjZXJYLCB0cmlhbmdsZVkgKyBzcGFjZXJZLCAwXSk7XG4gICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoW3RyaWFuZ2xlWCwgdHJpYW5nbGVZICsgc3BhY2VyWSwgMF0pO1xuXG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbHMgPSBub3JtYWxzLmNvbmNhdChbMCwgMCwgMV0pO1xuICAgICAgICAgICAgICAgICAgICBub3JtYWxzID0gbm9ybWFscy5jb25jYXQoWzAsIDAsIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFswLCAwLCAxXSk7XG4gICAgICAgICAgICAgICAgICAgIG5vcm1hbHMgPSBub3JtYWxzLmNvbmNhdChbMCwgMCwgMV0pO1xuXG4gICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UsIHZdKTtcbiAgICAgICAgICAgICAgICAgICAgdXZzID0gdXZzLmNvbmNhdChbdSArIHNwYWNlclUsIHZdKTtcbiAgICAgICAgICAgICAgICAgICAgdXZzID0gdXZzLmNvbmNhdChbdSArIHNwYWNlclUsIHYgKyBzcGFjZXJWXSk7XG4gICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UsIHYgKyBzcGFjZXJWXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKChpbmRleCAqIDQpICsgMCk7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKChpbmRleCAqIDQpICsgMSk7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKChpbmRleCAqIDQpICsgMik7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKChpbmRleCAqIDQpICsgMCk7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKChpbmRleCAqIDQpICsgMik7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKChpbmRleCAqIDQpICsgMyk7XG5cbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxhbmU7XG4iLCJjbGFzcyBCb3gge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgd2lkdGg6IDEsXG4gICAgICAgICAgICBoZWlnaHQ6IDEsXG4gICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgfSwgcHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtcbiAgICAgICAgICAgIC8vIEZyb250IGZhY2VcbiAgICAgICAgICAgIC0wLjUsIC0wLjUsIDAuNSwgMC41LCAtMC41LCAwLjUsIDAuNSwgMC41LCAwLjUsIC0wLjUsIDAuNSwgMC41LFxuICAgICAgICAgICAgLy8gQmFjayBmYWNlXG4gICAgICAgICAgICAtMC41LCAtMC41LCAtMC41LCAtMC41LCAwLjUsIC0wLjUsIDAuNSwgMC41LCAtMC41LCAwLjUsIC0wLjUsIC0wLjUsXG4gICAgICAgICAgICAvLyBUb3AgZmFjZVxuICAgICAgICAgICAgLTAuNSwgMC41LCAtMC41LCAtMC41LCAwLjUsIDAuNSwgMC41LCAwLjUsIDAuNSwgMC41LCAwLjUsIC0wLjUsXG4gICAgICAgICAgICAvLyBCb3R0b20gZmFjZVxuICAgICAgICAgICAgLTAuNSwgLTAuNSwgLTAuNSwgMC41LCAtMC41LCAtMC41LCAwLjUsIC0wLjUsIDAuNSwgLTAuNSwgLTAuNSwgMC41LFxuICAgICAgICAgICAgLy8gUmlnaHQgZmFjZVxuICAgICAgICAgICAgMC41LCAtMC41LCAtMC41LCAwLjUsIDAuNSwgLTAuNSwgMC41LCAwLjUsIDAuNSwgMC41LCAtMC41LCAwLjUsXG4gICAgICAgICAgICAvLyBMZWZ0IGZhY2VcbiAgICAgICAgICAgIC0wLjUsIC0wLjUsIC0wLjUsIC0wLjUsIC0wLjUsIDAuNSwgLTAuNSwgMC41LCAwLjUsIC0wLjUsIDAuNSwgLTAuNSxcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9ucy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgcG9zaXRpb25zW2kgKyAwXSAqPSBzZXR0aW5ncy53aWR0aDtcbiAgICAgICAgICAgIHBvc2l0aW9uc1tpICsgMV0gKj0gc2V0dGluZ3MuaGVpZ2h0O1xuICAgICAgICAgICAgcG9zaXRpb25zW2kgKyAyXSAqPSBzZXR0aW5ncy5kZXB0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBbXG4gICAgICAgICAgICAvLyBGcm9udCBmYWNlXG4gICAgICAgICAgICAwLCAxLCAyLCAwLCAyLCAzLFxuICAgICAgICAgICAgLy8gQmFjayBmYWNlXG4gICAgICAgICAgICA0LCA1LCA2LCA0LCA2LCA3LFxuICAgICAgICAgICAgLy8gVG9wIGZhY2VcbiAgICAgICAgICAgIDgsIDksIDEwLCA4LCAxMCwgMTEsXG4gICAgICAgICAgICAvLyBCb3R0b20gZmFjZVxuICAgICAgICAgICAgMTIsIDEzLCAxNCwgMTIsIDE0LCAxNSxcbiAgICAgICAgICAgIC8vIFJpZ2h0IGZhY2VcbiAgICAgICAgICAgIDE2LCAxNywgMTgsIDE2LCAxOCwgMTksXG4gICAgICAgICAgICAvLyBMZWZ0IGZhY2VcbiAgICAgICAgICAgIDIwLCAyMSwgMjIsIDIwLCAyMiwgMjMsXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3Qgbm9ybWFscyA9IFtcbiAgICAgICAgICAgIC8vIEZyb250XG4gICAgICAgICAgICAwLjAsIDAuMCwgMS4wLCAwLjAsIDAuMCwgMS4wLCAwLjAsIDAuMCwgMS4wLCAwLjAsIDAuMCwgMS4wLFxuICAgICAgICAgICAgLy8gQmFja1xuICAgICAgICAgICAgMC4wLCAwLjAsIC0xLjAsIDAuMCwgMC4wLCAtMS4wLCAwLjAsIDAuMCwgLTEuMCwgMC4wLCAwLjAsIC0xLjAsXG4gICAgICAgICAgICAvLyBUb3BcbiAgICAgICAgICAgIDAuMCwgMS4wLCAwLjAsIDAuMCwgMS4wLCAwLjAsIDAuMCwgMS4wLCAwLjAsIDAuMCwgMS4wLCAwLjAsXG4gICAgICAgICAgICAvLyBCb3R0b21cbiAgICAgICAgICAgIDAuMCwgLTEuMCwgMC4wLCAwLjAsIC0xLjAsIDAuMCwgMC4wLCAtMS4wLCAwLjAsIDAuMCwgLTEuMCwgMC4wLFxuICAgICAgICAgICAgLy8gUmlnaHRcbiAgICAgICAgICAgIDEuMCwgMC4wLCAwLjAsIDEuMCwgMC4wLCAwLjAsIDEuMCwgMC4wLCAwLjAsIDEuMCwgMC4wLCAwLjAsXG4gICAgICAgICAgICAvLyBMZWZ0XG4gICAgICAgICAgICAtMS4wLCAwLjAsIDAuMCwgLTEuMCwgMC4wLCAwLjAsIC0xLjAsIDAuMCwgMC4wLCAtMS4wLCAwLjAsIDAuMCxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCB1dnMgPSBbXG4gICAgICAgICAgICAvLyBGcm9udCBmYWNlXG4gICAgICAgICAgICAwLjAsIDAuMCwgMS4wLCAwLjAsIDEuMCwgMS4wLCAwLjAsIDEuMCxcbiAgICAgICAgICAgIC8vIEJhY2sgZmFjZVxuICAgICAgICAgICAgMS4wLCAwLjAsIDEuMCwgMS4wLCAwLjAsIDEuMCwgMC4wLCAwLjAsXG4gICAgICAgICAgICAvLyBUb3AgZmFjZVxuICAgICAgICAgICAgMC4wLCAxLjAsIDAuMCwgMC4wLCAxLjAsIDAuMCwgMS4wLCAxLjAsXG4gICAgICAgICAgICAvLyBCb3R0b20gZmFjZVxuICAgICAgICAgICAgMS4wLCAxLjAsIDAuMCwgMS4wLCAwLjAsIDAuMCwgMS4wLCAwLjAsXG4gICAgICAgICAgICAvLyBSaWdodCBmYWNlXG4gICAgICAgICAgICAxLjAsIDAuMCwgMS4wLCAxLjAsIDAuMCwgMS4wLCAwLjAsIDAuMCxcbiAgICAgICAgICAgIC8vIExlZnQgZmFjZVxuICAgICAgICAgICAgMC4wLCAwLjAsIDEuMCwgMC4wLCAxLjAsIDEuMCwgMC4wLCAxLjAsXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm94O1xuIiwiaW1wb3J0IHsgbWF0NCwgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbmNvbnN0IG1hdFJvdFkgPSBtYXQ0LmNyZWF0ZSgpO1xuY29uc3QgbWF0Um90WiA9IG1hdDQuY3JlYXRlKCk7XG5jb25zdCB1cCA9IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKTtcbmNvbnN0IHRtcFZlYzMgPSB2ZWMzLmNyZWF0ZSgpO1xuXG5jbGFzcyBTcGhlcmUge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbih7fSwge1xuICAgICAgICAgICAgcmFkaXVzOiAwLjUsXG4gICAgICAgICAgICBzZWdtZW50czogOCxcbiAgICAgICAgfSwgcHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCBpbmRpY2VzID0gW107XG4gICAgICAgIGNvbnN0IG5vcm1hbHMgPSBbXTtcbiAgICAgICAgY29uc3QgdXZzID0gW107XG5cbiAgICAgICAgY29uc3QgaGVpZ2h0U2VnbWVudHMgPSAyICsgc2V0dGluZ3Muc2VnbWVudHM7XG4gICAgICAgIGNvbnN0IHdpZHRoU2VnbWVudHMgPSAyICogaGVpZ2h0U2VnbWVudHM7XG5cbiAgICAgICAgZm9yIChsZXQgelN0ZXAgPSAwOyB6U3RlcCA8PSBoZWlnaHRTZWdtZW50czsgelN0ZXArKykge1xuICAgICAgICAgICAgY29uc3QgdiA9IHpTdGVwIC8gaGVpZ2h0U2VnbWVudHM7XG4gICAgICAgICAgICBjb25zdCBhbmdsZVogPSAodiAqIE1hdGguUEkpO1xuXG4gICAgICAgICAgICBmb3IgKGxldCB5U3RlcCA9IDA7IHlTdGVwIDw9IHdpZHRoU2VnbWVudHM7IHlTdGVwKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1ID0geVN0ZXAgLyB3aWR0aFNlZ21lbnRzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlWSA9IHUgKiBNYXRoLlBJICogMjtcblxuICAgICAgICAgICAgICAgIG1hdDQuaWRlbnRpdHkobWF0Um90Wik7XG4gICAgICAgICAgICAgICAgbWF0NC5yb3RhdGVaKG1hdFJvdFosIG1hdFJvdFosIC1hbmdsZVopO1xuXG4gICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eShtYXRSb3RZKTtcbiAgICAgICAgICAgICAgICBtYXQ0LnJvdGF0ZVkobWF0Um90WSwgbWF0Um90WSwgYW5nbGVZKTtcblxuICAgICAgICAgICAgICAgIHZlYzMudHJhbnNmb3JtTWF0NCh0bXBWZWMzLCB1cCwgbWF0Um90Wik7XG4gICAgICAgICAgICAgICAgdmVjMy50cmFuc2Zvcm1NYXQ0KHRtcFZlYzMsIHRtcFZlYzMsIG1hdFJvdFkpO1xuXG4gICAgICAgICAgICAgICAgdmVjMy5zY2FsZSh0bXBWZWMzLCB0bXBWZWMzLCAtKHNldHRpbmdzLnJhZGl1cyAqIDIpKTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi50bXBWZWMzKTtcblxuICAgICAgICAgICAgICAgIHZlYzMubm9ybWFsaXplKHRtcFZlYzMsIHRtcFZlYzMpO1xuICAgICAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi50bXBWZWMzKTtcblxuICAgICAgICAgICAgICAgIHV2cy5wdXNoKHUsIHYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoelN0ZXAgPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmVydGljZXMgPSBwb3NpdGlvbnMubGVuZ3RoIC8gMztcbiAgICAgICAgICAgICAgICBsZXQgZmlyc3RJbmRleCA9IHZlcnRpY2VzIC0gKDIgKiAod2lkdGhTZWdtZW50cyArIDEpKTtcbiAgICAgICAgICAgICAgICBmb3IgKDsgKGZpcnN0SW5kZXggKyB3aWR0aFNlZ21lbnRzICsgMikgPCB2ZXJ0aWNlczsgZmlyc3RJbmRleCsrKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdEluZGV4ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0SW5kZXggKyB3aWR0aFNlZ21lbnRzICsgMSxcbiAgICAgICAgICAgICAgICAgICAgKTtcbiAgICAgICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RJbmRleCArIHdpZHRoU2VnbWVudHMgKyAxLFxuICAgICAgICAgICAgICAgICAgICAgICAgZmlyc3RJbmRleCArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdEluZGV4ICsgd2lkdGhTZWdtZW50cyArIDIsXG4gICAgICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgU3BoZXJlO1xuIiwiaW1wb3J0IHsgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbmNsYXNzIFRvcnVzIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIHJhZGl1czogMSxcbiAgICAgICAgICAgIHR1YmU6IDAuMzc1LFxuICAgICAgICAgICAgdHVidWxhclNlZ21lbnRzOiAxNixcbiAgICAgICAgICAgIHJhZGlhbFNlZ21lbnRzOiA4LFxuICAgICAgICAgICAgYXJjOiBNYXRoLlBJICogMixcbiAgICAgICAgfSwgcHJvcHMpO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCBpbmRpY2VzID0gW107XG4gICAgICAgIGNvbnN0IG5vcm1hbHMgPSBbXTtcbiAgICAgICAgY29uc3QgdXZzID0gW107XG5cbiAgICAgICAgY29uc3QgY2VudGVyID0gdmVjMy5jcmVhdGUoKTtcbiAgICAgICAgY29uc3QgdmVydGV4ID0gdmVjMy5jcmVhdGUoKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gdmVjMy5jcmVhdGUoKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8PSBzZXR0aW5ncy5yYWRpYWxTZWdtZW50czsgaisrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHUgPSAoaSAvIHNldHRpbmdzLnR1YnVsYXJTZWdtZW50cykgKiBzZXR0aW5ncy5hcmM7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IChqIC8gc2V0dGluZ3MucmFkaWFsU2VnbWVudHMpICogTWF0aC5QSSAqIDI7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0ZXhbMF0gPSAoc2V0dGluZ3MucmFkaXVzICsgKHNldHRpbmdzLnR1YmUgKiBNYXRoLmNvcyh2KSkpICogTWF0aC5jb3ModSk7XG4gICAgICAgICAgICAgICAgdmVydGV4WzFdID0gKHNldHRpbmdzLnJhZGl1cyArIChzZXR0aW5ncy50dWJlICogTWF0aC5jb3ModikpKSAqIE1hdGguc2luKHUpO1xuICAgICAgICAgICAgICAgIHZlcnRleFsyXSA9IHNldHRpbmdzLnR1YmUgKiBNYXRoLnNpbih2KTtcblxuICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLnZlcnRleCk7XG5cbiAgICAgICAgICAgICAgICBjZW50ZXJbMF0gPSBzZXR0aW5ncy5yYWRpdXMgKiBNYXRoLmNvcyh1KTtcbiAgICAgICAgICAgICAgICBjZW50ZXJbMV0gPSBzZXR0aW5ncy5yYWRpdXMgKiBNYXRoLnNpbih1KTtcbiAgICAgICAgICAgICAgICB2ZWMzLnN1YnRyYWN0KG5vcm1hbCwgdmVydGV4LCBjZW50ZXIpO1xuICAgICAgICAgICAgICAgIHZlYzMubm9ybWFsaXplKG5vcm1hbCwgbm9ybWFsKTtcblxuICAgICAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5ub3JtYWwpO1xuXG4gICAgICAgICAgICAgICAgdXZzLnB1c2goaSAvIHNldHRpbmdzLnR1YnVsYXJTZWdtZW50cyk7XG4gICAgICAgICAgICAgICAgdXZzLnB1c2goaiAvIHNldHRpbmdzLnJhZGlhbFNlZ21lbnRzKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGogPSAxOyBqIDw9IHNldHRpbmdzLnJhZGlhbFNlZ21lbnRzOyBqKyspIHtcbiAgICAgICAgICAgIGZvciAobGV0IGkgPSAxOyBpIDw9IHNldHRpbmdzLnR1YnVsYXJTZWdtZW50czsgaSsrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYSA9ICgoc2V0dGluZ3MudHVidWxhclNlZ21lbnRzICsgMSkgKiBqKSArIChpIC0gMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYiA9ICgoc2V0dGluZ3MudHVidWxhclNlZ21lbnRzICsgMSkgKiAoaiAtIDEpKSArIChpIC0gMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYyA9ICgoc2V0dGluZ3MudHVidWxhclNlZ21lbnRzICsgMSkgKiAoaiAtIDEpKSArIGk7XG4gICAgICAgICAgICAgICAgY29uc3QgZCA9ICgoc2V0dGluZ3MudHVidWxhclNlZ21lbnRzICsgMSkgKiBqKSArIGk7XG5cbiAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYSwgYiwgZCk7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGIsIGMsIGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVG9ydXM7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcblxuY2xhc3MgVG9ydXNLbm90IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIHJhZGl1czogMC41LFxuICAgICAgICAgICAgdHViZTogMC4yLFxuICAgICAgICAgICAgdHVidWxhclNlZ21lbnRzOiA2NCxcbiAgICAgICAgICAgIHJhZGlhbFNlZ21lbnRzOiA2LFxuICAgICAgICAgICAgcDogMixcbiAgICAgICAgICAgIHE6IDMsXG4gICAgICAgIH0sIHByb3BzKTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IFtdO1xuICAgICAgICBjb25zdCBub3JtYWxzID0gW107XG4gICAgICAgIGNvbnN0IHV2cyA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICAgICAgY29uc3QgUDEgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICBjb25zdCBQMiA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICAgICAgY29uc3QgQiA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIGNvbnN0IFQgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICBjb25zdCBOID0gdmVjMy5jcmVhdGUoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHM7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgdSA9IChpIC8gc2V0dGluZ3MudHVidWxhclNlZ21lbnRzKSAqIHNldHRpbmdzLnAgKiBNYXRoLlBJICogMjtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlUG9zaXRpb25PbkN1cnZlKHUsIHNldHRpbmdzLnAsIHNldHRpbmdzLnEsIHNldHRpbmdzLnJhZGl1cywgUDEpO1xuICAgICAgICAgICAgdGhpcy5jYWxjdWxhdGVQb3NpdGlvbk9uQ3VydmUodSArIDAuMDEsIHNldHRpbmdzLnAsIHNldHRpbmdzLnEsIHNldHRpbmdzLnJhZGl1cywgUDIpO1xuXG4gICAgICAgICAgICB2ZWMzLnN1YnRyYWN0KFQsIFAyLCBQMSk7XG4gICAgICAgICAgICB2ZWMzLmFkZChOLCBQMiwgUDEpO1xuICAgICAgICAgICAgdmVjMy5jcm9zcyhCLCBULCBOKTtcbiAgICAgICAgICAgIHZlYzMuY3Jvc3MoTiwgQiwgVCk7XG5cbiAgICAgICAgICAgIHZlYzMubm9ybWFsaXplKEIsIEIpO1xuICAgICAgICAgICAgdmVjMy5ub3JtYWxpemUoTiwgTik7XG5cbiAgICAgICAgICAgIGZvciAobGV0IGogPSAwOyBqIDw9IHNldHRpbmdzLnJhZGlhbFNlZ21lbnRzOyBqKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB2ID0gKGogLyBzZXR0aW5ncy5yYWRpYWxTZWdtZW50cykgKiBNYXRoLlBJICogMjtcbiAgICAgICAgICAgICAgICBjb25zdCBjeCA9IC1zZXR0aW5ncy50dWJlICogTWF0aC5jb3Modik7XG4gICAgICAgICAgICAgICAgY29uc3QgY3kgPSBzZXR0aW5ncy50dWJlICogTWF0aC5zaW4odik7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0ZXhbMF0gPSBQMVswXSArICgoY3ggKiBOWzBdKSArIChjeSAqIEJbMF0pKTtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhbMV0gPSBQMVsxXSArICgoY3ggKiBOWzFdKSArIChjeSAqIEJbMV0pKTtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhbMl0gPSBQMVsyXSArICgoY3ggKiBOWzJdKSArIChjeSAqIEJbMl0pKTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi52ZXJ0ZXgpO1xuXG4gICAgICAgICAgICAgICAgdmVjMy5zdWJ0cmFjdChub3JtYWwsIHZlcnRleCwgUDEpO1xuICAgICAgICAgICAgICAgIHZlYzMubm9ybWFsaXplKG5vcm1hbCwgbm9ybWFsKTtcbiAgICAgICAgICAgICAgICBub3JtYWxzLnB1c2goLi4ubm9ybWFsKTtcblxuICAgICAgICAgICAgICAgIHV2cy5wdXNoKGkgLyBzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHMsIGogLyBzZXR0aW5ncy5yYWRpYWxTZWdtZW50cyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBqID0gMTsgaiA8PSBzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHM7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gc2V0dGluZ3MucmFkaWFsU2VnbWVudHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSAoKHNldHRpbmdzLnJhZGlhbFNlZ21lbnRzICsgMSkgKiAoaiAtIDEpKSArIChpIC0gMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYiA9ICgoc2V0dGluZ3MucmFkaWFsU2VnbWVudHMgKyAxKSAqIGopICsgKGkgLSAxKTtcbiAgICAgICAgICAgICAgICBjb25zdCBjID0gKChzZXR0aW5ncy5yYWRpYWxTZWdtZW50cyArIDEpICogaikgKyBpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSAoKHNldHRpbmdzLnJhZGlhbFNlZ21lbnRzICsgMSkgKiAoaiAtIDEpKSArIGk7XG5cbiAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYSwgYiwgZCk7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGIsIGMsIGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cblxuICAgIGNhbGN1bGF0ZVBvc2l0aW9uT25DdXJ2ZSh1LCBwLCBxLCByYWRpdXMsIHBvc2l0aW9uKSB7XG4gICAgICAgIGNvbnN0IGN1ID0gTWF0aC5jb3ModSk7XG4gICAgICAgIGNvbnN0IHN1ID0gTWF0aC5zaW4odSk7XG4gICAgICAgIGNvbnN0IHF1T3ZlclAgPSAocSAvIHApICogdTtcbiAgICAgICAgY29uc3QgY3MgPSBNYXRoLmNvcyhxdU92ZXJQKTtcblxuICAgICAgICBwb3NpdGlvblswXSA9IHJhZGl1cyAqICgyICsgY3MpICogMC41ICogY3U7XG4gICAgICAgIHBvc2l0aW9uWzFdID0gcmFkaXVzICogKDIgKyBjcykgKiBzdSAqIDAuNTtcbiAgICAgICAgcG9zaXRpb25bMl0gPSByYWRpdXMgKiBNYXRoLnNpbihxdU92ZXJQKSAqIDAuNTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFRvcnVzS25vdDtcbiJdLCJuYW1lcyI6WyJBUlJBWV9UWVBFIiwiRmxvYXQzMkFycmF5IiwiQXJyYXkiLCJkZWdyZWUiLCJNYXRoIiwiUEkiLCJjcmVhdGUiLCJvdXQiLCJnbE1hdHJpeCIsImlkZW50aXR5Iiwicm90YXRlWSIsImEiLCJyYWQiLCJzIiwic2luIiwiYyIsImNvcyIsImEwMCIsImEwMSIsImEwMiIsImEwMyIsImEyMCIsImEyMSIsImEyMiIsImEyMyIsInJvdGF0ZVoiLCJhMTAiLCJhMTEiLCJhMTIiLCJhMTMiLCJsZW5ndGgiLCJ4IiwieSIsInoiLCJzcXJ0IiwiZnJvbVZhbHVlcyIsImFkZCIsImIiLCJzdWJ0cmFjdCIsInNjYWxlIiwibm9ybWFsaXplIiwibGVuIiwiZG90IiwiY3Jvc3MiLCJheCIsImF5IiwiYXoiLCJieCIsImJ5IiwiYnoiLCJ0cmFuc2Zvcm1NYXQ0IiwibSIsInciLCJmb3JFYWNoIiwidmVjIiwic3RyaWRlIiwib2Zmc2V0IiwiY291bnQiLCJmbiIsImFyZyIsImkiLCJsIiwibWluIiwic2V0QXhpc0FuZ2xlIiwiYXhpcyIsInNsZXJwIiwidCIsImF3IiwiYnciLCJvbWVnYSIsImNvc29tIiwic2lub20iLCJzY2FsZTAiLCJzY2FsZTEiLCJhY29zIiwiZnJvbU1hdDMiLCJmVHJhY2UiLCJmUm9vdCIsImoiLCJrIiwidmVjNCIsInJvdGF0aW9uVG8iLCJ0bXB2ZWMzIiwidmVjMyIsInhVbml0VmVjMyIsInlVbml0VmVjMyIsInNxbGVycCIsInRlbXAxIiwidGVtcDIiLCJkIiwic2V0QXhlcyIsIm1hdHIiLCJtYXQzIiwidmlldyIsInJpZ2h0IiwidXAiLCJNb2RpZnkiLCJnZXREYXRhIiwiaW5kZXgiLCJzdGVwIiwiYXJyYXkiLCJkYXRhIiwicHVzaCIsImRldGFjaCIsImdlb21ldHJ5IiwicG9zaXRpb25zIiwibm9ybWFscyIsInV2cyIsImluZGljZXMiLCJmYSIsImZiIiwiZmMiLCJtb2RpZnkiLCJmbGF0dGVuIiwiYXJyIiwib3V0cHV0IiwiaXNBcnJheSIsImNvbmNhdCIsInVuZmxhdHRlbiIsImFtb3VudCIsInZhbHVlIiwiZ2VuZXJhdGVWZXJ0ZXhOb3JtYWxzIiwiZmFjZXMiLCJ2ZXJ0aWNlcyIsInRlbXAiLCJjYiIsImFiIiwidkEiLCJ2QiIsInZDIiwiZmFjZSIsInVuZGVmaW5lZCIsIm1lcmdlVmVydGljZXMiLCJ2ZXJ0aWNlc01hcCIsInVuaXF1ZSIsImNoYW5nZXMiLCJwcmVjaXNpb25Qb2ludHMiLCJwcmVjaXNpb24iLCJwb3ciLCJ2Iiwia2V5Iiwicm91bmQiLCJmYWNlSW5kaWNlc1RvUmVtb3ZlIiwibiIsImlkeCIsInNwbGljZSIsImZhY2VWZXJ0ZXhVdnMiLCJwIiwiZiIsIlVpbnQxNkFycmF5IiwiUG9seWhlZHJhIiwicmFkaXVzIiwiZGV0YWlsIiwiY29tcGxleCIsInN1YmRpdmlkZSIsInBvc2l0aW9uIiwidSIsImF0YW4yIiwiYXNpbiIsImNlbGxzIiwibm9ydGhJbmRleCIsImZpcnN0WUluZGV4Iiwic291dGhJbmRleCIsIm5ld1ZlcnRpY2VzIiwic2xpY2UiLCJuZXdVdnMiLCJ2ZXJ0aWNlSW5kZXgiLCJ2aXNpdCIsImNlbGwiLCJwb2xlSW5kZXgiLCJ1djEiLCJ1djIiLCJsaXN0IiwiYWJzIiwibWFnIiwiYXBwbHkiLCJtYXAiLCJOdW1iZXIiLCJwcm90b3R5cGUiLCJ2YWx1ZU9mIiwiZmFjdG9yIiwibmV3Q2VsbHMiLCJuZXdQb3NpdGlvbnMiLCJtaWRwb2ludHMiLCJtaWRwb2ludCIsInBvaW50VG9LZXkiLCJwb2ludCIsInRvUHJlY2lzaW9uIiwiZ2V0TWlkcG9pbnQiLCJwb2ludEtleSIsImNhY2hlZFBvaW50IiwiYzAiLCJjMSIsImMyIiwidjAiLCJ2MSIsInYyIiwiYWkiLCJpbmRleE9mIiwiYmkiLCJjaSIsInYwaSIsInYxaSIsInYyaSIsIlRldHJhaGVkcm9uIiwicHJvcHMiLCJzZXR0aW5ncyIsIk9iamVjdCIsImFzc2lnbiIsIkhleGFoZWRyb24iLCJyIiwiT2N0YWhlZHJvbiIsIkRvZGVjYWhlZHJvbiIsIkljb3NhaGVkcm9uIiwiUGxhbmUiLCJ3aWR0aCIsImhlaWdodCIsInN1YmRpdmlzaW9uc1giLCJzdWJkaXZpc2lvbnNZIiwiaCIsInNwYWNlclgiLCJzcGFjZXJZIiwib2Zmc2V0WCIsIm9mZnNldFkiLCJzcGFjZXJVIiwic3BhY2VyViIsInRyaWFuZ2xlWCIsInRyaWFuZ2xlWSIsIkJveCIsImRlcHRoIiwibWF0Um90WSIsIm1hdDQiLCJtYXRSb3RaIiwidG1wVmVjMyIsIlNwaGVyZSIsInNlZ21lbnRzIiwiaGVpZ2h0U2VnbWVudHMiLCJ3aWR0aFNlZ21lbnRzIiwielN0ZXAiLCJhbmdsZVoiLCJ5U3RlcCIsImFuZ2xlWSIsImZpcnN0SW5kZXgiLCJUb3J1cyIsInR1YmUiLCJ0dWJ1bGFyU2VnbWVudHMiLCJyYWRpYWxTZWdtZW50cyIsImFyYyIsImNlbnRlciIsInZlcnRleCIsIm5vcm1hbCIsIlRvcnVzS25vdCIsInEiLCJQMSIsIlAyIiwiQiIsIlQiLCJOIiwiY2FsY3VsYXRlUG9zaXRpb25PbkN1cnZlIiwiY3giLCJjeSIsImN1Iiwic3UiLCJxdU92ZXJQIiwiY3MiXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBOzs7O0VBT08sSUFBSUEsYUFBYyxPQUFPQyxZQUFQLEtBQXdCLFdBQXpCLEdBQXdDQSxZQUF4QyxHQUF1REMsS0FBeEU7QUFDUDtFQVdBLElBQU1DLFNBQVNDLEtBQUtDLEVBQUwsR0FBVSxHQUF6Qjs7RUNqQkE7Ozs7O0VBS0E7Ozs7O0FBS0EsRUFBTyxTQUFTQyxRQUFULEdBQWtCO0VBQ3ZCLE1BQUlDLE1BQU0sSUFBSUMsVUFBSixDQUF3QixDQUF4QixDQUFWO0VBQ0FELE1BQUksQ0FBSixJQUFTLENBQVQ7RUFDQUEsTUFBSSxDQUFKLElBQVMsQ0FBVDtFQUNBQSxNQUFJLENBQUosSUFBUyxDQUFUO0VBQ0FBLE1BQUksQ0FBSixJQUFTLENBQVQ7RUFDQUEsTUFBSSxDQUFKLElBQVMsQ0FBVDtFQUNBQSxNQUFJLENBQUosSUFBUyxDQUFUO0VBQ0FBLE1BQUksQ0FBSixJQUFTLENBQVQ7RUFDQUEsTUFBSSxDQUFKLElBQVMsQ0FBVDtFQUNBQSxNQUFJLENBQUosSUFBUyxDQUFUO0VBQ0EsU0FBT0EsR0FBUDtFQUNEOztFQ3RCRDs7Ozs7RUFLQTs7Ozs7QUFLQSxFQUFPLFNBQVNELFFBQVQsR0FBa0I7RUFDdkIsTUFBSUMsTUFBTSxJQUFJQyxVQUFKLENBQXdCLEVBQXhCLENBQVY7RUFDQUQsTUFBSSxDQUFKLElBQVMsQ0FBVDtFQUNBQSxNQUFJLENBQUosSUFBUyxDQUFUO0VBQ0FBLE1BQUksQ0FBSixJQUFTLENBQVQ7RUFDQUEsTUFBSSxDQUFKLElBQVMs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
