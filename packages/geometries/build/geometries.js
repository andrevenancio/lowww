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
