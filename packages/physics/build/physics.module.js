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
 * Calculates the squared euclidian distance between two vec3's
 *
 * @param {vec3} a the first operand
 * @param {vec3} b the second operand
 * @returns {Number} squared distance between a and b
 */
function squaredDistance(a, b) {
  var x = b[0] - a[0];
  var y = b[1] - a[1];
  var z = b[2] - a[2];
  return x * x + y * y + z * z;
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

var handleContact = function handleContact(a, b, depth, direction) {
    var mt = a.inversemass() + b.inversemass();
    var f1 = a.inversemass() / mt;
    var f2 = b.inversemass() / mt;

    var off1 = depth * f1;
    var off2 = depth * f2;

    a.velocity[0] += direction[0] * off1;
    a.velocity[1] += direction[1] * off1;
    a.velocity[2] += direction[2] * off1;

    b.velocity[0] -= direction[0] * off2;
    b.velocity[1] -= direction[1] * off2;
    b.velocity[2] -= direction[2] * off2;

    // restitute
};

var sphereIntersectSphere = function sphereIntersectSphere(a, b) {
    var r = a.collider.radius * 2 + b.collider.radius * 2;
    var target = r * r;
    var length$$1 = squaredDistance(a.position, b.position);

    if (length$$1 < target) {
        subtract$4(tempDirection, a.position, b.position);
        normalize(tempDirection, tempDirection);

        handleContact(a, b, target - length$$1, tempDirection);
    }
};

var checkContacts = function checkContacts(a, b) {
    switch (a.collider.type) {
        case SPHERE_COLLIDER:
            // surely there's a better way
            if (b.collider.type === SPHERE_COLLIDER) {
                sphereIntersectSphere(a, b);
            } else if (b.collider.type === AABB_COLLIDER) ;
            break;
        default:

    }
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

                    if (i === 0 && j === 1) {
                        console.log(a.collider);
                    }
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
    }, {
        key: 'debug',
        value: function debug() {
            // TODO: debugs the world in a canvas 2d
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
            mass: 1,
            velocity: create$4(),
            acceleration: create$4(),
            position: create$4(),
            force: create$4()
        }, params);

        // copy mesh position
        copy$4(this.position, this.mesh.position.data);
    }

    createClass(RigidBody, [{
        key: 'inversemass',
        value: function inversemass() {
            return 1 / this.mass;
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
            if (!this.awake) {
                return;
            }

            // calculate acceleration
            this.acceleration[0] = this.force[0] / this.mass;
            this.acceleration[1] = this.force[1] / this.mass;
            this.acceleration[2] = this.force[2] / this.mass;

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
            radius: 1
        }, params);
    }

    createClass(SphereCollider, [{
        key: 'updateBounds',
        value: function updateBounds(position) {
            this.left = position[0] - this.radius;
            this.right = position[0] + this.radius;

            this.top = position[1] + this.radius;
            this.bottom = position[1] - this.radius;

            this.front = position[2] + this.radius;
            this.back = position[2] - this.radius;
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
            depth: 1
        }, params);
    }

    createClass(AABBCollider, [{
        key: 'updateBounds',
        value: function updateBounds(position) {
            var width = this.width / 2;
            var height = this.height / 2;
            var depth = this.depth / 2;

            this.left = position[0] - width;
            this.right = position[0] + width;

            this.top = position[1] + height;
            this.bottom = position[1] - height;

            this.front = position[2] + depth;
            this.back = position[2] - depth;
        }
    }]);
    return AABBCollider;
}();

var Force = function Force() {
    var force = arguments.length > 0 && arguments[0] !== undefined ? arguments[0] : create$4();
    classCallCheck(this, Force);

    this.type = FORCE;
    this.data = fromValues$4(force[0], force[1], force[2]);
};

// world

export { World, RigidBody, SphereCollider, AABBCollider, Force };
