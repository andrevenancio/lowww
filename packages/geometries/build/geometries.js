(function (global, factory) {
  typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
  typeof define === 'function' && define.amd ? define(['exports'], factory) :
  (global = global || self, factory((global.lowww = global.lowww || {}, global.lowww.geometries = {})));
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
   * 4x4 Matrix<br>Format: column-major, when typed out it looks like row-major<br>The matrices are being post multiplied.
   * @module mat4
   */

  /**
   * Creates a new identity mat4
   *
   * @returns {mat4} a new 4x4 matrix
   */

  function create() {
    var out = new ARRAY_TYPE(16);

    if (ARRAY_TYPE != Float32Array) {
      out[1] = 0;
      out[2] = 0;
      out[3] = 0;
      out[4] = 0;
      out[6] = 0;
      out[7] = 0;
      out[8] = 0;
      out[9] = 0;
      out[11] = 0;
      out[12] = 0;
      out[13] = 0;
      out[14] = 0;
    }

    out[0] = 1;
    out[5] = 1;
    out[10] = 1;
    out[15] = 1;
    return out;
  }
  /**
   * Set a mat4 to the identity matrix
   *
   * @param {mat4} out the receiving matrix
   * @returns {mat4} out
   */

  function identity(out) {
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
    } // Perform axis-specific matrix multiplication


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
    } // Perform axis-specific matrix multiplication


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

  function create$1() {
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
   * Adds two vec3's
   *
   * @param {vec3} out the receiving vector
   * @param {vec3} a the first operand
   * @param {vec3} b the second operand
   * @returns {vec3} out
   */

  function add(out, a, b) {
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

  function subtract(out, a, b) {
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

  function scale(out, a, b) {
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
    }

    out[0] = a[0] * len;
    out[1] = a[1] * len;
    out[2] = a[2] * len;
    return out;
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
    var vec = create$1();
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

  var merge = function merge() {
      for (var _len = arguments.length, props = Array(_len), _key = 0; _key < _len; _key++) {
          props[_key] = arguments[_key];
      }

      console.log('merge', props);

      var positions = [];
      var indices = [];
      var normals = [];
      var uvs = [];

      return {
          positions: positions,
          indices: indices,
          normals: normals,
          uvs: uvs
      };
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

      var cb = create$1();
      var ab = create$1();
      var cross$1 = create$1();

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

          subtract(cb, vC, vB);
          subtract(ab, vA, vB);
          cross(cross$1, cb, ab);

          if (temp[a] === undefined) {
              temp[a] = create$1();
          }

          if (temp[b] === undefined) {
              temp[b] = create$1();
          }

          if (temp[c] === undefined) {
              temp[c] = create$1();
          }

          add(temp[a], temp[a], cross$1);
          add(temp[b], temp[b], cross$1);
          add(temp[c], temp[c], cross$1);
      }

      for (var _i = 0; _i < temp.length; _i++) {
          normalize(temp[_i], temp[_i]);
      }

      return flatten(temp);
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

      var p = flatten(unique);
      var f = flatten(faces);

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
    Modify: Modify,
    merge: merge
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
              uvs: flatten(uvs)
          };

          this.geometry = {
              positions: geometry.positions,
              indices: geometry.indices,
              normals: generateVertexNormals(geometry.positions, geometry.indices),
              uvs: flatten(uvs)
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

  var matRotY = create();
  var matRotZ = create();
  var up = fromValues(0, 1, 0);
  var tmpVec3 = create$1();

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

              identity(matRotZ);
              rotateZ(matRotZ, matRotZ, -angleZ);

              identity(matRotY);
              rotateY(matRotY, matRotY, angleY);

              transformMat4(tmpVec3, up, matRotZ);
              transformMat4(tmpVec3, tmpVec3, matRotY);

              scale(tmpVec3, tmpVec3, -(settings.radius * 2));
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

      var center = create$1();
      var vertex = create$1();
      var normal = create$1();

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
              subtract(normal, vertex, center);
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

          var vertex = create$1();
          var normal = create$1();

          var P1 = create$1();
          var P2 = create$1();

          var B = create$1();
          var T = create$1();
          var N = create$1();

          for (var i = 0; i <= settings.tubularSegments; i++) {
              var u = i / settings.tubularSegments * settings.p * Math.PI * 2;
              this.calculatePositionOnCurve(u, settings.p, settings.q, settings.radius, P1);
              this.calculatePositionOnCurve(u + 0.01, settings.p, settings.q, settings.radius, P2);

              subtract(T, P2, P1);
              add(N, P2, P1);
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

                  subtract(normal, vertex, P1);
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

  var Prism = function Prism(props) {
      classCallCheck(this, Prism);

      var settings = Object.assign({}, {
          width: 1,
          height: 1,
          depth: 1
      }, props);

      var positions = [
      // Front face
      -0.5, -0.5, +0.5, // 0
      +0.5, -0.5, +0.5, // 1
      +0.5, +0.5, -0.5, // 2
      -0.5, +0.5, -0.5, // 3

      // back
      +0.5, -0.5, -0.5, // 4
      -0.5, -0.5, -0.5];

      for (var i = 0; i < positions.length; i += 3) {
          positions[i + 0] *= settings.width;
          positions[i + 1] *= settings.height;
          positions[i + 2] *= settings.depth;
      }

      var indices = [
      // Front face
      0, 1, 2, 0, 2, 3,
      // Back face
      4, 3, 2, 4, 5, 3,
      // bottom
      1, 0, 5, 1, 5, 4,
      // left
      5, 0, 3,
      // right
      1, 4, 2];

      return {
          positions: positions,
          indices: indices
      };
  };

  exports.Box = Box;
  exports.Dodecahedron = Dodecahedron;
  exports.Hexahedron = Hexahedron;
  exports.Icosahedron = Icosahedron;
  exports.Octahedron = Octahedron;
  exports.Plane = Plane;
  exports.Prism = Prism;
  exports.Sphere = Sphere;
  exports.Tetrahedron = Tetrahedron;
  exports.Torus = Torus;
  exports.TorusKnot = TorusKnot;
  exports.utils = index;

  Object.defineProperty(exports, '__esModule', { value: true });

}));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiZ2VvbWV0cmllcy5qcyIsInNvdXJjZXMiOlsiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9lc20vY29tbW9uLmpzIiwiLi4vLi4vLi4vbm9kZV9tb2R1bGVzL2dsLW1hdHJpeC9lc20vbWF0NC5qcyIsIi4uLy4uLy4uL25vZGVfbW9kdWxlcy9nbC1tYXRyaXgvZXNtL3ZlYzMuanMiLCIuLi9zcmMvdXRpbHMvbWVyZ2UuanMiLCIuLi9zcmMvdXRpbHMvbW9kaWZ5LmpzIiwiLi4vc3JjL3V0aWxzL2luZGV4LmpzIiwiLi4vc3JjL3BvbHloZWRyYS5qcyIsIi4uL3NyYy90ZXRyYWhlZHJvbi9pbmRleC5qcyIsIi4uL3NyYy9oZXhhaGVkcm9uL2luZGV4LmpzIiwiLi4vc3JjL29jdGFoZWRyb24vaW5kZXguanMiLCIuLi9zcmMvZG9kZWNhaGVkcm9uL2luZGV4LmpzIiwiLi4vc3JjL2ljb3NhaGVkcm9uL2luZGV4LmpzIiwiLi4vc3JjL3BsYW5lL2luZGV4LmpzIiwiLi4vc3JjL2JveC9pbmRleC5qcyIsIi4uL3NyYy9zcGhlcmUvaW5kZXguanMiLCIuLi9zcmMvdG9ydXMvaW5kZXguanMiLCIuLi9zcmMvdG9ydXNrbm90L2luZGV4LmpzIiwiLi4vc3JjL3ByaXNtL2luZGV4LmpzIl0sInNvdXJjZXNDb250ZW50IjpbIi8qKlxyXG4gKiBDb21tb24gdXRpbGl0aWVzXHJcbiAqIEBtb2R1bGUgZ2xNYXRyaXhcclxuICovXG4vLyBDb25maWd1cmF0aW9uIENvbnN0YW50c1xuZXhwb3J0IHZhciBFUFNJTE9OID0gMC4wMDAwMDE7XG5leHBvcnQgdmFyIEFSUkFZX1RZUEUgPSB0eXBlb2YgRmxvYXQzMkFycmF5ICE9PSAndW5kZWZpbmVkJyA/IEZsb2F0MzJBcnJheSA6IEFycmF5O1xuZXhwb3J0IHZhciBSQU5ET00gPSBNYXRoLnJhbmRvbTtcbi8qKlxyXG4gKiBTZXRzIHRoZSB0eXBlIG9mIGFycmF5IHVzZWQgd2hlbiBjcmVhdGluZyBuZXcgdmVjdG9ycyBhbmQgbWF0cmljZXNcclxuICpcclxuICogQHBhcmFtIHtUeXBlfSB0eXBlIEFycmF5IHR5cGUsIHN1Y2ggYXMgRmxvYXQzMkFycmF5IG9yIEFycmF5XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2V0TWF0cml4QXJyYXlUeXBlKHR5cGUpIHtcbiAgQVJSQVlfVFlQRSA9IHR5cGU7XG59XG52YXIgZGVncmVlID0gTWF0aC5QSSAvIDE4MDtcbi8qKlxyXG4gKiBDb252ZXJ0IERlZ3JlZSBUbyBSYWRpYW5cclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IGEgQW5nbGUgaW4gRGVncmVlc1xyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRvUmFkaWFuKGEpIHtcbiAgcmV0dXJuIGEgKiBkZWdyZWU7XG59XG4vKipcclxuICogVGVzdHMgd2hldGhlciBvciBub3QgdGhlIGFyZ3VtZW50cyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgdmFsdWUsIHdpdGhpbiBhbiBhYnNvbHV0ZVxyXG4gKiBvciByZWxhdGl2ZSB0b2xlcmFuY2Ugb2YgZ2xNYXRyaXguRVBTSUxPTiAoYW4gYWJzb2x1dGUgdG9sZXJhbmNlIGlzIHVzZWQgZm9yIHZhbHVlcyBsZXNzXHJcbiAqIHRoYW4gb3IgZXF1YWwgdG8gMS4wLCBhbmQgYSByZWxhdGl2ZSB0b2xlcmFuY2UgaXMgdXNlZCBmb3IgbGFyZ2VyIHZhbHVlcylcclxuICpcclxuICogQHBhcmFtIHtOdW1iZXJ9IGEgVGhlIGZpcnN0IG51bWJlciB0byB0ZXN0LlxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBUaGUgc2Vjb25kIG51bWJlciB0byB0ZXN0LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbnVtYmVycyBhcmUgYXBwcm94aW1hdGVseSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIHJldHVybiBNYXRoLmFicyhhIC0gYikgPD0gRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYSksIE1hdGguYWJzKGIpKTtcbn1cbmlmICghTWF0aC5oeXBvdCkgTWF0aC5oeXBvdCA9IGZ1bmN0aW9uICgpIHtcbiAgdmFyIHkgPSAwLFxuICAgICAgaSA9IGFyZ3VtZW50cy5sZW5ndGg7XG5cbiAgd2hpbGUgKGktLSkge1xuICAgIHkgKz0gYXJndW1lbnRzW2ldICogYXJndW1lbnRzW2ldO1xuICB9XG5cbiAgcmV0dXJuIE1hdGguc3FydCh5KTtcbn07IiwiaW1wb3J0ICogYXMgZ2xNYXRyaXggZnJvbSBcIi4vY29tbW9uLmpzXCI7XG4vKipcclxuICogNHg0IE1hdHJpeDxicj5Gb3JtYXQ6IGNvbHVtbi1tYWpvciwgd2hlbiB0eXBlZCBvdXQgaXQgbG9va3MgbGlrZSByb3ctbWFqb3I8YnI+VGhlIG1hdHJpY2VzIGFyZSBiZWluZyBwb3N0IG11bHRpcGxpZWQuXHJcbiAqIEBtb2R1bGUgbWF0NFxyXG4gKi9cblxuLyoqXHJcbiAqIENyZWF0ZXMgYSBuZXcgaWRlbnRpdHkgbWF0NFxyXG4gKlxyXG4gKiBAcmV0dXJucyB7bWF0NH0gYSBuZXcgNHg0IG1hdHJpeFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNyZWF0ZSgpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDE2KTtcblxuICBpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcbiAgICBvdXRbMV0gPSAwO1xuICAgIG91dFsyXSA9IDA7XG4gICAgb3V0WzNdID0gMDtcbiAgICBvdXRbNF0gPSAwO1xuICAgIG91dFs2XSA9IDA7XG4gICAgb3V0WzddID0gMDtcbiAgICBvdXRbOF0gPSAwO1xuICAgIG91dFs5XSA9IDA7XG4gICAgb3V0WzExXSA9IDA7XG4gICAgb3V0WzEyXSA9IDA7XG4gICAgb3V0WzEzXSA9IDA7XG4gICAgb3V0WzE0XSA9IDA7XG4gIH1cblxuICBvdXRbMF0gPSAxO1xuICBvdXRbNV0gPSAxO1xuICBvdXRbMTBdID0gMTtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyBtYXQ0IGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gY2xvbmVcclxuICogQHJldHVybnMge21hdDR9IGEgbmV3IDR4NCBtYXRyaXhcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjbG9uZShhKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgxNik7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIG91dFs0XSA9IGFbNF07XG4gIG91dFs1XSA9IGFbNV07XG4gIG91dFs2XSA9IGFbNl07XG4gIG91dFs3XSA9IGFbN107XG4gIG91dFs4XSA9IGFbOF07XG4gIG91dFs5XSA9IGFbOV07XG4gIG91dFsxMF0gPSBhWzEwXTtcbiAgb3V0WzExXSA9IGFbMTFdO1xuICBvdXRbMTJdID0gYVsxMl07XG4gIG91dFsxM10gPSBhWzEzXTtcbiAgb3V0WzE0XSA9IGFbMTRdO1xuICBvdXRbMTVdID0gYVsxNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ29weSB0aGUgdmFsdWVzIGZyb20gb25lIG1hdDQgdG8gYW5vdGhlclxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNvcHkob3V0LCBhKSB7XG4gIG91dFswXSA9IGFbMF07XG4gIG91dFsxXSA9IGFbMV07XG4gIG91dFsyXSA9IGFbMl07XG4gIG91dFszXSA9IGFbM107XG4gIG91dFs0XSA9IGFbNF07XG4gIG91dFs1XSA9IGFbNV07XG4gIG91dFs2XSA9IGFbNl07XG4gIG91dFs3XSA9IGFbN107XG4gIG91dFs4XSA9IGFbOF07XG4gIG91dFs5XSA9IGFbOV07XG4gIG91dFsxMF0gPSBhWzEwXTtcbiAgb3V0WzExXSA9IGFbMTFdO1xuICBvdXRbMTJdID0gYVsxMl07XG4gIG91dFsxM10gPSBhWzEzXTtcbiAgb3V0WzE0XSA9IGFbMTRdO1xuICBvdXRbMTVdID0gYVsxNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlIGEgbmV3IG1hdDQgd2l0aCB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDMgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMyBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAzIHBvc2l0aW9uIChpbmRleCA3KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggOSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMCBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAxMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMSBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMyBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxNSlcclxuICogQHJldHVybnMge21hdDR9IEEgbmV3IG1hdDRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tVmFsdWVzKG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICB2YXIgb3V0ID0gbmV3IGdsTWF0cml4LkFSUkFZX1RZUEUoMTYpO1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMDM7XG4gIG91dFs0XSA9IG0xMDtcbiAgb3V0WzVdID0gbTExO1xuICBvdXRbNl0gPSBtMTI7XG4gIG91dFs3XSA9IG0xMztcbiAgb3V0WzhdID0gbTIwO1xuICBvdXRbOV0gPSBtMjE7XG4gIG91dFsxMF0gPSBtMjI7XG4gIG91dFsxMV0gPSBtMjM7XG4gIG91dFsxMl0gPSBtMzA7XG4gIG91dFsxM10gPSBtMzE7XG4gIG91dFsxNF0gPSBtMzI7XG4gIG91dFsxNV0gPSBtMzM7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU2V0IHRoZSBjb21wb25lbnRzIG9mIGEgbWF0NCB0byB0aGUgZ2l2ZW4gdmFsdWVzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDAgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMCBwb3NpdGlvbiAoaW5kZXggMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0wMSBDb21wb25lbnQgaW4gY29sdW1uIDAsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxKVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTAyIENvbXBvbmVudCBpbiBjb2x1bW4gMCwgcm93IDIgcG9zaXRpb24gKGluZGV4IDIpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMDMgQ29tcG9uZW50IGluIGNvbHVtbiAwLCByb3cgMyBwb3NpdGlvbiAoaW5kZXggMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMCBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAwIHBvc2l0aW9uIChpbmRleCA0KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTExIENvbXBvbmVudCBpbiBjb2x1bW4gMSwgcm93IDEgcG9zaXRpb24gKGluZGV4IDUpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMTIgQ29tcG9uZW50IGluIGNvbHVtbiAxLCByb3cgMiBwb3NpdGlvbiAoaW5kZXggNilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0xMyBDb21wb25lbnQgaW4gY29sdW1uIDEsIHJvdyAzIHBvc2l0aW9uIChpbmRleCA3KVxyXG4gKiBAcGFyYW0ge051bWJlcn0gbTIwIENvbXBvbmVudCBpbiBjb2x1bW4gMiwgcm93IDAgcG9zaXRpb24gKGluZGV4IDgpXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBtMjEgQ29tcG9uZW50IGluIGNvbHVtbiAyLCByb3cgMSBwb3NpdGlvbiAoaW5kZXggOSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMiBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxMClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0yMyBDb21wb25lbnQgaW4gY29sdW1uIDIsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxMSlcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMCBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAwIHBvc2l0aW9uIChpbmRleCAxMilcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMSBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAxIHBvc2l0aW9uIChpbmRleCAxMylcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMiBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAyIHBvc2l0aW9uIChpbmRleCAxNClcclxuICogQHBhcmFtIHtOdW1iZXJ9IG0zMyBDb21wb25lbnQgaW4gY29sdW1uIDMsIHJvdyAzIHBvc2l0aW9uIChpbmRleCAxNSlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIG0wMCwgbTAxLCBtMDIsIG0wMywgbTEwLCBtMTEsIG0xMiwgbTEzLCBtMjAsIG0yMSwgbTIyLCBtMjMsIG0zMCwgbTMxLCBtMzIsIG0zMykge1xuICBvdXRbMF0gPSBtMDA7XG4gIG91dFsxXSA9IG0wMTtcbiAgb3V0WzJdID0gbTAyO1xuICBvdXRbM10gPSBtMDM7XG4gIG91dFs0XSA9IG0xMDtcbiAgb3V0WzVdID0gbTExO1xuICBvdXRbNl0gPSBtMTI7XG4gIG91dFs3XSA9IG0xMztcbiAgb3V0WzhdID0gbTIwO1xuICBvdXRbOV0gPSBtMjE7XG4gIG91dFsxMF0gPSBtMjI7XG4gIG91dFsxMV0gPSBtMjM7XG4gIG91dFsxMl0gPSBtMzA7XG4gIG91dFsxM10gPSBtMzE7XG4gIG91dFsxNF0gPSBtMzI7XG4gIG91dFsxNV0gPSBtMzM7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU2V0IGEgbWF0NCB0byB0aGUgaWRlbnRpdHkgbWF0cml4XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpZGVudGl0eShvdXQpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gMTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IDE7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBUcmFuc3Bvc2UgdGhlIHZhbHVlcyBvZiBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc3Bvc2Uob3V0LCBhKSB7XG4gIC8vIElmIHdlIGFyZSB0cmFuc3Bvc2luZyBvdXJzZWx2ZXMgd2UgY2FuIHNraXAgYSBmZXcgc3RlcHMgYnV0IGhhdmUgdG8gY2FjaGUgc29tZSB2YWx1ZXNcbiAgaWYgKG91dCA9PT0gYSkge1xuICAgIHZhciBhMDEgPSBhWzFdLFxuICAgICAgICBhMDIgPSBhWzJdLFxuICAgICAgICBhMDMgPSBhWzNdO1xuICAgIHZhciBhMTIgPSBhWzZdLFxuICAgICAgICBhMTMgPSBhWzddO1xuICAgIHZhciBhMjMgPSBhWzExXTtcbiAgICBvdXRbMV0gPSBhWzRdO1xuICAgIG91dFsyXSA9IGFbOF07XG4gICAgb3V0WzNdID0gYVsxMl07XG4gICAgb3V0WzRdID0gYTAxO1xuICAgIG91dFs2XSA9IGFbOV07XG4gICAgb3V0WzddID0gYVsxM107XG4gICAgb3V0WzhdID0gYTAyO1xuICAgIG91dFs5XSA9IGExMjtcbiAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgb3V0WzEyXSA9IGEwMztcbiAgICBvdXRbMTNdID0gYTEzO1xuICAgIG91dFsxNF0gPSBhMjM7XG4gIH0gZWxzZSB7XG4gICAgb3V0WzBdID0gYVswXTtcbiAgICBvdXRbMV0gPSBhWzRdO1xuICAgIG91dFsyXSA9IGFbOF07XG4gICAgb3V0WzNdID0gYVsxMl07XG4gICAgb3V0WzRdID0gYVsxXTtcbiAgICBvdXRbNV0gPSBhWzVdO1xuICAgIG91dFs2XSA9IGFbOV07XG4gICAgb3V0WzddID0gYVsxM107XG4gICAgb3V0WzhdID0gYVsyXTtcbiAgICBvdXRbOV0gPSBhWzZdO1xuICAgIG91dFsxMF0gPSBhWzEwXTtcbiAgICBvdXRbMTFdID0gYVsxNF07XG4gICAgb3V0WzEyXSA9IGFbM107XG4gICAgb3V0WzEzXSA9IGFbN107XG4gICAgb3V0WzE0XSA9IGFbMTFdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogSW52ZXJ0cyBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBpbnZlcnQob3V0LCBhKSB7XG4gIHZhciBhMDAgPSBhWzBdLFxuICAgICAgYTAxID0gYVsxXSxcbiAgICAgIGEwMiA9IGFbMl0sXG4gICAgICBhMDMgPSBhWzNdO1xuICB2YXIgYTEwID0gYVs0XSxcbiAgICAgIGExMSA9IGFbNV0sXG4gICAgICBhMTIgPSBhWzZdLFxuICAgICAgYTEzID0gYVs3XTtcbiAgdmFyIGEyMCA9IGFbOF0sXG4gICAgICBhMjEgPSBhWzldLFxuICAgICAgYTIyID0gYVsxMF0sXG4gICAgICBhMjMgPSBhWzExXTtcbiAgdmFyIGEzMCA9IGFbMTJdLFxuICAgICAgYTMxID0gYVsxM10sXG4gICAgICBhMzIgPSBhWzE0XSxcbiAgICAgIGEzMyA9IGFbMTVdO1xuICB2YXIgYjAwID0gYTAwICogYTExIC0gYTAxICogYTEwO1xuICB2YXIgYjAxID0gYTAwICogYTEyIC0gYTAyICogYTEwO1xuICB2YXIgYjAyID0gYTAwICogYTEzIC0gYTAzICogYTEwO1xuICB2YXIgYjAzID0gYTAxICogYTEyIC0gYTAyICogYTExO1xuICB2YXIgYjA0ID0gYTAxICogYTEzIC0gYTAzICogYTExO1xuICB2YXIgYjA1ID0gYTAyICogYTEzIC0gYTAzICogYTEyO1xuICB2YXIgYjA2ID0gYTIwICogYTMxIC0gYTIxICogYTMwO1xuICB2YXIgYjA3ID0gYTIwICogYTMyIC0gYTIyICogYTMwO1xuICB2YXIgYjA4ID0gYTIwICogYTMzIC0gYTIzICogYTMwO1xuICB2YXIgYjA5ID0gYTIxICogYTMyIC0gYTIyICogYTMxO1xuICB2YXIgYjEwID0gYTIxICogYTMzIC0gYTIzICogYTMxO1xuICB2YXIgYjExID0gYTIyICogYTMzIC0gYTIzICogYTMyOyAvLyBDYWxjdWxhdGUgdGhlIGRldGVybWluYW50XG5cbiAgdmFyIGRldCA9IGIwMCAqIGIxMSAtIGIwMSAqIGIxMCArIGIwMiAqIGIwOSArIGIwMyAqIGIwOCAtIGIwNCAqIGIwNyArIGIwNSAqIGIwNjtcblxuICBpZiAoIWRldCkge1xuICAgIHJldHVybiBudWxsO1xuICB9XG5cbiAgZGV0ID0gMS4wIC8gZGV0O1xuICBvdXRbMF0gPSAoYTExICogYjExIC0gYTEyICogYjEwICsgYTEzICogYjA5KSAqIGRldDtcbiAgb3V0WzFdID0gKGEwMiAqIGIxMCAtIGEwMSAqIGIxMSAtIGEwMyAqIGIwOSkgKiBkZXQ7XG4gIG91dFsyXSA9IChhMzEgKiBiMDUgLSBhMzIgKiBiMDQgKyBhMzMgKiBiMDMpICogZGV0O1xuICBvdXRbM10gPSAoYTIyICogYjA0IC0gYTIxICogYjA1IC0gYTIzICogYjAzKSAqIGRldDtcbiAgb3V0WzRdID0gKGExMiAqIGIwOCAtIGExMCAqIGIxMSAtIGExMyAqIGIwNykgKiBkZXQ7XG4gIG91dFs1XSA9IChhMDAgKiBiMTEgLSBhMDIgKiBiMDggKyBhMDMgKiBiMDcpICogZGV0O1xuICBvdXRbNl0gPSAoYTMyICogYjAyIC0gYTMwICogYjA1IC0gYTMzICogYjAxKSAqIGRldDtcbiAgb3V0WzddID0gKGEyMCAqIGIwNSAtIGEyMiAqIGIwMiArIGEyMyAqIGIwMSkgKiBkZXQ7XG4gIG91dFs4XSA9IChhMTAgKiBiMTAgLSBhMTEgKiBiMDggKyBhMTMgKiBiMDYpICogZGV0O1xuICBvdXRbOV0gPSAoYTAxICogYjA4IC0gYTAwICogYjEwIC0gYTAzICogYjA2KSAqIGRldDtcbiAgb3V0WzEwXSA9IChhMzAgKiBiMDQgLSBhMzEgKiBiMDIgKyBhMzMgKiBiMDApICogZGV0O1xuICBvdXRbMTFdID0gKGEyMSAqIGIwMiAtIGEyMCAqIGIwNCAtIGEyMyAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxMl0gPSAoYTExICogYjA3IC0gYTEwICogYjA5IC0gYTEyICogYjA2KSAqIGRldDtcbiAgb3V0WzEzXSA9IChhMDAgKiBiMDkgLSBhMDEgKiBiMDcgKyBhMDIgKiBiMDYpICogZGV0O1xuICBvdXRbMTRdID0gKGEzMSAqIGIwMSAtIGEzMCAqIGIwMyAtIGEzMiAqIGIwMCkgKiBkZXQ7XG4gIG91dFsxNV0gPSAoYTIwICogYjAzIC0gYTIxICogYjAxICsgYTIyICogYjAwKSAqIGRldDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBhZGp1Z2F0ZSBvZiBhIG1hdDRcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBzb3VyY2UgbWF0cml4XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBhZGpvaW50KG91dCwgYSkge1xuICB2YXIgYTAwID0gYVswXSxcbiAgICAgIGEwMSA9IGFbMV0sXG4gICAgICBhMDIgPSBhWzJdLFxuICAgICAgYTAzID0gYVszXTtcbiAgdmFyIGExMCA9IGFbNF0sXG4gICAgICBhMTEgPSBhWzVdLFxuICAgICAgYTEyID0gYVs2XSxcbiAgICAgIGExMyA9IGFbN107XG4gIHZhciBhMjAgPSBhWzhdLFxuICAgICAgYTIxID0gYVs5XSxcbiAgICAgIGEyMiA9IGFbMTBdLFxuICAgICAgYTIzID0gYVsxMV07XG4gIHZhciBhMzAgPSBhWzEyXSxcbiAgICAgIGEzMSA9IGFbMTNdLFxuICAgICAgYTMyID0gYVsxNF0sXG4gICAgICBhMzMgPSBhWzE1XTtcbiAgb3V0WzBdID0gYTExICogKGEyMiAqIGEzMyAtIGEyMyAqIGEzMikgLSBhMjEgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSArIGEzMSAqIChhMTIgKiBhMjMgLSBhMTMgKiBhMjIpO1xuICBvdXRbMV0gPSAtKGEwMSAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIxICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKSk7XG4gIG91dFsyXSA9IGEwMSAqIChhMTIgKiBhMzMgLSBhMTMgKiBhMzIpIC0gYTExICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzEgKiAoYTAyICogYTEzIC0gYTAzICogYTEyKTtcbiAgb3V0WzNdID0gLShhMDEgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtIGExMSAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICsgYTIxICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICBvdXRbNF0gPSAtKGExMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGExMiAqIGEzMyAtIGExMyAqIGEzMikgKyBhMzAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSk7XG4gIG91dFs1XSA9IGEwMCAqIChhMjIgKiBhMzMgLSBhMjMgKiBhMzIpIC0gYTIwICogKGEwMiAqIGEzMyAtIGEwMyAqIGEzMikgKyBhMzAgKiAoYTAyICogYTIzIC0gYTAzICogYTIyKTtcbiAgb3V0WzZdID0gLShhMDAgKiAoYTEyICogYTMzIC0gYTEzICogYTMyKSAtIGExMCAqIChhMDIgKiBhMzMgLSBhMDMgKiBhMzIpICsgYTMwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMikpO1xuICBvdXRbN10gPSBhMDAgKiAoYTEyICogYTIzIC0gYTEzICogYTIyKSAtIGExMCAqIChhMDIgKiBhMjMgLSBhMDMgKiBhMjIpICsgYTIwICogKGEwMiAqIGExMyAtIGEwMyAqIGExMik7XG4gIG91dFs4XSA9IGExMCAqIChhMjEgKiBhMzMgLSBhMjMgKiBhMzEpIC0gYTIwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgKyBhMzAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKTtcbiAgb3V0WzldID0gLShhMDAgKiAoYTIxICogYTMzIC0gYTIzICogYTMxKSAtIGEyMCAqIChhMDEgKiBhMzMgLSBhMDMgKiBhMzEpICsgYTMwICogKGEwMSAqIGEyMyAtIGEwMyAqIGEyMSkpO1xuICBvdXRbMTBdID0gYTAwICogKGExMSAqIGEzMyAtIGExMyAqIGEzMSkgLSBhMTAgKiAoYTAxICogYTMzIC0gYTAzICogYTMxKSArIGEzMCAqIChhMDEgKiBhMTMgLSBhMDMgKiBhMTEpO1xuICBvdXRbMTFdID0gLShhMDAgKiAoYTExICogYTIzIC0gYTEzICogYTIxKSAtIGExMCAqIChhMDEgKiBhMjMgLSBhMDMgKiBhMjEpICsgYTIwICogKGEwMSAqIGExMyAtIGEwMyAqIGExMSkpO1xuICBvdXRbMTJdID0gLShhMTAgKiAoYTIxICogYTMyIC0gYTIyICogYTMxKSAtIGEyMCAqIChhMTEgKiBhMzIgLSBhMTIgKiBhMzEpICsgYTMwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkpO1xuICBvdXRbMTNdID0gYTAwICogKGEyMSAqIGEzMiAtIGEyMiAqIGEzMSkgLSBhMjAgKiAoYTAxICogYTMyIC0gYTAyICogYTMxKSArIGEzMCAqIChhMDEgKiBhMjIgLSBhMDIgKiBhMjEpO1xuICBvdXRbMTRdID0gLShhMDAgKiAoYTExICogYTMyIC0gYTEyICogYTMxKSAtIGExMCAqIChhMDEgKiBhMzIgLSBhMDIgKiBhMzEpICsgYTMwICogKGEwMSAqIGExMiAtIGEwMiAqIGExMSkpO1xuICBvdXRbMTVdID0gYTAwICogKGExMSAqIGEyMiAtIGExMiAqIGEyMSkgLSBhMTAgKiAoYTAxICogYTIyIC0gYTAyICogYTIxKSArIGEyMCAqIChhMDEgKiBhMTIgLSBhMDIgKiBhMTEpO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGRldGVybWluYW50IG9mIGEgbWF0NFxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIHNvdXJjZSBtYXRyaXhcclxuICogQHJldHVybnMge051bWJlcn0gZGV0ZXJtaW5hbnQgb2YgYVxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRldGVybWluYW50KGEpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXSxcbiAgICAgIGEwMyA9IGFbM107XG4gIHZhciBhMTAgPSBhWzRdLFxuICAgICAgYTExID0gYVs1XSxcbiAgICAgIGExMiA9IGFbNl0sXG4gICAgICBhMTMgPSBhWzddO1xuICB2YXIgYTIwID0gYVs4XSxcbiAgICAgIGEyMSA9IGFbOV0sXG4gICAgICBhMjIgPSBhWzEwXSxcbiAgICAgIGEyMyA9IGFbMTFdO1xuICB2YXIgYTMwID0gYVsxMl0sXG4gICAgICBhMzEgPSBhWzEzXSxcbiAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgYTMzID0gYVsxNV07XG4gIHZhciBiMDAgPSBhMDAgKiBhMTEgLSBhMDEgKiBhMTA7XG4gIHZhciBiMDEgPSBhMDAgKiBhMTIgLSBhMDIgKiBhMTA7XG4gIHZhciBiMDIgPSBhMDAgKiBhMTMgLSBhMDMgKiBhMTA7XG4gIHZhciBiMDMgPSBhMDEgKiBhMTIgLSBhMDIgKiBhMTE7XG4gIHZhciBiMDQgPSBhMDEgKiBhMTMgLSBhMDMgKiBhMTE7XG4gIHZhciBiMDUgPSBhMDIgKiBhMTMgLSBhMDMgKiBhMTI7XG4gIHZhciBiMDYgPSBhMjAgKiBhMzEgLSBhMjEgKiBhMzA7XG4gIHZhciBiMDcgPSBhMjAgKiBhMzIgLSBhMjIgKiBhMzA7XG4gIHZhciBiMDggPSBhMjAgKiBhMzMgLSBhMjMgKiBhMzA7XG4gIHZhciBiMDkgPSBhMjEgKiBhMzIgLSBhMjIgKiBhMzE7XG4gIHZhciBiMTAgPSBhMjEgKiBhMzMgLSBhMjMgKiBhMzE7XG4gIHZhciBiMTEgPSBhMjIgKiBhMzMgLSBhMjMgKiBhMzI7IC8vIENhbGN1bGF0ZSB0aGUgZGV0ZXJtaW5hbnRcblxuICByZXR1cm4gYjAwICogYjExIC0gYjAxICogYjEwICsgYjAyICogYjA5ICsgYjAzICogYjA4IC0gYjA0ICogYjA3ICsgYjA1ICogYjA2O1xufVxuLyoqXHJcbiAqIE11bHRpcGxpZXMgdHdvIG1hdDRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge21hdDR9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgdmFyIGEwMCA9IGFbMF0sXG4gICAgICBhMDEgPSBhWzFdLFxuICAgICAgYTAyID0gYVsyXSxcbiAgICAgIGEwMyA9IGFbM107XG4gIHZhciBhMTAgPSBhWzRdLFxuICAgICAgYTExID0gYVs1XSxcbiAgICAgIGExMiA9IGFbNl0sXG4gICAgICBhMTMgPSBhWzddO1xuICB2YXIgYTIwID0gYVs4XSxcbiAgICAgIGEyMSA9IGFbOV0sXG4gICAgICBhMjIgPSBhWzEwXSxcbiAgICAgIGEyMyA9IGFbMTFdO1xuICB2YXIgYTMwID0gYVsxMl0sXG4gICAgICBhMzEgPSBhWzEzXSxcbiAgICAgIGEzMiA9IGFbMTRdLFxuICAgICAgYTMzID0gYVsxNV07IC8vIENhY2hlIG9ubHkgdGhlIGN1cnJlbnQgbGluZSBvZiB0aGUgc2Vjb25kIG1hdHJpeFxuXG4gIHZhciBiMCA9IGJbMF0sXG4gICAgICBiMSA9IGJbMV0sXG4gICAgICBiMiA9IGJbMl0sXG4gICAgICBiMyA9IGJbM107XG4gIG91dFswXSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICBvdXRbMV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgb3V0WzJdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gIG91dFszXSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuICBiMCA9IGJbNF07XG4gIGIxID0gYls1XTtcbiAgYjIgPSBiWzZdO1xuICBiMyA9IGJbN107XG4gIG91dFs0XSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICBvdXRbNV0gPSBiMCAqIGEwMSArIGIxICogYTExICsgYjIgKiBhMjEgKyBiMyAqIGEzMTtcbiAgb3V0WzZdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gIG91dFs3XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuICBiMCA9IGJbOF07XG4gIGIxID0gYls5XTtcbiAgYjIgPSBiWzEwXTtcbiAgYjMgPSBiWzExXTtcbiAgb3V0WzhdID0gYjAgKiBhMDAgKyBiMSAqIGExMCArIGIyICogYTIwICsgYjMgKiBhMzA7XG4gIG91dFs5XSA9IGIwICogYTAxICsgYjEgKiBhMTEgKyBiMiAqIGEyMSArIGIzICogYTMxO1xuICBvdXRbMTBdID0gYjAgKiBhMDIgKyBiMSAqIGExMiArIGIyICogYTIyICsgYjMgKiBhMzI7XG4gIG91dFsxMV0gPSBiMCAqIGEwMyArIGIxICogYTEzICsgYjIgKiBhMjMgKyBiMyAqIGEzMztcbiAgYjAgPSBiWzEyXTtcbiAgYjEgPSBiWzEzXTtcbiAgYjIgPSBiWzE0XTtcbiAgYjMgPSBiWzE1XTtcbiAgb3V0WzEyXSA9IGIwICogYTAwICsgYjEgKiBhMTAgKyBiMiAqIGEyMCArIGIzICogYTMwO1xuICBvdXRbMTNdID0gYjAgKiBhMDEgKyBiMSAqIGExMSArIGIyICogYTIxICsgYjMgKiBhMzE7XG4gIG91dFsxNF0gPSBiMCAqIGEwMiArIGIxICogYTEyICsgYjIgKiBhMjIgKyBiMyAqIGEzMjtcbiAgb3V0WzE1XSA9IGIwICogYTAzICsgYjEgKiBhMTMgKyBiMiAqIGEyMyArIGIzICogYTMzO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFRyYW5zbGF0ZSBhIG1hdDQgYnkgdGhlIGdpdmVuIHZlY3RvclxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byB0cmFuc2xhdGVcclxuICogQHBhcmFtIHt2ZWMzfSB2IHZlY3RvciB0byB0cmFuc2xhdGUgYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRyYW5zbGF0ZShvdXQsIGEsIHYpIHtcbiAgdmFyIHggPSB2WzBdLFxuICAgICAgeSA9IHZbMV0sXG4gICAgICB6ID0gdlsyXTtcbiAgdmFyIGEwMCwgYTAxLCBhMDIsIGEwMztcbiAgdmFyIGExMCwgYTExLCBhMTIsIGExMztcbiAgdmFyIGEyMCwgYTIxLCBhMjIsIGEyMztcblxuICBpZiAoYSA9PT0gb3V0KSB7XG4gICAgb3V0WzEyXSA9IGFbMF0gKiB4ICsgYVs0XSAqIHkgKyBhWzhdICogeiArIGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzFdICogeCArIGFbNV0gKiB5ICsgYVs5XSAqIHogKyBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsyXSAqIHggKyBhWzZdICogeSArIGFbMTBdICogeiArIGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzNdICogeCArIGFbN10gKiB5ICsgYVsxMV0gKiB6ICsgYVsxNV07XG4gIH0gZWxzZSB7XG4gICAgYTAwID0gYVswXTtcbiAgICBhMDEgPSBhWzFdO1xuICAgIGEwMiA9IGFbMl07XG4gICAgYTAzID0gYVszXTtcbiAgICBhMTAgPSBhWzRdO1xuICAgIGExMSA9IGFbNV07XG4gICAgYTEyID0gYVs2XTtcbiAgICBhMTMgPSBhWzddO1xuICAgIGEyMCA9IGFbOF07XG4gICAgYTIxID0gYVs5XTtcbiAgICBhMjIgPSBhWzEwXTtcbiAgICBhMjMgPSBhWzExXTtcbiAgICBvdXRbMF0gPSBhMDA7XG4gICAgb3V0WzFdID0gYTAxO1xuICAgIG91dFsyXSA9IGEwMjtcbiAgICBvdXRbM10gPSBhMDM7XG4gICAgb3V0WzRdID0gYTEwO1xuICAgIG91dFs1XSA9IGExMTtcbiAgICBvdXRbNl0gPSBhMTI7XG4gICAgb3V0WzddID0gYTEzO1xuICAgIG91dFs4XSA9IGEyMDtcbiAgICBvdXRbOV0gPSBhMjE7XG4gICAgb3V0WzEwXSA9IGEyMjtcbiAgICBvdXRbMTFdID0gYTIzO1xuICAgIG91dFsxMl0gPSBhMDAgKiB4ICsgYTEwICogeSArIGEyMCAqIHogKyBhWzEyXTtcbiAgICBvdXRbMTNdID0gYTAxICogeCArIGExMSAqIHkgKyBhMjEgKiB6ICsgYVsxM107XG4gICAgb3V0WzE0XSA9IGEwMiAqIHggKyBhMTIgKiB5ICsgYTIyICogeiArIGFbMTRdO1xuICAgIG91dFsxNV0gPSBhMDMgKiB4ICsgYTEzICogeSArIGEyMyAqIHogKyBhWzE1XTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU2NhbGVzIHRoZSBtYXQ0IGJ5IHRoZSBkaW1lbnNpb25zIGluIHRoZSBnaXZlbiB2ZWMzIG5vdCB1c2luZyB2ZWN0b3JpemF0aW9uXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHNjYWxlXHJcbiAqIEBwYXJhbSB7dmVjM30gdiB0aGUgdmVjMyB0byBzY2FsZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICoqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCB2KSB7XG4gIHZhciB4ID0gdlswXSxcbiAgICAgIHkgPSB2WzFdLFxuICAgICAgeiA9IHZbMl07XG4gIG91dFswXSA9IGFbMF0gKiB4O1xuICBvdXRbMV0gPSBhWzFdICogeDtcbiAgb3V0WzJdID0gYVsyXSAqIHg7XG4gIG91dFszXSA9IGFbM10gKiB4O1xuICBvdXRbNF0gPSBhWzRdICogeTtcbiAgb3V0WzVdID0gYVs1XSAqIHk7XG4gIG91dFs2XSA9IGFbNl0gKiB5O1xuICBvdXRbN10gPSBhWzddICogeTtcbiAgb3V0WzhdID0gYVs4XSAqIHo7XG4gIG91dFs5XSA9IGFbOV0gKiB6O1xuICBvdXRbMTBdID0gYVsxMF0gKiB6O1xuICBvdXRbMTFdID0gYVsxMV0gKiB6O1xuICBvdXRbMTJdID0gYVsxMl07XG4gIG91dFsxM10gPSBhWzEzXTtcbiAgb3V0WzE0XSA9IGFbMTRdO1xuICBvdXRbMTVdID0gYVsxNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlcyBhIG1hdDQgYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgZ2l2ZW4gYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZShvdXQsIGEsIHJhZCwgYXhpcykge1xuICB2YXIgeCA9IGF4aXNbMF0sXG4gICAgICB5ID0gYXhpc1sxXSxcbiAgICAgIHogPSBheGlzWzJdO1xuICB2YXIgbGVuID0gTWF0aC5oeXBvdCh4LCB5LCB6KTtcbiAgdmFyIHMsIGMsIHQ7XG4gIHZhciBhMDAsIGEwMSwgYTAyLCBhMDM7XG4gIHZhciBhMTAsIGExMSwgYTEyLCBhMTM7XG4gIHZhciBhMjAsIGEyMSwgYTIyLCBhMjM7XG4gIHZhciBiMDAsIGIwMSwgYjAyO1xuICB2YXIgYjEwLCBiMTEsIGIxMjtcbiAgdmFyIGIyMCwgYjIxLCBiMjI7XG5cbiAgaWYgKGxlbiA8IGdsTWF0cml4LkVQU0lMT04pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxlbiA9IDEgLyBsZW47XG4gIHggKj0gbGVuO1xuICB5ICo9IGxlbjtcbiAgeiAqPSBsZW47XG4gIHMgPSBNYXRoLnNpbihyYWQpO1xuICBjID0gTWF0aC5jb3MocmFkKTtcbiAgdCA9IDEgLSBjO1xuICBhMDAgPSBhWzBdO1xuICBhMDEgPSBhWzFdO1xuICBhMDIgPSBhWzJdO1xuICBhMDMgPSBhWzNdO1xuICBhMTAgPSBhWzRdO1xuICBhMTEgPSBhWzVdO1xuICBhMTIgPSBhWzZdO1xuICBhMTMgPSBhWzddO1xuICBhMjAgPSBhWzhdO1xuICBhMjEgPSBhWzldO1xuICBhMjIgPSBhWzEwXTtcbiAgYTIzID0gYVsxMV07IC8vIENvbnN0cnVjdCB0aGUgZWxlbWVudHMgb2YgdGhlIHJvdGF0aW9uIG1hdHJpeFxuXG4gIGIwMCA9IHggKiB4ICogdCArIGM7XG4gIGIwMSA9IHkgKiB4ICogdCArIHogKiBzO1xuICBiMDIgPSB6ICogeCAqIHQgLSB5ICogcztcbiAgYjEwID0geCAqIHkgKiB0IC0geiAqIHM7XG4gIGIxMSA9IHkgKiB5ICogdCArIGM7XG4gIGIxMiA9IHogKiB5ICogdCArIHggKiBzO1xuICBiMjAgPSB4ICogeiAqIHQgKyB5ICogcztcbiAgYjIxID0geSAqIHogKiB0IC0geCAqIHM7XG4gIGIyMiA9IHogKiB6ICogdCArIGM7IC8vIFBlcmZvcm0gcm90YXRpb24tc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG5cbiAgb3V0WzBdID0gYTAwICogYjAwICsgYTEwICogYjAxICsgYTIwICogYjAyO1xuICBvdXRbMV0gPSBhMDEgKiBiMDAgKyBhMTEgKiBiMDEgKyBhMjEgKiBiMDI7XG4gIG91dFsyXSA9IGEwMiAqIGIwMCArIGExMiAqIGIwMSArIGEyMiAqIGIwMjtcbiAgb3V0WzNdID0gYTAzICogYjAwICsgYTEzICogYjAxICsgYTIzICogYjAyO1xuICBvdXRbNF0gPSBhMDAgKiBiMTAgKyBhMTAgKiBiMTEgKyBhMjAgKiBiMTI7XG4gIG91dFs1XSA9IGEwMSAqIGIxMCArIGExMSAqIGIxMSArIGEyMSAqIGIxMjtcbiAgb3V0WzZdID0gYTAyICogYjEwICsgYTEyICogYjExICsgYTIyICogYjEyO1xuICBvdXRbN10gPSBhMDMgKiBiMTAgKyBhMTMgKiBiMTEgKyBhMjMgKiBiMTI7XG4gIG91dFs4XSA9IGEwMCAqIGIyMCArIGExMCAqIGIyMSArIGEyMCAqIGIyMjtcbiAgb3V0WzldID0gYTAxICogYjIwICsgYTExICogYjIxICsgYTIxICogYjIyO1xuICBvdXRbMTBdID0gYTAyICogYjIwICsgYTEyICogYjIxICsgYTIyICogYjIyO1xuICBvdXRbMTFdID0gYTAzICogYjIwICsgYTEzICogYjIxICsgYTIzICogYjIyO1xuXG4gIGlmIChhICE9PSBvdXQpIHtcbiAgICAvLyBJZiB0aGUgc291cmNlIGFuZCBkZXN0aW5hdGlvbiBkaWZmZXIsIGNvcHkgdGhlIHVuY2hhbmdlZCBsYXN0IHJvd1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlcyBhIG1hdHJpeCBieSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBYIGF4aXNcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3RhdGVYKG91dCwgYSwgcmFkKSB7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgdmFyIGMgPSBNYXRoLmNvcyhyYWQpO1xuICB2YXIgYTEwID0gYVs0XTtcbiAgdmFyIGExMSA9IGFbNV07XG4gIHZhciBhMTIgPSBhWzZdO1xuICB2YXIgYTEzID0gYVs3XTtcbiAgdmFyIGEyMCA9IGFbOF07XG4gIHZhciBhMjEgPSBhWzldO1xuICB2YXIgYTIyID0gYVsxMF07XG4gIHZhciBhMjMgPSBhWzExXTtcblxuICBpZiAoYSAhPT0gb3V0KSB7XG4gICAgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgcm93c1xuICAgIG91dFswXSA9IGFbMF07XG4gICAgb3V0WzFdID0gYVsxXTtcbiAgICBvdXRbMl0gPSBhWzJdO1xuICAgIG91dFszXSA9IGFbM107XG4gICAgb3V0WzEyXSA9IGFbMTJdO1xuICAgIG91dFsxM10gPSBhWzEzXTtcbiAgICBvdXRbMTRdID0gYVsxNF07XG4gICAgb3V0WzE1XSA9IGFbMTVdO1xuICB9IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cblxuXG4gIG91dFs0XSA9IGExMCAqIGMgKyBhMjAgKiBzO1xuICBvdXRbNV0gPSBhMTEgKiBjICsgYTIxICogcztcbiAgb3V0WzZdID0gYTEyICogYyArIGEyMiAqIHM7XG4gIG91dFs3XSA9IGExMyAqIGMgKyBhMjMgKiBzO1xuICBvdXRbOF0gPSBhMjAgKiBjIC0gYTEwICogcztcbiAgb3V0WzldID0gYTIxICogYyAtIGExMSAqIHM7XG4gIG91dFsxMF0gPSBhMjIgKiBjIC0gYTEyICogcztcbiAgb3V0WzExXSA9IGEyMyAqIGMgLSBhMTMgKiBzO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJvdGF0ZXMgYSBtYXRyaXggYnkgdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWSBheGlzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IHRoZSByZWNlaXZpbmcgbWF0cml4XHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIHJvdGF0ZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gcm90YXRlWShvdXQsIGEsIHJhZCkge1xuICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gIHZhciBjID0gTWF0aC5jb3MocmFkKTtcbiAgdmFyIGEwMCA9IGFbMF07XG4gIHZhciBhMDEgPSBhWzFdO1xuICB2YXIgYTAyID0gYVsyXTtcbiAgdmFyIGEwMyA9IGFbM107XG4gIHZhciBhMjAgPSBhWzhdO1xuICB2YXIgYTIxID0gYVs5XTtcbiAgdmFyIGEyMiA9IGFbMTBdO1xuICB2YXIgYTIzID0gYVsxMV07XG5cbiAgaWYgKGEgIT09IG91dCkge1xuICAgIC8vIElmIHRoZSBzb3VyY2UgYW5kIGRlc3RpbmF0aW9uIGRpZmZlciwgY29weSB0aGUgdW5jaGFuZ2VkIHJvd3NcbiAgICBvdXRbNF0gPSBhWzRdO1xuICAgIG91dFs1XSA9IGFbNV07XG4gICAgb3V0WzZdID0gYVs2XTtcbiAgICBvdXRbN10gPSBhWzddO1xuICAgIG91dFsxMl0gPSBhWzEyXTtcbiAgICBvdXRbMTNdID0gYVsxM107XG4gICAgb3V0WzE0XSA9IGFbMTRdO1xuICAgIG91dFsxNV0gPSBhWzE1XTtcbiAgfSAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG5cblxuICBvdXRbMF0gPSBhMDAgKiBjIC0gYTIwICogcztcbiAgb3V0WzFdID0gYTAxICogYyAtIGEyMSAqIHM7XG4gIG91dFsyXSA9IGEwMiAqIGMgLSBhMjIgKiBzO1xuICBvdXRbM10gPSBhMDMgKiBjIC0gYTIzICogcztcbiAgb3V0WzhdID0gYTAwICogcyArIGEyMCAqIGM7XG4gIG91dFs5XSA9IGEwMSAqIHMgKyBhMjEgKiBjO1xuICBvdXRbMTBdID0gYTAyICogcyArIGEyMiAqIGM7XG4gIG91dFsxMV0gPSBhMDMgKiBzICsgYTIzICogYztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSb3RhdGVzIGEgbWF0cml4IGJ5IHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFogYXhpc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIG1hdHJpeFxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIG1hdHJpeCB0byByb3RhdGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCByYWQpIHtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICB2YXIgYyA9IE1hdGguY29zKHJhZCk7XG4gIHZhciBhMDAgPSBhWzBdO1xuICB2YXIgYTAxID0gYVsxXTtcbiAgdmFyIGEwMiA9IGFbMl07XG4gIHZhciBhMDMgPSBhWzNdO1xuICB2YXIgYTEwID0gYVs0XTtcbiAgdmFyIGExMSA9IGFbNV07XG4gIHZhciBhMTIgPSBhWzZdO1xuICB2YXIgYTEzID0gYVs3XTtcblxuICBpZiAoYSAhPT0gb3V0KSB7XG4gICAgLy8gSWYgdGhlIHNvdXJjZSBhbmQgZGVzdGluYXRpb24gZGlmZmVyLCBjb3B5IHRoZSB1bmNoYW5nZWQgbGFzdCByb3dcbiAgICBvdXRbOF0gPSBhWzhdO1xuICAgIG91dFs5XSA9IGFbOV07XG4gICAgb3V0WzEwXSA9IGFbMTBdO1xuICAgIG91dFsxMV0gPSBhWzExXTtcbiAgICBvdXRbMTJdID0gYVsxMl07XG4gICAgb3V0WzEzXSA9IGFbMTNdO1xuICAgIG91dFsxNF0gPSBhWzE0XTtcbiAgICBvdXRbMTVdID0gYVsxNV07XG4gIH0gLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuXG5cbiAgb3V0WzBdID0gYTAwICogYyArIGExMCAqIHM7XG4gIG91dFsxXSA9IGEwMSAqIGMgKyBhMTEgKiBzO1xuICBvdXRbMl0gPSBhMDIgKiBjICsgYTEyICogcztcbiAgb3V0WzNdID0gYTAzICogYyArIGExMyAqIHM7XG4gIG91dFs0XSA9IGExMCAqIGMgLSBhMDAgKiBzO1xuICBvdXRbNV0gPSBhMTEgKiBjIC0gYTAxICogcztcbiAgb3V0WzZdID0gYTEyICogYyAtIGEwMiAqIHM7XG4gIG91dFs3XSA9IGExMyAqIGMgLSBhMDMgKiBzO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSBhIHZlY3RvciB0cmFuc2xhdGlvblxyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnRyYW5zbGF0ZShkZXN0LCBkZXN0LCB2ZWMpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7dmVjM30gdiBUcmFuc2xhdGlvbiB2ZWN0b3JcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21UcmFuc2xhdGlvbihvdXQsIHYpIHtcbiAgb3V0WzBdID0gMTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gMTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IDE7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXTtcbiAgb3V0WzEzXSA9IHZbMV07XG4gIG91dFsxNF0gPSB2WzJdO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSB2ZWN0b3Igc2NhbGluZ1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIGRlc3QsIHZlYyk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHt2ZWMzfSB2IFNjYWxpbmcgdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tU2NhbGluZyhvdXQsIHYpIHtcbiAgb3V0WzBdID0gdlswXTtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gdlsxXTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IHZbMl07XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBnaXZlbiBhbmdsZSBhcm91bmQgYSBnaXZlbiBheGlzXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQucm90YXRlKGRlc3QsIGRlc3QsIHJhZCwgYXhpcyk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHBhcmFtIHt2ZWMzfSBheGlzIHRoZSBheGlzIHRvIHJvdGF0ZSBhcm91bmRcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21Sb3RhdGlvbihvdXQsIHJhZCwgYXhpcykge1xuICB2YXIgeCA9IGF4aXNbMF0sXG4gICAgICB5ID0gYXhpc1sxXSxcbiAgICAgIHogPSBheGlzWzJdO1xuICB2YXIgbGVuID0gTWF0aC5oeXBvdCh4LCB5LCB6KTtcbiAgdmFyIHMsIGMsIHQ7XG5cbiAgaWYgKGxlbiA8IGdsTWF0cml4LkVQU0lMT04pIHtcbiAgICByZXR1cm4gbnVsbDtcbiAgfVxuXG4gIGxlbiA9IDEgLyBsZW47XG4gIHggKj0gbGVuO1xuICB5ICo9IGxlbjtcbiAgeiAqPSBsZW47XG4gIHMgPSBNYXRoLnNpbihyYWQpO1xuICBjID0gTWF0aC5jb3MocmFkKTtcbiAgdCA9IDEgLSBjOyAvLyBQZXJmb3JtIHJvdGF0aW9uLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuXG4gIG91dFswXSA9IHggKiB4ICogdCArIGM7XG4gIG91dFsxXSA9IHkgKiB4ICogdCArIHogKiBzO1xuICBvdXRbMl0gPSB6ICogeCAqIHQgLSB5ICogcztcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0geCAqIHkgKiB0IC0geiAqIHM7XG4gIG91dFs1XSA9IHkgKiB5ICogdCArIGM7XG4gIG91dFs2XSA9IHogKiB5ICogdCArIHggKiBzO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSB4ICogeiAqIHQgKyB5ICogcztcbiAgb3V0WzldID0geSAqIHogKiB0IC0geCAqIHM7XG4gIG91dFsxMF0gPSB6ICogeiAqIHQgKyBjO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIHRoZSBnaXZlbiBhbmdsZSBhcm91bmQgdGhlIFggYXhpc1xyXG4gKiBUaGlzIGlzIGVxdWl2YWxlbnQgdG8gKGJ1dCBtdWNoIGZhc3RlciB0aGFuKTpcclxuICpcclxuICogICAgIG1hdDQuaWRlbnRpdHkoZGVzdCk7XHJcbiAqICAgICBtYXQ0LnJvdGF0ZVgoZGVzdCwgZGVzdCwgcmFkKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmFkIHRoZSBhbmdsZSB0byByb3RhdGUgdGhlIG1hdHJpeCBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVhSb3RhdGlvbihvdXQsIHJhZCkge1xuICB2YXIgcyA9IE1hdGguc2luKHJhZCk7XG4gIHZhciBjID0gTWF0aC5jb3MocmFkKTsgLy8gUGVyZm9ybSBheGlzLXNwZWNpZmljIG1hdHJpeCBtdWx0aXBsaWNhdGlvblxuXG4gIG91dFswXSA9IDE7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IGM7XG4gIG91dFs2XSA9IHM7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IC1zO1xuICBvdXRbMTBdID0gYztcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSAwO1xuICBvdXRbMTNdID0gMDtcbiAgb3V0WzE0XSA9IDA7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENyZWF0ZXMgYSBtYXRyaXggZnJvbSB0aGUgZ2l2ZW4gYW5nbGUgYXJvdW5kIHRoZSBZIGF4aXNcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC5yb3RhdGVZKGRlc3QsIGRlc3QsIHJhZCk7XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgcmVjZWl2aW5nIG9wZXJhdGlvbiByZXN1bHRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHJhZCB0aGUgYW5nbGUgdG8gcm90YXRlIHRoZSBtYXRyaXggYnlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21ZUm90YXRpb24ob3V0LCByYWQpIHtcbiAgdmFyIHMgPSBNYXRoLnNpbihyYWQpO1xuICB2YXIgYyA9IE1hdGguY29zKHJhZCk7IC8vIFBlcmZvcm0gYXhpcy1zcGVjaWZpYyBtYXRyaXggbXVsdGlwbGljYXRpb25cblxuICBvdXRbMF0gPSBjO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAtcztcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gMTtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gcztcbiAgb3V0WzldID0gMDtcbiAgb3V0WzEwXSA9IGM7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNF0gPSAwO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gdGhlIGdpdmVuIGFuZ2xlIGFyb3VuZCB0aGUgWiBheGlzXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQucm90YXRlWihkZXN0LCBkZXN0LCByYWQpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7TnVtYmVyfSByYWQgdGhlIGFuZ2xlIHRvIHJvdGF0ZSB0aGUgbWF0cml4IGJ5XHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tWlJvdGF0aW9uKG91dCwgcmFkKSB7XG4gIHZhciBzID0gTWF0aC5zaW4ocmFkKTtcbiAgdmFyIGMgPSBNYXRoLmNvcyhyYWQpOyAvLyBQZXJmb3JtIGF4aXMtc3BlY2lmaWMgbWF0cml4IG11bHRpcGxpY2F0aW9uXG5cbiAgb3V0WzBdID0gYztcbiAgb3V0WzFdID0gcztcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gLXM7XG4gIG91dFs1XSA9IGM7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAxO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiBhbmQgdmVjdG9yIHRyYW5zbGF0aW9uXHJcbiAqIFRoaXMgaXMgZXF1aXZhbGVudCB0byAoYnV0IG11Y2ggZmFzdGVyIHRoYW4pOlxyXG4gKlxyXG4gKiAgICAgbWF0NC5pZGVudGl0eShkZXN0KTtcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIHZlYyk7XHJcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIHEsIHYpIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIHZhciB4ID0gcVswXSxcbiAgICAgIHkgPSBxWzFdLFxuICAgICAgeiA9IHFbMl0sXG4gICAgICB3ID0gcVszXTtcbiAgdmFyIHgyID0geCArIHg7XG4gIHZhciB5MiA9IHkgKyB5O1xuICB2YXIgejIgPSB6ICsgejtcbiAgdmFyIHh4ID0geCAqIHgyO1xuICB2YXIgeHkgPSB4ICogeTI7XG4gIHZhciB4eiA9IHggKiB6MjtcbiAgdmFyIHl5ID0geSAqIHkyO1xuICB2YXIgeXogPSB5ICogejI7XG4gIHZhciB6eiA9IHogKiB6MjtcbiAgdmFyIHd4ID0gdyAqIHgyO1xuICB2YXIgd3kgPSB3ICogeTI7XG4gIHZhciB3eiA9IHcgKiB6MjtcbiAgb3V0WzBdID0gMSAtICh5eSArIHp6KTtcbiAgb3V0WzFdID0geHkgKyB3ejtcbiAgb3V0WzJdID0geHogLSB3eTtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0geHkgLSB3ejtcbiAgb3V0WzVdID0gMSAtICh4eCArIHp6KTtcbiAgb3V0WzZdID0geXogKyB3eDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geHogKyB3eTtcbiAgb3V0WzldID0geXogLSB3eDtcbiAgb3V0WzEwXSA9IDEgLSAoeHggKyB5eSk7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXTtcbiAgb3V0WzEzXSA9IHZbMV07XG4gIG91dFsxNF0gPSB2WzJdO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3IG1hdDQgZnJvbSBhIGR1YWwgcXVhdC5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgTWF0cml4XHJcbiAqIEBwYXJhbSB7cXVhdDJ9IGEgRHVhbCBRdWF0ZXJuaW9uXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVF1YXQyKG91dCwgYSkge1xuICB2YXIgdHJhbnNsYXRpb24gPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgdmFyIGJ4ID0gLWFbMF0sXG4gICAgICBieSA9IC1hWzFdLFxuICAgICAgYnogPSAtYVsyXSxcbiAgICAgIGJ3ID0gYVszXSxcbiAgICAgIGF4ID0gYVs0XSxcbiAgICAgIGF5ID0gYVs1XSxcbiAgICAgIGF6ID0gYVs2XSxcbiAgICAgIGF3ID0gYVs3XTtcbiAgdmFyIG1hZ25pdHVkZSA9IGJ4ICogYnggKyBieSAqIGJ5ICsgYnogKiBieiArIGJ3ICogYnc7IC8vT25seSBzY2FsZSBpZiBpdCBtYWtlcyBzZW5zZVxuXG4gIGlmIChtYWduaXR1ZGUgPiAwKSB7XG4gICAgdHJhbnNsYXRpb25bMF0gPSAoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyIC8gbWFnbml0dWRlO1xuICAgIHRyYW5zbGF0aW9uWzFdID0gKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMiAvIG1hZ25pdHVkZTtcbiAgICB0cmFuc2xhdGlvblsyXSA9IChheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4KSAqIDIgLyBtYWduaXR1ZGU7XG4gIH0gZWxzZSB7XG4gICAgdHJhbnNsYXRpb25bMF0gPSAoYXggKiBidyArIGF3ICogYnggKyBheSAqIGJ6IC0gYXogKiBieSkgKiAyO1xuICAgIHRyYW5zbGF0aW9uWzFdID0gKGF5ICogYncgKyBhdyAqIGJ5ICsgYXogKiBieCAtIGF4ICogYnopICogMjtcbiAgICB0cmFuc2xhdGlvblsyXSA9IChheiAqIGJ3ICsgYXcgKiBieiArIGF4ICogYnkgLSBheSAqIGJ4KSAqIDI7XG4gIH1cblxuICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbihvdXQsIGEsIHRyYW5zbGF0aW9uKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSB0cmFuc2xhdGlvbiB2ZWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cclxuICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvbixcclxuICogIHRoZSByZXR1cm5lZCB2ZWN0b3Igd2lsbCBiZSB0aGUgc2FtZSBhcyB0aGUgdHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqICBvcmlnaW5hbGx5IHN1cHBsaWVkLlxyXG4gKiBAcGFyYW0gIHt2ZWMzfSBvdXQgVmVjdG9yIHRvIHJlY2VpdmUgdHJhbnNsYXRpb24gY29tcG9uZW50XHJcbiAqIEBwYXJhbSAge21hdDR9IG1hdCBNYXRyaXggdG8gYmUgZGVjb21wb3NlZCAoaW5wdXQpXHJcbiAqIEByZXR1cm4ge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGdldFRyYW5zbGF0aW9uKG91dCwgbWF0KSB7XG4gIG91dFswXSA9IG1hdFsxMl07XG4gIG91dFsxXSA9IG1hdFsxM107XG4gIG91dFsyXSA9IG1hdFsxNF07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUmV0dXJucyB0aGUgc2NhbGluZyBmYWN0b3IgY29tcG9uZW50IG9mIGEgdHJhbnNmb3JtYXRpb25cclxuICogIG1hdHJpeC4gSWYgYSBtYXRyaXggaXMgYnVpbHQgd2l0aCBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlXHJcbiAqICB3aXRoIGEgbm9ybWFsaXplZCBRdWF0ZXJuaW9uIHBhcmFtdGVyLCB0aGUgcmV0dXJuZWQgdmVjdG9yIHdpbGwgYmVcclxuICogIHRoZSBzYW1lIGFzIHRoZSBzY2FsaW5nIHZlY3RvclxyXG4gKiAgb3JpZ2luYWxseSBzdXBwbGllZC5cclxuICogQHBhcmFtICB7dmVjM30gb3V0IFZlY3RvciB0byByZWNlaXZlIHNjYWxpbmcgZmFjdG9yIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0gIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG4gKiBAcmV0dXJuIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRTY2FsaW5nKG91dCwgbWF0KSB7XG4gIHZhciBtMTEgPSBtYXRbMF07XG4gIHZhciBtMTIgPSBtYXRbMV07XG4gIHZhciBtMTMgPSBtYXRbMl07XG4gIHZhciBtMjEgPSBtYXRbNF07XG4gIHZhciBtMjIgPSBtYXRbNV07XG4gIHZhciBtMjMgPSBtYXRbNl07XG4gIHZhciBtMzEgPSBtYXRbOF07XG4gIHZhciBtMzIgPSBtYXRbOV07XG4gIHZhciBtMzMgPSBtYXRbMTBdO1xuICBvdXRbMF0gPSBNYXRoLmh5cG90KG0xMSwgbTEyLCBtMTMpO1xuICBvdXRbMV0gPSBNYXRoLmh5cG90KG0yMSwgbTIyLCBtMjMpO1xuICBvdXRbMl0gPSBNYXRoLmh5cG90KG0zMSwgbTMyLCBtMzMpO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgYSBxdWF0ZXJuaW9uIHJlcHJlc2VudGluZyB0aGUgcm90YXRpb25hbCBjb21wb25lbnRcclxuICogIG9mIGEgdHJhbnNmb3JtYXRpb24gbWF0cml4LiBJZiBhIG1hdHJpeCBpcyBidWlsdCB3aXRoXHJcbiAqICBmcm9tUm90YXRpb25UcmFuc2xhdGlvbiwgdGhlIHJldHVybmVkIHF1YXRlcm5pb24gd2lsbCBiZSB0aGVcclxuICogIHNhbWUgYXMgdGhlIHF1YXRlcm5pb24gb3JpZ2luYWxseSBzdXBwbGllZC5cclxuICogQHBhcmFtIHtxdWF0fSBvdXQgUXVhdGVybmlvbiB0byByZWNlaXZlIHRoZSByb3RhdGlvbiBjb21wb25lbnRcclxuICogQHBhcmFtIHttYXQ0fSBtYXQgTWF0cml4IHRvIGJlIGRlY29tcG9zZWQgKGlucHV0KVxyXG4gKiBAcmV0dXJuIHtxdWF0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBnZXRSb3RhdGlvbihvdXQsIG1hdCkge1xuICB2YXIgc2NhbGluZyA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xuICBnZXRTY2FsaW5nKHNjYWxpbmcsIG1hdCk7XG4gIHZhciBpczEgPSAxIC8gc2NhbGluZ1swXTtcbiAgdmFyIGlzMiA9IDEgLyBzY2FsaW5nWzFdO1xuICB2YXIgaXMzID0gMSAvIHNjYWxpbmdbMl07XG4gIHZhciBzbTExID0gbWF0WzBdICogaXMxO1xuICB2YXIgc20xMiA9IG1hdFsxXSAqIGlzMjtcbiAgdmFyIHNtMTMgPSBtYXRbMl0gKiBpczM7XG4gIHZhciBzbTIxID0gbWF0WzRdICogaXMxO1xuICB2YXIgc20yMiA9IG1hdFs1XSAqIGlzMjtcbiAgdmFyIHNtMjMgPSBtYXRbNl0gKiBpczM7XG4gIHZhciBzbTMxID0gbWF0WzhdICogaXMxO1xuICB2YXIgc20zMiA9IG1hdFs5XSAqIGlzMjtcbiAgdmFyIHNtMzMgPSBtYXRbMTBdICogaXMzO1xuICB2YXIgdHJhY2UgPSBzbTExICsgc20yMiArIHNtMzM7XG4gIHZhciBTID0gMDtcblxuICBpZiAodHJhY2UgPiAwKSB7XG4gICAgUyA9IE1hdGguc3FydCh0cmFjZSArIDEuMCkgKiAyO1xuICAgIG91dFszXSA9IDAuMjUgKiBTO1xuICAgIG91dFswXSA9IChzbTIzIC0gc20zMikgLyBTO1xuICAgIG91dFsxXSA9IChzbTMxIC0gc20xMykgLyBTO1xuICAgIG91dFsyXSA9IChzbTEyIC0gc20yMSkgLyBTO1xuICB9IGVsc2UgaWYgKHNtMTEgPiBzbTIyICYmIHNtMTEgPiBzbTMzKSB7XG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTExIC0gc20yMiAtIHNtMzMpICogMjtcbiAgICBvdXRbM10gPSAoc20yMyAtIHNtMzIpIC8gUztcbiAgICBvdXRbMF0gPSAwLjI1ICogUztcbiAgICBvdXRbMV0gPSAoc20xMiArIHNtMjEpIC8gUztcbiAgICBvdXRbMl0gPSAoc20zMSArIHNtMTMpIC8gUztcbiAgfSBlbHNlIGlmIChzbTIyID4gc20zMykge1xuICAgIFMgPSBNYXRoLnNxcnQoMS4wICsgc20yMiAtIHNtMTEgLSBzbTMzKSAqIDI7XG4gICAgb3V0WzNdID0gKHNtMzEgLSBzbTEzKSAvIFM7XG4gICAgb3V0WzBdID0gKHNtMTIgKyBzbTIxKSAvIFM7XG4gICAgb3V0WzFdID0gMC4yNSAqIFM7XG4gICAgb3V0WzJdID0gKHNtMjMgKyBzbTMyKSAvIFM7XG4gIH0gZWxzZSB7XG4gICAgUyA9IE1hdGguc3FydCgxLjAgKyBzbTMzIC0gc20xMSAtIHNtMjIpICogMjtcbiAgICBvdXRbM10gPSAoc20xMiAtIHNtMjEpIC8gUztcbiAgICBvdXRbMF0gPSAoc20zMSArIHNtMTMpIC8gUztcbiAgICBvdXRbMV0gPSAoc20yMyArIHNtMzIpIC8gUztcbiAgICBvdXRbMl0gPSAwLjI1ICogUztcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG1hdHJpeCBmcm9tIGEgcXVhdGVybmlvbiByb3RhdGlvbiwgdmVjdG9yIHRyYW5zbGF0aW9uIGFuZCB2ZWN0b3Igc2NhbGVcclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuICogICAgIGxldCBxdWF0TWF0ID0gbWF0NC5jcmVhdGUoKTtcclxuICogICAgIHF1YXQ0LnRvTWF0NChxdWF0LCBxdWF0TWF0KTtcclxuICogICAgIG1hdDQubXVsdGlwbHkoZGVzdCwgcXVhdE1hdCk7XHJcbiAqICAgICBtYXQ0LnNjYWxlKGRlc3QsIHNjYWxlKVxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IHJlY2VpdmluZyBvcGVyYXRpb24gcmVzdWx0XHJcbiAqIEBwYXJhbSB7cXVhdDR9IHEgUm90YXRpb24gcXVhdGVybmlvblxyXG4gKiBAcGFyYW0ge3ZlYzN9IHYgVHJhbnNsYXRpb24gdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gcyBTY2FsaW5nIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVJvdGF0aW9uVHJhbnNsYXRpb25TY2FsZShvdXQsIHEsIHYsIHMpIHtcbiAgLy8gUXVhdGVybmlvbiBtYXRoXG4gIHZhciB4ID0gcVswXSxcbiAgICAgIHkgPSBxWzFdLFxuICAgICAgeiA9IHFbMl0sXG4gICAgICB3ID0gcVszXTtcbiAgdmFyIHgyID0geCArIHg7XG4gIHZhciB5MiA9IHkgKyB5O1xuICB2YXIgejIgPSB6ICsgejtcbiAgdmFyIHh4ID0geCAqIHgyO1xuICB2YXIgeHkgPSB4ICogeTI7XG4gIHZhciB4eiA9IHggKiB6MjtcbiAgdmFyIHl5ID0geSAqIHkyO1xuICB2YXIgeXogPSB5ICogejI7XG4gIHZhciB6eiA9IHogKiB6MjtcbiAgdmFyIHd4ID0gdyAqIHgyO1xuICB2YXIgd3kgPSB3ICogeTI7XG4gIHZhciB3eiA9IHcgKiB6MjtcbiAgdmFyIHN4ID0gc1swXTtcbiAgdmFyIHN5ID0gc1sxXTtcbiAgdmFyIHN6ID0gc1syXTtcbiAgb3V0WzBdID0gKDEgLSAoeXkgKyB6eikpICogc3g7XG4gIG91dFsxXSA9ICh4eSArIHd6KSAqIHN4O1xuICBvdXRbMl0gPSAoeHogLSB3eSkgKiBzeDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gKHh5IC0gd3opICogc3k7XG4gIG91dFs1XSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xuICBvdXRbNl0gPSAoeXogKyB3eCkgKiBzeTtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gKHh6ICsgd3kpICogc3o7XG4gIG91dFs5XSA9ICh5eiAtIHd4KSAqIHN6O1xuICBvdXRbMTBdID0gKDEgLSAoeHggKyB5eSkpICogc3o7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gdlswXTtcbiAgb3V0WzEzXSA9IHZbMV07XG4gIG91dFsxNF0gPSB2WzJdO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbWF0cml4IGZyb20gYSBxdWF0ZXJuaW9uIHJvdGF0aW9uLCB2ZWN0b3IgdHJhbnNsYXRpb24gYW5kIHZlY3RvciBzY2FsZSwgcm90YXRpbmcgYW5kIHNjYWxpbmcgYXJvdW5kIHRoZSBnaXZlbiBvcmlnaW5cclxuICogVGhpcyBpcyBlcXVpdmFsZW50IHRvIChidXQgbXVjaCBmYXN0ZXIgdGhhbik6XHJcbiAqXHJcbiAqICAgICBtYXQ0LmlkZW50aXR5KGRlc3QpO1xyXG4gKiAgICAgbWF0NC50cmFuc2xhdGUoZGVzdCwgdmVjKTtcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG9yaWdpbik7XHJcbiAqICAgICBsZXQgcXVhdE1hdCA9IG1hdDQuY3JlYXRlKCk7XHJcbiAqICAgICBxdWF0NC50b01hdDQocXVhdCwgcXVhdE1hdCk7XHJcbiAqICAgICBtYXQ0Lm11bHRpcGx5KGRlc3QsIHF1YXRNYXQpO1xyXG4gKiAgICAgbWF0NC5zY2FsZShkZXN0LCBzY2FsZSlcclxuICogICAgIG1hdDQudHJhbnNsYXRlKGRlc3QsIG5lZ2F0aXZlT3JpZ2luKTtcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXQ0fSBxIFJvdGF0aW9uIHF1YXRlcm5pb25cclxuICogQHBhcmFtIHt2ZWMzfSB2IFRyYW5zbGF0aW9uIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IHMgU2NhbGluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBvIFRoZSBvcmlnaW4gdmVjdG9yIGFyb3VuZCB3aGljaCB0byBzY2FsZSBhbmQgcm90YXRlXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmcm9tUm90YXRpb25UcmFuc2xhdGlvblNjYWxlT3JpZ2luKG91dCwgcSwgdiwgcywgbykge1xuICAvLyBRdWF0ZXJuaW9uIG1hdGhcbiAgdmFyIHggPSBxWzBdLFxuICAgICAgeSA9IHFbMV0sXG4gICAgICB6ID0gcVsyXSxcbiAgICAgIHcgPSBxWzNdO1xuICB2YXIgeDIgPSB4ICsgeDtcbiAgdmFyIHkyID0geSArIHk7XG4gIHZhciB6MiA9IHogKyB6O1xuICB2YXIgeHggPSB4ICogeDI7XG4gIHZhciB4eSA9IHggKiB5MjtcbiAgdmFyIHh6ID0geCAqIHoyO1xuICB2YXIgeXkgPSB5ICogeTI7XG4gIHZhciB5eiA9IHkgKiB6MjtcbiAgdmFyIHp6ID0geiAqIHoyO1xuICB2YXIgd3ggPSB3ICogeDI7XG4gIHZhciB3eSA9IHcgKiB5MjtcbiAgdmFyIHd6ID0gdyAqIHoyO1xuICB2YXIgc3ggPSBzWzBdO1xuICB2YXIgc3kgPSBzWzFdO1xuICB2YXIgc3ogPSBzWzJdO1xuICB2YXIgb3ggPSBvWzBdO1xuICB2YXIgb3kgPSBvWzFdO1xuICB2YXIgb3ogPSBvWzJdO1xuICB2YXIgb3V0MCA9ICgxIC0gKHl5ICsgenopKSAqIHN4O1xuICB2YXIgb3V0MSA9ICh4eSArIHd6KSAqIHN4O1xuICB2YXIgb3V0MiA9ICh4eiAtIHd5KSAqIHN4O1xuICB2YXIgb3V0NCA9ICh4eSAtIHd6KSAqIHN5O1xuICB2YXIgb3V0NSA9ICgxIC0gKHh4ICsgenopKSAqIHN5O1xuICB2YXIgb3V0NiA9ICh5eiArIHd4KSAqIHN5O1xuICB2YXIgb3V0OCA9ICh4eiArIHd5KSAqIHN6O1xuICB2YXIgb3V0OSA9ICh5eiAtIHd4KSAqIHN6O1xuICB2YXIgb3V0MTAgPSAoMSAtICh4eCArIHl5KSkgKiBzejtcbiAgb3V0WzBdID0gb3V0MDtcbiAgb3V0WzFdID0gb3V0MTtcbiAgb3V0WzJdID0gb3V0MjtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gb3V0NDtcbiAgb3V0WzVdID0gb3V0NTtcbiAgb3V0WzZdID0gb3V0NjtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gb3V0ODtcbiAgb3V0WzldID0gb3V0OTtcbiAgb3V0WzEwXSA9IG91dDEwO1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IHZbMF0gKyBveCAtIChvdXQwICogb3ggKyBvdXQ0ICogb3kgKyBvdXQ4ICogb3opO1xuICBvdXRbMTNdID0gdlsxXSArIG95IC0gKG91dDEgKiBveCArIG91dDUgKiBveSArIG91dDkgKiBveik7XG4gIG91dFsxNF0gPSB2WzJdICsgb3ogLSAob3V0MiAqIG94ICsgb3V0NiAqIG95ICsgb3V0MTAgKiBveik7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgYSA0eDQgbWF0cml4IGZyb20gdGhlIGdpdmVuIHF1YXRlcm5pb25cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCByZWNlaXZpbmcgb3BlcmF0aW9uIHJlc3VsdFxyXG4gKiBAcGFyYW0ge3F1YXR9IHEgUXVhdGVybmlvbiB0byBjcmVhdGUgbWF0cml4IGZyb21cclxuICpcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb21RdWF0KG91dCwgcSkge1xuICB2YXIgeCA9IHFbMF0sXG4gICAgICB5ID0gcVsxXSxcbiAgICAgIHogPSBxWzJdLFxuICAgICAgdyA9IHFbM107XG4gIHZhciB4MiA9IHggKyB4O1xuICB2YXIgeTIgPSB5ICsgeTtcbiAgdmFyIHoyID0geiArIHo7XG4gIHZhciB4eCA9IHggKiB4MjtcbiAgdmFyIHl4ID0geSAqIHgyO1xuICB2YXIgeXkgPSB5ICogeTI7XG4gIHZhciB6eCA9IHogKiB4MjtcbiAgdmFyIHp5ID0geiAqIHkyO1xuICB2YXIgenogPSB6ICogejI7XG4gIHZhciB3eCA9IHcgKiB4MjtcbiAgdmFyIHd5ID0gdyAqIHkyO1xuICB2YXIgd3ogPSB3ICogejI7XG4gIG91dFswXSA9IDEgLSB5eSAtIHp6O1xuICBvdXRbMV0gPSB5eCArIHd6O1xuICBvdXRbMl0gPSB6eCAtIHd5O1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB5eCAtIHd6O1xuICBvdXRbNV0gPSAxIC0geHggLSB6ejtcbiAgb3V0WzZdID0genkgKyB3eDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0genggKyB3eTtcbiAgb3V0WzldID0genkgLSB3eDtcbiAgb3V0WzEwXSA9IDEgLSB4eCAtIHl5O1xuICBvdXRbMTFdID0gMDtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gMDtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2VuZXJhdGVzIGEgZnJ1c3R1bSBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHtOdW1iZXJ9IGxlZnQgTGVmdCBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge051bWJlcn0gcmlnaHQgUmlnaHQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtOdW1iZXJ9IGJvdHRvbSBCb3R0b20gYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtOdW1iZXJ9IHRvcCBUb3AgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtOdW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge051bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJ1c3R1bShvdXQsIGxlZnQsIHJpZ2h0LCBib3R0b20sIHRvcCwgbmVhciwgZmFyKSB7XG4gIHZhciBybCA9IDEgLyAocmlnaHQgLSBsZWZ0KTtcbiAgdmFyIHRiID0gMSAvICh0b3AgLSBib3R0b20pO1xuICB2YXIgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICBvdXRbMF0gPSBuZWFyICogMiAqIHJsO1xuICBvdXRbMV0gPSAwO1xuICBvdXRbMl0gPSAwO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSAwO1xuICBvdXRbNV0gPSBuZWFyICogMiAqIHRiO1xuICBvdXRbNl0gPSAwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSAocmlnaHQgKyBsZWZ0KSAqIHJsO1xuICBvdXRbOV0gPSAodG9wICsgYm90dG9tKSAqIHRiO1xuICBvdXRbMTBdID0gKGZhciArIG5lYXIpICogbmY7XG4gIG91dFsxMV0gPSAtMTtcbiAgb3V0WzEyXSA9IDA7XG4gIG91dFsxM10gPSAwO1xuICBvdXRbMTRdID0gZmFyICogbmVhciAqIDIgKiBuZjtcbiAgb3V0WzE1XSA9IDA7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gYm91bmRzLlxyXG4gKiBQYXNzaW5nIG51bGwvdW5kZWZpbmVkL25vIHZhbHVlIGZvciBmYXIgd2lsbCBnZW5lcmF0ZSBpbmZpbml0ZSBwcm9qZWN0aW9uIG1hdHJpeC5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge251bWJlcn0gZm92eSBWZXJ0aWNhbCBmaWVsZCBvZiB2aWV3IGluIHJhZGlhbnNcclxuICogQHBhcmFtIHtudW1iZXJ9IGFzcGVjdCBBc3BlY3QgcmF0aW8uIHR5cGljYWxseSB2aWV3cG9ydCB3aWR0aC9oZWlnaHRcclxuICogQHBhcmFtIHtudW1iZXJ9IG5lYXIgTmVhciBib3VuZCBvZiB0aGUgZnJ1c3R1bVxyXG4gKiBAcGFyYW0ge251bWJlcn0gZmFyIEZhciBib3VuZCBvZiB0aGUgZnJ1c3R1bSwgY2FuIGJlIG51bGwgb3IgSW5maW5pdHlcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlKG91dCwgZm92eSwgYXNwZWN0LCBuZWFyLCBmYXIpIHtcbiAgdmFyIGYgPSAxLjAgLyBNYXRoLnRhbihmb3Z5IC8gMiksXG4gICAgICBuZjtcbiAgb3V0WzBdID0gZiAvIGFzcGVjdDtcbiAgb3V0WzFdID0gMDtcbiAgb3V0WzJdID0gMDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0gMDtcbiAgb3V0WzVdID0gZjtcbiAgb3V0WzZdID0gMDtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0gMDtcbiAgb3V0WzldID0gMDtcbiAgb3V0WzExXSA9IC0xO1xuICBvdXRbMTJdID0gMDtcbiAgb3V0WzEzXSA9IDA7XG4gIG91dFsxNV0gPSAwO1xuXG4gIGlmIChmYXIgIT0gbnVsbCAmJiBmYXIgIT09IEluZmluaXR5KSB7XG4gICAgbmYgPSAxIC8gKG5lYXIgLSBmYXIpO1xuICAgIG91dFsxMF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgICBvdXRbMTRdID0gMiAqIGZhciAqIG5lYXIgKiBuZjtcbiAgfSBlbHNlIHtcbiAgICBvdXRbMTBdID0gLTE7XG4gICAgb3V0WzE0XSA9IC0yICogbmVhcjtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2VuZXJhdGVzIGEgcGVyc3BlY3RpdmUgcHJvamVjdGlvbiBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZmllbGQgb2Ygdmlldy5cclxuICogVGhpcyBpcyBwcmltYXJpbHkgdXNlZnVsIGZvciBnZW5lcmF0aW5nIHByb2plY3Rpb24gbWF0cmljZXMgdG8gYmUgdXNlZFxyXG4gKiB3aXRoIHRoZSBzdGlsbCBleHBlcmllbWVudGFsIFdlYlZSIEFQSS5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge09iamVjdH0gZm92IE9iamVjdCBjb250YWluaW5nIHRoZSBmb2xsb3dpbmcgdmFsdWVzOiB1cERlZ3JlZXMsIGRvd25EZWdyZWVzLCBsZWZ0RGVncmVlcywgcmlnaHREZWdyZWVzXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHBlcnNwZWN0aXZlRnJvbUZpZWxkT2ZWaWV3KG91dCwgZm92LCBuZWFyLCBmYXIpIHtcbiAgdmFyIHVwVGFuID0gTWF0aC50YW4oZm92LnVwRGVncmVlcyAqIE1hdGguUEkgLyAxODAuMCk7XG4gIHZhciBkb3duVGFuID0gTWF0aC50YW4oZm92LmRvd25EZWdyZWVzICogTWF0aC5QSSAvIDE4MC4wKTtcbiAgdmFyIGxlZnRUYW4gPSBNYXRoLnRhbihmb3YubGVmdERlZ3JlZXMgKiBNYXRoLlBJIC8gMTgwLjApO1xuICB2YXIgcmlnaHRUYW4gPSBNYXRoLnRhbihmb3YucmlnaHREZWdyZWVzICogTWF0aC5QSSAvIDE4MC4wKTtcbiAgdmFyIHhTY2FsZSA9IDIuMCAvIChsZWZ0VGFuICsgcmlnaHRUYW4pO1xuICB2YXIgeVNjYWxlID0gMi4wIC8gKHVwVGFuICsgZG93blRhbik7XG4gIG91dFswXSA9IHhTY2FsZTtcbiAgb3V0WzFdID0gMC4wO1xuICBvdXRbMl0gPSAwLjA7XG4gIG91dFszXSA9IDAuMDtcbiAgb3V0WzRdID0gMC4wO1xuICBvdXRbNV0gPSB5U2NhbGU7XG4gIG91dFs2XSA9IDAuMDtcbiAgb3V0WzddID0gMC4wO1xuICBvdXRbOF0gPSAtKChsZWZ0VGFuIC0gcmlnaHRUYW4pICogeFNjYWxlICogMC41KTtcbiAgb3V0WzldID0gKHVwVGFuIC0gZG93blRhbikgKiB5U2NhbGUgKiAwLjU7XG4gIG91dFsxMF0gPSBmYXIgLyAobmVhciAtIGZhcik7XG4gIG91dFsxMV0gPSAtMS4wO1xuICBvdXRbMTJdID0gMC4wO1xuICBvdXRbMTNdID0gMC4wO1xuICBvdXRbMTRdID0gZmFyICogbmVhciAvIChuZWFyIC0gZmFyKTtcbiAgb3V0WzE1XSA9IDAuMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBvcnRob2dvbmFsIHByb2plY3Rpb24gbWF0cml4IHdpdGggdGhlIGdpdmVuIGJvdW5kc1xyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCBtYXQ0IGZydXN0dW0gbWF0cml4IHdpbGwgYmUgd3JpdHRlbiBpbnRvXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBsZWZ0IExlZnQgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IHJpZ2h0IFJpZ2h0IGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBib3R0b20gQm90dG9tIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSB0b3AgVG9wIGJvdW5kIG9mIHRoZSBmcnVzdHVtXHJcbiAqIEBwYXJhbSB7bnVtYmVyfSBuZWFyIE5lYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHBhcmFtIHtudW1iZXJ9IGZhciBGYXIgYm91bmQgb2YgdGhlIGZydXN0dW1cclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG9ydGhvKG91dCwgbGVmdCwgcmlnaHQsIGJvdHRvbSwgdG9wLCBuZWFyLCBmYXIpIHtcbiAgdmFyIGxyID0gMSAvIChsZWZ0IC0gcmlnaHQpO1xuICB2YXIgYnQgPSAxIC8gKGJvdHRvbSAtIHRvcCk7XG4gIHZhciBuZiA9IDEgLyAobmVhciAtIGZhcik7XG4gIG91dFswXSA9IC0yICogbHI7XG4gIG91dFsxXSA9IDA7XG4gIG91dFsyXSA9IDA7XG4gIG91dFszXSA9IDA7XG4gIG91dFs0XSA9IDA7XG4gIG91dFs1XSA9IC0yICogYnQ7XG4gIG91dFs2XSA9IDA7XG4gIG91dFs3XSA9IDA7XG4gIG91dFs4XSA9IDA7XG4gIG91dFs5XSA9IDA7XG4gIG91dFsxMF0gPSAyICogbmY7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gKGxlZnQgKyByaWdodCkgKiBscjtcbiAgb3V0WzEzXSA9ICh0b3AgKyBib3R0b20pICogYnQ7XG4gIG91dFsxNF0gPSAoZmFyICsgbmVhcikgKiBuZjtcbiAgb3V0WzE1XSA9IDE7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2VuZXJhdGVzIGEgbG9vay1hdCBtYXRyaXggd2l0aCB0aGUgZ2l2ZW4gZXllIHBvc2l0aW9uLCBmb2NhbCBwb2ludCwgYW5kIHVwIGF4aXMuXHJcbiAqIElmIHlvdSB3YW50IGEgbWF0cml4IHRoYXQgYWN0dWFsbHkgbWFrZXMgYW4gb2JqZWN0IGxvb2sgYXQgYW5vdGhlciBvYmplY3QsIHlvdSBzaG91bGQgdXNlIHRhcmdldFRvIGluc3RlYWQuXHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gb3V0IG1hdDQgZnJ1c3R1bSBtYXRyaXggd2lsbCBiZSB3cml0dGVuIGludG9cclxuICogQHBhcmFtIHt2ZWMzfSBleWUgUG9zaXRpb24gb2YgdGhlIHZpZXdlclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGNlbnRlciBQb2ludCB0aGUgdmlld2VyIGlzIGxvb2tpbmcgYXRcclxuICogQHBhcmFtIHt2ZWMzfSB1cCB2ZWMzIHBvaW50aW5nIHVwXHJcbiAqIEByZXR1cm5zIHttYXQ0fSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsb29rQXQob3V0LCBleWUsIGNlbnRlciwgdXApIHtcbiAgdmFyIHgwLCB4MSwgeDIsIHkwLCB5MSwgeTIsIHowLCB6MSwgejIsIGxlbjtcbiAgdmFyIGV5ZXggPSBleWVbMF07XG4gIHZhciBleWV5ID0gZXllWzFdO1xuICB2YXIgZXlleiA9IGV5ZVsyXTtcbiAgdmFyIHVweCA9IHVwWzBdO1xuICB2YXIgdXB5ID0gdXBbMV07XG4gIHZhciB1cHogPSB1cFsyXTtcbiAgdmFyIGNlbnRlcnggPSBjZW50ZXJbMF07XG4gIHZhciBjZW50ZXJ5ID0gY2VudGVyWzFdO1xuICB2YXIgY2VudGVyeiA9IGNlbnRlclsyXTtcblxuICBpZiAoTWF0aC5hYnMoZXlleCAtIGNlbnRlcngpIDwgZ2xNYXRyaXguRVBTSUxPTiAmJiBNYXRoLmFicyhleWV5IC0gY2VudGVyeSkgPCBnbE1hdHJpeC5FUFNJTE9OICYmIE1hdGguYWJzKGV5ZXogLSBjZW50ZXJ6KSA8IGdsTWF0cml4LkVQU0lMT04pIHtcbiAgICByZXR1cm4gaWRlbnRpdHkob3V0KTtcbiAgfVxuXG4gIHowID0gZXlleCAtIGNlbnRlcng7XG4gIHoxID0gZXlleSAtIGNlbnRlcnk7XG4gIHoyID0gZXlleiAtIGNlbnRlcno7XG4gIGxlbiA9IDEgLyBNYXRoLmh5cG90KHowLCB6MSwgejIpO1xuICB6MCAqPSBsZW47XG4gIHoxICo9IGxlbjtcbiAgejIgKj0gbGVuO1xuICB4MCA9IHVweSAqIHoyIC0gdXB6ICogejE7XG4gIHgxID0gdXB6ICogejAgLSB1cHggKiB6MjtcbiAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuICBsZW4gPSBNYXRoLmh5cG90KHgwLCB4MSwgeDIpO1xuXG4gIGlmICghbGVuKSB7XG4gICAgeDAgPSAwO1xuICAgIHgxID0gMDtcbiAgICB4MiA9IDA7XG4gIH0gZWxzZSB7XG4gICAgbGVuID0gMSAvIGxlbjtcbiAgICB4MCAqPSBsZW47XG4gICAgeDEgKj0gbGVuO1xuICAgIHgyICo9IGxlbjtcbiAgfVxuXG4gIHkwID0gejEgKiB4MiAtIHoyICogeDE7XG4gIHkxID0gejIgKiB4MCAtIHowICogeDI7XG4gIHkyID0gejAgKiB4MSAtIHoxICogeDA7XG4gIGxlbiA9IE1hdGguaHlwb3QoeTAsIHkxLCB5Mik7XG5cbiAgaWYgKCFsZW4pIHtcbiAgICB5MCA9IDA7XG4gICAgeTEgPSAwO1xuICAgIHkyID0gMDtcbiAgfSBlbHNlIHtcbiAgICBsZW4gPSAxIC8gbGVuO1xuICAgIHkwICo9IGxlbjtcbiAgICB5MSAqPSBsZW47XG4gICAgeTIgKj0gbGVuO1xuICB9XG5cbiAgb3V0WzBdID0geDA7XG4gIG91dFsxXSA9IHkwO1xuICBvdXRbMl0gPSB6MDtcbiAgb3V0WzNdID0gMDtcbiAgb3V0WzRdID0geDE7XG4gIG91dFs1XSA9IHkxO1xuICBvdXRbNl0gPSB6MTtcbiAgb3V0WzddID0gMDtcbiAgb3V0WzhdID0geDI7XG4gIG91dFs5XSA9IHkyO1xuICBvdXRbMTBdID0gejI7XG4gIG91dFsxMV0gPSAwO1xuICBvdXRbMTJdID0gLSh4MCAqIGV5ZXggKyB4MSAqIGV5ZXkgKyB4MiAqIGV5ZXopO1xuICBvdXRbMTNdID0gLSh5MCAqIGV5ZXggKyB5MSAqIGV5ZXkgKyB5MiAqIGV5ZXopO1xuICBvdXRbMTRdID0gLSh6MCAqIGV5ZXggKyB6MSAqIGV5ZXkgKyB6MiAqIGV5ZXopO1xuICBvdXRbMTVdID0gMTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBHZW5lcmF0ZXMgYSBtYXRyaXggdGhhdCBtYWtlcyBzb21ldGhpbmcgbG9vayBhdCBzb21ldGhpbmcgZWxzZS5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgbWF0NCBmcnVzdHVtIG1hdHJpeCB3aWxsIGJlIHdyaXR0ZW4gaW50b1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGV5ZSBQb3NpdGlvbiBvZiB0aGUgdmlld2VyXHJcbiAqIEBwYXJhbSB7dmVjM30gY2VudGVyIFBvaW50IHRoZSB2aWV3ZXIgaXMgbG9va2luZyBhdFxyXG4gKiBAcGFyYW0ge3ZlYzN9IHVwIHZlYzMgcG9pbnRpbmcgdXBcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHRhcmdldFRvKG91dCwgZXllLCB0YXJnZXQsIHVwKSB7XG4gIHZhciBleWV4ID0gZXllWzBdLFxuICAgICAgZXlleSA9IGV5ZVsxXSxcbiAgICAgIGV5ZXogPSBleWVbMl0sXG4gICAgICB1cHggPSB1cFswXSxcbiAgICAgIHVweSA9IHVwWzFdLFxuICAgICAgdXB6ID0gdXBbMl07XG4gIHZhciB6MCA9IGV5ZXggLSB0YXJnZXRbMF0sXG4gICAgICB6MSA9IGV5ZXkgLSB0YXJnZXRbMV0sXG4gICAgICB6MiA9IGV5ZXogLSB0YXJnZXRbMl07XG4gIHZhciBsZW4gPSB6MCAqIHowICsgejEgKiB6MSArIHoyICogejI7XG5cbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgejAgKj0gbGVuO1xuICAgIHoxICo9IGxlbjtcbiAgICB6MiAqPSBsZW47XG4gIH1cblxuICB2YXIgeDAgPSB1cHkgKiB6MiAtIHVweiAqIHoxLFxuICAgICAgeDEgPSB1cHogKiB6MCAtIHVweCAqIHoyLFxuICAgICAgeDIgPSB1cHggKiB6MSAtIHVweSAqIHowO1xuICBsZW4gPSB4MCAqIHgwICsgeDEgKiB4MSArIHgyICogeDI7XG5cbiAgaWYgKGxlbiA+IDApIHtcbiAgICBsZW4gPSAxIC8gTWF0aC5zcXJ0KGxlbik7XG4gICAgeDAgKj0gbGVuO1xuICAgIHgxICo9IGxlbjtcbiAgICB4MiAqPSBsZW47XG4gIH1cblxuICBvdXRbMF0gPSB4MDtcbiAgb3V0WzFdID0geDE7XG4gIG91dFsyXSA9IHgyO1xuICBvdXRbM10gPSAwO1xuICBvdXRbNF0gPSB6MSAqIHgyIC0gejIgKiB4MTtcbiAgb3V0WzVdID0gejIgKiB4MCAtIHowICogeDI7XG4gIG91dFs2XSA9IHowICogeDEgLSB6MSAqIHgwO1xuICBvdXRbN10gPSAwO1xuICBvdXRbOF0gPSB6MDtcbiAgb3V0WzldID0gejE7XG4gIG91dFsxMF0gPSB6MjtcbiAgb3V0WzExXSA9IDA7XG4gIG91dFsxMl0gPSBleWV4O1xuICBvdXRbMTNdID0gZXlleTtcbiAgb3V0WzE0XSA9IGV5ZXo7XG4gIG91dFsxNV0gPSAxO1xuICByZXR1cm4gb3V0O1xufVxuO1xuLyoqXHJcbiAqIFJldHVybnMgYSBzdHJpbmcgcmVwcmVzZW50YXRpb24gb2YgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gYSBtYXRyaXggdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgbWF0cml4XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICdtYXQ0KCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcsICcgKyBhWzNdICsgJywgJyArIGFbNF0gKyAnLCAnICsgYVs1XSArICcsICcgKyBhWzZdICsgJywgJyArIGFbN10gKyAnLCAnICsgYVs4XSArICcsICcgKyBhWzldICsgJywgJyArIGFbMTBdICsgJywgJyArIGFbMTFdICsgJywgJyArIGFbMTJdICsgJywgJyArIGFbMTNdICsgJywgJyArIGFbMTRdICsgJywgJyArIGFbMTVdICsgJyknO1xufVxuLyoqXHJcbiAqIFJldHVybnMgRnJvYmVuaXVzIG5vcm0gb2YgYSBtYXQ0XHJcbiAqXHJcbiAqIEBwYXJhbSB7bWF0NH0gYSB0aGUgbWF0cml4IHRvIGNhbGN1bGF0ZSBGcm9iZW5pdXMgbm9ybSBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBGcm9iZW5pdXMgbm9ybVxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGZyb2IoYSkge1xuICByZXR1cm4gTWF0aC5oeXBvdChhWzBdLCBhWzFdLCBhWzNdLCBhWzRdLCBhWzVdLCBhWzZdLCBhWzddLCBhWzhdLCBhWzldLCBhWzEwXSwgYVsxMV0sIGFbMTJdLCBhWzEzXSwgYVsxNF0sIGFbMTVdKTtcbn1cbi8qKlxyXG4gKiBBZGRzIHR3byBtYXQ0J3NcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgb3V0WzNdID0gYVszXSArIGJbM107XG4gIG91dFs0XSA9IGFbNF0gKyBiWzRdO1xuICBvdXRbNV0gPSBhWzVdICsgYls1XTtcbiAgb3V0WzZdID0gYVs2XSArIGJbNl07XG4gIG91dFs3XSA9IGFbN10gKyBiWzddO1xuICBvdXRbOF0gPSBhWzhdICsgYls4XTtcbiAgb3V0WzldID0gYVs5XSArIGJbOV07XG4gIG91dFsxMF0gPSBhWzEwXSArIGJbMTBdO1xuICBvdXRbMTFdID0gYVsxMV0gKyBiWzExXTtcbiAgb3V0WzEyXSA9IGFbMTJdICsgYlsxMl07XG4gIG91dFsxM10gPSBhWzEzXSArIGJbMTNdO1xuICBvdXRbMTRdID0gYVsxNF0gKyBiWzE0XTtcbiAgb3V0WzE1XSA9IGFbMTVdICsgYlsxNV07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogU3VidHJhY3RzIG1hdHJpeCBiIGZyb20gbWF0cml4IGFcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge21hdDR9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHN1YnRyYWN0KG91dCwgYSwgYikge1xuICBvdXRbMF0gPSBhWzBdIC0gYlswXTtcbiAgb3V0WzFdID0gYVsxXSAtIGJbMV07XG4gIG91dFsyXSA9IGFbMl0gLSBiWzJdO1xuICBvdXRbM10gPSBhWzNdIC0gYlszXTtcbiAgb3V0WzRdID0gYVs0XSAtIGJbNF07XG4gIG91dFs1XSA9IGFbNV0gLSBiWzVdO1xuICBvdXRbNl0gPSBhWzZdIC0gYls2XTtcbiAgb3V0WzddID0gYVs3XSAtIGJbN107XG4gIG91dFs4XSA9IGFbOF0gLSBiWzhdO1xuICBvdXRbOV0gPSBhWzldIC0gYls5XTtcbiAgb3V0WzEwXSA9IGFbMTBdIC0gYlsxMF07XG4gIG91dFsxMV0gPSBhWzExXSAtIGJbMTFdO1xuICBvdXRbMTJdID0gYVsxMl0gLSBiWzEyXTtcbiAgb3V0WzEzXSA9IGFbMTNdIC0gYlsxM107XG4gIG91dFsxNF0gPSBhWzE0XSAtIGJbMTRdO1xuICBvdXRbMTVdID0gYVsxNV0gLSBiWzE1XTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNdWx0aXBseSBlYWNoIGVsZW1lbnQgb2YgdGhlIG1hdHJpeCBieSBhIHNjYWxhci5cclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBvdXQgdGhlIHJlY2VpdmluZyBtYXRyaXhcclxuICogQHBhcmFtIHttYXQ0fSBhIHRoZSBtYXRyaXggdG8gc2NhbGVcclxuICogQHBhcmFtIHtOdW1iZXJ9IGIgYW1vdW50IHRvIHNjYWxlIHRoZSBtYXRyaXgncyBlbGVtZW50cyBieVxyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXIob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIG91dFszXSA9IGFbM10gKiBiO1xuICBvdXRbNF0gPSBhWzRdICogYjtcbiAgb3V0WzVdID0gYVs1XSAqIGI7XG4gIG91dFs2XSA9IGFbNl0gKiBiO1xuICBvdXRbN10gPSBhWzddICogYjtcbiAgb3V0WzhdID0gYVs4XSAqIGI7XG4gIG91dFs5XSA9IGFbOV0gKiBiO1xuICBvdXRbMTBdID0gYVsxMF0gKiBiO1xuICBvdXRbMTFdID0gYVsxMV0gKiBiO1xuICBvdXRbMTJdID0gYVsxMl0gKiBiO1xuICBvdXRbMTNdID0gYVsxM10gKiBiO1xuICBvdXRbMTRdID0gYVsxNF0gKiBiO1xuICBvdXRbMTVdID0gYVsxNV0gKiBiO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEFkZHMgdHdvIG1hdDQncyBhZnRlciBtdWx0aXBseWluZyBlYWNoIGVsZW1lbnQgb2YgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge21hdDR9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHttYXQ0fSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gc2NhbGUgdGhlIGFtb3VudCB0byBzY2FsZSBiJ3MgZWxlbWVudHMgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7bWF0NH0gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbXVsdGlwbHlTY2FsYXJBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlO1xuICBvdXRbM10gPSBhWzNdICsgYlszXSAqIHNjYWxlO1xuICBvdXRbNF0gPSBhWzRdICsgYls0XSAqIHNjYWxlO1xuICBvdXRbNV0gPSBhWzVdICsgYls1XSAqIHNjYWxlO1xuICBvdXRbNl0gPSBhWzZdICsgYls2XSAqIHNjYWxlO1xuICBvdXRbN10gPSBhWzddICsgYls3XSAqIHNjYWxlO1xuICBvdXRbOF0gPSBhWzhdICsgYls4XSAqIHNjYWxlO1xuICBvdXRbOV0gPSBhWzldICsgYls5XSAqIHNjYWxlO1xuICBvdXRbMTBdID0gYVsxMF0gKyBiWzEwXSAqIHNjYWxlO1xuICBvdXRbMTFdID0gYVsxMV0gKyBiWzExXSAqIHNjYWxlO1xuICBvdXRbMTJdID0gYVsxMl0gKyBiWzEyXSAqIHNjYWxlO1xuICBvdXRbMTNdID0gYVsxM10gKyBiWzEzXSAqIHNjYWxlO1xuICBvdXRbMTRdID0gYVsxNF0gKyBiWzE0XSAqIHNjYWxlO1xuICBvdXRbMTVdID0gYVsxNV0gKyBiWzE1XSAqIHNjYWxlO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFJldHVybnMgd2hldGhlciBvciBub3QgdGhlIG1hdHJpY2VzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHttYXQ0fSBhIFRoZSBmaXJzdCBtYXRyaXguXHJcbiAqIEBwYXJhbSB7bWF0NH0gYiBUaGUgc2Vjb25kIG1hdHJpeC5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIG1hdHJpY2VzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGV4YWN0RXF1YWxzKGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gPT09IGJbMF0gJiYgYVsxXSA9PT0gYlsxXSAmJiBhWzJdID09PSBiWzJdICYmIGFbM10gPT09IGJbM10gJiYgYVs0XSA9PT0gYls0XSAmJiBhWzVdID09PSBiWzVdICYmIGFbNl0gPT09IGJbNl0gJiYgYVs3XSA9PT0gYls3XSAmJiBhWzhdID09PSBiWzhdICYmIGFbOV0gPT09IGJbOV0gJiYgYVsxMF0gPT09IGJbMTBdICYmIGFbMTFdID09PSBiWzExXSAmJiBhWzEyXSA9PT0gYlsxMl0gJiYgYVsxM10gPT09IGJbMTNdICYmIGFbMTRdID09PSBiWzE0XSAmJiBhWzE1XSA9PT0gYlsxNV07XG59XG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgbWF0cmljZXMgaGF2ZSBhcHByb3hpbWF0ZWx5IHRoZSBzYW1lIGVsZW1lbnRzIGluIHRoZSBzYW1lIHBvc2l0aW9uLlxyXG4gKlxyXG4gKiBAcGFyYW0ge21hdDR9IGEgVGhlIGZpcnN0IG1hdHJpeC5cclxuICogQHBhcmFtIHttYXQ0fSBiIFRoZSBzZWNvbmQgbWF0cml4LlxyXG4gKiBAcmV0dXJucyB7Qm9vbGVhbn0gVHJ1ZSBpZiB0aGUgbWF0cmljZXMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXF1YWxzKGEsIGIpIHtcbiAgdmFyIGEwID0gYVswXSxcbiAgICAgIGExID0gYVsxXSxcbiAgICAgIGEyID0gYVsyXSxcbiAgICAgIGEzID0gYVszXTtcbiAgdmFyIGE0ID0gYVs0XSxcbiAgICAgIGE1ID0gYVs1XSxcbiAgICAgIGE2ID0gYVs2XSxcbiAgICAgIGE3ID0gYVs3XTtcbiAgdmFyIGE4ID0gYVs4XSxcbiAgICAgIGE5ID0gYVs5XSxcbiAgICAgIGExMCA9IGFbMTBdLFxuICAgICAgYTExID0gYVsxMV07XG4gIHZhciBhMTIgPSBhWzEyXSxcbiAgICAgIGExMyA9IGFbMTNdLFxuICAgICAgYTE0ID0gYVsxNF0sXG4gICAgICBhMTUgPSBhWzE1XTtcbiAgdmFyIGIwID0gYlswXSxcbiAgICAgIGIxID0gYlsxXSxcbiAgICAgIGIyID0gYlsyXSxcbiAgICAgIGIzID0gYlszXTtcbiAgdmFyIGI0ID0gYls0XSxcbiAgICAgIGI1ID0gYls1XSxcbiAgICAgIGI2ID0gYls2XSxcbiAgICAgIGI3ID0gYls3XTtcbiAgdmFyIGI4ID0gYls4XSxcbiAgICAgIGI5ID0gYls5XSxcbiAgICAgIGIxMCA9IGJbMTBdLFxuICAgICAgYjExID0gYlsxMV07XG4gIHZhciBiMTIgPSBiWzEyXSxcbiAgICAgIGIxMyA9IGJbMTNdLFxuICAgICAgYjE0ID0gYlsxNF0sXG4gICAgICBiMTUgPSBiWzE1XTtcbiAgcmV0dXJuIE1hdGguYWJzKGEwIC0gYjApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEwKSwgTWF0aC5hYnMoYjApKSAmJiBNYXRoLmFicyhhMSAtIGIxKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMSksIE1hdGguYWJzKGIxKSkgJiYgTWF0aC5hYnMoYTIgLSBiMikgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTIpLCBNYXRoLmFicyhiMikpICYmIE1hdGguYWJzKGEzIC0gYjMpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEzKSwgTWF0aC5hYnMoYjMpKSAmJiBNYXRoLmFicyhhNCAtIGI0KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNCksIE1hdGguYWJzKGI0KSkgJiYgTWF0aC5hYnMoYTUgLSBiNSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTUpLCBNYXRoLmFicyhiNSkpICYmIE1hdGguYWJzKGE2IC0gYjYpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE2KSwgTWF0aC5hYnMoYjYpKSAmJiBNYXRoLmFicyhhNyAtIGI3KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhNyksIE1hdGguYWJzKGI3KSkgJiYgTWF0aC5hYnMoYTggLSBiOCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTgpLCBNYXRoLmFicyhiOCkpICYmIE1hdGguYWJzKGE5IC0gYjkpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGE5KSwgTWF0aC5hYnMoYjkpKSAmJiBNYXRoLmFicyhhMTAgLSBiMTApIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMCksIE1hdGguYWJzKGIxMCkpICYmIE1hdGguYWJzKGExMSAtIGIxMSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTExKSwgTWF0aC5hYnMoYjExKSkgJiYgTWF0aC5hYnMoYTEyIC0gYjEyKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTIpLCBNYXRoLmFicyhiMTIpKSAmJiBNYXRoLmFicyhhMTMgLSBiMTMpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGExMyksIE1hdGguYWJzKGIxMykpICYmIE1hdGguYWJzKGExNCAtIGIxNCkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTE0KSwgTWF0aC5hYnMoYjE0KSkgJiYgTWF0aC5hYnMoYTE1IC0gYjE1KSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMTUpLCBNYXRoLmFicyhiMTUpKTtcbn1cbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDQubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBtdWwgPSBtdWx0aXBseTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIG1hdDQuc3VidHJhY3R9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBzdWIgPSBzdWJ0cmFjdDsiLCJpbXBvcnQgKiBhcyBnbE1hdHJpeCBmcm9tIFwiLi9jb21tb24uanNcIjtcbi8qKlxyXG4gKiAzIERpbWVuc2lvbmFsIFZlY3RvclxyXG4gKiBAbW9kdWxlIHZlYzNcclxuICovXG5cbi8qKlxyXG4gKiBDcmVhdGVzIGEgbmV3LCBlbXB0eSB2ZWMzXHJcbiAqXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBhIG5ldyAzRCB2ZWN0b3JcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcmVhdGUoKSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcblxuICBpZiAoZ2xNYXRyaXguQVJSQVlfVFlQRSAhPSBGbG9hdDMyQXJyYXkpIHtcbiAgICBvdXRbMF0gPSAwO1xuICAgIG91dFsxXSA9IDA7XG4gICAgb3V0WzJdID0gMDtcbiAgfVxuXG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdmFsdWVzIGZyb20gYW4gZXhpc3RpbmcgdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2xvbmVcclxuICogQHJldHVybnMge3ZlYzN9IGEgbmV3IDNEIHZlY3RvclxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGNsb25lKGEpIHtcbiAgdmFyIG91dCA9IG5ldyBnbE1hdHJpeC5BUlJBWV9UWVBFKDMpO1xuICBvdXRbMF0gPSBhWzBdO1xuICBvdXRbMV0gPSBhWzFdO1xuICBvdXRbMl0gPSBhWzJdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGxlbmd0aCBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBjYWxjdWxhdGUgbGVuZ3RoIG9mXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IGxlbmd0aCBvZiBhXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gbGVuZ3RoKGEpIHtcbiAgdmFyIHggPSBhWzBdO1xuICB2YXIgeSA9IGFbMV07XG4gIHZhciB6ID0gYVsyXTtcbiAgcmV0dXJuIE1hdGguaHlwb3QoeCwgeSwgeik7XG59XG4vKipcclxuICogQ3JlYXRlcyBhIG5ldyB2ZWMzIGluaXRpYWxpemVkIHdpdGggdGhlIGdpdmVuIHZhbHVlc1xyXG4gKlxyXG4gKiBAcGFyYW0ge051bWJlcn0geCBYIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geSBZIGNvbXBvbmVudFxyXG4gKiBAcGFyYW0ge051bWJlcn0geiBaIGNvbXBvbmVudFxyXG4gKiBAcmV0dXJucyB7dmVjM30gYSBuZXcgM0QgdmVjdG9yXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZnJvbVZhbHVlcyh4LCB5LCB6KSB7XG4gIHZhciBvdXQgPSBuZXcgZ2xNYXRyaXguQVJSQVlfVFlQRSgzKTtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBDb3B5IHRoZSB2YWx1ZXMgZnJvbSBvbmUgdmVjMyB0byBhbm90aGVyXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgc291cmNlIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY29weShvdXQsIGEpIHtcbiAgb3V0WzBdID0gYVswXTtcbiAgb3V0WzFdID0gYVsxXTtcbiAgb3V0WzJdID0gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBTZXQgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzIHRvIHRoZSBnaXZlbiB2YWx1ZXNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IHggWCBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHkgWSBjb21wb25lbnRcclxuICogQHBhcmFtIHtOdW1iZXJ9IHogWiBjb21wb25lbnRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHNldChvdXQsIHgsIHksIHopIHtcbiAgb3V0WzBdID0geDtcbiAgb3V0WzFdID0geTtcbiAgb3V0WzJdID0gejtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBBZGRzIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGFkZChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSArIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBTdWJ0cmFjdHMgdmVjdG9yIGIgZnJvbSB2ZWN0b3IgYVxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3VidHJhY3Qob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gLSBiWzBdO1xuICBvdXRbMV0gPSBhWzFdIC0gYlsxXTtcbiAgb3V0WzJdID0gYVsyXSAtIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogTXVsdGlwbGllcyB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBtdWx0aXBseShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAqIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gKiBiWzFdO1xuICBvdXRbMl0gPSBhWzJdICogYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBEaXZpZGVzIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGRpdmlkZShvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gYVswXSAvIGJbMF07XG4gIG91dFsxXSA9IGFbMV0gLyBiWzFdO1xuICBvdXRbMl0gPSBhWzJdIC8gYlsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNYXRoLmNlaWwgdGhlIGNvbXBvbmVudHMgb2YgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gY2VpbFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gY2VpbChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5jZWlsKGFbMF0pO1xuICBvdXRbMV0gPSBNYXRoLmNlaWwoYVsxXSk7XG4gIG91dFsyXSA9IE1hdGguY2VpbChhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNYXRoLmZsb29yIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGZsb29yXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBmbG9vcihvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5mbG9vcihhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5mbG9vcihhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5mbG9vcihhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtaW5pbXVtIG9mIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG1pbihvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5taW4oYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWluKGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1pbihhWzJdLCBiWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBtYXhpbXVtIG9mIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG1heChvdXQsIGEsIGIpIHtcbiAgb3V0WzBdID0gTWF0aC5tYXgoYVswXSwgYlswXSk7XG4gIG91dFsxXSA9IE1hdGgubWF4KGFbMV0sIGJbMV0pO1xuICBvdXRbMl0gPSBNYXRoLm1heChhWzJdLCBiWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBNYXRoLnJvdW5kIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIHJvdW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByb3VuZChvdXQsIGEpIHtcbiAgb3V0WzBdID0gTWF0aC5yb3VuZChhWzBdKTtcbiAgb3V0WzFdID0gTWF0aC5yb3VuZChhWzFdKTtcbiAgb3V0WzJdID0gTWF0aC5yb3VuZChhWzJdKTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBTY2FsZXMgYSB2ZWMzIGJ5IGEgc2NhbGFyIG51bWJlclxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byBzY2FsZVxyXG4gKiBAcGFyYW0ge051bWJlcn0gYiBhbW91bnQgdG8gc2NhbGUgdGhlIHZlY3RvciBieVxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGUob3V0LCBhLCBiKSB7XG4gIG91dFswXSA9IGFbMF0gKiBiO1xuICBvdXRbMV0gPSBhWzFdICogYjtcbiAgb3V0WzJdID0gYVsyXSAqIGI7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQWRkcyB0d28gdmVjMydzIGFmdGVyIHNjYWxpbmcgdGhlIHNlY29uZCBvcGVyYW5kIGJ5IGEgc2NhbGFyIHZhbHVlXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzY2FsZSB0aGUgYW1vdW50IHRvIHNjYWxlIGIgYnkgYmVmb3JlIGFkZGluZ1xyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc2NhbGVBbmRBZGQob3V0LCBhLCBiLCBzY2FsZSkge1xuICBvdXRbMF0gPSBhWzBdICsgYlswXSAqIHNjYWxlO1xuICBvdXRbMV0gPSBhWzFdICsgYlsxXSAqIHNjYWxlO1xuICBvdXRbMl0gPSBhWzJdICsgYlsyXSAqIHNjYWxlO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gZGlzdGFuY2UgYmV0d2VlbiBhIGFuZCBiXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdO1xuICB2YXIgeSA9IGJbMV0gLSBhWzFdO1xuICB2YXIgeiA9IGJbMl0gLSBhWzJdO1xuICByZXR1cm4gTWF0aC5oeXBvdCh4LCB5LCB6KTtcbn1cbi8qKlxyXG4gKiBDYWxjdWxhdGVzIHRoZSBzcXVhcmVkIGV1Y2xpZGlhbiBkaXN0YW5jZSBiZXR3ZWVuIHR3byB2ZWMzJ3NcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSBmaXJzdCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYiB0aGUgc2Vjb25kIG9wZXJhbmRcclxuICogQHJldHVybnMge051bWJlcn0gc3F1YXJlZCBkaXN0YW5jZSBiZXR3ZWVuIGEgYW5kIGJcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBzcXVhcmVkRGlzdGFuY2UoYSwgYikge1xuICB2YXIgeCA9IGJbMF0gLSBhWzBdO1xuICB2YXIgeSA9IGJbMV0gLSBhWzFdO1xuICB2YXIgeiA9IGJbMl0gLSBhWzJdO1xuICByZXR1cm4geCAqIHggKyB5ICogeSArIHogKiB6O1xufVxuLyoqXHJcbiAqIENhbGN1bGF0ZXMgdGhlIHNxdWFyZWQgbGVuZ3RoIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGNhbGN1bGF0ZSBzcXVhcmVkIGxlbmd0aCBvZlxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBzcXVhcmVkIGxlbmd0aCBvZiBhXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3F1YXJlZExlbmd0aChhKSB7XG4gIHZhciB4ID0gYVswXTtcbiAgdmFyIHkgPSBhWzFdO1xuICB2YXIgeiA9IGFbMl07XG4gIHJldHVybiB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG59XG4vKipcclxuICogTmVnYXRlcyB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzNcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHZlY3RvciB0byBuZWdhdGVcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIG5lZ2F0ZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gLWFbMF07XG4gIG91dFsxXSA9IC1hWzFdO1xuICBvdXRbMl0gPSAtYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHRoZSBpbnZlcnNlIG9mIHRoZSBjb21wb25lbnRzIG9mIGEgdmVjM1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdmVjdG9yIHRvIGludmVydFxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gaW52ZXJzZShvdXQsIGEpIHtcbiAgb3V0WzBdID0gMS4wIC8gYVswXTtcbiAgb3V0WzFdID0gMS4wIC8gYVsxXTtcbiAgb3V0WzJdID0gMS4wIC8gYVsyXTtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBOb3JtYWxpemUgYSB2ZWMzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gbm9ybWFsaXplXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBub3JtYWxpemUob3V0LCBhKSB7XG4gIHZhciB4ID0gYVswXTtcbiAgdmFyIHkgPSBhWzFdO1xuICB2YXIgeiA9IGFbMl07XG4gIHZhciBsZW4gPSB4ICogeCArIHkgKiB5ICsgeiAqIHo7XG5cbiAgaWYgKGxlbiA+IDApIHtcbiAgICAvL1RPRE86IGV2YWx1YXRlIHVzZSBvZiBnbG1faW52c3FydCBoZXJlP1xuICAgIGxlbiA9IDEgLyBNYXRoLnNxcnQobGVuKTtcbiAgfVxuXG4gIG91dFswXSA9IGFbMF0gKiBsZW47XG4gIG91dFsxXSA9IGFbMV0gKiBsZW47XG4gIG91dFsyXSA9IGFbMl0gKiBsZW47XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogQ2FsY3VsYXRlcyB0aGUgZG90IHByb2R1Y3Qgb2YgdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcmV0dXJucyB7TnVtYmVyfSBkb3QgcHJvZHVjdCBvZiBhIGFuZCBiXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZG90KGEsIGIpIHtcbiAgcmV0dXJuIGFbMF0gKiBiWzBdICsgYVsxXSAqIGJbMV0gKyBhWzJdICogYlsyXTtcbn1cbi8qKlxyXG4gKiBDb21wdXRlcyB0aGUgY3Jvc3MgcHJvZHVjdCBvZiB0d28gdmVjMydzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBjcm9zcyhvdXQsIGEsIGIpIHtcbiAgdmFyIGF4ID0gYVswXSxcbiAgICAgIGF5ID0gYVsxXSxcbiAgICAgIGF6ID0gYVsyXTtcbiAgdmFyIGJ4ID0gYlswXSxcbiAgICAgIGJ5ID0gYlsxXSxcbiAgICAgIGJ6ID0gYlsyXTtcbiAgb3V0WzBdID0gYXkgKiBieiAtIGF6ICogYnk7XG4gIG91dFsxXSA9IGF6ICogYnggLSBheCAqIGJ6O1xuICBvdXRbMl0gPSBheCAqIGJ5IC0gYXkgKiBieDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGxpbmVhciBpbnRlcnBvbGF0aW9uIGJldHdlZW4gdHdvIHZlYzMnc1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIGZpcnN0IG9wZXJhbmRcclxuICogQHBhcmFtIHt2ZWMzfSBiIHRoZSBzZWNvbmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge051bWJlcn0gdCBpbnRlcnBvbGF0aW9uIGFtb3VudCwgaW4gdGhlIHJhbmdlIFswLTFdLCBiZXR3ZWVuIHRoZSB0d28gaW5wdXRzXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiBsZXJwKG91dCwgYSwgYiwgdCkge1xuICB2YXIgYXggPSBhWzBdO1xuICB2YXIgYXkgPSBhWzFdO1xuICB2YXIgYXogPSBhWzJdO1xuICBvdXRbMF0gPSBheCArIHQgKiAoYlswXSAtIGF4KTtcbiAgb3V0WzFdID0gYXkgKyB0ICogKGJbMV0gLSBheSk7XG4gIG91dFsyXSA9IGF6ICsgdCAqIChiWzJdIC0gYXopO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFBlcmZvcm1zIGEgaGVybWl0ZSBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGhlcm1pdGUob3V0LCBhLCBiLCBjLCBkLCB0KSB7XG4gIHZhciBmYWN0b3JUaW1lczIgPSB0ICogdDtcbiAgdmFyIGZhY3RvcjEgPSBmYWN0b3JUaW1lczIgKiAoMiAqIHQgLSAzKSArIDE7XG4gIHZhciBmYWN0b3IyID0gZmFjdG9yVGltZXMyICogKHQgLSAyKSArIHQ7XG4gIHZhciBmYWN0b3IzID0gZmFjdG9yVGltZXMyICogKHQgLSAxKTtcbiAgdmFyIGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiAoMyAtIDIgKiB0KTtcbiAgb3V0WzBdID0gYVswXSAqIGZhY3RvcjEgKyBiWzBdICogZmFjdG9yMiArIGNbMF0gKiBmYWN0b3IzICsgZFswXSAqIGZhY3RvcjQ7XG4gIG91dFsxXSA9IGFbMV0gKiBmYWN0b3IxICsgYlsxXSAqIGZhY3RvcjIgKyBjWzFdICogZmFjdG9yMyArIGRbMV0gKiBmYWN0b3I0O1xuICBvdXRbMl0gPSBhWzJdICogZmFjdG9yMSArIGJbMl0gKiBmYWN0b3IyICsgY1syXSAqIGZhY3RvcjMgKyBkWzJdICogZmFjdG9yNDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBQZXJmb3JtcyBhIGJlemllciBpbnRlcnBvbGF0aW9uIHdpdGggdHdvIGNvbnRyb2wgcG9pbnRzXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgdGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7dmVjM30gYyB0aGUgdGhpcmQgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGQgdGhlIGZvdXJ0aCBvcGVyYW5kXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSB0IGludGVycG9sYXRpb24gYW1vdW50LCBpbiB0aGUgcmFuZ2UgWzAtMV0sIGJldHdlZW4gdGhlIHR3byBpbnB1dHNcclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGJlemllcihvdXQsIGEsIGIsIGMsIGQsIHQpIHtcbiAgdmFyIGludmVyc2VGYWN0b3IgPSAxIC0gdDtcbiAgdmFyIGludmVyc2VGYWN0b3JUaW1lc1R3byA9IGludmVyc2VGYWN0b3IgKiBpbnZlcnNlRmFjdG9yO1xuICB2YXIgZmFjdG9yVGltZXMyID0gdCAqIHQ7XG4gIHZhciBmYWN0b3IxID0gaW52ZXJzZUZhY3RvclRpbWVzVHdvICogaW52ZXJzZUZhY3RvcjtcbiAgdmFyIGZhY3RvcjIgPSAzICogdCAqIGludmVyc2VGYWN0b3JUaW1lc1R3bztcbiAgdmFyIGZhY3RvcjMgPSAzICogZmFjdG9yVGltZXMyICogaW52ZXJzZUZhY3RvcjtcbiAgdmFyIGZhY3RvcjQgPSBmYWN0b3JUaW1lczIgKiB0O1xuICBvdXRbMF0gPSBhWzBdICogZmFjdG9yMSArIGJbMF0gKiBmYWN0b3IyICsgY1swXSAqIGZhY3RvcjMgKyBkWzBdICogZmFjdG9yNDtcbiAgb3V0WzFdID0gYVsxXSAqIGZhY3RvcjEgKyBiWzFdICogZmFjdG9yMiArIGNbMV0gKiBmYWN0b3IzICsgZFsxXSAqIGZhY3RvcjQ7XG4gIG91dFsyXSA9IGFbMl0gKiBmYWN0b3IxICsgYlsyXSAqIGZhY3RvcjIgKyBjWzJdICogZmFjdG9yMyArIGRbMl0gKiBmYWN0b3I0O1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIEdlbmVyYXRlcyBhIHJhbmRvbSB2ZWN0b3Igd2l0aCB0aGUgZ2l2ZW4gc2NhbGVcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHtOdW1iZXJ9IFtzY2FsZV0gTGVuZ3RoIG9mIHRoZSByZXN1bHRpbmcgdmVjdG9yLiBJZiBvbW1pdHRlZCwgYSB1bml0IHZlY3RvciB3aWxsIGJlIHJldHVybmVkXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiByYW5kb20ob3V0LCBzY2FsZSkge1xuICBzY2FsZSA9IHNjYWxlIHx8IDEuMDtcbiAgdmFyIHIgPSBnbE1hdHJpeC5SQU5ET00oKSAqIDIuMCAqIE1hdGguUEk7XG4gIHZhciB6ID0gZ2xNYXRyaXguUkFORE9NKCkgKiAyLjAgLSAxLjA7XG4gIHZhciB6U2NhbGUgPSBNYXRoLnNxcnQoMS4wIC0geiAqIHopICogc2NhbGU7XG4gIG91dFswXSA9IE1hdGguY29zKHIpICogelNjYWxlO1xuICBvdXRbMV0gPSBNYXRoLnNpbihyKSAqIHpTY2FsZTtcbiAgb3V0WzJdID0geiAqIHNjYWxlO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIG1hdDQuXHJcbiAqIDR0aCB2ZWN0b3IgY29tcG9uZW50IGlzIGltcGxpY2l0bHkgJzEnXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IHRoZSByZWNlaXZpbmcgdmVjdG9yXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB0aGUgdmVjdG9yIHRvIHRyYW5zZm9ybVxyXG4gKiBAcGFyYW0ge21hdDR9IG0gbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQ0KG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdO1xuICB2YXIgdyA9IG1bM10gKiB4ICsgbVs3XSAqIHkgKyBtWzExXSAqIHogKyBtWzE1XTtcbiAgdyA9IHcgfHwgMS4wO1xuICBvdXRbMF0gPSAobVswXSAqIHggKyBtWzRdICogeSArIG1bOF0gKiB6ICsgbVsxMl0pIC8gdztcbiAgb3V0WzFdID0gKG1bMV0gKiB4ICsgbVs1XSAqIHkgKyBtWzldICogeiArIG1bMTNdKSAvIHc7XG4gIG91dFsyXSA9IChtWzJdICogeCArIG1bNl0gKiB5ICsgbVsxMF0gKiB6ICsgbVsxNF0pIC8gdztcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBUcmFuc2Zvcm1zIHRoZSB2ZWMzIHdpdGggYSBtYXQzLlxyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgdGhlIHZlY3RvciB0byB0cmFuc2Zvcm1cclxuICogQHBhcmFtIHttYXQzfSBtIHRoZSAzeDMgbWF0cml4IHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1NYXQzKG91dCwgYSwgbSkge1xuICB2YXIgeCA9IGFbMF0sXG4gICAgICB5ID0gYVsxXSxcbiAgICAgIHogPSBhWzJdO1xuICBvdXRbMF0gPSB4ICogbVswXSArIHkgKiBtWzNdICsgeiAqIG1bNl07XG4gIG91dFsxXSA9IHggKiBtWzFdICsgeSAqIG1bNF0gKyB6ICogbVs3XTtcbiAgb3V0WzJdID0geCAqIG1bMl0gKyB5ICogbVs1XSArIHogKiBtWzhdO1xuICByZXR1cm4gb3V0O1xufVxuLyoqXHJcbiAqIFRyYW5zZm9ybXMgdGhlIHZlYzMgd2l0aCBhIHF1YXRcclxuICogQ2FuIGFsc28gYmUgdXNlZCBmb3IgZHVhbCBxdWF0ZXJuaW9ucy4gKE11bHRpcGx5IGl0IHdpdGggdGhlIHJlYWwgcGFydClcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBvdXQgdGhlIHJlY2VpdmluZyB2ZWN0b3JcclxuICogQHBhcmFtIHt2ZWMzfSBhIHRoZSB2ZWN0b3IgdG8gdHJhbnNmb3JtXHJcbiAqIEBwYXJhbSB7cXVhdH0gcSBxdWF0ZXJuaW9uIHRvIHRyYW5zZm9ybSB3aXRoXHJcbiAqIEByZXR1cm5zIHt2ZWMzfSBvdXRcclxuICovXG5cbmV4cG9ydCBmdW5jdGlvbiB0cmFuc2Zvcm1RdWF0KG91dCwgYSwgcSkge1xuICAvLyBiZW5jaG1hcmtzOiBodHRwczovL2pzcGVyZi5jb20vcXVhdGVybmlvbi10cmFuc2Zvcm0tdmVjMy1pbXBsZW1lbnRhdGlvbnMtZml4ZWRcbiAgdmFyIHF4ID0gcVswXSxcbiAgICAgIHF5ID0gcVsxXSxcbiAgICAgIHF6ID0gcVsyXSxcbiAgICAgIHF3ID0gcVszXTtcbiAgdmFyIHggPSBhWzBdLFxuICAgICAgeSA9IGFbMV0sXG4gICAgICB6ID0gYVsyXTsgLy8gdmFyIHF2ZWMgPSBbcXgsIHF5LCBxel07XG4gIC8vIHZhciB1diA9IHZlYzMuY3Jvc3MoW10sIHF2ZWMsIGEpO1xuXG4gIHZhciB1dnggPSBxeSAqIHogLSBxeiAqIHksXG4gICAgICB1dnkgPSBxeiAqIHggLSBxeCAqIHosXG4gICAgICB1dnogPSBxeCAqIHkgLSBxeSAqIHg7IC8vIHZhciB1dXYgPSB2ZWMzLmNyb3NzKFtdLCBxdmVjLCB1dik7XG5cbiAgdmFyIHV1dnggPSBxeSAqIHV2eiAtIHF6ICogdXZ5LFxuICAgICAgdXV2eSA9IHF6ICogdXZ4IC0gcXggKiB1dnosXG4gICAgICB1dXZ6ID0gcXggKiB1dnkgLSBxeSAqIHV2eDsgLy8gdmVjMy5zY2FsZSh1diwgdXYsIDIgKiB3KTtcblxuICB2YXIgdzIgPSBxdyAqIDI7XG4gIHV2eCAqPSB3MjtcbiAgdXZ5ICo9IHcyO1xuICB1dnogKj0gdzI7IC8vIHZlYzMuc2NhbGUodXV2LCB1dXYsIDIpO1xuXG4gIHV1dnggKj0gMjtcbiAgdXV2eSAqPSAyO1xuICB1dXZ6ICo9IDI7IC8vIHJldHVybiB2ZWMzLmFkZChvdXQsIGEsIHZlYzMuYWRkKG91dCwgdXYsIHV1dikpO1xuXG4gIG91dFswXSA9IHggKyB1dnggKyB1dXZ4O1xuICBvdXRbMV0gPSB5ICsgdXZ5ICsgdXV2eTtcbiAgb3V0WzJdID0geiArIHV2eiArIHV1dno7XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeC1heGlzXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVgob3V0LCBhLCBiLCBjKSB7XG4gIHZhciBwID0gW10sXG4gICAgICByID0gW107IC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdOyAvL3BlcmZvcm0gcm90YXRpb25cblxuICByWzBdID0gcFswXTtcbiAgclsxXSA9IHBbMV0gKiBNYXRoLmNvcyhjKSAtIHBbMl0gKiBNYXRoLnNpbihjKTtcbiAgclsyXSA9IHBbMV0gKiBNYXRoLnNpbihjKSArIHBbMl0gKiBNYXRoLmNvcyhjKTsgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgeS1heGlzXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVkob3V0LCBhLCBiLCBjKSB7XG4gIHZhciBwID0gW10sXG4gICAgICByID0gW107IC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdOyAvL3BlcmZvcm0gcm90YXRpb25cblxuICByWzBdID0gcFsyXSAqIE1hdGguc2luKGMpICsgcFswXSAqIE1hdGguY29zKGMpO1xuICByWzFdID0gcFsxXTtcbiAgclsyXSA9IHBbMl0gKiBNYXRoLmNvcyhjKSAtIHBbMF0gKiBNYXRoLnNpbihjKTsgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogUm90YXRlIGEgM0QgdmVjdG9yIGFyb3VuZCB0aGUgei1heGlzXHJcbiAqIEBwYXJhbSB7dmVjM30gb3V0IFRoZSByZWNlaXZpbmcgdmVjM1xyXG4gKiBAcGFyYW0ge3ZlYzN9IGEgVGhlIHZlYzMgcG9pbnQgdG8gcm90YXRlXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgb3JpZ2luIG9mIHRoZSByb3RhdGlvblxyXG4gKiBAcGFyYW0ge051bWJlcn0gYyBUaGUgYW5nbGUgb2Ygcm90YXRpb25cclxuICogQHJldHVybnMge3ZlYzN9IG91dFxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIHJvdGF0ZVoob3V0LCBhLCBiLCBjKSB7XG4gIHZhciBwID0gW10sXG4gICAgICByID0gW107IC8vVHJhbnNsYXRlIHBvaW50IHRvIHRoZSBvcmlnaW5cblxuICBwWzBdID0gYVswXSAtIGJbMF07XG4gIHBbMV0gPSBhWzFdIC0gYlsxXTtcbiAgcFsyXSA9IGFbMl0gLSBiWzJdOyAvL3BlcmZvcm0gcm90YXRpb25cblxuICByWzBdID0gcFswXSAqIE1hdGguY29zKGMpIC0gcFsxXSAqIE1hdGguc2luKGMpO1xuICByWzFdID0gcFswXSAqIE1hdGguc2luKGMpICsgcFsxXSAqIE1hdGguY29zKGMpO1xuICByWzJdID0gcFsyXTsgLy90cmFuc2xhdGUgdG8gY29ycmVjdCBwb3NpdGlvblxuXG4gIG91dFswXSA9IHJbMF0gKyBiWzBdO1xuICBvdXRbMV0gPSByWzFdICsgYlsxXTtcbiAgb3V0WzJdID0gclsyXSArIGJbMl07XG4gIHJldHVybiBvdXQ7XG59XG4vKipcclxuICogR2V0IHRoZSBhbmdsZSBiZXR3ZWVuIHR3byAzRCB2ZWN0b3JzXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3Qgb3BlcmFuZFxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCBvcGVyYW5kXHJcbiAqIEByZXR1cm5zIHtOdW1iZXJ9IFRoZSBhbmdsZSBpbiByYWRpYW5zXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gYW5nbGUoYSwgYikge1xuICB2YXIgdGVtcEEgPSBmcm9tVmFsdWVzKGFbMF0sIGFbMV0sIGFbMl0pO1xuICB2YXIgdGVtcEIgPSBmcm9tVmFsdWVzKGJbMF0sIGJbMV0sIGJbMl0pO1xuICBub3JtYWxpemUodGVtcEEsIHRlbXBBKTtcbiAgbm9ybWFsaXplKHRlbXBCLCB0ZW1wQik7XG4gIHZhciBjb3NpbmUgPSBkb3QodGVtcEEsIHRlbXBCKTtcblxuICBpZiAoY29zaW5lID4gMS4wKSB7XG4gICAgcmV0dXJuIDA7XG4gIH0gZWxzZSBpZiAoY29zaW5lIDwgLTEuMCkge1xuICAgIHJldHVybiBNYXRoLlBJO1xuICB9IGVsc2Uge1xuICAgIHJldHVybiBNYXRoLmFjb3MoY29zaW5lKTtcbiAgfVxufVxuLyoqXHJcbiAqIFNldCB0aGUgY29tcG9uZW50cyBvZiBhIHZlYzMgdG8gemVyb1xyXG4gKlxyXG4gKiBAcGFyYW0ge3ZlYzN9IG91dCB0aGUgcmVjZWl2aW5nIHZlY3RvclxyXG4gKiBAcmV0dXJucyB7dmVjM30gb3V0XHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gemVybyhvdXQpIHtcbiAgb3V0WzBdID0gMC4wO1xuICBvdXRbMV0gPSAwLjA7XG4gIG91dFsyXSA9IDAuMDtcbiAgcmV0dXJuIG91dDtcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIGEgc3RyaW5nIHJlcHJlc2VudGF0aW9uIG9mIGEgdmVjdG9yXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSB2ZWN0b3IgdG8gcmVwcmVzZW50IGFzIGEgc3RyaW5nXHJcbiAqIEByZXR1cm5zIHtTdHJpbmd9IHN0cmluZyByZXByZXNlbnRhdGlvbiBvZiB0aGUgdmVjdG9yXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gc3RyKGEpIHtcbiAgcmV0dXJuICd2ZWMzKCcgKyBhWzBdICsgJywgJyArIGFbMV0gKyAnLCAnICsgYVsyXSArICcpJztcbn1cbi8qKlxyXG4gKiBSZXR1cm5zIHdoZXRoZXIgb3Igbm90IHRoZSB2ZWN0b3JzIGhhdmUgZXhhY3RseSB0aGUgc2FtZSBlbGVtZW50cyBpbiB0aGUgc2FtZSBwb3NpdGlvbiAod2hlbiBjb21wYXJlZCB3aXRoID09PSlcclxuICpcclxuICogQHBhcmFtIHt2ZWMzfSBhIFRoZSBmaXJzdCB2ZWN0b3IuXHJcbiAqIEBwYXJhbSB7dmVjM30gYiBUaGUgc2Vjb25kIHZlY3Rvci5cclxuICogQHJldHVybnMge0Jvb2xlYW59IFRydWUgaWYgdGhlIHZlY3RvcnMgYXJlIGVxdWFsLCBmYWxzZSBvdGhlcndpc2UuXHJcbiAqL1xuXG5leHBvcnQgZnVuY3Rpb24gZXhhY3RFcXVhbHMoYSwgYikge1xuICByZXR1cm4gYVswXSA9PT0gYlswXSAmJiBhWzFdID09PSBiWzFdICYmIGFbMl0gPT09IGJbMl07XG59XG4vKipcclxuICogUmV0dXJucyB3aGV0aGVyIG9yIG5vdCB0aGUgdmVjdG9ycyBoYXZlIGFwcHJveGltYXRlbHkgdGhlIHNhbWUgZWxlbWVudHMgaW4gdGhlIHNhbWUgcG9zaXRpb24uXHJcbiAqXHJcbiAqIEBwYXJhbSB7dmVjM30gYSBUaGUgZmlyc3QgdmVjdG9yLlxyXG4gKiBAcGFyYW0ge3ZlYzN9IGIgVGhlIHNlY29uZCB2ZWN0b3IuXHJcbiAqIEByZXR1cm5zIHtCb29sZWFufSBUcnVlIGlmIHRoZSB2ZWN0b3JzIGFyZSBlcXVhbCwgZmFsc2Ugb3RoZXJ3aXNlLlxyXG4gKi9cblxuZXhwb3J0IGZ1bmN0aW9uIGVxdWFscyhhLCBiKSB7XG4gIHZhciBhMCA9IGFbMF0sXG4gICAgICBhMSA9IGFbMV0sXG4gICAgICBhMiA9IGFbMl07XG4gIHZhciBiMCA9IGJbMF0sXG4gICAgICBiMSA9IGJbMV0sXG4gICAgICBiMiA9IGJbMl07XG4gIHJldHVybiBNYXRoLmFicyhhMCAtIGIwKSA8PSBnbE1hdHJpeC5FUFNJTE9OICogTWF0aC5tYXgoMS4wLCBNYXRoLmFicyhhMCksIE1hdGguYWJzKGIwKSkgJiYgTWF0aC5hYnMoYTEgLSBiMSkgPD0gZ2xNYXRyaXguRVBTSUxPTiAqIE1hdGgubWF4KDEuMCwgTWF0aC5hYnMoYTEpLCBNYXRoLmFicyhiMSkpICYmIE1hdGguYWJzKGEyIC0gYjIpIDw9IGdsTWF0cml4LkVQU0lMT04gKiBNYXRoLm1heCgxLjAsIE1hdGguYWJzKGEyKSwgTWF0aC5hYnMoYjIpKTtcbn1cbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3VidHJhY3R9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBzdWIgPSBzdWJ0cmFjdDtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubXVsdGlwbHl9XHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBtdWwgPSBtdWx0aXBseTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuZGl2aWRlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgZGl2ID0gZGl2aWRlO1xuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5kaXN0YW5jZX1cclxuICogQGZ1bmN0aW9uXHJcbiAqL1xuXG5leHBvcnQgdmFyIGRpc3QgPSBkaXN0YW5jZTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMuc3F1YXJlZERpc3RhbmNlfVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgc3FyRGlzdCA9IHNxdWFyZWREaXN0YW5jZTtcbi8qKlxyXG4gKiBBbGlhcyBmb3Ige0BsaW5rIHZlYzMubGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgbGVuID0gbGVuZ3RoO1xuLyoqXHJcbiAqIEFsaWFzIGZvciB7QGxpbmsgdmVjMy5zcXVhcmVkTGVuZ3RofVxyXG4gKiBAZnVuY3Rpb25cclxuICovXG5cbmV4cG9ydCB2YXIgc3FyTGVuID0gc3F1YXJlZExlbmd0aDtcbi8qKlxyXG4gKiBQZXJmb3JtIHNvbWUgb3BlcmF0aW9uIG92ZXIgYW4gYXJyYXkgb2YgdmVjM3MuXHJcbiAqXHJcbiAqIEBwYXJhbSB7QXJyYXl9IGEgdGhlIGFycmF5IG9mIHZlY3RvcnMgdG8gaXRlcmF0ZSBvdmVyXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBzdHJpZGUgTnVtYmVyIG9mIGVsZW1lbnRzIGJldHdlZW4gdGhlIHN0YXJ0IG9mIGVhY2ggdmVjMy4gSWYgMCBhc3N1bWVzIHRpZ2h0bHkgcGFja2VkXHJcbiAqIEBwYXJhbSB7TnVtYmVyfSBvZmZzZXQgTnVtYmVyIG9mIGVsZW1lbnRzIHRvIHNraXAgYXQgdGhlIGJlZ2lubmluZyBvZiB0aGUgYXJyYXlcclxuICogQHBhcmFtIHtOdW1iZXJ9IGNvdW50IE51bWJlciBvZiB2ZWMzcyB0byBpdGVyYXRlIG92ZXIuIElmIDAgaXRlcmF0ZXMgb3ZlciBlbnRpcmUgYXJyYXlcclxuICogQHBhcmFtIHtGdW5jdGlvbn0gZm4gRnVuY3Rpb24gdG8gY2FsbCBmb3IgZWFjaCB2ZWN0b3IgaW4gdGhlIGFycmF5XHJcbiAqIEBwYXJhbSB7T2JqZWN0fSBbYXJnXSBhZGRpdGlvbmFsIGFyZ3VtZW50IHRvIHBhc3MgdG8gZm5cclxuICogQHJldHVybnMge0FycmF5fSBhXHJcbiAqIEBmdW5jdGlvblxyXG4gKi9cblxuZXhwb3J0IHZhciBmb3JFYWNoID0gZnVuY3Rpb24gKCkge1xuICB2YXIgdmVjID0gY3JlYXRlKCk7XG4gIHJldHVybiBmdW5jdGlvbiAoYSwgc3RyaWRlLCBvZmZzZXQsIGNvdW50LCBmbiwgYXJnKSB7XG4gICAgdmFyIGksIGw7XG5cbiAgICBpZiAoIXN0cmlkZSkge1xuICAgICAgc3RyaWRlID0gMztcbiAgICB9XG5cbiAgICBpZiAoIW9mZnNldCkge1xuICAgICAgb2Zmc2V0ID0gMDtcbiAgICB9XG5cbiAgICBpZiAoY291bnQpIHtcbiAgICAgIGwgPSBNYXRoLm1pbihjb3VudCAqIHN0cmlkZSArIG9mZnNldCwgYS5sZW5ndGgpO1xuICAgIH0gZWxzZSB7XG4gICAgICBsID0gYS5sZW5ndGg7XG4gICAgfVxuXG4gICAgZm9yIChpID0gb2Zmc2V0OyBpIDwgbDsgaSArPSBzdHJpZGUpIHtcbiAgICAgIHZlY1swXSA9IGFbaV07XG4gICAgICB2ZWNbMV0gPSBhW2kgKyAxXTtcbiAgICAgIHZlY1syXSA9IGFbaSArIDJdO1xuICAgICAgZm4odmVjLCB2ZWMsIGFyZyk7XG4gICAgICBhW2ldID0gdmVjWzBdO1xuICAgICAgYVtpICsgMV0gPSB2ZWNbMV07XG4gICAgICBhW2kgKyAyXSA9IHZlY1syXTtcbiAgICB9XG5cbiAgICByZXR1cm4gYTtcbiAgfTtcbn0oKTsiLCJleHBvcnQgY29uc3QgbWVyZ2UgPSAoLi4ucHJvcHMpID0+IHtcbiAgICBjb25zb2xlLmxvZygnbWVyZ2UnLCBwcm9wcyk7XG5cbiAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICBjb25zdCBpbmRpY2VzID0gW107XG4gICAgY29uc3Qgbm9ybWFscyA9IFtdO1xuICAgIGNvbnN0IHV2cyA9IFtdO1xuXG4gICAgcmV0dXJuIHtcbiAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICBpbmRpY2VzLFxuICAgICAgICBub3JtYWxzLFxuICAgICAgICB1dnMsXG4gICAgfTtcbn07XG4iLCJjbGFzcyBNb2RpZnkge1xuICAgIHN0YXRpYyBnZXREYXRhID0gKGluZGV4LCBzdGVwLCBhcnJheSkgPT4ge1xuICAgICAgICBjb25zdCBpID0gaW5kZXggKiBzdGVwO1xuICAgICAgICBjb25zdCBkYXRhID0gW107XG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgc3RlcDsgaisrKSB7XG4gICAgICAgICAgICBkYXRhLnB1c2goYXJyYXlbaSArIGpdKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiBkYXRhO1xuICAgIH07XG5cbiAgICBzdGF0aWMgZGV0YWNoID0gZ2VvbWV0cnkgPT4ge1xuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3Qgbm9ybWFscyA9IFtdO1xuICAgICAgICBjb25zdCB1dnMgPSBbXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGdlb21ldHJ5LmluZGljZXMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIGNvbnN0IGZhID0gZ2VvbWV0cnkuaW5kaWNlc1tpICsgMF07XG4gICAgICAgICAgICBjb25zdCBmYiA9IGdlb21ldHJ5LmluZGljZXNbaSArIDFdO1xuICAgICAgICAgICAgY29uc3QgZmMgPSBnZW9tZXRyeS5pbmRpY2VzW2kgKyAyXTtcblxuICAgICAgICAgICAgLy8gZ2V0cyBmYWNlc1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmEsIDMsIGdlb21ldHJ5LnBvc2l0aW9ucykpO1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmIsIDMsIGdlb21ldHJ5LnBvc2l0aW9ucykpO1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmMsIDMsIGdlb21ldHJ5LnBvc2l0aW9ucykpO1xuXG4gICAgICAgICAgICAvLyBnZXRzIG5vcm1hbHNcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYSwgMywgZ2VvbWV0cnkubm9ybWFscykpO1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZiLCAzLCBnZW9tZXRyeS5ub3JtYWxzKSk7XG4gICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmMsIDMsIGdlb21ldHJ5Lm5vcm1hbHMpKTtcblxuICAgICAgICAgICAgLy8gZ2V0cyB1dnNcbiAgICAgICAgICAgIHV2cy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAyLCBnZW9tZXRyeS51dnMpKTtcbiAgICAgICAgICAgIHV2cy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZiLCAyLCBnZW9tZXRyeS51dnMpKTtcbiAgICAgICAgICAgIHV2cy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAyLCBnZW9tZXRyeS51dnMpKTtcbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwb3NpdGlvbnMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH07XG5cbiAgICAvLyBldmVyeSBmYWNlICgzIHBvaW50cykgYmVjb21lcyAxIHRldHJhaGVkcm9uXG4gICAgc3RhdGljIG1vZGlmeSA9IGdlb21ldHJ5ID0+IHtcbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgICAgIGNvbnN0IG5vcm1hbHMgPSBbXTtcbiAgICAgICAgY29uc3QgdXZzID0gW107XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBnZW9tZXRyeS5pbmRpY2VzLmxlbmd0aDsgaSArPSAzKSB7XG4gICAgICAgICAgICBjb25zdCBmYSA9IGdlb21ldHJ5LmluZGljZXNbaSArIDBdO1xuICAgICAgICAgICAgY29uc3QgZmIgPSBnZW9tZXRyeS5pbmRpY2VzW2kgKyAxXTtcbiAgICAgICAgICAgIGNvbnN0IGZjID0gZ2VvbWV0cnkuaW5kaWNlc1tpICsgMl07XG5cbiAgICAgICAgICAgIC8vIGdldHMgZmFjZXMgQ0JBIG9yZGVyXG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYSwgMywgZ2VvbWV0cnkucG9zaXRpb25zKSk7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMywgZ2VvbWV0cnkucG9zaXRpb25zKSk7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYywgMywgZ2VvbWV0cnkucG9zaXRpb25zKSk7XG5cbiAgICAgICAgICAgIC8vIGdldHMgbm9ybWFsc1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAzLCBnZW9tZXRyeS5ub3JtYWxzKSk7XG4gICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmIsIDMsIGdlb21ldHJ5Lm5vcm1hbHMpKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYywgMywgZ2VvbWV0cnkubm9ybWFscykpO1xuXG4gICAgICAgICAgICAvLyBnZXRzIHV2c1xuICAgICAgICAgICAgdXZzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmEsIDIsIGdlb21ldHJ5LnV2cykpO1xuICAgICAgICAgICAgdXZzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmIsIDIsIGdlb21ldHJ5LnV2cykpO1xuICAgICAgICAgICAgdXZzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmMsIDIsIGdlb21ldHJ5LnV2cykpO1xuXG4gICAgICAgICAgICAvLyBFWFRSQVNcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAzLCBnZW9tZXRyeS5wb3NpdGlvbnMpKTtcbiAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKDAsIDAsIDApO1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmMsIDMsIGdlb21ldHJ5LnBvc2l0aW9ucykpO1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmIsIDMsIGdlb21ldHJ5LnBvc2l0aW9ucykpO1xuICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goMCwgMCwgMCk7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYiwgMywgZ2VvbWV0cnkucG9zaXRpb25zKSk7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYSwgMywgZ2VvbWV0cnkucG9zaXRpb25zKSk7XG4gICAgICAgICAgICBwb3NpdGlvbnMucHVzaCgwLCAwLCAwKTtcblxuICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZhLCAzLCBnZW9tZXRyeS5ub3JtYWxzKSk7XG4gICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmMsIDMsIGdlb21ldHJ5Lm5vcm1hbHMpKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCgwLCAwLCAwKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYywgMywgZ2VvbWV0cnkubm9ybWFscykpO1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZiLCAzLCBnZW9tZXRyeS5ub3JtYWxzKSk7XG4gICAgICAgICAgICBub3JtYWxzLnB1c2goMCwgMCwgMCk7XG4gICAgICAgICAgICBub3JtYWxzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmIsIDMsIGdlb21ldHJ5Lm5vcm1hbHMpKTtcbiAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYSwgMywgZ2VvbWV0cnkubm9ybWFscykpO1xuICAgICAgICAgICAgbm9ybWFscy5wdXNoKDAsIDAsIDApO1xuXG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYSwgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgICAgICB1dnMucHVzaCguLi5Nb2RpZnkuZ2V0RGF0YShmYywgMiwgZ2VvbWV0cnkudXZzKSk7XG4gICAgICAgICAgICB1dnMucHVzaCgwLCAwKTtcbiAgICAgICAgICAgIHV2cy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZjLCAyLCBnZW9tZXRyeS51dnMpKTtcbiAgICAgICAgICAgIHV2cy5wdXNoKC4uLk1vZGlmeS5nZXREYXRhKGZiLCAyLCBnZW9tZXRyeS51dnMpKTtcbiAgICAgICAgICAgIHV2cy5wdXNoKDAsIDApO1xuICAgICAgICAgICAgdXZzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmIsIDIsIGdlb21ldHJ5LnV2cykpO1xuICAgICAgICAgICAgdXZzLnB1c2goLi4uTW9kaWZ5LmdldERhdGEoZmEsIDIsIGdlb21ldHJ5LnV2cykpO1xuICAgICAgICAgICAgdXZzLnB1c2goMCwgMCk7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4ge1xuICAgICAgICAgICAgcG9zaXRpb25zLFxuICAgICAgICAgICAgbm9ybWFscyxcbiAgICAgICAgICAgIHV2cyxcbiAgICAgICAgfTtcbiAgICB9O1xufVxuXG5leHBvcnQgeyBNb2RpZnkgfTtcbiIsIi8qKlxuICogVXRpbGl0aWVzXG4gKiBAbW9kdWxlIGdlb21ldHJpZXMvdXRpbHNcbiAqL1xuXG5pbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcblxuLyoqXG4gKiBmbGF0dGVucyBhbiBhcnJheSBvciB2ZXJ0aWNlc1xuICpcbiAqIEBwYXJhbSB7VHlwZX0gdHlwZSBBcnJheSB0eXBlLCBzdWNoIGFzIEZsb2F0MzJBcnJheSBvciBBcnJheVxuICovXG5leHBvcnQgZnVuY3Rpb24gZmxhdHRlbihhcnIpIHtcbiAgICBsZXQgb3V0cHV0ID0gW107XG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBhcnIubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgaWYgKEFycmF5LmlzQXJyYXkoYXJyW2ldKSB8fCBhcnJbaV0gaW5zdGFuY2VvZiBGbG9hdDMyQXJyYXkpIHtcbiAgICAgICAgICAgIG91dHB1dCA9IG91dHB1dC5jb25jYXQoZmxhdHRlbihhcnJbaV0pKTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIG91dHB1dC5wdXNoKGFycltpXSk7XG4gICAgICAgIH1cbiAgICB9XG4gICAgcmV0dXJuIG91dHB1dDtcbn1cblxuZXhwb3J0IGZ1bmN0aW9uIHVuZmxhdHRlbihhcnIsIGFtb3VudCkge1xuICAgIGNvbnN0IG91dHB1dCA9IFtdO1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJyLmxlbmd0aDsgaSArPSBhbW91bnQpIHtcbiAgICAgICAgY29uc3QgdmFsdWUgPSBbXTtcbiAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPCBhbW91bnQ7IGorKykge1xuICAgICAgICAgICAgdmFsdWUucHVzaChhcnJbaSArIGpdKTtcbiAgICAgICAgfVxuICAgICAgICBvdXRwdXQucHVzaCh2YWx1ZSk7XG4gICAgfVxuICAgIHJldHVybiBvdXRwdXQ7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBnZW5lcmF0ZVZlcnRleE5vcm1hbHMocG9zaXRpb25zLCBpbmRpY2VzKSB7XG4gICAgY29uc3QgZmFjZXMgPSB1bmZsYXR0ZW4oaW5kaWNlcywgMyk7XG4gICAgY29uc3QgdmVydGljZXMgPSB1bmZsYXR0ZW4ocG9zaXRpb25zLCAzKTtcblxuICAgIGNvbnN0IHRlbXAgPSBbXTtcblxuICAgIGNvbnN0IGNiID0gdmVjMy5jcmVhdGUoKTtcbiAgICBjb25zdCBhYiA9IHZlYzMuY3JlYXRlKCk7XG4gICAgY29uc3QgY3Jvc3MgPSB2ZWMzLmNyZWF0ZSgpO1xuXG4gICAgbGV0IHZBO1xuICAgIGxldCB2QjtcbiAgICBsZXQgdkM7XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IGZhY2VzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IGZhY2UgPSBmYWNlc1tpXTtcbiAgICAgICAgY29uc3QgYSA9IGZhY2VbMF07XG4gICAgICAgIGNvbnN0IGIgPSBmYWNlWzFdO1xuICAgICAgICBjb25zdCBjID0gZmFjZVsyXTtcblxuICAgICAgICB2QSA9IHZlcnRpY2VzW2FdO1xuICAgICAgICB2QiA9IHZlcnRpY2VzW2JdO1xuICAgICAgICB2QyA9IHZlcnRpY2VzW2NdO1xuXG4gICAgICAgIHZlYzMuc3VidHJhY3QoY2IsIHZDLCB2Qik7XG4gICAgICAgIHZlYzMuc3VidHJhY3QoYWIsIHZBLCB2Qik7XG4gICAgICAgIHZlYzMuY3Jvc3MoY3Jvc3MsIGNiLCBhYik7XG5cbiAgICAgICAgaWYgKHRlbXBbYV0gPT09IHVuZGVmaW5lZCkge1xuICAgICAgICAgICAgdGVtcFthXSA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIH1cblxuICAgICAgICBpZiAodGVtcFtiXSA9PT0gdW5kZWZpbmVkKSB7XG4gICAgICAgICAgICB0ZW1wW2JdID0gdmVjMy5jcmVhdGUoKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGlmICh0ZW1wW2NdID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHRlbXBbY10gPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICB9XG5cbiAgICAgICAgdmVjMy5hZGQodGVtcFthXSwgdGVtcFthXSwgY3Jvc3MpO1xuICAgICAgICB2ZWMzLmFkZCh0ZW1wW2JdLCB0ZW1wW2JdLCBjcm9zcyk7XG4gICAgICAgIHZlYzMuYWRkKHRlbXBbY10sIHRlbXBbY10sIGNyb3NzKTtcbiAgICB9XG5cbiAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRlbXAubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgdmVjMy5ub3JtYWxpemUodGVtcFtpXSwgdGVtcFtpXSk7XG4gICAgfVxuXG4gICAgcmV0dXJuIGZsYXR0ZW4odGVtcCwgMyk7XG59XG5cbmV4cG9ydCBmdW5jdGlvbiBtZXJnZVZlcnRpY2VzKGRhdGEpIHtcbiAgICBjb25zdCBwb3NpdGlvbnMgPSB1bmZsYXR0ZW4oZGF0YS5wb3NpdGlvbnMsIDMpO1xuICAgIGNvbnN0IHZlcnRpY2VzTWFwID0ge307XG4gICAgY29uc3QgdW5pcXVlID0gW107XG4gICAgY29uc3QgY2hhbmdlcyA9IFtdO1xuXG4gICAgY29uc3QgcHJlY2lzaW9uUG9pbnRzID0gNDsgLy8gbnVtYmVyIG9mIGRlY2ltYWwgcG9pbnRzLCBlLmcuIDQgZm9yIGVwc2lsb24gb2YgMC4wMDAxXG4gICAgY29uc3QgcHJlY2lzaW9uID0gTWF0aC5wb3coMTAsIHByZWNpc2lvblBvaW50cyk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcblxuICAgIC8vIHJlbW92ZSBkdXBsaWNhdGVkIHBvc2l0aW9uc1xuICAgIGZvciAobGV0IGkgPSAwOyBpIDwgcG9zaXRpb25zLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgIGNvbnN0IHYgPSBwb3NpdGlvbnNbaV07XG4gICAgICAgIGNvbnN0IGtleSA9IGBcbiAgICAgICAgICAgICR7TWF0aC5yb3VuZCh2WzBdICogcHJlY2lzaW9uKX1fXG4gICAgICAgICAgICAke01hdGgucm91bmQodlsxXSAqIHByZWNpc2lvbil9X1xuICAgICAgICAgICAgJHtNYXRoLnJvdW5kKHZbMl0gKiBwcmVjaXNpb24pfVxuICAgICAgICBgO1xuXG4gICAgICAgIGlmICh2ZXJ0aWNlc01hcFtrZXldID09PSB1bmRlZmluZWQpIHtcbiAgICAgICAgICAgIHZlcnRpY2VzTWFwW2tleV0gPSBpO1xuICAgICAgICAgICAgdW5pcXVlLnB1c2gocG9zaXRpb25zW2ldKTtcbiAgICAgICAgICAgIGNoYW5nZXNbaV0gPSB1bmlxdWUubGVuZ3RoIC0gMTtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIC8vIGNvbnNvbGUubG9nKCdEdXBsaWNhdGUgdmVydGV4IGZvdW5kLiAnLCBpLCAnIGNvdWxkIGJlIHVzaW5nICcsIHZlcnRpY2VzTWFwW2tleV0pO1xuICAgICAgICAgICAgY2hhbmdlc1tpXSA9IGNoYW5nZXNbdmVydGljZXNNYXBba2V5XV07XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZW1vdmUgZHVwbGljYXRlZCBmYWNlc1xuICAgIGNvbnN0IGZhY2VJbmRpY2VzVG9SZW1vdmUgPSBbXTtcbiAgICBjb25zdCBmYWNlcyA9IHVuZmxhdHRlbihkYXRhLmluZGljZXMsIDMpO1xuXG4gICAgZm9yIChsZXQgaSA9IDA7IGkgPCBmYWNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICBjb25zdCBmYWNlID0gZmFjZXNbaV07XG5cbiAgICAgICAgZmFjZVswXSA9IGNoYW5nZXNbZmFjZVswXV07XG4gICAgICAgIGZhY2VbMV0gPSBjaGFuZ2VzW2ZhY2VbMV1dO1xuICAgICAgICBmYWNlWzJdID0gY2hhbmdlc1tmYWNlWzJdXTtcblxuICAgICAgICBjb25zdCBpbmRpY2VzID0gW2ZhY2VbMF0sIGZhY2VbMV0sIGZhY2VbMl1dO1xuXG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgMzsgbisrKSB7XG4gICAgICAgICAgICBpZiAoaW5kaWNlc1tuXSA9PT0gaW5kaWNlc1sobiArIDEpICUgM10pIHtcbiAgICAgICAgICAgICAgICBmYWNlSW5kaWNlc1RvUmVtb3ZlLnB1c2goaSk7XG4gICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICAvLyByZW1vdmUgZHVwbGljYXRlZCB1dnNcbiAgICBmb3IgKGxldCBpID0gZmFjZUluZGljZXNUb1JlbW92ZS5sZW5ndGggLSAxOyBpID49IDA7IGktLSkge1xuICAgICAgICBjb25zdCBpZHggPSBmYWNlSW5kaWNlc1RvUmVtb3ZlW2ldO1xuXG4gICAgICAgIGZhY2VzLnNwbGljZShpZHgsIDEpO1xuXG4gICAgICAgIGZvciAobGV0IGogPSAwOyBqIDwgdGhpcy5mYWNlVmVydGV4VXZzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICB0aGlzLmZhY2VWZXJ0ZXhVdnNbal0uc3BsaWNlKGlkeCwgMSk7XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjb25zdCBwID0gZmxhdHRlbih1bmlxdWUsIDMpO1xuICAgIGNvbnN0IGYgPSBmbGF0dGVuKGZhY2VzLCAzKTtcblxuICAgIHJldHVybiB7XG4gICAgICAgIHBvc2l0aW9uczogbmV3IEZsb2F0MzJBcnJheShwKSxcbiAgICAgICAgaW5kaWNlczogbmV3IFVpbnQxNkFycmF5KGYpLFxuICAgICAgICBub3JtYWxzOiBuZXcgRmxvYXQzMkFycmF5KGdlbmVyYXRlVmVydGV4Tm9ybWFscyhwLCBmKSksXG4gICAgfTtcbn1cbmV4cG9ydCAqIGZyb20gJy4vbWVyZ2UnO1xuZXhwb3J0IHsgTW9kaWZ5IH0gZnJvbSAnLi9tb2RpZnknO1xuIiwiaW1wb3J0IHsgZ2VuZXJhdGVWZXJ0ZXhOb3JtYWxzLCBmbGF0dGVuLCB1bmZsYXR0ZW4gfSBmcm9tICcuL3V0aWxzJztcblxuY2xhc3MgUG9seWhlZHJhIHtcbiAgICBjb25zdHJ1Y3Rvcihwb3NpdGlvbnMsIGZhY2VzLCByYWRpdXMsIGRldGFpbCA9IDApIHtcbiAgICAgICAgY29uc3QgdXZzID0gW107XG5cbiAgICAgICAgbGV0IGNvbXBsZXggPSB7XG4gICAgICAgICAgICBmYWNlczogdW5mbGF0dGVuKGZhY2VzLCAzKSxcbiAgICAgICAgICAgIHBvc2l0aW9uczogdW5mbGF0dGVuKHBvc2l0aW9ucywgMyksXG4gICAgICAgIH07XG5cbiAgICAgICAgbGV0IGQgPSBNYXRoLm1pbihkZXRhaWwsIDQpO1xuXG4gICAgICAgIHdoaWxlIChkLS0gPiAwKSB7XG4gICAgICAgICAgICBjb21wbGV4ID0gdGhpcy5zdWJkaXZpZGUoY29tcGxleCk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBnZW5lcmF0ZSB1dnNcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjb21wbGV4LnBvc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLm5vcm1hbGl6ZShjb21wbGV4LnBvc2l0aW9uc1tpXSk7XG4gICAgICAgICAgICBjb25zdCB1ID1cbiAgICAgICAgICAgICAgICAwLjUgKlxuICAgICAgICAgICAgICAgICgtKE1hdGguYXRhbjIocG9zaXRpb25bMl0sIC1wb3NpdGlvblswXSkgLyBNYXRoLlBJKSArIDEuMCk7XG4gICAgICAgICAgICBjb25zdCB2ID0gMC41ICsgTWF0aC5hc2luKHBvc2l0aW9uWzFdKSAvIE1hdGguUEk7XG4gICAgICAgICAgICB1dnMucHVzaChbMSAtIHUsIDEgLSB2XSk7XG4gICAgICAgIH1cblxuICAgICAgICAvLyBodHRwOi8vbWZ0LWRldi5kay91di1tYXBwaW5nLXNwaGVyZS9cbiAgICAgICAgLy8gdGhpcy5maXhQb2xlVVZzKGNvbXBsZXgucG9zaXRpb25zLCBjb21wbGV4LmZhY2VzLCB1dnMpO1xuXG4gICAgICAgIC8vIHNjYWxlIHBvc2l0aW9uc1xuICAgICAgICBwb3NpdGlvbnMgPSBjb21wbGV4LnBvc2l0aW9uczsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9ucy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgLy8gdGhpcy5ub3JtYWxpemUocG9zaXRpb25zW2ldKTtcbiAgICAgICAgICAgIHRoaXMuc2NhbGUocG9zaXRpb25zW2ldLCByYWRpdXMpO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgZ2VvbWV0cnkgPSB7XG4gICAgICAgICAgICBwb3NpdGlvbnM6IGZsYXR0ZW4oY29tcGxleC5wb3NpdGlvbnMpLFxuICAgICAgICAgICAgaW5kaWNlczogZmxhdHRlbihjb21wbGV4LmZhY2VzKSxcbiAgICAgICAgICAgIG5vcm1hbHM6IG51bGwsXG4gICAgICAgICAgICB1dnM6IGZsYXR0ZW4odXZzLCAyKSxcbiAgICAgICAgfTtcblxuICAgICAgICB0aGlzLmdlb21ldHJ5ID0ge1xuICAgICAgICAgICAgcG9zaXRpb25zOiBnZW9tZXRyeS5wb3NpdGlvbnMsXG4gICAgICAgICAgICBpbmRpY2VzOiBnZW9tZXRyeS5pbmRpY2VzLFxuICAgICAgICAgICAgbm9ybWFsczogZ2VuZXJhdGVWZXJ0ZXhOb3JtYWxzKFxuICAgICAgICAgICAgICAgIGdlb21ldHJ5LnBvc2l0aW9ucyxcbiAgICAgICAgICAgICAgICBnZW9tZXRyeS5pbmRpY2VzXG4gICAgICAgICAgICApLFxuICAgICAgICAgICAgdXZzOiBmbGF0dGVuKHV2cywgMiksXG4gICAgICAgIH07XG4gICAgfVxuXG4gICAgZml4UG9sZVVWcyhwb3NpdGlvbnMsIGNlbGxzLCB1dnMpIHtcbiAgICAgICAgY29uc3Qgbm9ydGhJbmRleCA9IHRoaXMuZmlyc3RZSW5kZXgocG9zaXRpb25zLCAxKTtcbiAgICAgICAgY29uc3Qgc291dGhJbmRleCA9IHRoaXMuZmlyc3RZSW5kZXgocG9zaXRpb25zLCAtMSk7XG5cbiAgICAgICAgaWYgKG5vcnRoSW5kZXggPT09IC0xIHx8IHNvdXRoSW5kZXggPT09IC0xKSB7XG4gICAgICAgICAgICAvLyBjb3VsZCBub3QgZmluZCBhbnkgcG9sZXMsIGJhaWwgZWFybHlcbiAgICAgICAgICAgIHJldHVybjtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IG5ld1ZlcnRpY2VzID0gcG9zaXRpb25zLnNsaWNlKCk7XG4gICAgICAgIGNvbnN0IG5ld1V2cyA9IHV2cy5zbGljZSgpO1xuICAgICAgICBsZXQgdmVydGljZUluZGV4ID0gbmV3VmVydGljZXMubGVuZ3RoIC0gMTtcblxuICAgICAgICBmdW5jdGlvbiB2aXNpdChjZWxsLCBwb2xlSW5kZXgsIGIsIGMpIHtcbiAgICAgICAgICAgIGNvbnN0IHV2MSA9IHV2c1tiXTtcbiAgICAgICAgICAgIGNvbnN0IHV2MiA9IHV2c1tjXTtcbiAgICAgICAgICAgIHV2c1twb2xlSW5kZXhdWzBdID0gKHV2MVswXSArIHV2MlswXSkgLyAyO1xuICAgICAgICAgICAgdmVydGljZUluZGV4Kys7XG4gICAgICAgICAgICBuZXdWZXJ0aWNlcy5wdXNoKHBvc2l0aW9uc1twb2xlSW5kZXhdLnNsaWNlKCkpO1xuICAgICAgICAgICAgbmV3VXZzLnB1c2godXZzW3BvbGVJbmRleF0uc2xpY2UoKSk7XG4gICAgICAgICAgICBjZWxsWzBdID0gdmVydGljZUluZGV4O1xuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjZWxscy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgY2VsbCA9IGNlbGxzW2ldO1xuICAgICAgICAgICAgY29uc3QgYSA9IGNlbGxbMF07XG4gICAgICAgICAgICBjb25zdCBiID0gY2VsbFsxXTtcbiAgICAgICAgICAgIGNvbnN0IGMgPSBjZWxsWzJdO1xuXG4gICAgICAgICAgICBpZiAoYSA9PT0gbm9ydGhJbmRleCkge1xuICAgICAgICAgICAgICAgIHZpc2l0KGNlbGwsIG5vcnRoSW5kZXgsIGIsIGMpO1xuICAgICAgICAgICAgfSBlbHNlIGlmIChhID09PSBzb3V0aEluZGV4KSB7XG4gICAgICAgICAgICAgICAgdmlzaXQoY2VsbCwgc291dGhJbmRleCwgYiwgYyk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBwb3NpdGlvbnMgPSBuZXdWZXJ0aWNlcztcbiAgICAgICAgdXZzID0gbmV3VXZzO1xuICAgIH1cblxuICAgIGZpcnN0WUluZGV4KGxpc3QsIHZhbHVlKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbGlzdC5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgdmVjID0gbGlzdFtpXTtcbiAgICAgICAgICAgIGlmIChNYXRoLmFicyh2ZWNbMV0gLSB2YWx1ZSkgPD0gMWUtNCkge1xuICAgICAgICAgICAgICAgIHJldHVybiBpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgICAgIHJldHVybiAtMTtcbiAgICB9XG5cbiAgICBub3JtYWxpemUodmVjKSB7XG4gICAgICAgIGxldCBtYWcgPSAwO1xuICAgICAgICBmb3IgKGxldCBuID0gMDsgbiA8IHZlYy5sZW5ndGg7IG4rKykge1xuICAgICAgICAgICAgbWFnICs9IHZlY1tuXSAqIHZlY1tuXTtcbiAgICAgICAgfVxuICAgICAgICBtYWcgPSBNYXRoLnNxcnQobWFnKTtcblxuICAgICAgICAvLyBhdm9pZCBkaXZpZGluZyBieSB6ZXJvXG4gICAgICAgIGlmIChtYWcgPT09IDApIHtcbiAgICAgICAgICAgIHJldHVybiBBcnJheS5hcHBseShudWxsLCBuZXcgQXJyYXkodmVjLmxlbmd0aCkpLm1hcChcbiAgICAgICAgICAgICAgICBOdW1iZXIucHJvdG90eXBlLnZhbHVlT2YsXG4gICAgICAgICAgICAgICAgMFxuICAgICAgICAgICAgKTsgLy8gZXNsaW50LWRpc2FibGUtbGluZVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgbiA9IDA7IG4gPCB2ZWMubGVuZ3RoOyBuKyspIHtcbiAgICAgICAgICAgIHZlY1tuXSAvPSBtYWc7XG4gICAgICAgIH1cblxuICAgICAgICByZXR1cm4gdmVjO1xuICAgIH1cblxuICAgIHNjYWxlKHZlYywgZmFjdG9yKSB7XG4gICAgICAgIGZvciAobGV0IG4gPSAwOyBuIDwgdmVjLmxlbmd0aDsgbisrKSB7XG4gICAgICAgICAgICB2ZWNbbl0gKj0gZmFjdG9yO1xuICAgICAgICB9XG4gICAgICAgIHJldHVybiB2ZWM7XG4gICAgfVxuXG4gICAgc3ViZGl2aWRlKGNvbXBsZXgpIHtcbiAgICAgICAgY29uc3QgeyBwb3NpdGlvbnMsIGZhY2VzIH0gPSBjb21wbGV4O1xuXG4gICAgICAgIGNvbnN0IG5ld0NlbGxzID0gW107XG4gICAgICAgIGNvbnN0IG5ld1Bvc2l0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCBtaWRwb2ludHMgPSB7fTtcbiAgICAgICAgbGV0IGwgPSAwO1xuXG4gICAgICAgIGZ1bmN0aW9uIG1pZHBvaW50KGEsIGIpIHtcbiAgICAgICAgICAgIHJldHVybiBbKGFbMF0gKyBiWzBdKSAvIDIsIChhWzFdICsgYlsxXSkgLyAyLCAoYVsyXSArIGJbMl0pIC8gMl07XG4gICAgICAgIH1cblxuICAgICAgICBmdW5jdGlvbiBwb2ludFRvS2V5KHBvaW50KSB7XG4gICAgICAgICAgICByZXR1cm4gYCR7cG9pbnRbMF0udG9QcmVjaXNpb24oNil9LCR7cG9pbnRbMV0udG9QcmVjaXNpb24oXG4gICAgICAgICAgICAgICAgNlxuICAgICAgICAgICAgKX0sJHtwb2ludFsyXS50b1ByZWNpc2lvbig2KX1gO1xuICAgICAgICB9XG5cbiAgICAgICAgZnVuY3Rpb24gZ2V0TWlkcG9pbnQoYSwgYikge1xuICAgICAgICAgICAgY29uc3QgcG9pbnQgPSBtaWRwb2ludChhLCBiKTtcbiAgICAgICAgICAgIGNvbnN0IHBvaW50S2V5ID0gcG9pbnRUb0tleShwb2ludCk7XG4gICAgICAgICAgICBjb25zdCBjYWNoZWRQb2ludCA9IG1pZHBvaW50c1twb2ludEtleV07XG4gICAgICAgICAgICBpZiAoY2FjaGVkUG9pbnQpIHtcbiAgICAgICAgICAgICAgICByZXR1cm4gY2FjaGVkUG9pbnQ7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBtaWRwb2ludHNbcG9pbnRLZXldID0gcG9pbnQ7XG4gICAgICAgICAgICByZXR1cm4gbWlkcG9pbnRzW3BvaW50S2V5XTtcbiAgICAgICAgfVxuXG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgZmFjZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGNvbnN0IGNlbGwgPSBmYWNlc1tpXTtcbiAgICAgICAgICAgIGNvbnN0IGMwID0gY2VsbFswXTtcbiAgICAgICAgICAgIGNvbnN0IGMxID0gY2VsbFsxXTtcbiAgICAgICAgICAgIGNvbnN0IGMyID0gY2VsbFsyXTtcbiAgICAgICAgICAgIGNvbnN0IHYwID0gcG9zaXRpb25zW2MwXTtcbiAgICAgICAgICAgIGNvbnN0IHYxID0gcG9zaXRpb25zW2MxXTtcbiAgICAgICAgICAgIGNvbnN0IHYyID0gcG9zaXRpb25zW2MyXTtcblxuICAgICAgICAgICAgY29uc3QgYSA9IGdldE1pZHBvaW50KHYwLCB2MSk7XG4gICAgICAgICAgICBjb25zdCBiID0gZ2V0TWlkcG9pbnQodjEsIHYyKTtcbiAgICAgICAgICAgIGNvbnN0IGMgPSBnZXRNaWRwb2ludCh2MiwgdjApO1xuXG4gICAgICAgICAgICBsZXQgYWkgPSBuZXdQb3NpdGlvbnMuaW5kZXhPZihhKTtcbiAgICAgICAgICAgIGlmIChhaSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICBhaSA9IGwrKztcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbnMucHVzaChhKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgICAgIGxldCBiaSA9IG5ld1Bvc2l0aW9ucy5pbmRleE9mKGIpO1xuICAgICAgICAgICAgaWYgKGJpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIGJpID0gbCsrO1xuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9ucy5wdXNoKGIpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IGNpID0gbmV3UG9zaXRpb25zLmluZGV4T2YoYyk7XG4gICAgICAgICAgICBpZiAoY2kgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgY2kgPSBsKys7XG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb25zLnB1c2goYyk7XG4gICAgICAgICAgICB9XG5cbiAgICAgICAgICAgIGxldCB2MGkgPSBuZXdQb3NpdGlvbnMuaW5kZXhPZih2MCk7XG4gICAgICAgICAgICBpZiAodjBpID09PSAtMSkge1xuICAgICAgICAgICAgICAgIHYwaSA9IGwrKztcbiAgICAgICAgICAgICAgICBuZXdQb3NpdGlvbnMucHVzaCh2MCk7XG4gICAgICAgICAgICB9XG4gICAgICAgICAgICBsZXQgdjFpID0gbmV3UG9zaXRpb25zLmluZGV4T2YodjEpO1xuICAgICAgICAgICAgaWYgKHYxaSA9PT0gLTEpIHtcbiAgICAgICAgICAgICAgICB2MWkgPSBsKys7XG4gICAgICAgICAgICAgICAgbmV3UG9zaXRpb25zLnB1c2godjEpO1xuICAgICAgICAgICAgfVxuICAgICAgICAgICAgbGV0IHYyaSA9IG5ld1Bvc2l0aW9ucy5pbmRleE9mKHYyKTtcbiAgICAgICAgICAgIGlmICh2MmkgPT09IC0xKSB7XG4gICAgICAgICAgICAgICAgdjJpID0gbCsrO1xuICAgICAgICAgICAgICAgIG5ld1Bvc2l0aW9ucy5wdXNoKHYyKTtcbiAgICAgICAgICAgIH1cblxuICAgICAgICAgICAgbmV3Q2VsbHMucHVzaChbdjBpLCBhaSwgY2ldKTtcbiAgICAgICAgICAgIG5ld0NlbGxzLnB1c2goW3YxaSwgYmksIGFpXSk7XG4gICAgICAgICAgICBuZXdDZWxscy5wdXNoKFt2MmksIGNpLCBiaV0pO1xuICAgICAgICAgICAgbmV3Q2VsbHMucHVzaChbYWksIGJpLCBjaV0pO1xuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIGZhY2VzOiBuZXdDZWxscyxcbiAgICAgICAgICAgIHBvc2l0aW9uczogbmV3UG9zaXRpb25zLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUG9seWhlZHJhO1xuIiwiaW1wb3J0IFBvbHloZWRyYSBmcm9tICcuLi9wb2x5aGVkcmEnO1xuXG5jbGFzcyBUZXRyYWhlZHJvbiBleHRlbmRzIFBvbHloZWRyYSB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmFkaXVzOiAwLjUsXG4gICAgICAgICAgICAgICAgZGV0YWlsOiAwLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb3BzXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gWzEsIDEsIDEsIC0xLCAtMSwgMSwgLTEsIDEsIC0xLCAxLCAtMSwgLTFdO1xuXG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBbMiwgMSwgMCwgMCwgMywgMiwgMSwgMywgMCwgMiwgMywgMV07XG5cbiAgICAgICAgc3VwZXIocG9zaXRpb25zLCBpbmRpY2VzLCBzZXR0aW5ncy5yYWRpdXMgKiAyLCBzZXR0aW5ncy5kZXRhaWwpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdlb21ldHJ5O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVGV0cmFoZWRyb247XG4iLCJpbXBvcnQgUG9seWhlZHJhIGZyb20gJy4uL3BvbHloZWRyYSc7XG5cbmNsYXNzIEhleGFoZWRyb24gZXh0ZW5kcyBQb2x5aGVkcmEge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJhZGl1czogMC41LFxuICAgICAgICAgICAgICAgIGRldGFpbDogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9wc1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHIgPSBzZXR0aW5ncy5yYWRpdXMgKiAyO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtcbiAgICAgICAgICAgIC8vIEZyb250IGZhY2VcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAvLyBCYWNrIGZhY2VcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgLy8gVG9wIGZhY2VcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAvLyBCb3R0b20gZmFjZVxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAvLyBSaWdodCBmYWNlXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgLy8gTGVmdCBmYWNlXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9ucy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgcG9zaXRpb25zW2kgKyAwXSAqPSByO1xuICAgICAgICAgICAgcG9zaXRpb25zW2kgKyAxXSAqPSByO1xuICAgICAgICAgICAgcG9zaXRpb25zW2kgKyAyXSAqPSByO1xuICAgICAgICB9XG5cbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IFtcbiAgICAgICAgICAgIC8vIEZyb250IGZhY2VcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIC8vIEJhY2sgZmFjZVxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDUsXG4gICAgICAgICAgICA2LFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDYsXG4gICAgICAgICAgICA3LFxuICAgICAgICAgICAgLy8gVG9wIGZhY2VcbiAgICAgICAgICAgIDgsXG4gICAgICAgICAgICA5LFxuICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICA4LFxuICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAxMSxcbiAgICAgICAgICAgIC8vIEJvdHRvbSBmYWNlXG4gICAgICAgICAgICAxMixcbiAgICAgICAgICAgIDEzLFxuICAgICAgICAgICAgMTQsXG4gICAgICAgICAgICAxMixcbiAgICAgICAgICAgIDE0LFxuICAgICAgICAgICAgMTUsXG4gICAgICAgICAgICAvLyBSaWdodCBmYWNlXG4gICAgICAgICAgICAxNixcbiAgICAgICAgICAgIDE3LFxuICAgICAgICAgICAgMTgsXG4gICAgICAgICAgICAxNixcbiAgICAgICAgICAgIDE4LFxuICAgICAgICAgICAgMTksXG4gICAgICAgICAgICAvLyBMZWZ0IGZhY2VcbiAgICAgICAgICAgIDIwLFxuICAgICAgICAgICAgMjEsXG4gICAgICAgICAgICAyMixcbiAgICAgICAgICAgIDIwLFxuICAgICAgICAgICAgMjIsXG4gICAgICAgICAgICAyMyxcbiAgICAgICAgXTtcblxuICAgICAgICBzdXBlcihwb3NpdGlvbnMsIGluZGljZXMsIHIsIHNldHRpbmdzLmRldGFpbCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbWV0cnk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBIZXhhaGVkcm9uO1xuIiwiaW1wb3J0IFBvbHloZWRyYSBmcm9tICcuLi9wb2x5aGVkcmEnO1xuXG5jbGFzcyBPY3RhaGVkcm9uIGV4dGVuZHMgUG9seWhlZHJhIHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByYWRpdXM6IDAuNSxcbiAgICAgICAgICAgICAgICBkZXRhaWw6IDAsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvcHNcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICA0LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAzLFxuICAgICAgICAgICAgNSxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICA1LFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgNSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICA1LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAzLFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICA0LFxuICAgICAgICAgICAgMixcbiAgICAgICAgXTtcblxuICAgICAgICBzdXBlcihwb3NpdGlvbnMsIGluZGljZXMsIHNldHRpbmdzLnJhZGl1cyAqIDIsIHNldHRpbmdzLmRldGFpbCk7XG5cbiAgICAgICAgcmV0dXJuIHRoaXMuZ2VvbWV0cnk7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBPY3RhaGVkcm9uO1xuIiwiaW1wb3J0IFBvbHloZWRyYSBmcm9tICcuLi9wb2x5aGVkcmEnO1xuXG5jbGFzcyBEb2RlY2FoZWRyb24gZXh0ZW5kcyBQb2x5aGVkcmEge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJhZGl1czogMC41LFxuICAgICAgICAgICAgICAgIGRldGFpbDogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9wc1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHQgPSAoMSArIE1hdGguc3FydCg1KSkgLyAyO1xuICAgICAgICBjb25zdCByID0gMSAvIHQ7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgLy8gKMKxMSwgwrExLCDCsTEpXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEsXG5cbiAgICAgICAgICAgIC8vICgwLCDCsTEvz4YsIMKxz4YpXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgLXIsXG4gICAgICAgICAgICAtdCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAtcixcbiAgICAgICAgICAgIHQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgcixcbiAgICAgICAgICAgIC10LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHIsXG4gICAgICAgICAgICB0LFxuXG4gICAgICAgICAgICAvLyAowrExL8+GLCDCsc+GLCAwKVxuICAgICAgICAgICAgLXIsXG4gICAgICAgICAgICAtdCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAtcixcbiAgICAgICAgICAgIHQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgcixcbiAgICAgICAgICAgIC10LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHIsXG4gICAgICAgICAgICB0LFxuICAgICAgICAgICAgMCxcblxuICAgICAgICAgICAgLy8gKMKxz4YsIDAsIMKxMS/PhilcbiAgICAgICAgICAgIC10LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIC1yLFxuICAgICAgICAgICAgdCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAtcixcbiAgICAgICAgICAgIC10LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHIsXG4gICAgICAgICAgICB0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIHIsXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IFtcbiAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAxMSxcbiAgICAgICAgICAgIDcsXG4gICAgICAgICAgICAzLFxuICAgICAgICAgICAgNyxcbiAgICAgICAgICAgIDE1LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDE1LFxuICAgICAgICAgICAgMTMsXG4gICAgICAgICAgICA3LFxuICAgICAgICAgICAgMTksXG4gICAgICAgICAgICAxNyxcbiAgICAgICAgICAgIDcsXG4gICAgICAgICAgICAxNyxcbiAgICAgICAgICAgIDYsXG4gICAgICAgICAgICA3LFxuICAgICAgICAgICAgNixcbiAgICAgICAgICAgIDE1LFxuICAgICAgICAgICAgMTcsXG4gICAgICAgICAgICA0LFxuICAgICAgICAgICAgOCxcbiAgICAgICAgICAgIDE3LFxuICAgICAgICAgICAgOCxcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgMTcsXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgICAgIDYsXG4gICAgICAgICAgICA4LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDE2LFxuICAgICAgICAgICAgOCxcbiAgICAgICAgICAgIDE2LFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDgsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMTIsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAxOCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxOCxcbiAgICAgICAgICAgIDE2LFxuICAgICAgICAgICAgNixcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDYsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMTMsXG4gICAgICAgICAgICA2LFxuICAgICAgICAgICAgMTMsXG4gICAgICAgICAgICAxNSxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxNixcbiAgICAgICAgICAgIDE4LFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDE4LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAzLFxuICAgICAgICAgICAgMTMsXG4gICAgICAgICAgICAxOCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICA5LFxuICAgICAgICAgICAgMTgsXG4gICAgICAgICAgICA5LFxuICAgICAgICAgICAgMTEsXG4gICAgICAgICAgICAxOCxcbiAgICAgICAgICAgIDExLFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDQsXG4gICAgICAgICAgICAxNCxcbiAgICAgICAgICAgIDEyLFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDEyLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgOCxcbiAgICAgICAgICAgIDExLFxuICAgICAgICAgICAgOSxcbiAgICAgICAgICAgIDUsXG4gICAgICAgICAgICAxMSxcbiAgICAgICAgICAgIDUsXG4gICAgICAgICAgICAxOSxcbiAgICAgICAgICAgIDExLFxuICAgICAgICAgICAgMTksXG4gICAgICAgICAgICA3LFxuICAgICAgICAgICAgMTksXG4gICAgICAgICAgICA1LFxuICAgICAgICAgICAgMTQsXG4gICAgICAgICAgICAxOSxcbiAgICAgICAgICAgIDE0LFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDE5LFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDE3LFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDEyLFxuICAgICAgICAgICAgMTQsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgMTQsXG4gICAgICAgICAgICA1LFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDUsXG4gICAgICAgICAgICA5LFxuICAgICAgICBdO1xuXG4gICAgICAgIHN1cGVyKHBvc2l0aW9ucywgaW5kaWNlcywgc2V0dGluZ3MucmFkaXVzICogMiwgc2V0dGluZ3MuZGV0YWlsKTtcblxuICAgICAgICByZXR1cm4gdGhpcy5nZW9tZXRyeTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IERvZGVjYWhlZHJvbjtcbiIsImltcG9ydCBQb2x5aGVkcmEgZnJvbSAnLi4vcG9seWhlZHJhJztcblxuY2xhc3MgSWNvc2FoZWRyb24gZXh0ZW5kcyBQb2x5aGVkcmEge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJhZGl1czogMC41LFxuICAgICAgICAgICAgICAgIGRldGFpbDogMCxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9wc1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHQgPSAwLjUgKyBNYXRoLnNxcnQoNSkgLyAyO1xuICAgICAgICBjb25zdCByID0gc2V0dGluZ3MucmFkaXVzICogMjtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgICt0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICsxLFxuICAgICAgICAgICAgK3QsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAtdCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICArMSxcbiAgICAgICAgICAgIC10LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAtMSxcbiAgICAgICAgICAgICt0LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICsxLFxuICAgICAgICAgICAgK3QsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICAtdCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICArMSxcbiAgICAgICAgICAgIC10LFxuICAgICAgICAgICAgK3QsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgLTEsXG4gICAgICAgICAgICArdCxcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICArMSxcbiAgICAgICAgICAgIC10LFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIC0xLFxuICAgICAgICAgICAgLXQsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgKzEsXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IFtcbiAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAxMSxcbiAgICAgICAgICAgIDUsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgNSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDcsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgNyxcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgMTEsXG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgNSxcbiAgICAgICAgICAgIDksXG4gICAgICAgICAgICA1LFxuICAgICAgICAgICAgMTEsXG4gICAgICAgICAgICA0LFxuICAgICAgICAgICAgMTEsXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAxMCxcbiAgICAgICAgICAgIDcsXG4gICAgICAgICAgICA2LFxuICAgICAgICAgICAgNyxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICA4LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDksXG4gICAgICAgICAgICA0LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDQsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICA2LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDYsXG4gICAgICAgICAgICA4LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDgsXG4gICAgICAgICAgICA5LFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDksXG4gICAgICAgICAgICA1LFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDQsXG4gICAgICAgICAgICAxMSxcbiAgICAgICAgICAgIDYsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMTAsXG4gICAgICAgICAgICA4LFxuICAgICAgICAgICAgNixcbiAgICAgICAgICAgIDcsXG4gICAgICAgICAgICA5LFxuICAgICAgICAgICAgOCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgIF07XG5cbiAgICAgICAgc3VwZXIocG9zaXRpb25zLCBpbmRpY2VzLCByLCBzZXR0aW5ncy5kZXRhaWwpO1xuXG4gICAgICAgIHJldHVybiB0aGlzLmdlb21ldHJ5O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgSWNvc2FoZWRyb247XG4iLCJjbGFzcyBQbGFuZSB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDEsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgICAgIHN1YmRpdmlzaW9uc1g6IDEsXG4gICAgICAgICAgICAgICAgc3ViZGl2aXNpb25zWTogMSxcbiAgICAgICAgICAgICAgICBheGlzOiAnWFknLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb3BzXG4gICAgICAgICk7XG5cbiAgICAgICAgbGV0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCBpbmRpY2VzID0gW107XG4gICAgICAgIGxldCBub3JtYWxzID0gW107XG4gICAgICAgIGxldCB1dnMgPSBbXTtcbiAgICAgICAgbGV0IGluZGV4ID0gMDtcblxuICAgICAgICBjb25zdCB3ID0gc2V0dGluZ3Mud2lkdGggKiAyO1xuICAgICAgICBjb25zdCBoID0gc2V0dGluZ3MuaGVpZ2h0ICogMjtcbiAgICAgICAgY29uc3Qgc3BhY2VyWCA9IHcgLyBzZXR0aW5ncy5zdWJkaXZpc2lvbnNYO1xuICAgICAgICBjb25zdCBzcGFjZXJZID0gaCAvIHNldHRpbmdzLnN1YmRpdmlzaW9uc1k7XG4gICAgICAgIGNvbnN0IG9mZnNldFggPSAtdyAqIDAuNTtcbiAgICAgICAgY29uc3Qgb2Zmc2V0WSA9IC1oICogMC41O1xuICAgICAgICBjb25zdCBzcGFjZXJVID0gMSAvIHNldHRpbmdzLnN1YmRpdmlzaW9uc1g7XG4gICAgICAgIGNvbnN0IHNwYWNlclYgPSAxIC8gc2V0dGluZ3Muc3ViZGl2aXNpb25zWTtcblxuICAgICAgICBmb3IgKGxldCB5ID0gMDsgeSA8IHNldHRpbmdzLnN1YmRpdmlzaW9uc1k7IHkrKykge1xuICAgICAgICAgICAgZm9yIChsZXQgeCA9IDA7IHggPCBzZXR0aW5ncy5zdWJkaXZpc2lvbnNYOyB4KyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB0cmlhbmdsZVggPSBzcGFjZXJYICogeCArIG9mZnNldFg7XG4gICAgICAgICAgICAgICAgY29uc3QgdHJpYW5nbGVZID0gc3BhY2VyWSAqIHkgKyBvZmZzZXRZO1xuXG4gICAgICAgICAgICAgICAgY29uc3QgdSA9IHggLyBzZXR0aW5ncy5zdWJkaXZpc2lvbnNYO1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSB5IC8gc2V0dGluZ3Muc3ViZGl2aXNpb25zWTtcblxuICAgICAgICAgICAgICAgIHN3aXRjaCAoc2V0dGluZ3MuYXhpcykge1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdYWic6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWNpbmcgdG93YXJkcyB5XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KFt0cmlhbmdsZVgsIDAsIHRyaWFuZ2xlWV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpYW5nbGVYICsgc3BhY2VyWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlWSxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpYW5nbGVYICsgc3BhY2VyWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlWSArIHNwYWNlclksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlWSArIHNwYWNlclksXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFswLCAxLCAwXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxzID0gbm9ybWFscy5jb25jYXQoWzAsIDEsIDBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbHMgPSBub3JtYWxzLmNvbmNhdChbMCwgMSwgMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFswLCAxLCAwXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UsIDEgLSB2XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dnMgPSB1dnMuY29uY2F0KFt1ICsgc3BhY2VyVSwgMSAtIHZdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UgKyBzcGFjZXJVLCAxIC0gKHYgKyBzcGFjZXJWKV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgdXZzID0gdXZzLmNvbmNhdChbdSwgMSAtICh2ICsgc3BhY2VyVildKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGJyZWFrO1xuICAgICAgICAgICAgICAgICAgICBjYXNlICdZWic6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWNpbmcgdG93YXJkcyB4XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoWzAsIHRyaWFuZ2xlWSwgdHJpYW5nbGVYXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlWSxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZVggKyBzcGFjZXJYLFxuICAgICAgICAgICAgICAgICAgICAgICAgXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KFtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICAwLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlWSArIHNwYWNlclksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpYW5nbGVYICsgc3BhY2VyWCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZVkgKyBzcGFjZXJZLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuXG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxzID0gbm9ybWFscy5jb25jYXQoWzEsIDAsIDBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbHMgPSBub3JtYWxzLmNvbmNhdChbMSwgMCwgMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFsxLCAwLCAwXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxzID0gbm9ybWFscy5jb25jYXQoWzEsIDAsIDBdKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgdXZzID0gdXZzLmNvbmNhdChbMSAtIHUsIHZdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoWzEgLSAodSArIHNwYWNlclUpLCB2XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dnMgPSB1dnMuY29uY2F0KFsxIC0gKHUgKyBzcGFjZXJVKSwgdiArIHNwYWNlclZdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoWzEgLSB1LCB2ICsgc3BhY2VyVl0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICAgICAgICAgICAgICAvLyBGYWNpbmcgdG93YXJkcyB6XG4gICAgICAgICAgICAgICAgICAgICAgICBwb3NpdGlvbnMgPSBwb3NpdGlvbnMuY29uY2F0KFt0cmlhbmdsZVgsIHRyaWFuZ2xlWSwgMF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpYW5nbGVYICsgc3BhY2VyWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZVksXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgMCxcbiAgICAgICAgICAgICAgICAgICAgICAgIF0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgcG9zaXRpb25zID0gcG9zaXRpb25zLmNvbmNhdChbXG4gICAgICAgICAgICAgICAgICAgICAgICAgICAgdHJpYW5nbGVYICsgc3BhY2VyWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZVkgKyBzcGFjZXJZLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHBvc2l0aW9ucyA9IHBvc2l0aW9ucy5jb25jYXQoW1xuICAgICAgICAgICAgICAgICAgICAgICAgICAgIHRyaWFuZ2xlWCxcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICB0cmlhbmdsZVkgKyBzcGFjZXJZLFxuICAgICAgICAgICAgICAgICAgICAgICAgICAgIDAsXG4gICAgICAgICAgICAgICAgICAgICAgICBdKTtcblxuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFswLCAwLCAxXSk7XG4gICAgICAgICAgICAgICAgICAgICAgICBub3JtYWxzID0gbm9ybWFscy5jb25jYXQoWzAsIDAsIDFdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIG5vcm1hbHMgPSBub3JtYWxzLmNvbmNhdChbMCwgMCwgMV0pO1xuICAgICAgICAgICAgICAgICAgICAgICAgbm9ybWFscyA9IG5vcm1hbHMuY29uY2F0KFswLCAwLCAxXSk7XG5cbiAgICAgICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UsIHZdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UgKyBzcGFjZXJVLCB2XSk7XG4gICAgICAgICAgICAgICAgICAgICAgICB1dnMgPSB1dnMuY29uY2F0KFt1ICsgc3BhY2VyVSwgdiArIHNwYWNlclZdKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIHV2cyA9IHV2cy5jb25jYXQoW3UsIHYgKyBzcGFjZXJWXSk7XG4gICAgICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGluZGV4ICogNCArIDApO1xuICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChpbmRleCAqIDQgKyAxKTtcbiAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goaW5kZXggKiA0ICsgMik7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGluZGV4ICogNCArIDApO1xuICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChpbmRleCAqIDQgKyAyKTtcbiAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goaW5kZXggKiA0ICsgMyk7XG5cbiAgICAgICAgICAgICAgICBpbmRleCsrO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgUGxhbmU7XG4iLCJjbGFzcyBCb3gge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgICAgIGhlaWdodDogMSxcbiAgICAgICAgICAgICAgICBkZXB0aDogMSxcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9wc1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtcbiAgICAgICAgICAgIC8vIEZyb250IGZhY2VcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAvLyBCYWNrIGZhY2VcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgLy8gVG9wIGZhY2VcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAvLyBCb3R0b20gZmFjZVxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAvLyBSaWdodCBmYWNlXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgLy8gTGVmdCBmYWNlXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIDAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAwLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgXTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHBvc2l0aW9ucy5sZW5ndGg7IGkgKz0gMykge1xuICAgICAgICAgICAgcG9zaXRpb25zW2kgKyAwXSAqPSBzZXR0aW5ncy53aWR0aDtcbiAgICAgICAgICAgIHBvc2l0aW9uc1tpICsgMV0gKj0gc2V0dGluZ3MuaGVpZ2h0O1xuICAgICAgICAgICAgcG9zaXRpb25zW2kgKyAyXSAqPSBzZXR0aW5ncy5kZXB0aDtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBbXG4gICAgICAgICAgICAvLyBGcm9udCBmYWNlXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMSxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMixcbiAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAvLyBCYWNrIGZhY2VcbiAgICAgICAgICAgIDQsXG4gICAgICAgICAgICA1LFxuICAgICAgICAgICAgNixcbiAgICAgICAgICAgIDQsXG4gICAgICAgICAgICA2LFxuICAgICAgICAgICAgNyxcbiAgICAgICAgICAgIC8vIFRvcCBmYWNlXG4gICAgICAgICAgICA4LFxuICAgICAgICAgICAgOSxcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgOCxcbiAgICAgICAgICAgIDEwLFxuICAgICAgICAgICAgMTEsXG4gICAgICAgICAgICAvLyBCb3R0b20gZmFjZVxuICAgICAgICAgICAgMTIsXG4gICAgICAgICAgICAxMyxcbiAgICAgICAgICAgIDE0LFxuICAgICAgICAgICAgMTIsXG4gICAgICAgICAgICAxNCxcbiAgICAgICAgICAgIDE1LFxuICAgICAgICAgICAgLy8gUmlnaHQgZmFjZVxuICAgICAgICAgICAgMTYsXG4gICAgICAgICAgICAxNyxcbiAgICAgICAgICAgIDE4LFxuICAgICAgICAgICAgMTYsXG4gICAgICAgICAgICAxOCxcbiAgICAgICAgICAgIDE5LFxuICAgICAgICAgICAgLy8gTGVmdCBmYWNlXG4gICAgICAgICAgICAyMCxcbiAgICAgICAgICAgIDIxLFxuICAgICAgICAgICAgMjIsXG4gICAgICAgICAgICAyMCxcbiAgICAgICAgICAgIDIyLFxuICAgICAgICAgICAgMjMsXG4gICAgICAgIF07XG5cbiAgICAgICAgY29uc3Qgbm9ybWFscyA9IFtcbiAgICAgICAgICAgIC8vIEZyb250XG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAvLyBCYWNrXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgLy8gVG9wXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAvLyBCb3R0b21cbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAvLyBSaWdodFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgLy8gTGVmdFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIC0xLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAtMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgLTEuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgXTtcblxuICAgICAgICBjb25zdCB1dnMgPSBbXG4gICAgICAgICAgICAvLyBGcm9udCBmYWNlXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAvLyBCYWNrIGZhY2VcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDEuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIDAuMCxcbiAgICAgICAgICAgIC8vIFRvcCBmYWNlXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAvLyBCb3R0b20gZmFjZVxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgLy8gUmlnaHQgZmFjZVxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMS4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgMC4wLFxuICAgICAgICAgICAgLy8gTGVmdCBmYWNlXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgICAgICAwLjAsXG4gICAgICAgICAgICAxLjAsXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm94O1xuIiwiaW1wb3J0IHsgbWF0NCwgdmVjMyB9IGZyb20gJ2dsLW1hdHJpeCc7XG5cbmNvbnN0IG1hdFJvdFkgPSBtYXQ0LmNyZWF0ZSgpO1xuY29uc3QgbWF0Um90WiA9IG1hdDQuY3JlYXRlKCk7XG5jb25zdCB1cCA9IHZlYzMuZnJvbVZhbHVlcygwLCAxLCAwKTtcbmNvbnN0IHRtcFZlYzMgPSB2ZWMzLmNyZWF0ZSgpO1xuXG5jbGFzcyBTcGhlcmUge1xuICAgIGNvbnN0cnVjdG9yKHByb3BzKSB7XG4gICAgICAgIGNvbnN0IHNldHRpbmdzID0gT2JqZWN0LmFzc2lnbihcbiAgICAgICAgICAgIHt9LFxuICAgICAgICAgICAge1xuICAgICAgICAgICAgICAgIHJhZGl1czogMC41LFxuICAgICAgICAgICAgICAgIHNlZ21lbnRzOiA4LFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb3BzXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gW107XG4gICAgICAgIGNvbnN0IGluZGljZXMgPSBbXTtcbiAgICAgICAgY29uc3Qgbm9ybWFscyA9IFtdO1xuICAgICAgICBjb25zdCB1dnMgPSBbXTtcblxuICAgICAgICBjb25zdCBoZWlnaHRTZWdtZW50cyA9IDIgKyBzZXR0aW5ncy5zZWdtZW50cztcbiAgICAgICAgY29uc3Qgd2lkdGhTZWdtZW50cyA9IDIgKiBoZWlnaHRTZWdtZW50cztcblxuICAgICAgICBmb3IgKGxldCB6U3RlcCA9IDA7IHpTdGVwIDw9IGhlaWdodFNlZ21lbnRzOyB6U3RlcCsrKSB7XG4gICAgICAgICAgICBjb25zdCB2ID0gelN0ZXAgLyBoZWlnaHRTZWdtZW50cztcbiAgICAgICAgICAgIGNvbnN0IGFuZ2xlWiA9IHYgKiBNYXRoLlBJO1xuXG4gICAgICAgICAgICBmb3IgKGxldCB5U3RlcCA9IDA7IHlTdGVwIDw9IHdpZHRoU2VnbWVudHM7IHlTdGVwKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCB1ID0geVN0ZXAgLyB3aWR0aFNlZ21lbnRzO1xuICAgICAgICAgICAgICAgIGNvbnN0IGFuZ2xlWSA9IHUgKiBNYXRoLlBJICogMjtcblxuICAgICAgICAgICAgICAgIG1hdDQuaWRlbnRpdHkobWF0Um90Wik7XG4gICAgICAgICAgICAgICAgbWF0NC5yb3RhdGVaKG1hdFJvdFosIG1hdFJvdFosIC1hbmdsZVopO1xuXG4gICAgICAgICAgICAgICAgbWF0NC5pZGVudGl0eShtYXRSb3RZKTtcbiAgICAgICAgICAgICAgICBtYXQ0LnJvdGF0ZVkobWF0Um90WSwgbWF0Um90WSwgYW5nbGVZKTtcblxuICAgICAgICAgICAgICAgIHZlYzMudHJhbnNmb3JtTWF0NCh0bXBWZWMzLCB1cCwgbWF0Um90Wik7XG4gICAgICAgICAgICAgICAgdmVjMy50cmFuc2Zvcm1NYXQ0KHRtcFZlYzMsIHRtcFZlYzMsIG1hdFJvdFkpO1xuXG4gICAgICAgICAgICAgICAgdmVjMy5zY2FsZSh0bXBWZWMzLCB0bXBWZWMzLCAtKHNldHRpbmdzLnJhZGl1cyAqIDIpKTtcbiAgICAgICAgICAgICAgICBwb3NpdGlvbnMucHVzaCguLi50bXBWZWMzKTtcblxuICAgICAgICAgICAgICAgIHZlYzMubm9ybWFsaXplKHRtcFZlYzMsIHRtcFZlYzMpO1xuICAgICAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi50bXBWZWMzKTtcblxuICAgICAgICAgICAgICAgIHV2cy5wdXNoKHUsIHYpO1xuICAgICAgICAgICAgfVxuXG4gICAgICAgICAgICBpZiAoelN0ZXAgPiAwKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgdmVydGljZXMgPSBwb3NpdGlvbnMubGVuZ3RoIC8gMztcbiAgICAgICAgICAgICAgICBsZXQgZmlyc3RJbmRleCA9IHZlcnRpY2VzIC0gMiAqICh3aWR0aFNlZ21lbnRzICsgMSk7XG4gICAgICAgICAgICAgICAgZm9yIChcbiAgICAgICAgICAgICAgICAgICAgO1xuICAgICAgICAgICAgICAgICAgICBmaXJzdEluZGV4ICsgd2lkdGhTZWdtZW50cyArIDIgPCB2ZXJ0aWNlcztcbiAgICAgICAgICAgICAgICAgICAgZmlyc3RJbmRleCsrXG4gICAgICAgICAgICAgICAgKSB7XG4gICAgICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0SW5kZXgsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdEluZGV4ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0SW5kZXggKyB3aWR0aFNlZ21lbnRzICsgMVxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdEluZGV4ICsgd2lkdGhTZWdtZW50cyArIDEsXG4gICAgICAgICAgICAgICAgICAgICAgICBmaXJzdEluZGV4ICsgMSxcbiAgICAgICAgICAgICAgICAgICAgICAgIGZpcnN0SW5kZXggKyB3aWR0aFNlZ21lbnRzICsgMlxuICAgICAgICAgICAgICAgICAgICApO1xuICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwb3NpdGlvbnMsXG4gICAgICAgICAgICBpbmRpY2VzLFxuICAgICAgICAgICAgbm9ybWFscyxcbiAgICAgICAgICAgIHV2cyxcbiAgICAgICAgfTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNwaGVyZTtcbiIsImltcG9ydCB7IHZlYzMgfSBmcm9tICdnbC1tYXRyaXgnO1xuXG5jbGFzcyBUb3J1cyB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgcmFkaXVzOiAxLFxuICAgICAgICAgICAgICAgIHR1YmU6IDAuMzc1LFxuICAgICAgICAgICAgICAgIHR1YnVsYXJTZWdtZW50czogMTYsXG4gICAgICAgICAgICAgICAgcmFkaWFsU2VnbWVudHM6IDgsXG4gICAgICAgICAgICAgICAgYXJjOiBNYXRoLlBJICogMixcbiAgICAgICAgICAgIH0sXG4gICAgICAgICAgICBwcm9wc1xuICAgICAgICApO1xuXG4gICAgICAgIGNvbnN0IHBvc2l0aW9ucyA9IFtdO1xuICAgICAgICBjb25zdCBpbmRpY2VzID0gW107XG4gICAgICAgIGNvbnN0IG5vcm1hbHMgPSBbXTtcbiAgICAgICAgY29uc3QgdXZzID0gW107XG5cbiAgICAgICAgY29uc3QgY2VudGVyID0gdmVjMy5jcmVhdGUoKTtcbiAgICAgICAgY29uc3QgdmVydGV4ID0gdmVjMy5jcmVhdGUoKTtcbiAgICAgICAgY29uc3Qgbm9ybWFsID0gdmVjMy5jcmVhdGUoKTtcblxuICAgICAgICBmb3IgKGxldCBqID0gMDsgaiA8PSBzZXR0aW5ncy5yYWRpYWxTZWdtZW50czsgaisrKSB7XG4gICAgICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHUgPSAoaSAvIHNldHRpbmdzLnR1YnVsYXJTZWdtZW50cykgKiBzZXR0aW5ncy5hcmM7XG4gICAgICAgICAgICAgICAgY29uc3QgdiA9IChqIC8gc2V0dGluZ3MucmFkaWFsU2VnbWVudHMpICogTWF0aC5QSSAqIDI7XG5cbiAgICAgICAgICAgICAgICB2ZXJ0ZXhbMF0gPVxuICAgICAgICAgICAgICAgICAgICAoc2V0dGluZ3MucmFkaXVzICsgc2V0dGluZ3MudHViZSAqIE1hdGguY29zKHYpKSAqXG4gICAgICAgICAgICAgICAgICAgIE1hdGguY29zKHUpO1xuICAgICAgICAgICAgICAgIHZlcnRleFsxXSA9XG4gICAgICAgICAgICAgICAgICAgIChzZXR0aW5ncy5yYWRpdXMgKyBzZXR0aW5ncy50dWJlICogTWF0aC5jb3ModikpICpcbiAgICAgICAgICAgICAgICAgICAgTWF0aC5zaW4odSk7XG4gICAgICAgICAgICAgICAgdmVydGV4WzJdID0gc2V0dGluZ3MudHViZSAqIE1hdGguc2luKHYpO1xuXG4gICAgICAgICAgICAgICAgcG9zaXRpb25zLnB1c2goLi4udmVydGV4KTtcblxuICAgICAgICAgICAgICAgIGNlbnRlclswXSA9IHNldHRpbmdzLnJhZGl1cyAqIE1hdGguY29zKHUpO1xuICAgICAgICAgICAgICAgIGNlbnRlclsxXSA9IHNldHRpbmdzLnJhZGl1cyAqIE1hdGguc2luKHUpO1xuICAgICAgICAgICAgICAgIHZlYzMuc3VidHJhY3Qobm9ybWFsLCB2ZXJ0ZXgsIGNlbnRlcik7XG4gICAgICAgICAgICAgICAgdmVjMy5ub3JtYWxpemUobm9ybWFsLCBub3JtYWwpO1xuXG4gICAgICAgICAgICAgICAgbm9ybWFscy5wdXNoKC4uLm5vcm1hbCk7XG5cbiAgICAgICAgICAgICAgICB1dnMucHVzaChpIC8gc2V0dGluZ3MudHVidWxhclNlZ21lbnRzKTtcbiAgICAgICAgICAgICAgICB1dnMucHVzaChqIC8gc2V0dGluZ3MucmFkaWFsU2VnbWVudHMpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgZm9yIChsZXQgaiA9IDE7IGogPD0gc2V0dGluZ3MucmFkaWFsU2VnbWVudHM7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gc2V0dGluZ3MudHVidWxhclNlZ21lbnRzOyBpKyspIHtcbiAgICAgICAgICAgICAgICBjb25zdCBhID0gKHNldHRpbmdzLnR1YnVsYXJTZWdtZW50cyArIDEpICogaiArIChpIC0gMSk7XG4gICAgICAgICAgICAgICAgY29uc3QgYiA9IChzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHMgKyAxKSAqIChqIC0gMSkgKyAoaSAtIDEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSAoc2V0dGluZ3MudHVidWxhclNlZ21lbnRzICsgMSkgKiAoaiAtIDEpICsgaTtcbiAgICAgICAgICAgICAgICBjb25zdCBkID0gKHNldHRpbmdzLnR1YnVsYXJTZWdtZW50cyArIDEpICogaiArIGk7XG5cbiAgICAgICAgICAgICAgICBpbmRpY2VzLnB1c2goYSwgYiwgZCk7XG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGIsIGMsIGQpO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgICAgICBub3JtYWxzLFxuICAgICAgICAgICAgdXZzLFxuICAgICAgICB9O1xuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgVG9ydXM7XG4iLCJpbXBvcnQgeyB2ZWMzIH0gZnJvbSAnZ2wtbWF0cml4JztcblxuY2xhc3MgVG9ydXNLbm90IHtcbiAgICBjb25zdHJ1Y3Rvcihwcm9wcykge1xuICAgICAgICBjb25zdCBzZXR0aW5ncyA9IE9iamVjdC5hc3NpZ24oXG4gICAgICAgICAgICB7fSxcbiAgICAgICAgICAgIHtcbiAgICAgICAgICAgICAgICByYWRpdXM6IDAuNSxcbiAgICAgICAgICAgICAgICB0dWJlOiAwLjIsXG4gICAgICAgICAgICAgICAgdHVidWxhclNlZ21lbnRzOiA2NCxcbiAgICAgICAgICAgICAgICByYWRpYWxTZWdtZW50czogNixcbiAgICAgICAgICAgICAgICBwOiAyLFxuICAgICAgICAgICAgICAgIHE6IDMsXG4gICAgICAgICAgICB9LFxuICAgICAgICAgICAgcHJvcHNcbiAgICAgICAgKTtcblxuICAgICAgICBjb25zdCBwb3NpdGlvbnMgPSBbXTtcbiAgICAgICAgY29uc3QgaW5kaWNlcyA9IFtdO1xuICAgICAgICBjb25zdCBub3JtYWxzID0gW107XG4gICAgICAgIGNvbnN0IHV2cyA9IFtdO1xuXG4gICAgICAgIGNvbnN0IHZlcnRleCA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIGNvbnN0IG5vcm1hbCA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICAgICAgY29uc3QgUDEgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICBjb25zdCBQMiA9IHZlYzMuY3JlYXRlKCk7XG5cbiAgICAgICAgY29uc3QgQiA9IHZlYzMuY3JlYXRlKCk7XG4gICAgICAgIGNvbnN0IFQgPSB2ZWMzLmNyZWF0ZSgpO1xuICAgICAgICBjb25zdCBOID0gdmVjMy5jcmVhdGUoKTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8PSBzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHM7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgdSA9IChpIC8gc2V0dGluZ3MudHVidWxhclNlZ21lbnRzKSAqIHNldHRpbmdzLnAgKiBNYXRoLlBJICogMjtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlUG9zaXRpb25PbkN1cnZlKFxuICAgICAgICAgICAgICAgIHUsXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MucCxcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5xLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzLnJhZGl1cyxcbiAgICAgICAgICAgICAgICBQMVxuICAgICAgICAgICAgKTtcbiAgICAgICAgICAgIHRoaXMuY2FsY3VsYXRlUG9zaXRpb25PbkN1cnZlKFxuICAgICAgICAgICAgICAgIHUgKyAwLjAxLFxuICAgICAgICAgICAgICAgIHNldHRpbmdzLnAsXG4gICAgICAgICAgICAgICAgc2V0dGluZ3MucSxcbiAgICAgICAgICAgICAgICBzZXR0aW5ncy5yYWRpdXMsXG4gICAgICAgICAgICAgICAgUDJcbiAgICAgICAgICAgICk7XG5cbiAgICAgICAgICAgIHZlYzMuc3VidHJhY3QoVCwgUDIsIFAxKTtcbiAgICAgICAgICAgIHZlYzMuYWRkKE4sIFAyLCBQMSk7XG4gICAgICAgICAgICB2ZWMzLmNyb3NzKEIsIFQsIE4pO1xuICAgICAgICAgICAgdmVjMy5jcm9zcyhOLCBCLCBUKTtcblxuICAgICAgICAgICAgdmVjMy5ub3JtYWxpemUoQiwgQik7XG4gICAgICAgICAgICB2ZWMzLm5vcm1hbGl6ZShOLCBOKTtcblxuICAgICAgICAgICAgZm9yIChsZXQgaiA9IDA7IGogPD0gc2V0dGluZ3MucmFkaWFsU2VnbWVudHM7IGorKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IHYgPSAoaiAvIHNldHRpbmdzLnJhZGlhbFNlZ21lbnRzKSAqIE1hdGguUEkgKiAyO1xuICAgICAgICAgICAgICAgIGNvbnN0IGN4ID0gLXNldHRpbmdzLnR1YmUgKiBNYXRoLmNvcyh2KTtcbiAgICAgICAgICAgICAgICBjb25zdCBjeSA9IHNldHRpbmdzLnR1YmUgKiBNYXRoLnNpbih2KTtcblxuICAgICAgICAgICAgICAgIHZlcnRleFswXSA9IFAxWzBdICsgKGN4ICogTlswXSArIGN5ICogQlswXSk7XG4gICAgICAgICAgICAgICAgdmVydGV4WzFdID0gUDFbMV0gKyAoY3ggKiBOWzFdICsgY3kgKiBCWzFdKTtcbiAgICAgICAgICAgICAgICB2ZXJ0ZXhbMl0gPSBQMVsyXSArIChjeCAqIE5bMl0gKyBjeSAqIEJbMl0pO1xuICAgICAgICAgICAgICAgIHBvc2l0aW9ucy5wdXNoKC4uLnZlcnRleCk7XG5cbiAgICAgICAgICAgICAgICB2ZWMzLnN1YnRyYWN0KG5vcm1hbCwgdmVydGV4LCBQMSk7XG4gICAgICAgICAgICAgICAgdmVjMy5ub3JtYWxpemUobm9ybWFsLCBub3JtYWwpO1xuICAgICAgICAgICAgICAgIG5vcm1hbHMucHVzaCguLi5ub3JtYWwpO1xuXG4gICAgICAgICAgICAgICAgdXZzLnB1c2goXG4gICAgICAgICAgICAgICAgICAgIGkgLyBzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHMsXG4gICAgICAgICAgICAgICAgICAgIGogLyBzZXR0aW5ncy5yYWRpYWxTZWdtZW50c1xuICAgICAgICAgICAgICAgICk7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cblxuICAgICAgICBmb3IgKGxldCBqID0gMTsgaiA8PSBzZXR0aW5ncy50dWJ1bGFyU2VnbWVudHM7IGorKykge1xuICAgICAgICAgICAgZm9yIChsZXQgaSA9IDE7IGkgPD0gc2V0dGluZ3MucmFkaWFsU2VnbWVudHM7IGkrKykge1xuICAgICAgICAgICAgICAgIGNvbnN0IGEgPSAoc2V0dGluZ3MucmFkaWFsU2VnbWVudHMgKyAxKSAqIChqIC0gMSkgKyAoaSAtIDEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGIgPSAoc2V0dGluZ3MucmFkaWFsU2VnbWVudHMgKyAxKSAqIGogKyAoaSAtIDEpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGMgPSAoc2V0dGluZ3MucmFkaWFsU2VnbWVudHMgKyAxKSAqIGogKyBpO1xuICAgICAgICAgICAgICAgIGNvbnN0IGQgPSAoc2V0dGluZ3MucmFkaWFsU2VnbWVudHMgKyAxKSAqIChqIC0gMSkgKyBpO1xuXG4gICAgICAgICAgICAgICAgaW5kaWNlcy5wdXNoKGEsIGIsIGQpO1xuICAgICAgICAgICAgICAgIGluZGljZXMucHVzaChiLCBjLCBkKTtcbiAgICAgICAgICAgIH1cbiAgICAgICAgfVxuXG4gICAgICAgIHJldHVybiB7XG4gICAgICAgICAgICBwb3NpdGlvbnMsXG4gICAgICAgICAgICBpbmRpY2VzLFxuICAgICAgICAgICAgbm9ybWFscyxcbiAgICAgICAgICAgIHV2cyxcbiAgICAgICAgfTtcbiAgICB9XG5cbiAgICBjYWxjdWxhdGVQb3NpdGlvbk9uQ3VydmUodSwgcCwgcSwgcmFkaXVzLCBwb3NpdGlvbikge1xuICAgICAgICBjb25zdCBjdSA9IE1hdGguY29zKHUpO1xuICAgICAgICBjb25zdCBzdSA9IE1hdGguc2luKHUpO1xuICAgICAgICBjb25zdCBxdU92ZXJQID0gKHEgLyBwKSAqIHU7XG4gICAgICAgIGNvbnN0IGNzID0gTWF0aC5jb3MocXVPdmVyUCk7XG5cbiAgICAgICAgcG9zaXRpb25bMF0gPSByYWRpdXMgKiAoMiArIGNzKSAqIDAuNSAqIGN1O1xuICAgICAgICBwb3NpdGlvblsxXSA9IHJhZGl1cyAqICgyICsgY3MpICogc3UgKiAwLjU7XG4gICAgICAgIHBvc2l0aW9uWzJdID0gcmFkaXVzICogTWF0aC5zaW4ocXVPdmVyUCkgKiAwLjU7XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBUb3J1c0tub3Q7XG4iLCJjbGFzcyBQcmlzbSB7XG4gICAgY29uc3RydWN0b3IocHJvcHMpIHtcbiAgICAgICAgY29uc3Qgc2V0dGluZ3MgPSBPYmplY3QuYXNzaWduKFxuICAgICAgICAgICAge30sXG4gICAgICAgICAgICB7XG4gICAgICAgICAgICAgICAgd2lkdGg6IDEsXG4gICAgICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgICAgIGRlcHRoOiAxLFxuICAgICAgICAgICAgfSxcbiAgICAgICAgICAgIHByb3BzXG4gICAgICAgICk7XG5cbiAgICAgICAgY29uc3QgcG9zaXRpb25zID0gW1xuICAgICAgICAgICAgLy8gRnJvbnQgZmFjZVxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICArMC41LCAvLyAwXG4gICAgICAgICAgICArMC41LFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgICswLjUsIC8vIDFcbiAgICAgICAgICAgICswLjUsXG4gICAgICAgICAgICArMC41LFxuICAgICAgICAgICAgLTAuNSwgLy8gMlxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgICswLjUsXG4gICAgICAgICAgICAtMC41LCAvLyAzXG5cbiAgICAgICAgICAgIC8vIGJhY2tcbiAgICAgICAgICAgICswLjUsXG4gICAgICAgICAgICAtMC41LFxuICAgICAgICAgICAgLTAuNSwgLy8gNFxuICAgICAgICAgICAgLTAuNSxcbiAgICAgICAgICAgIC0wLjUsXG4gICAgICAgICAgICAtMC41LCAvLyA1XG4gICAgICAgIF07XG5cbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBwb3NpdGlvbnMubGVuZ3RoOyBpICs9IDMpIHtcbiAgICAgICAgICAgIHBvc2l0aW9uc1tpICsgMF0gKj0gc2V0dGluZ3Mud2lkdGg7XG4gICAgICAgICAgICBwb3NpdGlvbnNbaSArIDFdICo9IHNldHRpbmdzLmhlaWdodDtcbiAgICAgICAgICAgIHBvc2l0aW9uc1tpICsgMl0gKj0gc2V0dGluZ3MuZGVwdGg7XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCBpbmRpY2VzID0gW1xuICAgICAgICAgICAgLy8gRnJvbnQgZmFjZVxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAyLFxuICAgICAgICAgICAgMCxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICAzLFxuICAgICAgICAgICAgLy8gQmFjayBmYWNlXG4gICAgICAgICAgICA0LFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIDIsXG4gICAgICAgICAgICA0LFxuICAgICAgICAgICAgNSxcbiAgICAgICAgICAgIDMsXG4gICAgICAgICAgICAvLyBib3R0b21cbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgNSxcbiAgICAgICAgICAgIDEsXG4gICAgICAgICAgICA1LFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIC8vIGxlZnRcbiAgICAgICAgICAgIDUsXG4gICAgICAgICAgICAwLFxuICAgICAgICAgICAgMyxcbiAgICAgICAgICAgIC8vIHJpZ2h0XG4gICAgICAgICAgICAxLFxuICAgICAgICAgICAgNCxcbiAgICAgICAgICAgIDIsXG4gICAgICAgIF07XG5cbiAgICAgICAgcmV0dXJuIHtcbiAgICAgICAgICAgIHBvc2l0aW9ucyxcbiAgICAgICAgICAgIGluZGljZXMsXG4gICAgICAgIH07XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBQcmlzbTtcbiJdLCJuYW1lcyI6WyJBUlJBWV9UWVBFIiwiRmxvYXQzMkFycmF5IiwiQXJyYXkiLCJNYXRoIiwiaHlwb3QiLCJ5IiwiaSIsImFyZ3VtZW50cyIsImxlbmd0aCIsInNxcnQiLCJjcmVhdGUiLCJvdXQiLCJnbE1hdHJpeCIsImlkZW50aXR5Iiwicm90YXRlWSIsImEiLCJyYWQiLCJzIiwic2luIiwiYyIsImNvcyIsImEwMCIsImEwMSIsImEwMiIsImEwMyIsImEyMCIsImEyMSIsImEyMiIsImEyMyIsInJvdGF0ZVoiLCJhMTAiLCJhMTEiLCJhMTIiLCJhMTMiLCJmcm9tVmFsdWVzIiwieCIsInoiLCJhZGQiLCJiIiwic3VidHJhY3QiLCJzY2FsZSIsIm5vcm1hbGl6ZSIsImxlbiIsImNyb3NzIiwiYXgiLCJheSIsImF6IiwiYngiLCJieSIsImJ6IiwidHJhbnNmb3JtTWF0NCIsIm0iLCJ3IiwiZm9yRWFjaCIsInZlYyIsInN0cmlkZSIsIm9mZnNldCIsImNvdW50IiwiZm4iLCJhcmciLCJsIiwibWluIiwibWVyZ2UiLCJwcm9wcyIsImNvbnNvbGUiLCJsb2ciLCJwb3NpdGlvbnMiLCJpbmRpY2VzIiwibm9ybWFscyIsInV2cyIsIk1vZGlmeSIsImdldERhdGEiLCJpbmRleCIsInN0ZXAiLCJhcnJheSIsImRhdGEiLCJqIiwicHVzaCIsImRldGFjaCIsImdlb21ldHJ5IiwiZmEiLCJmYiIsImZjIiwibW9kaWZ5IiwiZmxhdHRlbiIsImFyciIsIm91dHB1dCIsImlzQXJyYXkiLCJjb25jYXQiLCJ1bmZsYXR0ZW4iLCJhbW91bnQiLCJ2YWx1ZSIsImdlbmVyYXRlVmVydGV4Tm9ybWFscyIsImZhY2VzIiwidmVydGljZXMiLCJ0ZW1wIiwiY2IiLCJ2ZWMzIiwiYWIiLCJ2QSIsInZCIiwidkMiLCJmYWNlIiwidW5kZWZpbmVkIiwibWVyZ2VWZXJ0aWNlcyIsInZlcnRpY2VzTWFwIiwidW5pcXVlIiwiY2hhbmdlcyIsInByZWNpc2lvblBvaW50cyIsInByZWNpc2lvbiIsInBvdyIsInYiLCJrZXkiLCJyb3VuZCIsImZhY2VJbmRpY2VzVG9SZW1vdmUiLCJuIiwiaWR4Iiwic3BsaWNlIiwiZmFjZVZlcnRleFV2cyIsInAiLCJmIiwiVWludDE2QXJyYXkiLCJQb2x5aGVkcmEiLCJyYWRpdXMiLCJkZXRhaWwiLCJjb21wbGV4IiwiZCIsInN1YmRpdmlkZSIsInBvc2l0aW9uIiwidSIsImF0YW4yIiwiUEkiLCJhc2luIiwiY2VsbHMiLCJub3J0aEluZGV4IiwiZmlyc3RZSW5kZXgiLCJzb3V0aEluZGV4IiwibmV3VmVydGljZXMiLCJzbGljZSIsIm5ld1V2cyIsInZlcnRpY2VJbmRleCIsInZpc2l0IiwiY2VsbCIsInBvbGVJbmRleCIsInV2MSIsInV2MiIsImxpc3QiLCJhYnMiLCJtYWciLCJhcHBseSIsIm1hcCIsIk51bWJlciIsInByb3RvdHlwZSIsInZhbHVlT2YiLCJmYWN0b3IiLCJuZXdDZWxscyIsIm5ld1Bvc2l0aW9ucyIsIm1pZHBvaW50cyIsIm1pZHBvaW50IiwicG9pbnRUb0tleSIsInBvaW50IiwidG9QcmVjaXNpb24iLCJnZXRNaWRwb2ludCIsInBvaW50S2V5IiwiY2FjaGVkUG9pbnQiLCJjMCIsImMxIiwiYzIiLCJ2MCIsInYxIiwidjIiLCJhaSIsImluZGV4T2YiLCJiaSIsImNpIiwidjBpIiwidjFpIiwidjJpIiwiVGV0cmFoZWRyb24iLCJzZXR0aW5ncyIsIk9iamVjdCIsImFzc2lnbiIsIkhleGFoZWRyb24iLCJyIiwiT2N0YWhlZHJvbiIsIkRvZGVjYWhlZHJvbiIsInQiLCJJY29zYWhlZHJvbiIsIlBsYW5lIiwid2lkdGgiLCJoZWlnaHQiLCJzdWJkaXZpc2lvbnNYIiwic3ViZGl2aXNpb25zWSIsImF4aXMiLCJoIiwic3BhY2VyWCIsInNwYWNlclkiLCJvZmZzZXRYIiwib2Zmc2V0WSIsInNwYWNlclUiLCJzcGFjZXJWIiwidHJpYW5nbGVYIiwidHJpYW5nbGVZIiwiQm94IiwiZGVwdGgiLCJtYXRSb3RZIiwibWF0NCIsIm1hdFJvdFoiLCJ1cCIsInRtcFZlYzMiLCJTcGhlcmUiLCJzZWdtZW50cyIsImhlaWdodFNlZ21lbnRzIiwid2lkdGhTZWdtZW50cyIsInpTdGVwIiwiYW5nbGVaIiwieVN0ZXAiLCJhbmdsZVkiLCJmaXJzdEluZGV4IiwiVG9ydXMiLCJ0dWJlIiwidHVidWxhclNlZ21lbnRzIiwicmFkaWFsU2VnbWVudHMiLCJhcmMiLCJjZW50ZXIiLCJ2ZXJ0ZXgiLCJub3JtYWwiLCJUb3J1c0tub3QiLCJxIiwiUDEiLCJQMiIsIkIiLCJUIiwiTiIsImNhbGN1bGF0ZVBvc2l0aW9uT25DdXJ2ZSIsImN4IiwiY3kiLCJjdSIsInN1IiwicXVPdmVyUCIsImNzIiwiUHJpc20iXSwibWFwcGluZ3MiOiI7Ozs7OztFQUFBOzs7O0FBSUEsRUFFTyxJQUFJQSxhQUFhLE9BQU9DLFlBQVAsS0FBd0IsV0FBeEIsR0FBc0NBLFlBQXRDLEdBQXFEQyxLQUF0RTtBQUNQLEVBaUNBLElBQUksQ0FBQ0MsS0FBS0MsS0FBVixFQUFpQkQsS0FBS0MsS0FBTCxHQUFhLFlBQVk7RUFDeEMsTUFBSUMsSUFBSSxDQUFSO0VBQUEsTUFDSUMsSUFBSUMsVUFBVUMsTUFEbEI7O0VBR0EsU0FBT0YsR0FBUCxFQUFZO0VBQ1ZELFNBQUtFLFVBQVVELENBQVYsSUFBZUMsVUFBVUQsQ0FBVixDQUFwQjtFQUNEOztFQUVELFNBQU9ILEtBQUtNLElBQUwsQ0FBVUosQ0FBVixDQUFQO0VBQ0QsQ0FUZ0I7O0VDdkNqQjs7Ozs7RUFLQTs7Ozs7O0FBTUEsRUFBTyxTQUFTSyxNQUFULEdBQWtCO0VBQ3ZCLE1BQUlDLE1BQU0sSUFBSUMsVUFBSixDQUF3QixFQUF4QixDQUFWOztFQUVBLE1BQUlBLFVBQUEsSUFBdUJYLFlBQTNCLEVBQXlDO0VBQ3ZDVSxRQUFJLENBQUosSUFBUyxDQUFUO0VBQ0FBLFFBQUksQ0FBSixJQUFTLENBQVQ7RUFDQUEsUUFBSSxDQUFKLElBQVMsQ0FBVDtFQUNBQSxRQUFJLENBQUos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LENBaEJZLEVBaUJaLENBakJZLEVBa0JaLEVBbEJZLEVBbUJaLEVBbkJZLEVBb0JaLENBcEJZLEVBcUJaLENBckJZLEVBc0JaLEVBdEJZLEVBdUJaLENBdkJZLEVBd0JaLEVBeEJZLEVBeUJaLEVBekJZLEVBMEJaLEVBMUJZLEVBMkJaLENBM0JZLEVBNEJaLENBNUJZLEVBNkJaLENBN0JZLEVBOEJaLEVBOUJZLEVBK0JaLENBL0JZLEVBZ0NaLEVBaENZLEVBaUNaLENBakNZLEVBa0NaLENBbENZLEVBbUNaLENBbkNZLEVBb0NaLEVBcENZLEVBcUNaLENBckNZLEVBc0NaLEVBdENZLEVBdUNaLENBdkNZLEVBd0NaLENBeENZLEVBeUNaLENBekNZLEVBMENaLEVBMUNZLEVBMkNaLENBM0NZLEVBNENaLEVBNUNZLEVBNkNaLEVBN0NZLEVBOENaLENBOUNZLEVBK0NaLEVBL0NZLEVBZ0RaLENBaERZLEVBaURaLENBakRZLEVBa0RaLENBbERZLEVBbURaLEVBbkRZLEVBb0RaLENBcERZLEVBcURaLEVBckRZLEVBc0RaLEVBdERZLEVBdURaLENBdkRZLEVBd0RaLEVBeERZLEVBeURaLEVBekRZLEVBMERaLENBMURZLEVBMkRaLEVBM0RZLEVBNERaLENBNURZLEVBNkRaLENBN0RZLEVBOERaLENBOURZLEVBK0RaLEVBL0RZLEVBZ0VaLEVBaEVZLEVBaUVaLENBakVZLEVBa0VaLENBbEVZLEVBbUVaLEVBbkVZLEVBb0VaLENBcEVZLEVBcUVaLEVBckVZLEVBc0VaLEVBdEVZLEVBdUVaLEVBdkVZLEVBd0VaLENBeEVZLEVBeUVaLENBekVZLEVBMEVaLEVBMUVZLEVBMkVaLEVBM0VZLEVBNEVaLENBNUVZLEVBNkVaLEVBN0VZLEVBOEVaLENBOUVZLEVBK0VaLENBL0VZLEVBZ0ZaLENBaEZZLEVBaUZaLENBakZZLEVBa0ZaLEVBbEZZLEVBbUZaLENBbkZZLEVBb0ZaLENBcEZZLEVBcUZaLEVBckZZLEVBc0ZaLENBdEZZLEVBdUZaLEVBdkZZLEVBd0ZaLEVBeEZZLEVBeUZaLEVBekZZLEVBMEZaLENBMUZZLEVBMkZa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
