(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (factory((global.lowww = global.lowww || {}, global.lowww.geometries = {})));
}(this, (function (exports) { 'use strict';

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */
  var ARRAY_TYPE = typeof Float32Array !== 'undefined' ? Float32Array : Array;

  var degree = Math.PI / 180;

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

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

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

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

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

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

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

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
   * @param {Number} t interpolation amount between the two inputs
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
   * @param {Number} t interpolation amount
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

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

  /* Copyright (c) 2015, Brandon Jones, Colin MacKenzie IV.

  Permission is hereby granted, free of charge, to any person obtaining a copy
  of this software and associated documentation files (the "Software"), to deal
  in the Software without restriction, including without limitation the rights
  to use, copy, modify, merge, publish, distribute, sublicense, and/or sell
  copies of the Software, and to permit persons to whom the Software is
  furnished to do so, subject to the following conditions:

  The above copyright notice and this permission notice shall be included in
  all copies or substantial portions of the Software.

  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR
  IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY,
  FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE
  AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER
  LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM,
  OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN
  THE SOFTWARE. */

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

  /**
   * @fileoverview gl-matrix - High performance matrix and vector operations
   * @author Brandon Jones
   * @author Colin MacKenzie IV
   * @version 2.4.0
   */

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

      function Tetrahedron() {
          var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

          var _ret;

          var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          classCallCheck(this, Tetrahedron);

          var positions = [1, 1, 1, -1, -1, 1, -1, 1, -1, 1, -1, -1];

          var indices = [2, 1, 0, 0, 3, 2, 1, 3, 0, 2, 3, 1];

          var _this = possibleConstructorReturn(this, (Tetrahedron.__proto__ || Object.getPrototypeOf(Tetrahedron)).call(this, positions, indices, radius, detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Tetrahedron;
  }(Polyhedra);

  var Hexahedron = function (_Polyhedra) {
      inherits(Hexahedron, _Polyhedra);

      function Hexahedron() {
          var size = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

          var _ret;

          var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          classCallCheck(this, Hexahedron);

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
              positions[i + 0] *= size;
              positions[i + 1] *= size;
              positions[i + 2] *= size;
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

          var _this = possibleConstructorReturn(this, (Hexahedron.__proto__ || Object.getPrototypeOf(Hexahedron)).call(this, positions, indices, size, detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Hexahedron;
  }(Polyhedra);

  var Octahedron = function (_Polyhedra) {
      inherits(Octahedron, _Polyhedra);

      function Octahedron() {
          var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

          var _ret;

          var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          classCallCheck(this, Octahedron);

          var positions = [1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1, 0, 0, 0, 1, 0, 0, -1];

          var indices = [0, 2, 4, 0, 4, 3, 0, 3, 5, 0, 5, 2, 1, 2, 5, 1, 5, 3, 1, 3, 4, 1, 4, 2];

          var _this = possibleConstructorReturn(this, (Octahedron.__proto__ || Object.getPrototypeOf(Octahedron)).call(this, positions, indices, radius, detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Octahedron;
  }(Polyhedra);

  var Dodecahedron = function (_Polyhedra) {
      inherits(Dodecahedron, _Polyhedra);

      function Dodecahedron() {
          var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

          var _ret;

          var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          classCallCheck(this, Dodecahedron);

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

          var _this = possibleConstructorReturn(this, (Dodecahedron.__proto__ || Object.getPrototypeOf(Dodecahedron)).call(this, positions, indices, radius, detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Dodecahedron;
  }(Polyhedra);

  var Icosahedron = function (_Polyhedra) {
      inherits(Icosahedron, _Polyhedra);

      function Icosahedron() {
          var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;

          var _ret;

          var detail = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0;
          classCallCheck(this, Icosahedron);

          var t = 0.5 + Math.sqrt(5) / 2;

          var positions = [-1, +t, 0, +1, +t, 0, -1, -t, 0, +1, -t, 0, 0, -1, +t, 0, +1, +t, 0, -1, -t, 0, +1, -t, +t, 0, -1, +t, 0, +1, -t, 0, -1, -t, 0, +1];

          var indices = [0, 11, 5, 0, 5, 1, 0, 1, 7, 0, 7, 10, 0, 10, 11, 1, 5, 9, 5, 11, 4, 11, 10, 2, 10, 7, 6, 7, 1, 8, 3, 9, 4, 3, 4, 2, 3, 2, 6, 3, 6, 8, 3, 8, 9, 4, 9, 5, 2, 4, 11, 6, 2, 10, 8, 6, 7, 9, 8, 1];

          var _this = possibleConstructorReturn(this, (Icosahedron.__proto__ || Object.getPrototypeOf(Icosahedron)).call(this, positions, indices, radius, detail));

          return _ret = _this.geometry, possibleConstructorReturn(_this, _ret);
      }

      return Icosahedron;
  }(Polyhedra);

  var Plane = function Plane() {
      var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var subdivisionsX = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      var subdivisionsY = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 1;
      var axis = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 'XY';
      classCallCheck(this, Plane);

      var positions = [];
      var indices = [];
      var normals = [];
      var uvs = [];
      var index = 0;

      var w = width * 2;
      var h = height * 2;
      var spacerX = w / subdivisionsX;
      var spacerY = h / subdivisionsY;
      var offsetX = -w * 0.5;
      var offsetY = -h * 0.5;
      var spacerU = 1 / subdivisionsX;
      var spacerV = 1 / subdivisionsY;

      for (var y = 0; y < subdivisionsY; y++) {
          for (var x = 0; x < subdivisionsX; x++) {
              var triangleX = spacerX * x + offsetX;
              var triangleY = spacerY * y + offsetY;

              var u = x / subdivisionsX;
              var v = y / subdivisionsY;

              switch (axis) {
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

  var Box = function Box() {
      var width = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var height = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 1;
      var depth = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 1;
      classCallCheck(this, Box);

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
          positions[i + 0] *= width;
          positions[i + 1] *= height;
          positions[i + 2] *= depth;
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

  var Sphere = function Sphere() {
      var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var widthSegments = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 8;
      var heightSegments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 6;
      var phiStart = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : -Math.PI * 2;
      var phiLength = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : Math.PI * 2;
      var thetaStart = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : Math.PI;
      var thetaLength = arguments.length > 6 && arguments[6] !== undefined ? arguments[6] : Math.PI;
      classCallCheck(this, Sphere);

      var positions = [];
      var indices = [];
      var normals = [];
      var uvs = [];

      var vertex = create$4();
      var normal = create$4();
      var thetaEnd = thetaStart + thetaLength;
      var index = 0;
      var grid = [];

      for (var iy = 0; iy <= heightSegments; iy++) {
          var verticesRow = [];
          var v = iy / heightSegments;

          for (var ix = 0; ix <= widthSegments; ix++) {
              var u = ix / widthSegments;

              // vertex
              vertex[0] = -radius * Math.cos(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);
              vertex[1] = radius * Math.cos(thetaStart + v * thetaLength);
              vertex[2] = radius * Math.sin(phiStart + u * phiLength) * Math.sin(thetaStart + v * thetaLength);

              positions.push.apply(positions, toConsumableArray(vertex));

              // normal
              normalize(normal, vertex);
              normals.push.apply(normals, toConsumableArray(normal));

              // uv
              uvs.push(u, 1 - v);
              verticesRow.push(index++);
          }
          grid.push(verticesRow);
      }

      for (var _iy = 0; _iy < heightSegments; _iy++) {
          for (var _ix = 0; _ix < widthSegments; _ix++) {
              var a = grid[_iy][_ix + 1];
              var b = grid[_iy][_ix];
              var c = grid[_iy + 1][_ix];
              var d = grid[_iy + 1][_ix + 1];

              if (_iy !== 0 || thetaStart > 0) {
                  indices.push(a, b, d);
              }
              if (_iy !== heightSegments - 1 || thetaEnd < Math.PI) {
                  indices.push(b, c, d);
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

  var Torus = function Torus() {
      var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
      var tube = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.375;
      var tubularSegments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 16;
      var radialSegments = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 8;
      var arc = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : Math.PI * 2;
      classCallCheck(this, Torus);

      var positions = [];
      var indices = [];
      var normals = [];
      var uvs = [];

      var center = create$4();
      var vertex = create$4();
      var normal = create$4();

      for (var j = 0; j <= radialSegments; j++) {
          for (var i = 0; i <= tubularSegments; i++) {
              var u = i / tubularSegments * arc;
              var v = j / radialSegments * Math.PI * 2;

              vertex[0] = (radius + tube * Math.cos(v)) * Math.cos(u);
              vertex[1] = (radius + tube * Math.cos(v)) * Math.sin(u);
              vertex[2] = tube * Math.sin(v);

              positions.push.apply(positions, toConsumableArray(vertex));

              center[0] = radius * Math.cos(u);
              center[1] = radius * Math.sin(u);
              subtract$4(normal, vertex, center);
              normalize(normal, normal);

              normals.push.apply(normals, toConsumableArray(normal));

              uvs.push(i / tubularSegments);
              uvs.push(j / radialSegments);
          }
      }

      for (var _j = 1; _j <= radialSegments; _j++) {
          for (var _i = 1; _i <= tubularSegments; _i++) {
              var a = (tubularSegments + 1) * _j + (_i - 1);
              var b = (tubularSegments + 1) * (_j - 1) + (_i - 1);
              var c = (tubularSegments + 1) * (_j - 1) + _i;
              var d = (tubularSegments + 1) * _j + _i;

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
      function TorusKnot() {
          var radius = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : 1;
          var tube = arguments.length > 1 && arguments[1] !== undefined ? arguments[1] : 0.375;
          var tubularSegments = arguments.length > 2 && arguments[2] !== undefined ? arguments[2] : 64;
          var radialSegments = arguments.length > 3 && arguments[3] !== undefined ? arguments[3] : 8;
          var p = arguments.length > 4 && arguments[4] !== undefined ? arguments[4] : 2;
          var q = arguments.length > 5 && arguments[5] !== undefined ? arguments[5] : 3;
          classCallCheck(this, TorusKnot);

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

          for (var i = 0; i <= tubularSegments; i++) {
              var u = i / tubularSegments * p * Math.PI * 2;
              this.calculatePositionOnCurve(u, p, q, radius, P1);
              this.calculatePositionOnCurve(u + 0.01, p, q, radius, P2);

              subtract$4(T, P2, P1);
              add$4(N, P2, P1);
              cross(B, T, N);
              cross(N, B, T);

              normalize(B, B);
              normalize(N, N);

              for (var j = 0; j <= radialSegments; j++) {
                  var v = j / radialSegments * Math.PI * 2;
                  var cx = -tube * Math.cos(v);
                  var cy = tube * Math.sin(v);

                  vertex[0] = P1[0] + (cx * N[0] + cy * B[0]);
                  vertex[1] = P1[1] + (cx * N[1] + cy * B[1]);
                  vertex[2] = P1[2] + (cx * N[2] + cy * B[2]);
                  positions.push.apply(positions, toConsumableArray(vertex));

                  subtract$4(normal, vertex, P1);
                  normalize(normal, normal);
                  normals.push.apply(normals, toConsumableArray(normal));

                  uvs.push(i / tubularSegments, j / radialSegments);
              }
          }

          for (var _j = 1; _j <= tubularSegments; _j++) {
              for (var _i = 1; _i <= radialSegments; _i++) {
                  var a = (radialSegments + 1) * (_j - 1) + (_i - 1);
                  var b = (radialSegments + 1) * _j + (_i - 1);
                  var c = (radialSegments + 1) * _j + _i;
                  var d = (radialSegments + 1) * (_j - 1) + _i;

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

  /* eslint-disable */
  var Suzanne = function Suzanne(size) {
      classCallCheck(this, Suzanne);

      var rawPositions = [0.35156, 0.24219, 0.82813, 0.44531, 0.15625, 0.78125, 0.47656, 0.24219, 0.77344, -0.47656, 0.24219, 0.77344, -0.44531, 0.15625, 0.78125, -0.35156, 0.24219, 0.82813, 0.35156, 0.11719, 0.80469, -0.35156, 0.11719, 0.80469, 0.26563, 0.15625, 0.82031, -0.26563, 0.15625, 0.82031, 0.22656, 0.24219, 0.82031, -0.22656, 0.24219, 0.82031, 0.26563, 0.33594, 0.82031, -0.26563, 0.33594, 0.82031, 0.35156, 0.375, 0.80469, -0.35156, 0.375, 0.80469, 0.44531, 0.33594, 0.78125, -0.44531, 0.33594, 0.78125, 0.09375, -0.75, 0.66406, 0.04688, -0.85156, 0.63281, 0.09375, -0.8125, 0.64063, -0.09375, -0.8125, 0.64063, -0.04688, -0.85156, 0.63281, -0.09375, -0.75, 0.66406, 0.0, 0.40625, 0.60156, 0.10938, 0.46094, 0.60938, 0.0, 0.57031, 0.57031, -0.10938, 0.46094, 0.60938, 0.21875, -0.28125, 0.42969, 0.21094, -0.39063, 0.16406, 0.40625, -0.17188, 0.14844, -0.40625, -0.17188, 0.14844, -0.21094, -0.39063, 0.16406, -0.21875, -0.28125, 0.42969, 0.4375, -0.09375, 0.46875, 0.20313, -0.17188, 0.5, 0.21094, -0.22656, 0.46875, -0.21094, -0.22656, 0.46875, -0.20313, -0.17188, 0.5, -0.4375, -0.09375, 0.46875, 0.33594, 0.05469, -0.66406, 0.48438, 0.02344, -0.54688, 0.34375, -0.14844, -0.53906, -0.34375, -0.14844, -0.53906, -0.48438, 0.02344, -0.54688, -0.33594, 0.05469, -0.66406, 0.72656, 0.0, -0.07031, 0.71875, -0.02344, -0.17188, 0.71875, 0.03906, -0.1875, -0.71875, 0.03906, -0.1875, -0.71875, -0.02344, -0.17188, -0.72656, 0.0, -0.07031, 1.03906, 0.32813, -0.41406, 1.08594, 0.27344, -0.39063, 1.1875, 0.34375, -0.48438, -1.1875, 0.34375, -0.48438, -1.08594, 0.27344, -0.39063, -1.03906, 0.32813, -0.41406, 1.25, 0.46875, -0.54688, 1.36719, 0.29688, -0.5, 1.3125, 0.05469, -0.53125, -1.3125, 0.05469, -0.53125, -1.36719, 0.29688, -0.5, -1.25, 0.46875, -0.54688, -0.78906, -0.125, -0.32813, -0.64063, -0.00781, -0.42969, -0.59375, -0.125, -0.16406, -0.77344, -0.14063, -0.125, 0.59375, -0.125, -0.16406, 0.64063, -0.00781, -0.42969, 0.78906, -0.125, -0.32813, 0.77344, -0.14063, -0.125, -0.85938, 0.38281, -0.38281, -0.77344, 0.26563, -0.4375, 0.77344, 0.26563, -0.4375, 0.85938, 0.38281, -0.38281, -0.89063, 0.40625, -0.23438, -0.82031, 0.32813, -0.20313, 0.82031, 0.32813, -0.20313, 0.89063, 0.40625, -0.23438, -1.02344, 0.4375, -0.48438, -1.03906, -0.08594, -0.49219, 1.02344, 0.4375, -0.48438, 1.03906, -0.08594, -0.49219, -1.02344, 0.47656, -0.3125, 1.02344, 0.47656, -0.3125, -1.23438, 0.50781, -0.42188, 1.23438, 0.50781, -0.42188, -1.35156, 0.32031, -0.42188, 1.35156, 0.32031, -0.42188, -1.28125, 0.05469, -0.42969, 1.28125, 0.05469, -0.42969, -1.03906, -0.10156, -0.32813, 1.03906, -0.10156, -0.32813, -1.10938, 0.21094, -0.39063, -1.25781, 0.24219, -0.49219, 1.10938, 0.21094, -0.39063, 1.25781, 0.24219, -0.49219, -1.05469, 0.1875, -0.38281, -1.21094, 0.08594, -0.48438, 1.21094, 0.08594, -0.48438, 1.05469, 0.1875, -0.38281, -1.0, 0.125, -0.36719, -1.04688, 0.0, -0.42188, 1.04688, 0.0, -0.42188, 1.0, 0.125, -0.36719, -0.9375, 0.0625, -0.33594, -0.88281, -0.01563, -0.26563, 0.9375, 0.0625, -0.33594, 0.88281, -0.01563, -0.26563, -0.85156, 0.01563, -0.32031, -0.8125, -0.01563, -0.32031, 0.8125, -0.01563, -0.32031, 0.85156, 0.01563, -0.32031, -0.84375, 0.17188, -0.32031, -0.89063, 0.10938, -0.32813, -0.82813, 0.07813, -0.32031, -0.76563, 0.09375, -0.32031, 0.82813, 0.07813, -0.32031, 0.89063, 0.10938, -0.32813, 0.84375, 0.17188, -0.32031, 0.76563, 0.09375, -0.32031, -0.96094, 0.17188, -0.35156, -0.89063, 0.23438, -0.32031, 0.89063, 0.23438, -0.32031, 0.96094, 0.17188, -0.35156, -1.01563, 0.23438, -0.375, -0.95313, 0.28906, -0.34375, 0.95313, 0.28906, -0.34375, 1.01563, 0.23438, -0.375, -1.03906, 0.0, -0.36719, -0.88281, -0.02344, -0.21094, 0.88281, -0.02344, -0.21094, 1.03906, 0.0, -0.36719, -1.1875, 0.09375, -0.44531, 1.1875, 0.09375, -0.44531, -1.23438, 0.25, -0.44531, 1.23438, 0.25, -0.44531, -1.17188, 0.35938, -0.4375, 1.17188, 0.35938, -0.4375, -1.02344, 0.34375, -0.35938, 1.02344, 0.34375, -0.35938, -0.94531, 0.30469, -0.28906, 0.94531, 0.30469, -0.28906, -0.8125, -0.01563, -0.27344, 0.8125, -0.01563, -0.27344, -0.84375, 0.01563, -0.27344, 0.84375, 0.01563, -0.27344, -0.82031, 0.08594, -0.27344, 0.82031, 0.08594, -0.27344, -0.75781, 0.09375, -0.27344, 0.75781, 0.09375, -0.27344, -0.83594, 0.17188, -0.27344, 0.83594, 0.17188, -0.27344, -0.89063, 0.24219, -0.26563, 0.89063, 0.24219, -0.26563, -0.79688, 0.20313, -0.21094, -0.85938, 0.32031, -0.04688, 0.85938, 0.32031, -0.04688, 0.79688, 0.20313, -0.21094, -0.84375, 0.28906, -0.21094, 0.84375, 0.28906, -0.21094, -0.92188, 0.35938, -0.21875, 0.92188, 0.35938, -0.21875, -0.82813, -0.07031, -0.13281, 0.82813, -0.07031, -0.13281, -0.73438, -0.04688, 0.07031, -0.85156, 0.23438, 0.05469, 0.85156, 0.23438, 0.05469, 0.73438, -0.04688, 0.07031, -1.01563, 0.41406, -0.28906, 1.01563, 0.41406, -0.28906, -1.1875, 0.4375, -0.39063, 1.1875, 0.4375, -0.39063, -1.26563, 0.28906, -0.40625, 1.26563, 0.28906, -0.40625, -1.21094, 0.07813, -0.40625, 1.21094, 0.07813, -0.40625, -1.03125, -0.03906, -0.30469, 1.03125, -0.03906, -0.30469, -0.42969, -0.19531, -0.21094, -0.29688, -0.3125, -0.26563, 0.29688, -0.3125, -0.26563, 0.42969, -0.19531, -0.21094, -0.61719, 0.32813, -0.58594, -0.46094, 0.4375, -0.70313, 0.46094, 0.4375, -0.70313, 0.61719, 0.32813, -0.58594, -0.60156, 0.0, 0.41406, 0.60156, 0.0, 0.41406, -0.79688, 0.61719, -0.11719, -0.79688, 0.53906, -0.35938, 0.79688, 0.53906, -0.35938, 0.79688, 0.61719, -0.11719, -0.79688, 0.5625, 0.125, 0.79688, 0.5625, 0.125, -0.72656, 0.40625, 0.33594, 0.72656, 0.40625, 0.33594, -0.77344, 0.16406, 0.375, -0.79688, 0.40625, 0.46094, 0.79688, 0.40625, 0.46094, 0.77344, 0.16406, 0.375, -0.46094, 0.52344, 0.42969, -0.48438, 0.55469, 0.55469, 0.48438, 0.55469, 0.55469, 0.46094, 0.52344, 0.42969, -0.33594, 0.6875, 0.59375, -0.19531, 0.66406, 0.61719, 0.19531, 0.66406, 0.61719, 0.33594, 0.6875, 0.59375, -0.45313, 0.85156, 0.23438, 0.0, 0.89844, 0.28906, 0.45313, 0.85156, 0.23438, -0.63281, 0.45313, 0.28125, -0.67969, 0.45313, 0.49219, 0.67969, 0.45313, 0.49219, 0.63281, 0.45313, 0.28125, -0.64063, 0.70313, 0.05469, 0.64063, 0.70313, 0.05469, -0.45313, 0.92969, -0.07031, -0.64063, 0.75, -0.19531, 0.45313, 0.92969, -0.07031, 0.64063, 0.75, -0.19531, -0.45313, 0.86719, -0.38281, -0.64063, 0.67969, -0.44531, 0.45313, 0.86719, -0.38281, 0.64063, 0.67969, -0.44531, 0.0, 0.89844, -0.54688, 0.0, 0.5625, -0.85156, 0.0, 0.98438, -0.07813, 0.0, 0.07031, -0.82813, -0.17969, -0.41406, 0.25781, -0.23438, -0.35156, 0.40625, 0.23438, -0.35156, 0.40625, 0.17969, -0.41406, 0.25781, 0.0, -0.46094, 0.1875, 0.0, -0.48438, 0.28125, 0.0, -0.38281, -0.35156, 0.0, -0.19531, -0.67188, -0.4375, -0.14063, 0.53125, -0.20313, -0.1875, 0.5625, 0.20313, -0.1875, 0.5625, 0.4375, -0.14063, 0.53125, -0.23438, -0.25, 0.55469, 0.23438, -0.25, 0.55469, -0.25781, -0.3125, 0.55469, -0.3125, -0.4375, 0.57031, 0.3125, -0.4375, 0.57031, 0.25781, -0.3125, 0.55469, -0.25, -0.5, 0.39063, -0.35156, -0.69531, 0.57031, 0.35156, -0.69531, 0.57031, 0.25, -0.5, 0.39063, -0.125, -0.53906, 0.35938, 0.125, -0.53906, 0.35938, -0.16406, -0.94531, 0.4375, -0.32813, -0.91406, 0.39844, -0.14063, -0.75781, 0.36719, -0.28906, -0.71094, 0.38281, 0.28906, -0.71094, 0.38281, 0.32813, -0.91406, 0.39844, 0.14063, -0.75781, 0.36719, 0.16406, -0.94531, 0.4375, -0.36719, -0.89063, 0.53125, 0.36719, -0.89063, 0.53125, -0.32813, -0.94531, 0.52344, 0.32813, -0.94531, 0.52344, -0.17969, -0.96875, 0.55469, 0.17969, -0.96875, 0.55469, 0.0, -0.97656, 0.46094, 0.0, -0.98438, 0.57813, 0.0, -0.80469, 0.34375, 0.0, -0.57031, 0.32031, -0.63281, -0.03906, 0.53906, 0.63281, -0.03906, 0.53906, -0.82813, 0.14844, 0.44531, 0.82813, 0.14844, 0.44531, -0.85938, 0.42969, 0.59375, 0.85938, 0.42969, 0.59375, -0.71094, 0.48438, 0.625, 0.71094, 0.48438, 0.625, -0.49219, 0.60156, 0.6875, 0.49219, 0.60156, 0.6875, -0.32031, 0.75781, 0.73438, 0.32031, 0.75781, 0.73438, -0.15625, 0.71875, 0.75781, 0.15625, 0.71875, 0.75781, -0.0625, 0.49219, 0.75, 0.0625, 0.49219, 0.75, 0.0, 0.42969, 0.74219, -0.20313, 0.17188, 0.75, -0.1875, 0.15625, 0.77344, -0.17188, 0.21875, 0.78125, -0.19531, 0.22656, 0.75, 0.17188, 0.21875, 0.78125, 0.1875, 0.15625, 0.77344, 0.20313, 0.17188, 0.75, 0.19531, 0.22656, 0.75, -0.17969, 0.29688, 0.78125, -0.19531, 0.29688, 0.75781, 0.17969, 0.29688, 0.78125, 0.19531, 0.29688, 0.75781, -0.21094, 0.375, 0.78125, -0.23438, 0.35938, 0.75781, 0.21094, 0.375, 0.78125, 0.23438, 0.35938, 0.75781, -0.24219, 0.125, 0.75781, -0.22656, 0.10938, 0.78125, 0.22656, 0.10938, 0.78125, 0.24219, 0.125, 0.75781, -0.375, 0.08594, 0.72656, -0.375, 0.0625, 0.74219, 0.375, 0.0625, 0.74219, 0.375, 0.08594, 0.72656, -0.46094, 0.11719, 0.70313, -0.47656, 0.10156, 0.71875, 0.47656, 0.10156, 0.71875, 0.46094, 0.11719, 0.70313, -0.54688, 0.21094, 0.67188, -0.57813, 0.19531, 0.67969, 0.57813, 0.19531, 0.67969, 0.54688, 0.21094, 0.67188, -0.55469, 0.28125, 0.67188, -0.58594, 0.28906, 0.6875, 0.58594, 0.28906, 0.6875, 0.55469, 0.28125, 0.67188, -0.53125, 0.33594, 0.67969, -0.5625, 0.35156, 0.69531, 0.5625, 0.35156, 0.69531, 0.53125, 0.33594, 0.67969, -0.41406, 0.39063, 0.75, -0.42188, 0.39844, 0.77344, 0.42188, 0.39844, 0.77344, 0.41406, 0.39063, 0.75, -0.33594, 0.40625, 0.75, -0.33594, 0.42969, 0.75781, 0.33594, 0.42969, 0.75781, 0.33594, 0.40625, 0.75, -0.28125, 0.39844, 0.76563, -0.27344, 0.42188, 0.77344, 0.27344, 0.42188, 0.77344, 0.28125, 0.39844, 0.76563, -0.16406, 0.41406, 0.77344, -0.25, 0.46875, 0.75781, 0.25, 0.46875, 0.75781, 0.16406, 0.41406, 0.77344, -0.32813, 0.47656, 0.74219, 0.32813, 0.47656, 0.74219, -0.42969, 0.4375, 0.71875, 0.42969, 0.4375, 0.71875, -0.60156, 0.375, 0.66406, 0.60156, 0.375, 0.66406, -0.64063, 0.29688, 0.64844, 0.64063, 0.29688, 0.64844, -0.625, 0.1875, 0.64844, 0.625, 0.1875, 0.64844, -0.49219, 0.0625, 0.67188, 0.49219, 0.0625, 0.67188, -0.375, 0.01563, 0.70313, 0.375, 0.01563, 0.70313, -0.20313, 0.09375, 0.74219, 0.20313, 0.09375, 0.74219, -0.16406, 0.14063, 0.75, 0.16406, 0.14063, 0.75, -0.125, 0.30469, 0.76563, 0.125, 0.30469, 0.76563, -0.13281, 0.21094, 0.75781, 0.13281, 0.21094, 0.75781, 0.0, -0.85938, 0.63281, 0.0, -0.78125, 0.65625, 0.0, -0.77344, 0.71875, -0.09375, -0.74219, 0.72656, 0.09375, -0.74219, 0.72656, -0.09375, -0.82031, 0.71094, 0.09375, -0.82031, 0.71094, -0.04688, -0.86719, 0.6875, 0.04688, -0.86719, 0.6875, 0.0, -0.875, 0.6875, -0.0625, -0.88281, 0.69531, 0.0, -0.89063, 0.6875, 0.0625, -0.88281, 0.69531, -0.11719, -0.83594, 0.71094, 0.11719, -0.83594, 0.71094, -0.10938, -0.71875, 0.73438, 0.10938, -0.71875, 0.73438, 0.0, -0.76563, 0.73438, -0.16406, -0.24219, 0.71094, -0.125, -0.10156, 0.8125, 0.125, -0.10156, 0.8125, 0.16406, -0.24219, 0.71094, -0.17969, -0.3125, 0.71094, 0.17969, -0.3125, 0.71094, -0.21094, -0.44531, 0.71094, 0.21094, -0.44531, 0.71094, -0.07813, -0.44531, 0.75, -0.08594, -0.28906, 0.74219, 0.08594, -0.28906, 0.74219, 0.07813, -0.44531, 0.75, -0.125, -0.22656, 0.75, 0.125, -0.22656, 0.75, -0.10156, -0.14844, 0.74219, 0.10156, -0.14844, 0.74219, 0.0, -0.14063, 0.74219, 0.0, 0.04688, 0.72656, -0.07813, -0.25, 0.80469, 0.0, -0.28906, 0.80469, 0.0, -0.20313, 0.82813, -0.10938, -0.22656, 0.82813, 0.07813, -0.25, 0.80469, 0.10938, -0.22656, 0.82813, -0.09375, -0.15625, 0.8125, -0.04688, -0.14844, 0.8125, 0.04688, -0.14844, 0.8125, 0.09375, -0.15625, 0.8125, -0.13281, -0.22656, 0.79688, -0.09375, -0.27344, 0.78125, 0.13281, -0.22656, 0.79688, 0.09375, -0.27344, 0.78125, -0.10938, -0.13281, 0.78125, 0.10938, -0.13281, 0.78125, -0.03906, -0.125, 0.78125, 0.03906, -0.125, 0.78125, 0.0, -0.1875, 0.79688, 0.0, -0.32031, 0.78125, 0.0, -0.32813, 0.74219, 0.0, -0.19531, 0.75, -0.11719, -0.6875, 0.73438, 0.0, -0.67969, 0.73438, 0.11719, -0.6875, 0.73438, 0.0, -0.44531, 0.75, -0.25, -0.70313, 0.6875, -0.26563, -0.82031, 0.66406, 0.26563, -0.82031, 0.66406, 0.25, -0.70313, 0.6875, -0.23438, -0.91406, 0.63281, 0.23438, -0.91406, 0.63281, -0.16406, -0.92969, 0.63281, 0.16406, -0.92969, 0.63281, 0.0, -0.94531, 0.64063, 0.0, 0.21094, 0.76563, 0.0, 0.35156, 0.82031, -0.10156, 0.42969, 0.84375, 0.10156, 0.42969, 0.84375, -0.39844, -0.04688, 0.67188, 0.39844, -0.04688, 0.67188, -0.61719, 0.05469, 0.625, 0.61719, 0.05469, 0.625, -0.72656, 0.20313, 0.60156, 0.72656, 0.20313, 0.60156, -0.74219, 0.375, 0.65625, 0.74219, 0.375, 0.65625, -0.6875, 0.41406, 0.72656, 0.6875, 0.41406, 0.72656, -0.4375, 0.54688, 0.79688, 0.4375, 0.54688, 0.79688, -0.3125, 0.64063, 0.83594, 0.3125, 0.64063, 0.83594, -0.20313, 0.61719, 0.85156, 0.20313, 0.61719, 0.85156, -0.46875, 0.24219, 0.75781, -0.4375, 0.16406, 0.76563, 0.4375, 0.16406, 0.76563, 0.46875, 0.24219, 0.75781, -0.35156, 0.13281, 0.78125, 0.35156, 0.13281, 0.78125, -0.27344, 0.16406, 0.79688, 0.27344, 0.16406, 0.79688, -0.24219, 0.24219, 0.79688, 0.24219, 0.24219, 0.79688, -0.27344, 0.32813, 0.79688, 0.27344, 0.32813, 0.79688, -0.35156, 0.35938, 0.78125, 0.35156, 0.35938, 0.78125, -0.4375, 0.32813, 0.76563, 0.4375, 0.32813, 0.76563, -0.5625, 0.24219, 0.67188, -0.5, 0.39063, 0.6875, 0.5, 0.39063, 0.6875, 0.5625, 0.24219, 0.67188, -0.625, 0.24219, 0.5625, -0.54688, 0.4375, 0.57813, 0.54688, 0.4375, 0.57813, 0.625, 0.24219, 0.5625, -0.35156, 0.51563, 0.61719, -0.35156, 0.45313, 0.71875, 0.35156, 0.45313, 0.71875, 0.35156, 0.51563, 0.61719, -0.20313, 0.39063, 0.74219, 0.20313, 0.39063, 0.74219, -0.15625, 0.4375, 0.64844, 0.15625, 0.4375, 0.64844, -0.07813, 0.24219, 0.65625, -0.14063, 0.24219, 0.74219, 0.14063, 0.24219, 0.74219, 0.07813, 0.24219, 0.65625, -0.20313, 0.09375, 0.74219, 0.20313, 0.09375, 0.74219, -0.15625, 0.05469, 0.64844, 0.15625, 0.05469, 0.64844, -0.35156, 0.03125, 0.71875, -0.35156, -0.02344, 0.61719, 0.35156, 0.03125, 0.71875, 0.35156, -0.02344, 0.61719, -0.5, 0.09375, 0.6875, 0.5, 0.09375, 0.6875, -0.54688, 0.05469, 0.57813, 0.54688, 0.05469, 0.57813];

      var positions = [];
      for (var i = 0; i < rawPositions.length; i++) {
          var raw = rawPositions[i];
          positions.push(raw * size);
      }

      var indices = [0, 1, 2, 3, 4, 5, 6, 1, 0, 5, 4, 7, 0, 8, 6, 7, 9, 5, 0, 10, 8, 9, 11, 5, 0, 12, 10, 11, 13, 5, 0, 14, 12, 13, 15, 5, 0, 16, 14, 15, 17, 5, 0, 2, 16, 17, 3, 5, 18, 19, 20, 21, 22, 23, 24, 25, 26, 26, 27, 24, 28, 29, 30, 31, 32, 33, 34, 35, 36, 37, 38, 39, 40, 41, 42, 43, 44, 45, 46, 47, 48, 49, 50, 51, 52, 53, 54, 55, 56, 57, 58, 59, 60, 61, 62, 63, 64, 65, 66, 64, 66, 67, 68, 69, 70, 68, 70, 71, 64, 72, 73, 64, 73, 65, 74, 75, 70, 74, 70, 69, 76, 77, 72, 77, 73, 72, 74, 78, 75, 78, 79, 75, 61, 63, 80, 61, 80, 81, 82, 58, 60, 82, 60, 83, 64, 81, 72, 81, 80, 72, 82, 83, 75, 83, 70, 75, 80, 84, 72, 84, 76, 72, 79, 85, 75, 85, 82, 75, 63, 86, 80, 86, 84, 80, 85, 87, 82, 87, 58, 82, 62, 88, 63, 88, 86, 63, 87, 89, 58, 89, 59, 58, 61, 90, 62, 90, 88, 62, 89, 91, 59, 91, 60, 59, 81, 92, 90, 81, 90, 61, 91, 93, 83, 91, 83, 60, 64, 67, 92, 64, 92, 81, 93, 71, 70, 93, 70, 83, 94, 56, 55, 94, 55, 95, 54, 53, 96, 54, 96, 97, 98, 94, 99, 94, 95, 99, 97, 96, 100, 96, 101, 100, 102, 98, 103, 98, 99, 103, 100, 101, 104, 101, 105, 104, 106, 102, 103, 106, 103, 107, 104, 105, 108, 104, 108, 109, 106, 107, 110, 107, 111, 110, 112, 109, 113, 109, 108, 113, 114, 115, 116, 114, 116, 117, 118, 119, 120, 118, 120, 121, 115, 114, 122, 114, 123, 122, 124, 120, 125, 120, 119, 125, 126, 122, 127, 122, 123, 127, 124, 125, 128, 125, 129, 128, 126, 127, 57, 126, 57, 56, 52, 128, 129, 52, 129, 53, 94, 98, 56, 98, 126, 56, 129, 101, 53, 101, 96, 53, 98, 102, 122, 98, 122, 126, 125, 105, 101, 125, 101, 129, 102, 106, 122, 106, 115, 122, 119, 108, 125, 108, 105, 125, 106, 110, 115, 110, 116, 115, 118, 113, 119, 113, 108, 119, 103, 130, 107, 130, 131, 107, 132, 133, 109, 133, 104, 109, 99, 134, 103, 134, 130, 103, 133, 135, 104, 135, 100, 104, 95, 136, 99, 136, 134, 99, 135, 137, 100, 137, 97, 100, 55, 138, 136, 55, 136, 95, 137, 139, 54, 137, 54, 97, 57, 140, 138, 57, 138, 55, 139, 141, 52, 139, 52, 54, 127, 142, 140, 127, 140, 57, 141, 143, 128, 141, 128, 52, 107, 131, 144, 107, 144, 111, 145, 132, 109, 145, 109, 112, 111, 144, 146, 111, 146, 110, 147, 145, 112, 147, 112, 113, 110, 146, 116, 146, 148, 116, 149, 147, 118, 147, 113, 118, 116, 148, 117, 148, 150, 117, 151, 149, 121, 149, 118, 121, 117, 150, 152, 117, 152, 114, 153, 151, 121, 153, 121, 120, 114, 152, 123, 152, 154, 123, 155, 153, 124, 153, 120, 124, 123, 154, 142, 123, 142, 127, 143, 155, 124, 143, 124, 128, 49, 51, 156, 51, 157, 156, 158, 46, 159, 46, 48, 159, 160, 156, 77, 156, 157, 77, 158, 159, 78, 159, 161, 78, 154, 160, 142, 160, 162, 142, 163, 161, 143, 161, 155, 143, 152, 156, 154, 156, 160, 154, 161, 159, 155, 159, 153, 155, 49, 156, 150, 156, 152, 150, 153, 159, 151, 159, 48, 151, 146, 49, 150, 146, 150, 148, 151, 48, 147, 151, 147, 149, 50, 49, 144, 49, 146, 144, 147, 48, 145, 48, 47, 145, 144, 131, 164, 144, 164, 50, 165, 132, 145, 165, 145, 47, 162, 160, 77, 162, 77, 76, 78, 161, 163, 78, 163, 79, 51, 166, 167, 51, 167, 157, 168, 169, 46, 168, 46, 158, 164, 67, 50, 67, 66, 50, 68, 71, 47, 71, 165, 47, 50, 66, 51, 66, 166, 51, 169, 68, 46, 68, 47, 46, 142, 162, 170, 142, 170, 140, 171, 163, 143, 171, 143, 141, 138, 140, 172, 140, 170, 172, 171, 141, 173, 141, 139, 173, 136, 138, 174, 138, 172, 174, 173, 139, 175, 139, 137, 175, 134, 136, 176, 136, 174, 176, 175, 137, 177, 137, 135, 177, 130, 134, 176, 130, 176, 178, 177, 135, 133, 177, 133, 179, 131, 130, 178, 131, 178, 164, 179, 133, 132, 179, 132, 165, 164, 178, 92, 164, 92, 67, 93, 179, 165, 93, 165, 71, 178, 176, 92, 176, 90, 92, 91, 177, 93, 177, 179, 93, 176, 174, 90, 174, 88, 90, 89, 175, 91, 175, 177, 91, 174, 172, 88, 172, 86, 88, 87, 173, 89, 173, 175, 89, 172, 170, 84, 172, 84, 86, 85, 171, 173, 85, 173, 87, 162, 76, 170, 76, 84, 170, 85, 79, 171, 79, 163, 171, 44, 43, 180, 43, 181, 180, 182, 42, 183, 42, 41, 183, 44, 180, 65, 180, 66, 65, 68, 183, 69, 183, 41, 69, 44, 184, 45, 184, 185, 45, 186, 187, 40, 187, 41, 40, 44, 65, 184, 65, 73, 184, 74, 69, 187, 69, 41, 187, 33, 37, 39, 33, 39, 31, 34, 36, 28, 34, 28, 30, 31, 39, 188, 31, 188, 166, 189, 34, 30, 189, 30, 169, 180, 31, 66, 31, 166, 66, 169, 30, 68, 30, 183, 68, 180, 181, 31, 181, 32, 31, 29, 182, 30, 182, 183, 30, 190, 191, 77, 191, 73, 77, 74, 192, 78, 192, 193, 78, 190, 77, 157, 190, 157, 194, 158, 78, 193, 158, 193, 195, 194, 157, 167, 194, 167, 196, 168, 158, 195, 168, 195, 197, 167, 198, 196, 198, 199, 196, 200, 201, 197, 201, 168, 197, 202, 203, 27, 202, 27, 26, 25, 204, 205, 25, 205, 26, 206, 207, 203, 207, 27, 203, 25, 208, 204, 208, 209, 204, 210, 202, 211, 202, 26, 211, 26, 205, 211, 205, 212, 211, 213, 214, 202, 214, 203, 202, 204, 215, 205, 215, 216, 205, 213, 202, 210, 213, 210, 217, 212, 205, 216, 212, 216, 218, 217, 210, 219, 217, 219, 220, 221, 212, 218, 221, 218, 222, 220, 219, 223, 220, 223, 224, 225, 221, 222, 225, 222, 226, 224, 223, 185, 224, 185, 184, 186, 225, 226, 186, 226, 187, 224, 184, 191, 184, 73, 191, 74, 187, 192, 187, 226, 192, 191, 190, 220, 191, 220, 224, 222, 193, 192, 222, 192, 226, 190, 194, 217, 190, 217, 220, 218, 195, 193, 218, 193, 222, 194, 196, 213, 194, 213, 217, 216, 197, 195, 216, 195, 218, 196, 199, 214, 196, 214, 213, 215, 200, 197, 215, 197, 216, 185, 223, 227, 185, 227, 228, 227, 225, 186, 227, 186, 228, 223, 219, 229, 223, 229, 227, 229, 221, 225, 229, 225, 227, 219, 210, 229, 210, 211, 229, 211, 212, 229, 212, 221, 229, 45, 185, 230, 185, 228, 230, 228, 186, 230, 186, 40, 230, 166, 188, 198, 166, 198, 167, 201, 189, 169, 201, 169, 168, 32, 231, 33, 231, 232, 33, 233, 234, 28, 234, 29, 28, 231, 32, 235, 231, 235, 236, 235, 29, 234, 235, 234, 236, 32, 181, 237, 32, 237, 235, 237, 182, 29, 237, 29, 235, 181, 43, 237, 43, 238, 237, 238, 42, 237, 42, 182, 237, 43, 45, 238, 45, 230, 238, 230, 40, 238, 40, 42, 238, 39, 38, 239, 38, 240, 239, 241, 35, 242, 35, 34, 242, 37, 243, 38, 243, 240, 38, 241, 244, 35, 244, 36, 35, 33, 232, 245, 232, 246, 245, 247, 233, 248, 233, 28, 248, 37, 33, 243, 33, 245, 243, 248, 28, 244, 28, 36, 244, 249, 250, 246, 249, 246, 232, 247, 251, 252, 247, 252, 233, 253, 249, 231, 249, 232, 231, 233, 252, 234, 252, 254, 234, 255, 256, 257, 256, 258, 257, 259, 260, 261, 260, 262, 261, 253, 257, 258, 253, 258, 249, 259, 261, 254, 259, 254, 252, 258, 263, 250, 258, 250, 249, 251, 264, 259, 251, 259, 252, 256, 265, 263, 256, 263, 258, 264, 266, 260, 264, 260, 259, 255, 267, 265, 255, 265, 256, 266, 268, 262, 266, 262, 260, 269, 270, 267, 269, 267, 255, 268, 270, 269, 268, 269, 262, 257, 271, 255, 271, 269, 255, 269, 271, 262, 271, 261, 262, 253, 272, 257, 272, 271, 257, 271, 272, 261, 272, 254, 261, 231, 236, 253, 236, 272, 253, 272, 236, 254, 236, 234, 254, 39, 239, 273, 39, 273, 188, 274, 242, 34, 274, 34, 189, 188, 273, 275, 188, 275, 198, 276, 274, 189, 276, 189, 201, 198, 275, 199, 275, 277, 199, 278, 276, 200, 276, 201, 200, 199, 277, 279, 199, 279, 214, 280, 278, 200, 280, 200, 215, 214, 279, 203, 279, 281, 203, 282, 280, 204, 280, 215, 204, 203, 281, 206, 281, 283, 206, 284, 282, 209, 282, 204, 209, 206, 283, 207, 283, 285, 207, 286, 284, 208, 284, 209, 208, 207, 285, 287, 207, 287, 27, 288, 286, 208, 288, 208, 25, 27, 287, 289, 27, 289, 24, 289, 288, 25, 289, 25, 24, 290, 291, 292, 290, 292, 293, 294, 295, 296, 294, 296, 297, 293, 292, 298, 293, 298, 299, 300, 294, 297, 300, 297, 301, 299, 298, 302, 299, 302, 303, 304, 300, 301, 304, 301, 305, 306, 307, 291, 306, 291, 290, 295, 308, 309, 295, 309, 296, 310, 311, 306, 311, 307, 306, 308, 312, 309, 312, 313, 309, 314, 315, 310, 315, 311, 310, 312, 316, 313, 316, 317, 313, 318, 319, 315, 318, 315, 314, 316, 320, 321, 316, 321, 317, 322, 323, 318, 323, 319, 318, 320, 324, 321, 324, 325, 321, 326, 327, 323, 326, 323, 322, 324, 328, 329, 324, 329, 325, 330, 331, 326, 331, 327, 326, 328, 332, 329, 332, 333, 329, 334, 335, 330, 335, 331, 330, 332, 336, 333, 336, 337, 333, 338, 339, 335, 338, 335, 334, 336, 340, 341, 336, 341, 337, 303, 302, 339, 303, 339, 338, 340, 304, 305, 340, 305, 341, 302, 342, 343, 302, 343, 339, 344, 345, 304, 344, 304, 340, 339, 343, 346, 339, 346, 335, 347, 344, 340, 347, 340, 336, 335, 346, 348, 335, 348, 331, 349, 347, 336, 349, 336, 332, 331, 348, 327, 348, 350, 327, 351, 349, 328, 349, 332, 328, 327, 350, 323, 350, 352, 323, 353, 351, 324, 351, 328, 324, 323, 352, 354, 323, 354, 319, 355, 353, 324, 355, 324, 320, 319, 354, 356, 319, 356, 315, 357, 355, 320, 357, 320, 316, 315, 356, 358, 315, 358, 311, 359, 357, 316, 359, 316, 312, 311, 358, 360, 311, 360, 307, 361, 359, 312, 361, 312, 308, 307, 360, 291, 360, 362, 291, 363, 361, 295, 361, 308, 295, 298, 364, 302, 364, 342, 302, 345, 365, 304, 365, 300, 304, 292, 366, 364, 292, 364, 298, 365, 367, 294, 365, 294, 300, 291, 362, 366, 291, 366, 292, 367, 363, 295, 367, 295, 294, 22, 368, 369, 22, 369, 23, 369, 368, 19, 369, 19, 18, 369, 370, 23, 370, 371, 23, 372, 370, 18, 370, 369, 18, 23, 371, 373, 23, 373, 21, 374, 372, 18, 374, 18, 20, 21, 373, 375, 21, 375, 22, 376, 374, 20, 376, 20, 19, 22, 375, 368, 375, 377, 368, 377, 376, 368, 376, 19, 368, 375, 378, 379, 375, 379, 377, 379, 380, 376, 379, 376, 377, 373, 381, 378, 373, 378, 375, 380, 382, 374, 380, 374, 376, 371, 383, 381, 371, 381, 373, 382, 384, 372, 382, 372, 374, 370, 385, 371, 385, 383, 371, 384, 385, 372, 385, 370, 372, 386, 387, 240, 386, 240, 243, 241, 388, 389, 241, 389, 244, 386, 243, 390, 243, 245, 390, 248, 244, 391, 244, 389, 391, 390, 245, 392, 245, 246, 392, 247, 248, 393, 248, 391, 393, 392, 394, 390, 394, 395, 390, 396, 397, 391, 397, 393, 391, 390, 395, 386, 395, 398, 386, 399, 396, 389, 396, 391, 389, 386, 398, 400, 386, 400, 387, 401, 399, 389, 401, 389, 388, 387, 400, 402, 387, 402, 403, 402, 401, 388, 402, 388, 403, 404, 405, 406, 404, 406, 407, 406, 405, 408, 406, 408, 409, 410, 407, 411, 407, 406, 411, 406, 409, 412, 409, 413, 412, 404, 407, 414, 404, 414, 415, 416, 409, 408, 416, 408, 417, 407, 410, 414, 410, 418, 414, 419, 413, 416, 413, 409, 416, 410, 411, 420, 410, 420, 418, 421, 412, 413, 421, 413, 419, 411, 406, 422, 411, 422, 420, 422, 406, 412, 422, 412, 421, 404, 415, 405, 415, 423, 405, 423, 417, 405, 417, 408, 405, 415, 395, 423, 395, 424, 423, 424, 396, 423, 396, 417, 423, 420, 422, 402, 422, 425, 402, 425, 422, 402, 422, 421, 402, 418, 420, 400, 420, 402, 400, 402, 421, 401, 421, 419, 401, 414, 418, 398, 418, 400, 398, 401, 419, 399, 419, 416, 399, 415, 414, 398, 415, 398, 395, 399, 416, 417, 399, 417, 396, 426, 383, 427, 383, 385, 427, 385, 384, 427, 384, 428, 427, 429, 394, 427, 394, 426, 427, 428, 397, 427, 397, 429, 427, 429, 424, 394, 424, 395, 394, 396, 424, 397, 424, 429, 397, 430, 431, 383, 430, 383, 426, 384, 432, 433, 384, 433, 428, 426, 394, 392, 426, 392, 430, 393, 397, 428, 393, 428, 433, 434, 381, 431, 381, 383, 431, 384, 382, 432, 382, 435, 432, 436, 378, 381, 436, 381, 434, 382, 380, 437, 382, 437, 435, 438, 379, 378, 438, 378, 436, 380, 379, 438, 380, 438, 437, 366, 362, 439, 362, 403, 439, 403, 363, 439, 363, 367, 439, 439, 440, 364, 439, 364, 366, 365, 440, 439, 365, 439, 367, 440, 441, 364, 441, 342, 364, 345, 442, 365, 442, 440, 365, 403, 362, 360, 403, 360, 387, 361, 363, 403, 361, 403, 388, 443, 387, 360, 443, 360, 358, 361, 388, 444, 361, 444, 359, 445, 443, 356, 443, 358, 356, 359, 444, 357, 444, 446, 357, 447, 445, 354, 445, 356, 354, 357, 446, 355, 446, 448, 355, 449, 447, 352, 447, 354, 352, 355, 448, 353, 448, 450, 353, 451, 449, 350, 449, 352, 350, 353, 450, 351, 450, 452, 351, 453, 451, 348, 451, 350, 348, 351, 452, 349, 452, 454, 349, 455, 453, 346, 453, 348, 346, 349, 454, 347, 454, 456, 347, 455, 346, 343, 455, 343, 457, 344, 347, 456, 344, 456, 458, 457, 343, 441, 343, 342, 441, 345, 344, 442, 344, 458, 442, 440, 289, 441, 289, 287, 441, 288, 289, 442, 289, 440, 442, 441, 287, 457, 287, 285, 457, 286, 288, 458, 288, 442, 458, 457, 285, 455, 285, 283, 455, 284, 286, 456, 286, 458, 456, 455, 283, 281, 455, 281, 453, 282, 284, 456, 282, 456, 454, 453, 281, 451, 281, 279, 451, 280, 282, 452, 282, 454, 452, 451, 279, 449, 279, 277, 449, 278, 280, 450, 280, 452, 450, 449, 277, 447, 277, 275, 447, 276, 278, 448, 278, 450, 448, 447, 275, 273, 447, 273, 445, 274, 276, 448, 274, 448, 446, 445, 273, 443, 273, 239, 443, 242, 274, 444, 274, 446, 444, 443, 239, 240, 443, 240, 387, 241, 242, 444, 241, 444, 388, 430, 392, 246, 430, 246, 250, 247, 393, 433, 247, 433, 251, 431, 430, 250, 431, 250, 263, 251, 433, 432, 251, 432, 264, 434, 431, 263, 434, 263, 265, 264, 432, 435, 264, 435, 266, 436, 434, 267, 434, 265, 267, 266, 435, 268, 435, 437, 268, 438, 436, 270, 436, 267, 270, 268, 437, 270, 437, 438, 270, 3, 459, 460, 3, 460, 4, 461, 462, 2, 461, 2, 1, 4, 460, 463, 4, 463, 7, 464, 461, 1, 464, 1, 6, 7, 463, 465, 7, 465, 9, 466, 464, 6, 466, 6, 8, 9, 465, 467, 9, 467, 11, 468, 466, 8, 468, 8, 10, 11, 467, 13, 467, 469, 13, 470, 468, 12, 468, 10, 12, 13, 469, 15, 469, 471, 15, 472, 470, 14, 470, 12, 14, 15, 471, 17, 471, 473, 17, 474, 472, 16, 472, 14, 16, 17, 473, 3, 473, 459, 3, 462, 474, 2, 474, 16, 2, 475, 459, 476, 459, 473, 476, 474, 462, 477, 462, 478, 477, 479, 475, 480, 475, 476, 480, 477, 478, 481, 478, 482, 481, 480, 476, 483, 476, 484, 483, 485, 477, 486, 477, 481, 486, 476, 473, 484, 473, 471, 484, 472, 474, 485, 474, 477, 485, 484, 471, 487, 471, 469, 487, 470, 472, 488, 472, 485, 488, 483, 484, 489, 484, 487, 489, 488, 485, 490, 485, 486, 490, 489, 487, 491, 487, 492, 491, 493, 488, 494, 488, 490, 494, 487, 469, 467, 487, 467, 492, 468, 470, 488, 468, 488, 493, 492, 467, 495, 467, 465, 495, 466, 468, 496, 468, 493, 496, 491, 492, 497, 492, 495, 497, 496, 493, 498, 493, 494, 498, 497, 495, 499, 497, 499, 500, 501, 496, 498, 501, 498, 502, 495, 465, 463, 495, 463, 499, 464, 466, 496, 464, 496, 501, 499, 463, 460, 499, 460, 503, 461, 464, 501, 461, 501, 504, 500, 499, 503, 500, 503, 505, 504, 501, 502, 504, 502, 506, 505, 503, 475, 505, 475, 479, 478, 504, 506, 478, 506, 482, 503, 460, 459, 503, 459, 475, 462, 461, 504, 462, 504, 478];
      var normals = [0.18976, -0.00357, 0.98181, 0.64681, -0.7582, 0.08209, 0.99957, -0.0145, -0.02445, -0.99957, -0.0145, -0.02445, -0.64681, -0.7582, 0.08209, -0.18976, -0.00357, 0.98181, -0.08579, -0.98297, 0.16239, 0.08579, -0.98297, 0.16239, -0.74483, -0.62377, 0.23682, 0.74483, -0.62377, 0.23682, -0.87097, -0.01471, 0.4911, 0.87097, -0.01471, 0.4911, -0.75835, 0.60613, 0.23969, 0.75835, 0.60613, 0.23969, -0.08579, 0.98251, 0.16511, 0.08579, 0.98251, 0.16511, 0.65514, 0.75063, 0.08557, -0.65514, 0.75063, 0.08557, -0.34928, -0.71993, 0.59972, -0.17368, 0.21574, 0.96084, -0.80984, 0.38829, 0.43974, 0.80984, 0.38829, 0.43974, 0.17368, 0.21574, 0.96084, 0.34928, -0.71993, 0.59972, 0.0, 0.79418, 0.60765, -0.50865, 0.85812, -0.06989, 0.0, 0.48708, 0.87335, 0.50865, 0.85812, -0.06989, 0.98141, -0.18668, 0.04395, 0.56981, -0.82171, 0.00781, 0.56346, -0.81457, 0.13767, -0.56346, -0.81457, 0.13767, -0.56981, -0.82171, 0.00781, -0.98141, -0.18668, 0.04395, 0.47584, -0.87625, 0.07538, 0.85052, -0.52553, -0.02069, 0.87695, -0.16382, 0.45177, -0.87695, -0.16382, 0.45177, -0.85052, -0.52553, -0.02069, -0.47584, -0.87625, 0.07538, 0.44829, -0.36787, -0.81466, 0.53053, -0.53945, -0.65383, 0.51308, -0.67467, -0.53059, -0.51308, -0.67467, -0.53059, -0.53053, -0.53945, -0.65383, -0.44829, -0.36787, -0.81466, 0.88818, -0.43995, -0.13239, 0.58852, 0.22697, 0.77593, 0.91153, -0.11527, 0.39467, -0.91153, -0.11527, 0.39467, -0.58852, 0.22697, 0.77593, -0.88818, -0.43995, -0.13239, 0.46889, -0.30473, 0.829, 0.25156, 0.26078, 0.932, -0.00308, -0.33088, 0.94363, 0.00308, -0.33088, 0.94363, -0.25156, 0.26078, 0.932, -0.46889, -0.30473, 0.829, 0.47307, 0.579, -0.66402, 0.99246, 0.02863, -0.1189, 0.45997, -0.38026, -0.80236, -0.45997, -0.38026, -0.80236, -0.99246, 0.02863, -0.1189, -0.47307, 0.579, -0.66402, -0.05991, -0.80471, -0.59059, -0.34614, -0.63729, -0.6885, -0.33055, -0.94324, 0.03128, -0.07367, -0.59499, 0.80032, 0.33055, -0.94324, 0.03128, 0.34614, -0.63729, -0.6885, 0.05991, -0.80471, -0.59059, 0.07367, -0.59499, 0.80032, 0.59374, 0.59526, -0.54137, -0.62606, -0.00269, -0.77975, 0.62606, -0.00269, -0.77975, -0.59374, 0.59526, -0.54137, 0.12769, 0.70376, 0.69884, -0.71383, 0.38218, 0.58681, 0.71383, 0.38218, 0.58681, -0.12769, 0.70376, 0.69884, 0.37806, 0.56005, -0.73714, 0.03681, -0.70846, -0.70476, -0.37806, 0.56005, -0.73714, -0.03681, -0.70846, -0.70476, -0.03156, 0.83871, 0.54363, 0.03156, 0.83871, 0.54363, -0.36116, 0.84869, 0.3863, 0.36116, 0.84869, 0.3863, -0.71639, 0.20447, 0.66704, 0.71639, 0.20447, 0.66704, -0.66204, -0.41377, 0.62487, 0.66204, -0.41377, 0.62487, -0.53023, -0.65575, 0.53737, 0.53023, -0.65575, 0.53737, -0.43748, 0.00122, 0.8992, 0.55098, -0.1381, 0.82299, 0.43748, 0.00122, 0.8992, -0.55098, -0.1381, 0.82299, -0.31596, -0.1023, 0.94321, 0.60854, 0.29612, 0.73617, -0.60854, 0.29612, 0.73617, 0.31596, -0.1023, 0.94321, -0.44548, -0.08878, 0.89087, -0.2577, 0.60002, 0.75732, 0.2577, 0.60002, 0.75732, 0.44548, -0.08878, 0.89087, -0.3278, 0.16993, 0.92932, 0.04178, 0.92721, 0.37211, 0.3278, 0.16993, 0.92932, -0.04178, 0.92721, 0.37211, -0.27793, 0.2602, 0.92468, -0.75072, 0.11155, 0.65111, 0.75072, 0.11155, 0.65111, 0.27793, 0.2602, 0.92468, -0.43791, -0.29398, 0.84957, -0.18378, 0.03684, 0.98227, -0.55422, 0.38722, 0.73681, -0.81433, 0.25343, 0.52211, 0.55422, 0.38722, 0.73681, 0.18378, 0.03684, 0.98227, 0.43791, -0.29398, 0.84957, 0.81433, 0.25343, 0.52211, -0.32667, -0.00162, 0.94513, -0.70434, -0.52687, 0.47569, 0.70434, -0.52687, 0.47569, 0.32667, -0.00162, 0.94513, -0.30879, 0.13462, 0.94153, -0.62917, -0.37144, 0.68273, 0.62917, -0.37144, 0.68273, 0.30879, 0.13462, 0.94153, 0.14618, 0.94864, 0.28047, -0.13752, 0.90582, 0.40071, 0.13752, 0.90582, 0.40071, -0.14618, 0.94864, 0.28047, 0.72375, 0.69002, -0.00522, -0.72375, 0.69002, -0.00522, 0.99469, -0.07801, 0.06702, -0.99469, -0.07801, 0.06702, 0.20093, -0.75814, 0.62035, -0.20093, -0.75814, 0.62035, -0.54125, -0.67266, 0.5045, 0.54125, -0.67266, 0.5045, -0.69005, -0.55321, 0.46663, 0.69005, -0.55321, 0.46663, -0.464, 0.68667, 0.55956, 0.464, 0.68667, 0.55956, -0.82745, -0.1359, 0.54479, 0.82745, -0.1359, 0.54479, -0.46623, 0.80886, 0.3582, 0.46623, 0.80886, 0.3582, -0.74398, -0.02292, 0.66778, 0.74398, -0.02292, 0.66778, -0.71129, -0.63833, 0.29414, 0.71129, -0.63833, 0.29414, -0.70977, -0.502, 0.49413, 0.70977, -0.502, 0.49413, -0.8189, -0.42552, 0.38511, -0.99252, -0.07144, -0.09876, 0.99252, -0.07144, -0.09876, 0.8189, -0.42552, 0.38511, -0.43919, -0.27357, 0.85571, 0.43919, -0.27357, 0.85571, -0.41469, -0.05988, 0.90796, 0.41469, -0.05988, 0.90796, -0.34156, 0.45213, 0.82394, 0.34156, 0.45213, 0.82394, -0.72451, -0.68493, 0.07663, -0.98755, -0.12302, 0.09799, 0.98755, -0.12302, 0.09799, 0.72451, -0.68493, 0.07663, -0.57274, -0.08844, 0.81494, 0.57274, -0.08844, 0.81494, -0.29182, -0.1521, 0.94427, 0.29182, -0.1521, 0.94427, 0.23966, -0.1286, 0.96228, -0.23966, -0.1286, 0.96228, 0.18702, 0.37068, 0.9097, -0.18702, 0.37068, 0.9097, -0.45579, 0.42317, 0.78304, 0.45579, 0.42317, 0.78304, -0.5435, -0.81338, -0.20734, -0.56005, -0.81442, -0.15174, 0.56005, -0.81442, -0.15174, 0.5435, -0.81338, -0.20734, -0.61538, -0.08765, -0.78332, -0.44731, 0.22953, -0.86441, 0.44731, 0.22953, -0.86441, 0.61538, -0.08765, -0.78332, -0.54717, -0.83218, -0.08979, 0.54717, -0.83218, -0.08979, -0.87313, 0.48698, -0.02026, -0.86535, 0.33122, -0.37605, 0.86535, 0.33122, -0.37605, 0.87313, 0.48698, -0.02026, -0.74874, 0.51839, 0.41304, 0.74874, 0.51839, 0.41304, -0.76617, 0.63482, 0.09961, 0.76617, 0.63482, 0.09961, -0.95318, -0.2483, -0.17243, -0.66564, 0.6025, -0.44032, 0.66564, 0.6025, -0.44032, 0.95318, -0.2483, -0.17243, -0.32264, 0.84771, 0.42103, -0.18857, 0.78893, -0.58477, 0.18857, 0.78893, -0.58477, 0.32264, 0.84771, 0.42103, -0.23978, 0.74526, -0.62212, 0.49425, 0.52058, -0.69616, -0.49425, 0.52058, -0.69616, 0.23978, 0.74526, -0.62212, -0.4807, 0.73122, 0.48393, 0.0, 0.75869, 0.65142, 0.4807, 0.73122, 0.48393, -0.48924, 0.76296, 0.4225, -0.36311, 0.90857, -0.20646, 0.36311, 0.90857, -0.20646, 0.48924, 0.76296, 0.4225, -0.64504, 0.69454, 0.31861, 0.64504, 0.69454, 0.31861, -0.49284, 0.86901, 0.04306, -0.67943, 0.72897, -0.08347, 0.49284, 0.86901, 0.04306, 0.67943, 0.72897, -0.08347, -0.39174, 0.82601, -0.40522, -0.6444, 0.52721, -0.55388, 0.39174, 0.82601, -0.40522, 0.6444, 0.52721, -0.55388, 0.0, 0.80071, -0.59902, 0.0, 0.33073, -0.94369, 0.0, 0.99966, 0.02564, 0.0, -0.27146, -0.96243, -0.68529, -0.58315, -0.43623, -0.90722, 0.2526, -0.33625, 0.90722, 0.2526, -0.33625, 0.68529, -0.58315, -0.43623, 0.0, -0.98434, -0.17621, 0.0, -0.73635, -0.67656, 0.0, -0.94876, -0.31593, 0.0, -0.64824, -0.76141, -0.31736, -0.94696, -0.04996, -0.83828, -0.40815, 0.36146, 0.83828, -0.40815, 0.36146, 0.31736, -0.94696, -0.04996, -0.93936, 0.326, 0.10611, 0.93936, 0.326, 0.10611, -0.93063, 0.34016, 0.13477, -0.96014, 0.23136, 0.15677, 0.96014, 0.23136, 0.15677, 0.93063, 0.34016, 0.13477, -0.81256, -0.00107, -0.58284, -0.97958, 0.09339, 0.17786, 0.97958, 0.09339, 0.17786, 0.81256, -0.00107, -0.58284, -0.27253, -0.30116, -0.91379, 0.27253, -0.30116, -0.91379, -0.09091, -0.77633, -0.62371, -0.50685, -0.48814, -0.71047, -0.14252, -0.14728, -0.97876, -0.63726, 0.09333, -0.76495, 0.63726, 0.09333, -0.76495, 0.50685, -0.48814, -0.71047, 0.14252, -0.14728, -0.97876, 0.09091, -0.77633, -0.62371, -0.93728, -0.25425, 0.23835, 0.93728, -0.25425, 0.23835, -0.43052, -0.89526, 0.1146, 0.43052, -0.89526, 0.1146, -0.15839, -0.97482, 0.15677, 0.15839, -0.97482, 0.15677, 0.0, -0.91586, -0.40144, 0.0, -0.94644, 0.32286, 0.0, -0.3368, -0.94156, 0.0, -0.17573, -0.98444, -0.59923, -0.77398, 0.20457, 0.59923, -0.77398, 0.20457, -0.89099, -0.42326, -0.16404, 0.89099, -0.42326, -0.16404, -0.85199, 0.21928, 0.47539, 0.85199, 0.21928, 0.47539, -0.50917, 0.85223, 0.12, 0.50917, 0.85223, 0.12, -0.61043, 0.75915, 0.22587, 0.61043, 0.75915, 0.22587, -0.18247, 0.98178, 0.05249, 0.18247, 0.98178, 0.05249, 0.52037, 0.77035, 0.36839, -0.52037, 0.77035, 0.36839, 0.85272, 0.50426, 0.1362, -0.85272, 0.50426, 0.1362, 0.0, 0.97021, 0.24216, -0.70965, 0.26182, 0.65404, 0.06729, -0.06427, 0.99564, -0.24659, -0.03409, 0.9685, -0.80972, -0.01022, 0.58669, 0.24659, -0.03409, 0.9685, -0.06729, -0.06427, 0.99564, 0.70965, 0.26182, 0.65404, 0.80972, -0.01022, 0.58669, -0.46583, -0.08032, 0.88119, -0.73711, -0.24418, 0.63009, 0.46583, -0.08032, 0.88119, 0.73711, -0.24418, 0.63009, -0.21195, -0.08597, 0.97348, -0.3675, -0.37648, 0.8504, 0.21195, -0.08597, 0.97348, 0.3675, -0.37648, 0.8504, -0.43028, 0.5566, 0.71062, -0.02008, -0.07294, 0.99713, 0.02008, -0.07294, 0.99713, 0.43028, 0.5566, 0.71062, -0.09098, 0.59734, 0.79678, -0.18793, -0.09162, 0.97787, 0.18793, -0.09162, 0.97787, 0.09098, 0.59734, 0.79678, 0.16593, 0.60936, 0.77529, -0.20331, 0.09253, 0.9747, 0.20331, 0.09253, 0.9747, -0.16593, 0.60936, 0.77529, 0.2693, 0.24168, 0.93222, -0.31422, -0.13242, 0.94006, 0.31422, -0.13242, 0.94006, -0.2693, 0.24168, 0.93222, 0.42006, -0.11899, 0.89962, -0.11975, -0.07093, 0.99023, 0.11975, -0.07093, 0.99023, -0.42006, -0.11899, 0.89962, 0.22614, -0.60659, 0.76214, -0.32084, 0.04071, 0.94623, 0.32084, 0.04071, 0.94623, -0.22614, -0.60659, 0.76214, 0.23261, -0.74606, 0.62389, -0.07456, -0.39164, 0.91708, 0.07456, -0.39164, 0.91708, -0.23261, -0.74606, 0.62389, -0.12125, -0.31388, 0.94168, -0.1467, -0.03571, 0.98853, 0.1467, -0.03571, 0.98853, 0.12125, -0.31388, 0.94168, -0.21683, -0.27372, 0.93701, -0.18744, 0.00116, 0.98227, 0.18744, 0.00116, 0.98227, 0.21683, -0.27372, 0.93701, -0.30302, -0.20194, 0.93133, -0.25309, -0.16181, 0.95379, 0.25309, -0.16181, 0.95379, 0.30302, -0.20194, 0.93133, -0.14011, -0.09119, 0.9859, 0.14011, -0.09119, 0.9859, -0.23798, 0.05017, 0.96994, 0.23798, 0.05017, 0.96994, -0.31266, -0.23792, 0.91955, 0.31266, -0.23792, 0.91955, -0.37379, -0.1052, 0.92151, 0.37379, -0.1052, 0.92151, -0.4706, -0.16465, 0.86682, 0.4706, -0.16465, 0.86682, -0.43922, -0.37614, 0.81582, 0.43922, -0.37614, 0.81582, -0.21961, -0.54064, 0.81204, 0.21961, -0.54064, 0.81204, 0.16697, -0.37483, 0.91189, -0.16697, -0.37483, 0.91189, 0.20185, -0.2776, 0.93924, -0.20185, -0.2776, 0.93924, 0.00116, -0.16556, 0.98618, -0.00116, -0.16556, 0.98618, 0.29292, -0.17411, 0.94012, -0.29292, -0.17411, 0.94012, 0.0, 0.7322, 0.68105, 0.0, -0.60363, 0.79727, 0.0, -0.97174, 0.23591, 0.13178, -0.60829, 0.78268, -0.13178, -0.60829, 0.78268, 0.75912, 0.06839, 0.6473, -0.75912, 0.06839, 0.6473, 0.40596, 0.6436, 0.64879, -0.40596, 0.6436, 0.64879, 0.0, 0.59835, 0.8012, 0.07385, -0.33055, 0.94086, 0.0, -0.12452, 0.99219, -0.07385, -0.33055, 0.94086, -0.08512, -0.33924, 0.93683, 0.08512, -0.33924, 0.93683, -0.14188, -0.14835, 0.9787, 0.14188, -0.14835, 0.9787, 0.0, -0.4828, 0.8757, -0.69298, -0.00134, 0.72091, -0.09552, -0.32609, 0.94049, 0.09552, -0.32609, 0.94049, 0.69298, -0.00134, 0.72091, -0.64669, 0.1626, 0.7452, 0.64669, 0.1626, 0.7452, -0.59346, 0.12186, 0.79556, 0.59346, 0.12186, 0.79556, -0.12436, 0.00967, 0.99219, -0.50999, -0.45772, 0.72823, 0.50999, -0.45772, 0.72823, 0.12436, 0.00967, 0.99219, -0.97214, -0.16788, 0.16355, 0.97214, -0.16788, 0.16355, -0.71599, 0.57216, 0.39995, 0.71599, 0.57216, 0.39995, 0.0, 0.43052, 0.90255, 0.0, 0.01086, 0.99994, -0.22184, -0.60604, 0.76385, 0.0, -0.49293, 0.87002, 0.0, 0.01032, 0.99994, -0.29432, -0.18448, 0.93771, 0.22184, -0.60604, 0.76385, 0.29432, -0.18448, 0.93771, -0.39692, 0.53499, 0.74578, 0.24778, 0.56822, 0.78466, -0.24778, 0.56822, 0.78466, 0.39692, 0.53499, 0.74578, -0.86822, -0.26133, 0.42174, -0.55599, -0.69069, 0.46236, 0.86822, -0.26133, 0.42174, 0.55599, -0.69069, 0.46236, -0.75307, 0.64989, 0.1023, 0.75307, 0.64989, 0.1023, 0.19419, 0.9357, 0.29447, -0.19419, 0.9357, 0.29447, 0.0, 0.78896, 0.6144, 0.0, -0.88864, 0.45857, 0.0, -0.33677, 0.94156, 0.0, -0.25199, 0.96771, -0.18836, -0.04013, 0.98126, 0.0, -0.0329, 0.99945, 0.18836, -0.04013, 0.98126, 0.0, 0.0, 1.0, -0.57204, -0.01871, 0.82, -0.53633, -0.21241, 0.81683, 0.53633, -0.21241, 0.81683, 0.57204, -0.01871, 0.82, -0.35771, -0.63833, 0.68157, 0.35771, -0.63833, 0.68157, -0.1543, -0.75411, 0.63833, 0.1543, -0.75411, 0.63833, 0.0, -0.74346, 0.66875, 0.0, -0.18912, 0.98193, 0.0, -0.11447, 0.99341, 0.0014, -0.05564, 0.99844, -0.0014, -0.05564, 0.99844, -0.33628, -0.51283, 0.78985, 0.33628, -0.51283, 0.78985, -0.45454, -0.33708, 0.82446, 0.45454, -0.33708, 0.82446, -0.54347, -0.3086, 0.7806, 0.54347, -0.3086, 0.7806, -0.38716, -0.18781, 0.90265, 0.38716, -0.18781, 0.90265, -0.43065, -0.1449, 0.8908, 0.43065, -0.1449, 0.8908, -0.23402, -0.12055, 0.96472, 0.23402, -0.12055, 0.96472, -0.26383, 0.1688, 0.94967, 0.26383, 0.1688, 0.94967, 0.19672, 0.14188, 0.97012, -0.19672, 0.14188, 0.97012, -0.90677, -0.00833, 0.42152, -0.74413, -0.64092, 0.18827, 0.74413, -0.64092, 0.18827, 0.90677, -0.00833, 0.42152, -0.04419, -0.97439, 0.22031, 0.04419, -0.97439, 0.22031, 0.63994, -0.7615, 0.10279, -0.63994, -0.7615, 0.10279, 0.9555, -0.01144, 0.29472, -0.9555, -0.01144, 0.29472, 0.64968, 0.75439, 0.09357, -0.64968, 0.75439, 0.09357, -0.03705, 0.97888, 0.2009, 0.03705, 0.97888, 0.2009, -0.75234, 0.6354, 0.17374, 0.75234, 0.6354, 0.17374, -0.81179, -0.00278, 0.58388, -0.59694, 0.48677, 0.63768, 0.59694, 0.48677, 0.63768, 0.81179, -0.00278, 0.58388, -0.86822, -0.00583, 0.49611, -0.7195, 0.47301, 0.50847, 0.7195, 0.47301, 0.50847, 0.86822, -0.00583, 0.49611, -0.20426, 0.82876, 0.52095, -0.09577, 0.71728, 0.69015, 0.09577, 0.71728, 0.69015, 0.20426, 0.82876, 0.52095, 0.4517, 0.45988, 0.76446, -0.4517, 0.45988, 0.76446, 0.45036, 0.6939, 0.56182, -0.45036, 0.6939, 0.56182, 0.80554, 0.10941, 0.58232, 0.69149, -0.0741, 0.71856, -0.69149, -0.0741, 0.71856, -0.80554, 0.10941, 0.58232, 0.38621, -0.47468, 0.79086, -0.38621, -0.47468, 0.79086, 0.55776, -0.62911, 0.54137, -0.55776, -0.62911, 0.54137, -0.09116, -0.72372, 0.68401, -0.19974, -0.85806, 0.47307, 0.09116, -0.72372, 0.68401, 0.19974, -0.85806, 0.47307, -0.59795, -0.49648, 0.62923, 0.59795, -0.49648, 0.62923, -0.7232, -0.48891, 0.48775, 0.7232, -0.48891, 0.48775];

      return {
          positions: positions,
          indices: indices,
          normals: normals
      };
  };

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
  exports.Suzanne = Suzanne;

  Object.defineProperty(exports, '__esModule', { value: true });

})));
