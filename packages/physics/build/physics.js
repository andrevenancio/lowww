(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? factory(exports) :
    typeof define === 'function' && define.amd ? define(['exports'], factory) :
    (factory((global.lowww = global.lowww || {}, global.lowww.physics = {})));
}(this, (function (exports) { 'use strict';

    var types = {
        AABB: 'aabb',
        SPHERE: 'sphere',
        FORCE: 'force'
    };

    var bodyId = 0;
    var getID = function getID() {
        return bodyId++;
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

    // inspired on microphysics
    /* eslint-disable */
    var byLeft = function byLeft(b1, b2) {
        return b1.left - b2.left;
    };

    var World = function () {
        function World() {
            classCallCheck(this, World);

            this.u = 0;
            this.bodies = [];
            this.forces = [];
            this.managed = [this.bodies, this.forces];
        }

        createClass(World, [{
            key: 'add',
            value: function add() {
                for (var i = 0; i < arguments.length; i++) {
                    var obj = arguments[i];
                    obj.world = this;

                    if (obj.type === types.FORCE) {
                        this.forces.push(obj);
                    } else {
                        this.bodies.push(obj);
                    }
                }
                return this;
            }
        }, {
            key: 'remove',
            value: function remove() {
                for (var i = 0; i < arguments.length; i++) {
                    var obj = arguments[i];
                    obj.remove();
                }
            }
        }, {
            key: 'onContact',
            value: function onContact(body1, body2) {
                // TODO: empty
            }
        }, {
            key: 'momentum',
            value: function momentum() {
                for (var i = 0; i < this.bodies.length; i++) {
                    this.bodies[i].momentum();
                }
            }
        }, {
            key: 'applyAcceleration',
            value: function applyAcceleration(delta) {
                var sdelta = delta * delta;
                for (var i = 0; i < this.bodies.length; i++) {
                    this.bodies[i].applyAcceleration(sdelta);
                }
            }
        }, {
            key: 'collide',
            value: function collide(restitute) {
                this.updateBoundingVolumes();
                this.bodies.sort(byLeft);

                for (var i = 0; i < this.bodies.length - 1; i++) {
                    var b1 = this.bodies[i];
                    for (var j = i + 1; j < this.bodies.length; j++) {
                        var b2 = this.bodies[j];

                        if (b1.dynamic || b2.dynamic) {
                            if (b1.right > b2.left) {
                                // console.log('back', b1.back, 'front', b2.front); // && b1.front > b2.back && b1.bottom < b2.top && b1.top > b2.bottom);
                                if (b1.back < b2.front && b1.front > b2.back && b1.bottom < b2.top && b1.top > b2.bottom) {
                                    b1.collide(b2, restitute);
                                }
                            } else {
                                break;
                            }
                        }
                    }
                }
                // debugger;
            }
        }, {
            key: 'getCollection',
            value: function getCollection() {
                var c = [];
                this.managed.push(c);
                return c;
            }
        }, {
            key: 'cleanupCollection',
            value: function cleanupCollection(c) {
                for (var i = 0; i < c.length; i++) {
                    if (c[i].to_remove) {
                        c.splice(i, 1);
                        i--;
                    }
                }
            }
        }, {
            key: 'cleanup',
            value: function cleanup() {
                var managed = this.managed;
                var l = managed.length;
                for (var i = 0; i < l; i++) {
                    this.cleanupCollection(managed[i]);
                }
            }
        }, {
            key: 'updateBoundingVolumes',
            value: function updateBoundingVolumes() {
                for (var i = 0; i < this.bodies.length; i++) {
                    this.bodies[i].updateBoundingVolume();
                }
            }
        }, {
            key: 'onestep',
            value: function onestep(delta) {
                this.time += delta;
                this.accelerate(delta);
                this.applyAcceleration(delta);
                this.collide(false);
                this.momentum();
                this.collide(true);
                this.updateMeshPosition();
                this.cleanup();
            }
        }, {
            key: 'step',
            value: function step(timestep, now) {
                if (now - this.time > 0.25) {
                    this.time = now - 0.25;
                }

                while (this.time < now) {
                    this.onestep(timestep);
                }

                var diff = this.time - now;
                if (diff > 0) {
                    this.u = (timestep - diff) / timestep;
                } else {
                    this.u = 1.0;
                }
            }
        }, {
            key: 'start',
            value: function start(time) {
                this.time = time;
            }
        }, {
            key: 'accelerate',
            value: function accelerate(delta) {
                for (var i = 0; i < this.forces.length; i++) {
                    this.forces[i].perform(this.bodies, delta);
                }
            }
        }, {
            key: 'updateMeshPosition',
            value: function updateMeshPosition() {
                var mesh = void 0;
                for (var i = 0; i < this.bodies.length; i++) {
                    mesh = this.bodies[i].mesh;
                    if (mesh) {
                        var _position = this.bodies[i].getPosition();
                        mesh.position.set(_position[0], _position[1], _position[2]);
                    }
                }
            }
        }]);
        return World;
    }();

    var Body = function () {
        function Body() {
            classCallCheck(this, Body);
        }

        createClass(Body, [{
            key: 'init',
            value: function init(args) {
                var params = Object.assign({}, {
                    hardness: 1,
                    restitution: 1,
                    x: 0,
                    y: 0,
                    z: 0,
                    density: 1
                }, args);

                this.id = getID();

                this.restitution = params.restitution;
                this.hardness = params.hardness;
                this.density = params.density;

                if (params.mass === 0 || this.dynamic === false) {
                    this.mass = 0;
                    this.inv_mass = 0;
                } else {
                    this.mass = params.mass || this.computeMass();
                    this.inv_mass = 1 / this.mass;
                }

                this.ax = 0;
                this.ay = 0;
                this.az = 0;

                this.x = params.x;
                this.y = params.y;
                this.z = params.z;

                this.px = this.x;
                this.py = this.y;
                this.pz = this.z;
            }
        }, {
            key: 'onContact',
            value: function onContact(other) {
                this.world.onContact(this, other);
            }
        }, {
            key: 'remove',
            value: function remove() {
                this.to_remove = true;
            }
        }, {
            key: 'computeMass',
            value: function computeMass() {
                return this.density;
            }
        }, {
            key: 'setVelocity',
            value: function setVelocity(x, y, z) {
                this.px = this.x - x;
                this.py = this.y - y;
                this.pz = this.z - z;
            }
        }, {
            key: 'getVelocity',
            value: function getVelocity() {
                return [this.x - this.px, this.y - this.py, this.z - this.pz];
            }
        }, {
            key: 'setPosition',
            value: function setPosition(x, y, z) {
                // TODO: does the order matter?
                var velocity = this.getVelocity();
                this.x = x;
                this.y = y;
                this.z = z;
                this.setVelocity(velocity[0], velocity[1], velocity[2]);
            }
        }, {
            key: 'getPosition',
            value: function getPosition() {
                var u = this.world.u;

                return [this.px + (this.x - this.px) * u, this.py + (this.y - this.py) * u, this.pz + (this.z - this.pz) * u];
            }
        }, {
            key: 'separatingVelocity',
            value: function separatingVelocity(other) {
                var b1 = this;
                var b2 = other;

                var x = b1.x - b2.x;
                var y = b1.y - b2.y;
                var z = b1.z - b2.z;
                var l = Math.sqrt(x * x + y * y + z * z);
                var xn = x / l;
                var yn = y / l;
                var zn = z / l;

                var v1 = b1.getVelocity();
                var v2 = b2.getVelocity();

                var vrx = v1[0] - v2[0];
                var vry = v1[1] - v2[1];
                var vrz = v1[2] - v2[2];

                var vdotn = vrx * xn + vry * yn + vrz * zn;
                var xs = vrx * vdotn;
                var ys = vry * vdotn;
                var zs = vrz * vdotn;
                var speed = Math.sqrt(xs * xs + ys * ys + zs * zs);

                return speed;
            }
        }, {
            key: 'collide',
            value: function collide(other, restitute) {
                switch (other.type) {
                    case types.AABB:
                        this.collideAABB(other, restitute);
                        break;
                    case types.SPHERE:
                        this.collideSphere(other, restitute);
                        break;
                    default:
                        break;
                }
            }
        }, {
            key: 'collideAABB',
            value: function collideAABB() {
                // to be overriden by Sphere of AABB
            }
        }, {
            key: 'collideSphere',
            value: function collideSphere() {
                // to be overriden by Sphere of AABB
            }
        }, {
            key: 'momentum',
            value: function momentum() {
                if (this.dynamic) {
                    var x = this.x,
                        y = this.y,
                        z = this.z;


                    var xn = x * 2 - this.px;
                    var yn = y * 2 - this.py;
                    var zn = z * 2 - this.pz;

                    this.px = x;
                    this.py = y;
                    this.pz = z;

                    this.x = xn;
                    this.y = yn;
                    this.z = zn;
                }
            }
        }, {
            key: 'applyAcceleration',
            value: function applyAcceleration(sdelta) {
                if (this.dynamic) {
                    this.x += this.ax * sdelta;
                    this.y += this.ay * sdelta;
                    this.z += this.az * sdelta;

                    this.ax = 0;
                    this.ay = 0;
                    this.az = 0;
                }
            }
        }, {
            key: 'accelerate',
            value: function accelerate(x, y, z) {
                if (this.dynamic) {
                    this.ax += x;
                    this.ay += y;
                    this.az += z;
                }
            }
        }]);
        return Body;
    }();

    /* eslint-disable */
    var clamp = function clamp(left, right, value) {
        return value < left ? left : value > right ? right : value; // eslint-disable-line
    };

    var handleContact = function handleContact(b1, b2, depth, xn, yn, zn, restitute) {
        var v1x = b1.x - b1.px;
        var v1y = b1.y - b1.py;
        var v1z = b1.z - b1.pz;

        var v2x = b2.x - b2.px;
        var v2y = b2.y - b2.py;
        var v2z = b2.z - b2.pz;

        var mt = b1.inv_mass + b2.inv_mass;
        var f1 = b1.inv_mass / mt;
        var f2 = b2.inv_mass / mt;

        var off1 = depth * f1;
        var off2 = depth * f2;

        b1.x += xn * off1;
        b1.y += yn * off1;
        b1.z += zn * off1;
        b2.x -= xn * off2;
        b2.y -= yn * off2;
        b2.z -= zn * off2;

        if (restitute) {
            var vrx = v1x - v2x;
            var vry = v1y - v2y;
            var vrz = v1z - v2z;

            var vdotn = vrx * xn + vry * yn + vrz * zn;
            var modifiedVelocity = vdotn / mt;

            var j1 = -(1 + b2.restitution) * modifiedVelocity * b1.inv_mass;
            var j2 = -(1 + b1.restitution) * modifiedVelocity * b2.inv_mass;

            v1x += j1 * xn;
            v1y += j1 * yn;
            v1z += j1 * zn;

            v2x -= j2 * xn;
            v2y -= j2 * yn;
            v2z -= j2 * zn;

            b1.setVelocity(v1x, v1y, v1z);
            b2.setVelocity(v2x, v2y, v2z);
        }
    };

    var AABB = function (_Body) {
        inherits(AABB, _Body);

        function AABB(args) {
            classCallCheck(this, AABB);

            // TODO: does nothing
            var _this = possibleConstructorReturn(this, (AABB.__proto__ || Object.getPrototypeOf(AABB)).call(this));

            var params = Object.assign({}, {
                width: 1,
                height: 1,
                depth: 1
            }, args);

            _this.type = types.AABB;
            _this.dynamic = false;
            _this.width = params.width;
            _this.height = params.height;
            _this.depth = params.depth;

            _this.mesh = params.mesh;
            _this.init(params);
            return _this;
        }

        createClass(AABB, [{
            key: 'updateBoundingVolume',
            value: function updateBoundingVolume() {
                var x = this.x,
                    y = this.y,
                    z = this.z;

                var width = this.width / 2;
                var height = this.height / 2;
                var depth = this.depth / 2;

                this.left = x - width;
                this.right = x + width;

                this.top = y + height;
                this.bottom = y - height;

                this.front = z + depth;
                this.back = z - depth;

                return this;
            }
        }, {
            key: 'collideSphere',
            value: function collideSphere(b, restitute) {
                var cx = clamp(this.left, this.right, b.x);
                var cy = clamp(this.bottom, this.top, b.y);
                var cz = clamp(this.back, this.front, b.z);

                var x = cx - b.x;
                var y = cy - b.y;
                var z = cz - b.z;

                var ls = x * x + y * y + z * z;

                if (ls === 0) {
                    var _x = this.z - b.x;
                    var _y = this.y - b.y;
                    var _z = this.z - b.z;
                }

                if (ls === 0) {
                    return;
                }

                var radius = b.radius;
                if (ls < radius * radius) {
                    var l = Math.sqrt(ls);
                    var xn = x / l;
                    var yn = y / l;
                    var zn = z / l;
                    handleContact(this, b, radius - l, xn, yn, zn, restitute);
                    this.onContact(b);
                }
            }
        }]);
        return AABB;
    }(Body);

    var handleContact$1 = function handleContact(b1, b2, depth, xn, yn, zn, restitute) {
        var v1x = b1.x - b1.px;
        var v1y = b1.y - b1.py;
        var v1z = b1.z - b1.pz;

        var v2x = b2.x - b2.px;
        var v2y = b2.y - b2.py;
        var v2z = b2.z - b2.pz;

        var mt = b1.inv_mass + b2.inv_mass;
        var f1 = b1.inv_mass / mt;
        var f2 = b2.inv_mass / mt;

        var off1 = depth * f1;
        var off2 = depth * f2;

        b1.x += xn * off1;
        b1.y += yn * off1;
        b1.z += zn * off1;
        b2.x -= xn * off2;
        b2.y -= yn * off2;
        b2.z -= zn * off2;

        if (restitute) {
            var vrx = v1x - v2x;
            var vry = v1y - v2y;
            var vrz = v1z - v2z;

            var vdotn = vrx * xn + vry * yn + vrz * zn;
            var modifiedVelocity = vdotn / mt;

            var j1 = -(1 + b2.restitution) * modifiedVelocity * b1.inv_mass;
            var j2 = -(1 + b1.restitution) * modifiedVelocity * b2.inv_mass;

            v1x += j1 * xn;
            v1y += j1 * yn;
            v1z += j1 * zn;

            v2x -= j2 * xn;
            v2y -= j2 * yn;
            v2z -= j2 * zn;

            b1.setVelocity(v1x, v1y, v1z);
            b2.setVelocity(v2x, v2y, v2z);
        }
    };

    var Sphere = function (_Body) {
        inherits(Sphere, _Body);

        function Sphere(args) {
            classCallCheck(this, Sphere);

            var _this = possibleConstructorReturn(this, (Sphere.__proto__ || Object.getPrototypeOf(Sphere)).call(this));

            _this.type = types.SPHERE;
            _this.dynamic = true;

            var params = Object.assign({}, {
                radius: 1
            }, args);

            _this.radius = params.radius;
            _this.mesh = params.mesh;
            _this.init(params);
            return _this;
        }

        createClass(Sphere, [{
            key: 'computeMass',
            value: function computeMass() {
                return 4 / 3 * Math.PI * Math.pow(this.radius, 3) * this.density;
            }
        }, {
            key: 'collideAABB',
            value: function collideAABB(other, restitute) {
                other.collideSphere(this, restitute);
            }
        }, {
            key: 'updateBoundingVolume',
            value: function updateBoundingVolume() {
                var x = this.x,
                    y = this.y,
                    z = this.z,
                    radius = this.radius;


                this.left = x - radius;
                this.right = x + radius;

                this.top = y + radius;
                this.bottom = y - radius;

                this.front = z + radius;
                this.back = z - radius;

                return this;
            }
        }, {
            key: 'collideSphere',
            value: function collideSphere(b2, restitute) {
                var b1 = this;

                var x = b1.x - b2.x;
                var y = b1.y - b2.y;
                var z = b1.z - b2.z;

                var ls = x * x + y * y + z * z;
                var target = b1.radius + b2.radius;

                if (ls !== 0 && ls < target * target) {
                    var l = Math.sqrt(ls);
                    var xn = x / l;
                    var yn = y / l;
                    var zn = z / l;

                    handleContact$1(b1, b2, target - l, xn, yn, zn, restitute);
                    b1.onContact(b2);
                }
            }
        }]);
        return Sphere;
    }(Body);

    var Force = function () {
        function Force() {
            classCallCheck(this, Force);

            this.type = types.FORCE;
        }

        createClass(Force, [{
            key: 'remove',
            value: function remove() {
                this.to_remove = true;
            }
        }]);
        return Force;
    }();

    var LinearAccelerator = function (_Force) {
        inherits(LinearAccelerator, _Force);

        function LinearAccelerator(direction) {
            classCallCheck(this, LinearAccelerator);

            var _this = possibleConstructorReturn(this, (LinearAccelerator.__proto__ || Object.getPrototypeOf(LinearAccelerator)).call(this));

            _this.x = direction.x;
            _this.y = direction.y;
            _this.z = direction.z;
            return _this;
        }

        createClass(LinearAccelerator, [{
            key: 'perform',
            value: function perform(bodies) {
                var x = this.x,
                    y = this.y,
                    z = this.z;

                for (var i = 0; i < bodies.length; i++) {
                    bodies[i].accelerate(x, y, z);
                }
            }
        }]);
        return LinearAccelerator;
    }(Force);

    exports.World = World;
    exports.Body = Body;
    exports.Sphere = Sphere;
    exports.AABB = AABB;
    exports.LinearAccelerator = LinearAccelerator;

    Object.defineProperty(exports, '__esModule', { value: true });

})));
//# sourceMappingURL=data:application/json;charset=utf-8;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoicGh5c2ljcy5qcyIsInNvdXJjZXMiOlsiLi4vc3JjL2NvbnN0YW50cy5qcyIsIi4uL3NyYy9jb3JlL3dvcmxkLmpzIiwiLi4vc3JjL2NvcmUvYm9keS5qcyIsIi4uL3NyYy9ib2RpZXMvYWFiYi5qcyIsIi4uL3NyYy9ib2RpZXMvc3BoZXJlLmpzIiwiLi4vc3JjL2NvcmUvZm9yY2UuanMiLCIuLi9zcmMvbGluZWFyLWFjY2VsZXJhdG9yLmpzIl0sInNvdXJjZXNDb250ZW50IjpbImV4cG9ydCBjb25zdCB0eXBlcyA9IHtcbiAgICBBQUJCOiAnYWFiYicsXG4gICAgU1BIRVJFOiAnc3BoZXJlJyxcbiAgICBGT1JDRTogJ2ZvcmNlJyxcbn07XG5cbmxldCBib2R5SWQgPSAwO1xuZXhwb3J0IGNvbnN0IGdldElEID0gKCkgPT4ge1xuICAgIHJldHVybiBib2R5SWQrKztcbn07XG4iLCIvLyBpbnNwaXJlZCBvbiBtaWNyb3BoeXNpY3NcbmltcG9ydCB7IHR5cGVzIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcbi8qIGVzbGludC1kaXNhYmxlICovXG5jb25zdCBieUxlZnQgPSAoYjEsIGIyKSA9PiB7XG4gICAgcmV0dXJuIGIxLmxlZnQgLSBiMi5sZWZ0O1xufTtcblxuY2xhc3MgV29ybGQge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnUgPSAwO1xuICAgICAgICB0aGlzLmJvZGllcyA9IFtdO1xuICAgICAgICB0aGlzLmZvcmNlcyA9IFtdO1xuICAgICAgICB0aGlzLm1hbmFnZWQgPSBbdGhpcy5ib2RpZXMsIHRoaXMuZm9yY2VzXTtcbiAgICB9XG5cbiAgICBhZGQoKSB7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgYXJndW1lbnRzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBjb25zdCBvYmogPSBhcmd1bWVudHNbaV07XG4gICAgICAgICAgICBvYmoud29ybGQgPSB0aGlzO1xuXG4gICAgICAgICAgICBpZiAob2JqLnR5cGUgPT09IHR5cGVzLkZPUkNFKSB7XG4gICAgICAgICAgICAgICAgdGhpcy5mb3JjZXMucHVzaChvYmopO1xuICAgICAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgICAgICB0aGlzLmJvZGllcy5wdXNoKG9iaik7XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgcmVtb3ZlKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IGFyZ3VtZW50cy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgY29uc3Qgb2JqID0gYXJndW1lbnRzW2ldO1xuICAgICAgICAgICAgb2JqLnJlbW92ZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25Db250YWN0KGJvZHkxLCBib2R5Mikge1xuICAgICAgICAvLyBUT0RPOiBlbXB0eVxuICAgIH1cblxuICAgIG1vbWVudHVtKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJvZGllc1tpXS5tb21lbnR1bSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXBwbHlBY2NlbGVyYXRpb24oZGVsdGEpIHtcbiAgICAgICAgY29uc3Qgc2RlbHRhID0gZGVsdGEgKiBkZWx0YTtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmJvZGllcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5ib2RpZXNbaV0uYXBwbHlBY2NlbGVyYXRpb24oc2RlbHRhKTtcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbGxpZGUocmVzdGl0dXRlKSB7XG4gICAgICAgIHRoaXMudXBkYXRlQm91bmRpbmdWb2x1bWVzKCk7XG4gICAgICAgIHRoaXMuYm9kaWVzLnNvcnQoYnlMZWZ0KTtcblxuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYm9kaWVzLmxlbmd0aCAtIDE7IGkrKykge1xuICAgICAgICAgICAgY29uc3QgYjEgPSB0aGlzLmJvZGllc1tpXTtcbiAgICAgICAgICAgIGZvciAobGV0IGogPSBpICsgMTsgaiA8IHRoaXMuYm9kaWVzLmxlbmd0aDsgaisrKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgYjIgPSB0aGlzLmJvZGllc1tqXTtcblxuICAgICAgICAgICAgICAgIGlmIChiMS5keW5hbWljIHx8IGIyLmR5bmFtaWMpIHtcbiAgICAgICAgICAgICAgICAgICAgaWYgKGIxLnJpZ2h0ID4gYjIubGVmdCkge1xuICAgICAgICAgICAgICAgICAgICAgICAgLy8gY29uc29sZS5sb2coJ2JhY2snLCBiMS5iYWNrLCAnZnJvbnQnLCBiMi5mcm9udCk7IC8vICYmIGIxLmZyb250ID4gYjIuYmFjayAmJiBiMS5ib3R0b20gPCBiMi50b3AgJiYgYjEudG9wID4gYjIuYm90dG9tKTtcbiAgICAgICAgICAgICAgICAgICAgICAgIGlmIChiMS5iYWNrIDwgYjIuZnJvbnQgJiYgYjEuZnJvbnQgPiBiMi5iYWNrICYmIGIxLmJvdHRvbSA8IGIyLnRvcCAmJiBiMS50b3AgPiBiMi5ib3R0b20pIHtcbiAgICAgICAgICAgICAgICAgICAgICAgICAgICBiMS5jb2xsaWRlKGIyLCByZXN0aXR1dGUpO1xuICAgICAgICAgICAgICAgICAgICAgICAgfVxuICAgICAgICAgICAgICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgICAgICAgICAgICAgIH1cbiAgICAgICAgICAgICAgICB9XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICAgICAgLy8gZGVidWdnZXI7XG4gICAgfVxuXG4gICAgZ2V0Q29sbGVjdGlvbigpIHtcbiAgICAgICAgdmFyIGMgPSBbXTtcbiAgICAgICAgdGhpcy5tYW5hZ2VkLnB1c2goYyk7XG4gICAgICAgIHJldHVybiBjO1xuICAgIH1cblxuICAgIGNsZWFudXBDb2xsZWN0aW9uKGMpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBjLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBpZiAoY1tpXS50b19yZW1vdmUpIHtcbiAgICAgICAgICAgICAgICBjLnNwbGljZShpLCAxKTtcbiAgICAgICAgICAgICAgICBpLS07XG4gICAgICAgICAgICB9XG4gICAgICAgIH1cbiAgICB9XG5cbiAgICBjbGVhbnVwKCkge1xuICAgICAgICBjb25zdCBtYW5hZ2VkID0gdGhpcy5tYW5hZ2VkO1xuICAgICAgICBjb25zdCBsID0gbWFuYWdlZC5sZW5ndGg7XG4gICAgICAgIGZvciAobGV0IGkgPSAwOyBpIDwgbDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmNsZWFudXBDb2xsZWN0aW9uKG1hbmFnZWRbaV0pO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlQm91bmRpbmdWb2x1bWVzKCkge1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICB0aGlzLmJvZGllc1tpXS51cGRhdGVCb3VuZGluZ1ZvbHVtZSgpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgb25lc3RlcChkZWx0YSkge1xuICAgICAgICB0aGlzLnRpbWUgKz0gZGVsdGE7XG4gICAgICAgIHRoaXMuYWNjZWxlcmF0ZShkZWx0YSk7XG4gICAgICAgIHRoaXMuYXBwbHlBY2NlbGVyYXRpb24oZGVsdGEpO1xuICAgICAgICB0aGlzLmNvbGxpZGUoZmFsc2UpO1xuICAgICAgICB0aGlzLm1vbWVudHVtKCk7XG4gICAgICAgIHRoaXMuY29sbGlkZSh0cnVlKTtcbiAgICAgICAgdGhpcy51cGRhdGVNZXNoUG9zaXRpb24oKTtcbiAgICAgICAgdGhpcy5jbGVhbnVwKCk7XG4gICAgfVxuXG4gICAgc3RlcCh0aW1lc3RlcCwgbm93KSB7XG4gICAgICAgIGlmIChub3cgLSB0aGlzLnRpbWUgPiAwLjI1KSB7XG4gICAgICAgICAgICB0aGlzLnRpbWUgPSBub3cgLSAwLjI1O1xuICAgICAgICB9XG5cbiAgICAgICAgd2hpbGUgKHRoaXMudGltZSA8IG5vdykge1xuICAgICAgICAgICAgdGhpcy5vbmVzdGVwKHRpbWVzdGVwKTtcbiAgICAgICAgfVxuXG4gICAgICAgIGNvbnN0IGRpZmYgPSB0aGlzLnRpbWUgLSBub3c7XG4gICAgICAgIGlmIChkaWZmID4gMCl7XG4gICAgICAgICAgICB0aGlzLnUgPSAodGltZXN0ZXAgLSBkaWZmKSAvIHRpbWVzdGVwO1xuICAgICAgICB9IGVsc2Uge1xuICAgICAgICAgICAgdGhpcy51ID0gMS4wO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgc3RhcnQodGltZSkge1xuICAgICAgICB0aGlzLnRpbWUgPSB0aW1lO1xuICAgIH1cblxuICAgIGFjY2VsZXJhdGUoZGVsdGEpIHtcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCB0aGlzLmZvcmNlcy5sZW5ndGg7IGkrKykge1xuICAgICAgICAgICAgdGhpcy5mb3JjZXNbaV0ucGVyZm9ybSh0aGlzLmJvZGllcywgZGVsdGEpO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgdXBkYXRlTWVzaFBvc2l0aW9uKCkge1xuICAgICAgICBsZXQgbWVzaDtcbiAgICAgICAgbGV0IHBvc2l0aW9uO1xuICAgICAgICBmb3IgKGxldCBpID0gMDsgaSA8IHRoaXMuYm9kaWVzLmxlbmd0aDsgaSsrKSB7XG4gICAgICAgICAgICBtZXNoID0gdGhpcy5ib2RpZXNbaV0ubWVzaDtcbiAgICAgICAgICAgIGlmIChtZXNoKSB7XG4gICAgICAgICAgICAgICAgY29uc3QgcG9zaXRpb24gPSB0aGlzLmJvZGllc1tpXS5nZXRQb3NpdGlvbigpO1xuICAgICAgICAgICAgICAgIG1lc2gucG9zaXRpb24uc2V0KHBvc2l0aW9uWzBdLCBwb3NpdGlvblsxXSwgcG9zaXRpb25bMl0pO1xuICAgICAgICAgICAgfVxuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBXb3JsZDtcbiIsImltcG9ydCB7IHR5cGVzLCBnZXRJRCB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbmNsYXNzIEJvZHkge1xuICAgIGluaXQoYXJncykge1xuICAgICAgICBjb25zdCBwYXJhbXMgPSBPYmplY3QuYXNzaWduKHt9LCB7XG4gICAgICAgICAgICBoYXJkbmVzczogMSxcbiAgICAgICAgICAgIHJlc3RpdHV0aW9uOiAxLFxuICAgICAgICAgICAgeDogMCxcbiAgICAgICAgICAgIHk6IDAsXG4gICAgICAgICAgICB6OiAwLFxuICAgICAgICAgICAgZGVuc2l0eTogMSxcbiAgICAgICAgfSwgYXJncyk7XG5cbiAgICAgICAgdGhpcy5pZCA9IGdldElEKCk7XG5cbiAgICAgICAgdGhpcy5yZXN0aXR1dGlvbiA9IHBhcmFtcy5yZXN0aXR1dGlvbjtcbiAgICAgICAgdGhpcy5oYXJkbmVzcyA9IHBhcmFtcy5oYXJkbmVzcztcbiAgICAgICAgdGhpcy5kZW5zaXR5ID0gcGFyYW1zLmRlbnNpdHk7XG5cbiAgICAgICAgaWYgKHBhcmFtcy5tYXNzID09PSAwIHx8IHRoaXMuZHluYW1pYyA9PT0gZmFsc2UpIHtcbiAgICAgICAgICAgIHRoaXMubWFzcyA9IDA7XG4gICAgICAgICAgICB0aGlzLmludl9tYXNzID0gMDtcbiAgICAgICAgfSBlbHNlIHtcbiAgICAgICAgICAgIHRoaXMubWFzcyA9IHBhcmFtcy5tYXNzIHx8IHRoaXMuY29tcHV0ZU1hc3MoKTtcbiAgICAgICAgICAgIHRoaXMuaW52X21hc3MgPSAxIC8gdGhpcy5tYXNzO1xuICAgICAgICB9XG5cbiAgICAgICAgdGhpcy5heCA9IDA7XG4gICAgICAgIHRoaXMuYXkgPSAwO1xuICAgICAgICB0aGlzLmF6ID0gMDtcblxuICAgICAgICB0aGlzLnggPSBwYXJhbXMueDtcbiAgICAgICAgdGhpcy55ID0gcGFyYW1zLnk7XG4gICAgICAgIHRoaXMueiA9IHBhcmFtcy56O1xuXG4gICAgICAgIHRoaXMucHggPSB0aGlzLng7XG4gICAgICAgIHRoaXMucHkgPSB0aGlzLnk7XG4gICAgICAgIHRoaXMucHogPSB0aGlzLno7XG4gICAgfVxuXG4gICAgb25Db250YWN0KG90aGVyKSB7XG4gICAgICAgIHRoaXMud29ybGQub25Db250YWN0KHRoaXMsIG90aGVyKTtcbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMudG9fcmVtb3ZlID0gdHJ1ZTtcbiAgICB9XG5cbiAgICBjb21wdXRlTWFzcygpIHtcbiAgICAgICAgcmV0dXJuIHRoaXMuZGVuc2l0eTtcbiAgICB9XG5cbiAgICBzZXRWZWxvY2l0eSh4LCB5LCB6KSB7XG4gICAgICAgIHRoaXMucHggPSB0aGlzLnggLSB4O1xuICAgICAgICB0aGlzLnB5ID0gdGhpcy55IC0geTtcbiAgICAgICAgdGhpcy5weiA9IHRoaXMueiAtIHo7XG4gICAgfVxuXG4gICAgZ2V0VmVsb2NpdHkoKSB7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLnggLSB0aGlzLnB4LFxuICAgICAgICAgICAgdGhpcy55IC0gdGhpcy5weSxcbiAgICAgICAgICAgIHRoaXMueiAtIHRoaXMucHosXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc2V0UG9zaXRpb24oeCwgeSwgeikge1xuICAgICAgICAvLyBUT0RPOiBkb2VzIHRoZSBvcmRlciBtYXR0ZXI/XG4gICAgICAgIGNvbnN0IHZlbG9jaXR5ID0gdGhpcy5nZXRWZWxvY2l0eSgpO1xuICAgICAgICB0aGlzLnggPSB4O1xuICAgICAgICB0aGlzLnkgPSB5O1xuICAgICAgICB0aGlzLnogPSB6O1xuICAgICAgICB0aGlzLnNldFZlbG9jaXR5KHZlbG9jaXR5WzBdLCB2ZWxvY2l0eVsxXSwgdmVsb2NpdHlbMl0pO1xuICAgIH1cblxuICAgIGdldFBvc2l0aW9uKCkge1xuICAgICAgICBjb25zdCB7IHUgfSA9IHRoaXMud29ybGQ7XG4gICAgICAgIHJldHVybiBbXG4gICAgICAgICAgICB0aGlzLnB4ICsgKCh0aGlzLnggLSB0aGlzLnB4KSAqIHUpLFxuICAgICAgICAgICAgdGhpcy5weSArICgodGhpcy55IC0gdGhpcy5weSkgKiB1KSxcbiAgICAgICAgICAgIHRoaXMucHogKyAoKHRoaXMueiAtIHRoaXMucHopICogdSksXG4gICAgICAgIF07XG4gICAgfVxuXG4gICAgc2VwYXJhdGluZ1ZlbG9jaXR5KG90aGVyKSB7XG4gICAgICAgIGNvbnN0IGIxID0gdGhpcztcbiAgICAgICAgY29uc3QgYjIgPSBvdGhlcjtcblxuICAgICAgICBjb25zdCB4ID0gYjEueCAtIGIyLng7XG4gICAgICAgIGNvbnN0IHkgPSBiMS55IC0gYjIueTtcbiAgICAgICAgY29uc3QgeiA9IGIxLnogLSBiMi56O1xuICAgICAgICBjb25zdCBsID0gTWF0aC5zcXJ0KCh4ICogeCkgKyAoeSAqIHkpICsgKHogKiB6KSk7XG4gICAgICAgIGNvbnN0IHhuID0geCAvIGw7XG4gICAgICAgIGNvbnN0IHluID0geSAvIGw7XG4gICAgICAgIGNvbnN0IHpuID0geiAvIGw7XG5cbiAgICAgICAgY29uc3QgdjEgPSBiMS5nZXRWZWxvY2l0eSgpO1xuICAgICAgICBjb25zdCB2MiA9IGIyLmdldFZlbG9jaXR5KCk7XG5cbiAgICAgICAgY29uc3QgdnJ4ID0gdjFbMF0gLSB2MlswXTtcbiAgICAgICAgY29uc3QgdnJ5ID0gdjFbMV0gLSB2MlsxXTtcbiAgICAgICAgY29uc3QgdnJ6ID0gdjFbMl0gLSB2MlsyXTtcblxuICAgICAgICBjb25zdCB2ZG90biA9ICh2cnggKiB4bikgKyAodnJ5ICogeW4pICsgKHZyeiAqIHpuKTtcbiAgICAgICAgY29uc3QgeHMgPSB2cnggKiB2ZG90bjtcbiAgICAgICAgY29uc3QgeXMgPSB2cnkgKiB2ZG90bjtcbiAgICAgICAgY29uc3QgenMgPSB2cnogKiB2ZG90bjtcbiAgICAgICAgY29uc3Qgc3BlZWQgPSBNYXRoLnNxcnQoKHhzICogeHMpICsgKHlzICogeXMpICsgKHpzICogenMpKTtcblxuICAgICAgICByZXR1cm4gc3BlZWQ7XG4gICAgfVxuXG4gICAgY29sbGlkZShvdGhlciwgcmVzdGl0dXRlKSB7XG4gICAgICAgIHN3aXRjaCAob3RoZXIudHlwZSkge1xuICAgICAgICBjYXNlIHR5cGVzLkFBQkI6XG4gICAgICAgICAgICB0aGlzLmNvbGxpZGVBQUJCKG90aGVyLCByZXN0aXR1dGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGNhc2UgdHlwZXMuU1BIRVJFOlxuICAgICAgICAgICAgdGhpcy5jb2xsaWRlU3BoZXJlKG90aGVyLCByZXN0aXR1dGUpO1xuICAgICAgICAgICAgYnJlYWs7XG4gICAgICAgIGRlZmF1bHQ6XG4gICAgICAgICAgICBicmVhaztcbiAgICAgICAgfVxuICAgIH1cblxuICAgIGNvbGxpZGVBQUJCKCkge1xuICAgICAgICAvLyB0byBiZSBvdmVycmlkZW4gYnkgU3BoZXJlIG9mIEFBQkJcbiAgICB9XG5cbiAgICBjb2xsaWRlU3BoZXJlKCkge1xuICAgICAgICAvLyB0byBiZSBvdmVycmlkZW4gYnkgU3BoZXJlIG9mIEFBQkJcbiAgICB9XG5cbiAgICBtb21lbnR1bSgpIHtcbiAgICAgICAgaWYgKHRoaXMuZHluYW1pYykge1xuICAgICAgICAgICAgY29uc3QgeyB4LCB5LCB6IH0gPSB0aGlzO1xuXG4gICAgICAgICAgICBjb25zdCB4biA9ICh4ICogMikgLSB0aGlzLnB4O1xuICAgICAgICAgICAgY29uc3QgeW4gPSAoeSAqIDIpIC0gdGhpcy5weTtcbiAgICAgICAgICAgIGNvbnN0IHpuID0gKHogKiAyKSAtIHRoaXMucHo7XG5cbiAgICAgICAgICAgIHRoaXMucHggPSB4O1xuICAgICAgICAgICAgdGhpcy5weSA9IHk7XG4gICAgICAgICAgICB0aGlzLnB6ID0gejtcblxuICAgICAgICAgICAgdGhpcy54ID0geG47XG4gICAgICAgICAgICB0aGlzLnkgPSB5bjtcbiAgICAgICAgICAgIHRoaXMueiA9IHpuO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYXBwbHlBY2NlbGVyYXRpb24oc2RlbHRhKSB7XG4gICAgICAgIGlmICh0aGlzLmR5bmFtaWMpIHtcbiAgICAgICAgICAgIHRoaXMueCArPSB0aGlzLmF4ICogc2RlbHRhO1xuICAgICAgICAgICAgdGhpcy55ICs9IHRoaXMuYXkgKiBzZGVsdGE7XG4gICAgICAgICAgICB0aGlzLnogKz0gdGhpcy5heiAqIHNkZWx0YTtcblxuICAgICAgICAgICAgdGhpcy5heCA9IDA7XG4gICAgICAgICAgICB0aGlzLmF5ID0gMDtcbiAgICAgICAgICAgIHRoaXMuYXogPSAwO1xuICAgICAgICB9XG4gICAgfVxuXG4gICAgYWNjZWxlcmF0ZSh4LCB5LCB6KSB7XG4gICAgICAgIGlmICh0aGlzLmR5bmFtaWMpIHtcbiAgICAgICAgICAgIHRoaXMuYXggKz0geDtcbiAgICAgICAgICAgIHRoaXMuYXkgKz0geTtcbiAgICAgICAgICAgIHRoaXMuYXogKz0gejtcbiAgICAgICAgfVxuICAgIH1cbn1cblxuZXhwb3J0IGRlZmF1bHQgQm9keTtcbiIsImltcG9ydCBCb2R5IGZyb20gJy4uL2NvcmUvYm9keSc7XG5pbXBvcnQgeyB0eXBlcyB9IGZyb20gJy4uL2NvbnN0YW50cyc7XG5cbi8qIGVzbGludC1kaXNhYmxlICovXG5jb25zdCBjbGFtcCA9IChsZWZ0LCByaWdodCwgdmFsdWUpID0+IHtcbiAgICByZXR1cm4gdmFsdWUgPCBsZWZ0ID8gbGVmdCA6ICh2YWx1ZSA+IHJpZ2h0ID8gcmlnaHQgOiB2YWx1ZSk7IC8vIGVzbGludC1kaXNhYmxlLWxpbmVcbn07XG5cbmNvbnN0IGhhbmRsZUNvbnRhY3QgPSAoYjEsIGIyLCBkZXB0aCwgeG4sIHluLCB6biwgcmVzdGl0dXRlKSA9PiB7XG4gICAgbGV0IHYxeCA9IGIxLnggLSBiMS5weDtcbiAgICBsZXQgdjF5ID0gYjEueSAtIGIxLnB5O1xuICAgIGxldCB2MXogPSBiMS56IC0gYjEucHo7XG5cbiAgICBsZXQgdjJ4ID0gYjIueCAtIGIyLnB4O1xuICAgIGxldCB2MnkgPSBiMi55IC0gYjIucHk7XG4gICAgbGV0IHYyeiA9IGIyLnogLSBiMi5wejtcblxuICAgIGNvbnN0IG10ID0gYjEuaW52X21hc3MgKyBiMi5pbnZfbWFzcztcbiAgICBjb25zdCBmMSA9IGIxLmludl9tYXNzIC8gbXQ7XG4gICAgY29uc3QgZjIgPSBiMi5pbnZfbWFzcyAvIG10O1xuXG4gICAgY29uc3Qgb2ZmMSA9IGRlcHRoICogZjE7XG4gICAgY29uc3Qgb2ZmMiA9IGRlcHRoICogZjI7XG5cbiAgICBiMS54ICs9IHhuICogb2ZmMTtcbiAgICBiMS55ICs9IHluICogb2ZmMTtcbiAgICBiMS56ICs9IHpuICogb2ZmMTtcbiAgICBiMi54IC09IHhuICogb2ZmMjtcbiAgICBiMi55IC09IHluICogb2ZmMjtcbiAgICBiMi56IC09IHpuICogb2ZmMjtcblxuICAgIGlmIChyZXN0aXR1dGUpIHtcbiAgICAgICAgY29uc3QgdnJ4ID0gdjF4IC0gdjJ4O1xuICAgICAgICBjb25zdCB2cnkgPSB2MXkgLSB2Mnk7XG4gICAgICAgIGNvbnN0IHZyeiA9IHYxeiAtIHYyejtcblxuICAgICAgICBjb25zdCB2ZG90biA9ICh2cnggKiB4bikgKyAodnJ5ICogeW4pICsgKHZyeiAqIHpuKTtcbiAgICAgICAgY29uc3QgbW9kaWZpZWRWZWxvY2l0eSA9IHZkb3RuIC8gbXQ7XG5cbiAgICAgICAgY29uc3QgajEgPSAtKDEgKyBiMi5yZXN0aXR1dGlvbikgKiBtb2RpZmllZFZlbG9jaXR5ICogYjEuaW52X21hc3M7XG4gICAgICAgIGNvbnN0IGoyID0gLSgxICsgYjEucmVzdGl0dXRpb24pICogbW9kaWZpZWRWZWxvY2l0eSAqIGIyLmludl9tYXNzO1xuXG4gICAgICAgIHYxeCArPSBqMSAqIHhuO1xuICAgICAgICB2MXkgKz0gajEgKiB5bjtcbiAgICAgICAgdjF6ICs9IGoxICogem47XG5cbiAgICAgICAgdjJ4IC09IGoyICogeG47XG4gICAgICAgIHYyeSAtPSBqMiAqIHluO1xuICAgICAgICB2MnogLT0gajIgKiB6bjtcblxuICAgICAgICBiMS5zZXRWZWxvY2l0eSh2MXgsIHYxeSwgdjF6KTtcbiAgICAgICAgYjIuc2V0VmVsb2NpdHkodjJ4LCB2MnksIHYyeik7XG4gICAgfVxufTtcblxuY2xhc3MgQUFCQiBleHRlbmRzIEJvZHkge1xuICAgIGNvbnN0cnVjdG9yKGFyZ3MpIHtcbiAgICAgICAgc3VwZXIoKTsgLy8gVE9ETzogZG9lcyBub3RoaW5nXG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIHdpZHRoOiAxLFxuICAgICAgICAgICAgaGVpZ2h0OiAxLFxuICAgICAgICAgICAgZGVwdGg6IDEsXG4gICAgICAgIH0sIGFyZ3MpO1xuXG4gICAgICAgIHRoaXMudHlwZSA9IHR5cGVzLkFBQkI7XG4gICAgICAgIHRoaXMuZHluYW1pYyA9IGZhbHNlO1xuICAgICAgICB0aGlzLndpZHRoID0gcGFyYW1zLndpZHRoO1xuICAgICAgICB0aGlzLmhlaWdodCA9IHBhcmFtcy5oZWlnaHQ7XG4gICAgICAgIHRoaXMuZGVwdGggPSBwYXJhbXMuZGVwdGg7XG5cbiAgICAgICAgdGhpcy5tZXNoID0gcGFyYW1zLm1lc2g7XG4gICAgICAgIHRoaXMuaW5pdChwYXJhbXMpO1xuICAgIH1cblxuICAgIHVwZGF0ZUJvdW5kaW5nVm9sdW1lKCkge1xuICAgICAgICBjb25zdCB7IHgsIHksIHogfSA9IHRoaXM7XG4gICAgICAgIGNvbnN0IHdpZHRoID0gdGhpcy53aWR0aCAvIDI7XG4gICAgICAgIGNvbnN0IGhlaWdodCA9IHRoaXMuaGVpZ2h0IC8gMjtcbiAgICAgICAgY29uc3QgZGVwdGggPSB0aGlzLmRlcHRoIC8gMjtcblxuICAgICAgICB0aGlzLmxlZnQgPSB4IC0gd2lkdGg7XG4gICAgICAgIHRoaXMucmlnaHQgPSB4ICsgd2lkdGg7XG5cbiAgICAgICAgdGhpcy50b3AgPSB5ICsgaGVpZ2h0O1xuICAgICAgICB0aGlzLmJvdHRvbSA9IHkgLSBoZWlnaHQ7XG5cbiAgICAgICAgdGhpcy5mcm9udCA9IHogKyBkZXB0aDtcbiAgICAgICAgdGhpcy5iYWNrID0geiAtIGRlcHRoO1xuXG4gICAgICAgIHJldHVybiB0aGlzO1xuICAgIH1cblxuICAgIGNvbGxpZGVTcGhlcmUoYiwgcmVzdGl0dXRlKSB7XG4gICAgICAgIGNvbnN0IGN4ID0gY2xhbXAodGhpcy5sZWZ0LCB0aGlzLnJpZ2h0LCBiLngpO1xuICAgICAgICBjb25zdCBjeSA9IGNsYW1wKHRoaXMuYm90dG9tLCB0aGlzLnRvcCwgYi55KTtcbiAgICAgICAgY29uc3QgY3ogPSBjbGFtcCh0aGlzLmJhY2ssIHRoaXMuZnJvbnQsIGIueik7XG5cbiAgICAgICAgY29uc3QgeCA9IGN4IC0gYi54O1xuICAgICAgICBjb25zdCB5ID0gY3kgLSBiLnk7XG4gICAgICAgIGNvbnN0IHogPSBjeiAtIGIuejtcblxuICAgICAgICBjb25zdCBscyA9ICh4ICogeCkgKyAoeSAqIHkpICsgKHogKiB6KTtcblxuICAgICAgICBpZiAobHMgPT09IDApIHtcbiAgICAgICAgICAgIGNvbnN0IHggPSB0aGlzLnogLSBiLng7XG4gICAgICAgICAgICBjb25zdCB5ID0gdGhpcy55IC0gYi55O1xuICAgICAgICAgICAgY29uc3QgeiA9IHRoaXMueiAtIGIuejtcbiAgICAgICAgICAgIGNvbnN0IGxzID0gKHggKiB4KSArICh5ICogeSkgKyAoeiAqIHopO1xuICAgICAgICB9XG5cbiAgICAgICAgaWYgKGxzID09PSAwKSB7XG4gICAgICAgICAgICByZXR1cm47XG4gICAgICAgIH1cblxuICAgICAgICBjb25zdCByYWRpdXMgPSBiLnJhZGl1cztcbiAgICAgICAgaWYgKGxzIDwgKHJhZGl1cyAqIHJhZGl1cykpIHtcbiAgICAgICAgICAgIGNvbnN0IGwgPSBNYXRoLnNxcnQobHMpO1xuICAgICAgICAgICAgY29uc3QgeG4gPSB4IC8gbDtcbiAgICAgICAgICAgIGNvbnN0IHluID0geSAvIGw7XG4gICAgICAgICAgICBjb25zdCB6biA9IHogLyBsO1xuICAgICAgICAgICAgaGFuZGxlQ29udGFjdCh0aGlzLCBiLCByYWRpdXMgLSBsLCB4biwgeW4sIHpuLCByZXN0aXR1dGUpO1xuICAgICAgICAgICAgdGhpcy5vbkNvbnRhY3QoYik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEFBQkI7XG4iLCJpbXBvcnQgQm9keSBmcm9tICcuLi9jb3JlL2JvZHknO1xuaW1wb3J0IHsgdHlwZXMgfSBmcm9tICcuLi9jb25zdGFudHMnO1xuXG5jb25zdCBoYW5kbGVDb250YWN0ID0gKGIxLCBiMiwgZGVwdGgsIHhuLCB5biwgem4sIHJlc3RpdHV0ZSkgPT4ge1xuICAgIGxldCB2MXggPSBiMS54IC0gYjEucHg7XG4gICAgbGV0IHYxeSA9IGIxLnkgLSBiMS5weTtcbiAgICBsZXQgdjF6ID0gYjEueiAtIGIxLnB6O1xuXG4gICAgbGV0IHYyeCA9IGIyLnggLSBiMi5weDtcbiAgICBsZXQgdjJ5ID0gYjIueSAtIGIyLnB5O1xuICAgIGxldCB2MnogPSBiMi56IC0gYjIucHo7XG5cbiAgICBjb25zdCBtdCA9IGIxLmludl9tYXNzICsgYjIuaW52X21hc3M7XG4gICAgY29uc3QgZjEgPSBiMS5pbnZfbWFzcyAvIG10O1xuICAgIGNvbnN0IGYyID0gYjIuaW52X21hc3MgLyBtdDtcblxuICAgIGNvbnN0IG9mZjEgPSBkZXB0aCAqIGYxO1xuICAgIGNvbnN0IG9mZjIgPSBkZXB0aCAqIGYyO1xuXG4gICAgYjEueCArPSB4biAqIG9mZjE7XG4gICAgYjEueSArPSB5biAqIG9mZjE7XG4gICAgYjEueiArPSB6biAqIG9mZjE7XG4gICAgYjIueCAtPSB4biAqIG9mZjI7XG4gICAgYjIueSAtPSB5biAqIG9mZjI7XG4gICAgYjIueiAtPSB6biAqIG9mZjI7XG5cbiAgICBpZiAocmVzdGl0dXRlKSB7XG4gICAgICAgIGNvbnN0IHZyeCA9IHYxeCAtIHYyeDtcbiAgICAgICAgY29uc3QgdnJ5ID0gdjF5IC0gdjJ5O1xuICAgICAgICBjb25zdCB2cnogPSB2MXogLSB2Mno7XG5cbiAgICAgICAgY29uc3QgdmRvdG4gPSAodnJ4ICogeG4pICsgKHZyeSAqIHluKSArICh2cnogKiB6bik7XG4gICAgICAgIGNvbnN0IG1vZGlmaWVkVmVsb2NpdHkgPSB2ZG90biAvIG10O1xuXG4gICAgICAgIGNvbnN0IGoxID0gLSgxICsgYjIucmVzdGl0dXRpb24pICogbW9kaWZpZWRWZWxvY2l0eSAqIGIxLmludl9tYXNzO1xuICAgICAgICBjb25zdCBqMiA9IC0oMSArIGIxLnJlc3RpdHV0aW9uKSAqIG1vZGlmaWVkVmVsb2NpdHkgKiBiMi5pbnZfbWFzcztcblxuICAgICAgICB2MXggKz0gajEgKiB4bjtcbiAgICAgICAgdjF5ICs9IGoxICogeW47XG4gICAgICAgIHYxeiArPSBqMSAqIHpuO1xuXG4gICAgICAgIHYyeCAtPSBqMiAqIHhuO1xuICAgICAgICB2MnkgLT0gajIgKiB5bjtcbiAgICAgICAgdjJ6IC09IGoyICogem47XG5cbiAgICAgICAgYjEuc2V0VmVsb2NpdHkodjF4LCB2MXksIHYxeik7XG4gICAgICAgIGIyLnNldFZlbG9jaXR5KHYyeCwgdjJ5LCB2MnopO1xuICAgIH1cbn07XG5cbmNsYXNzIFNwaGVyZSBleHRlbmRzIEJvZHkge1xuICAgIGNvbnN0cnVjdG9yKGFyZ3MpIHtcbiAgICAgICAgc3VwZXIoKTtcbiAgICAgICAgdGhpcy50eXBlID0gdHlwZXMuU1BIRVJFO1xuICAgICAgICB0aGlzLmR5bmFtaWMgPSB0cnVlO1xuXG4gICAgICAgIGNvbnN0IHBhcmFtcyA9IE9iamVjdC5hc3NpZ24oe30sIHtcbiAgICAgICAgICAgIHJhZGl1czogMSxcbiAgICAgICAgfSwgYXJncyk7XG5cbiAgICAgICAgdGhpcy5yYWRpdXMgPSBwYXJhbXMucmFkaXVzO1xuICAgICAgICB0aGlzLm1lc2ggPSBwYXJhbXMubWVzaDtcbiAgICAgICAgdGhpcy5pbml0KHBhcmFtcyk7XG4gICAgfVxuXG4gICAgY29tcHV0ZU1hc3MoKSB7XG4gICAgICAgIHJldHVybiAoNCAvIDMpICogTWF0aC5QSSAqIE1hdGgucG93KHRoaXMucmFkaXVzLCAzKSAqIHRoaXMuZGVuc2l0eTtcbiAgICB9XG5cbiAgICBjb2xsaWRlQUFCQihvdGhlciwgcmVzdGl0dXRlKSB7XG4gICAgICAgIG90aGVyLmNvbGxpZGVTcGhlcmUodGhpcywgcmVzdGl0dXRlKTtcbiAgICB9XG5cbiAgICB1cGRhdGVCb3VuZGluZ1ZvbHVtZSgpIHtcbiAgICAgICAgY29uc3QgeyB4LCB5LCB6LCByYWRpdXMgfSA9IHRoaXM7XG5cbiAgICAgICAgdGhpcy5sZWZ0ID0geCAtIHJhZGl1cztcbiAgICAgICAgdGhpcy5yaWdodCA9IHggKyByYWRpdXM7XG5cbiAgICAgICAgdGhpcy50b3AgPSB5ICsgcmFkaXVzO1xuICAgICAgICB0aGlzLmJvdHRvbSA9IHkgLSByYWRpdXM7XG5cbiAgICAgICAgdGhpcy5mcm9udCA9IHogKyByYWRpdXM7XG4gICAgICAgIHRoaXMuYmFjayA9IHogLSByYWRpdXM7XG5cbiAgICAgICAgcmV0dXJuIHRoaXM7XG4gICAgfVxuXG4gICAgY29sbGlkZVNwaGVyZShiMiwgcmVzdGl0dXRlKSB7XG4gICAgICAgIGNvbnN0IGIxID0gdGhpcztcblxuICAgICAgICBjb25zdCB4ID0gYjEueCAtIGIyLng7XG4gICAgICAgIGNvbnN0IHkgPSBiMS55IC0gYjIueTtcbiAgICAgICAgY29uc3QgeiA9IGIxLnogLSBiMi56O1xuXG4gICAgICAgIGNvbnN0IGxzID0gKHggKiB4KSArICh5ICogeSkgKyAoeiAqIHopO1xuICAgICAgICBjb25zdCB0YXJnZXQgPSBiMS5yYWRpdXMgKyBiMi5yYWRpdXM7XG5cbiAgICAgICAgaWYgKGxzICE9PSAwICYmIGxzIDwgKHRhcmdldCAqIHRhcmdldCkpIHtcbiAgICAgICAgICAgIGNvbnN0IGwgPSBNYXRoLnNxcnQobHMpO1xuICAgICAgICAgICAgY29uc3QgeG4gPSAoeCAvIGwpO1xuICAgICAgICAgICAgY29uc3QgeW4gPSAoeSAvIGwpO1xuICAgICAgICAgICAgY29uc3Qgem4gPSAoeiAvIGwpO1xuXG4gICAgICAgICAgICBoYW5kbGVDb250YWN0KGIxLCBiMiwgdGFyZ2V0IC0gbCwgeG4sIHluLCB6biwgcmVzdGl0dXRlKTtcbiAgICAgICAgICAgIGIxLm9uQ29udGFjdChiMik7XG4gICAgICAgIH1cbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IFNwaGVyZTtcbiIsImltcG9ydCB7IHR5cGVzIH0gZnJvbSAnLi4vY29uc3RhbnRzJztcblxuY2xhc3MgRm9yY2Uge1xuICAgIGNvbnN0cnVjdG9yKCkge1xuICAgICAgICB0aGlzLnR5cGUgPSB0eXBlcy5GT1JDRTtcbiAgICB9XG5cbiAgICByZW1vdmUoKSB7XG4gICAgICAgIHRoaXMudG9fcmVtb3ZlID0gdHJ1ZTtcbiAgICB9XG59XG5cbmV4cG9ydCBkZWZhdWx0IEZvcmNlO1xuIiwiaW1wb3J0IEZvcmNlIGZyb20gJy4vY29yZS9mb3JjZSc7XG5cbmNsYXNzIExpbmVhckFjY2VsZXJhdG9yIGV4dGVuZHMgRm9yY2Uge1xuICAgIGNvbnN0cnVjdG9yKGRpcmVjdGlvbikge1xuICAgICAgICBzdXBlcigpO1xuICAgICAgICB0aGlzLnggPSBkaXJlY3Rpb24ueDtcbiAgICAgICAgdGhpcy55ID0gZGlyZWN0aW9uLnk7XG4gICAgICAgIHRoaXMueiA9IGRpcmVjdGlvbi56O1xuICAgIH1cblxuICAgIHBlcmZvcm0oYm9kaWVzKSB7XG4gICAgICAgIGNvbnN0IHsgeCwgeSwgeiB9ID0gdGhpcztcbiAgICAgICAgZm9yIChsZXQgaSA9IDA7IGkgPCBib2RpZXMubGVuZ3RoOyBpKyspIHtcbiAgICAgICAgICAgIGJvZGllc1tpXS5hY2NlbGVyYXRlKHgsIHksIHopO1xuICAgICAgICB9XG4gICAgfVxufVxuXG5leHBvcnQgZGVmYXVsdCBMaW5lYXJBY2NlbGVyYXRvcjtcbiJdLCJuYW1lcyI6WyJ0eXBlcyIsIkFBQkIiLCJTUEhFUkUiLCJGT1JDRSIsImJvZHlJZCIsImdldElEIiwiYnlMZWZ0IiwiYjEiLCJiMiIsImxlZnQiLCJXb3JsZCIsInUiLCJib2RpZXMiLCJmb3JjZXMiLCJtYW5hZ2VkIiwiaSIsImFyZ3VtZW50cyIsImxlbmd0aCIsIm9iaiIsIndvcmxkIiwidHlwZSIsInB1c2giLCJyZW1vdmUiLCJib2R5MSIsImJvZHkyIiwibW9tZW50dW0iLCJkZWx0YSIsInNkZWx0YSIsImFwcGx5QWNjZWxlcmF0aW9uIiwicmVzdGl0dXRlIiwidXBkYXRlQm91bmRpbmdWb2x1bWVzIiwic29ydCIsImoiLCJkeW5hbWljIiwicmlnaHQiLCJiYWNrIiwiZnJvbnQiLCJib3R0b20iLCJ0b3AiLCJjb2xsaWRlIiwiYyIsInRvX3JlbW92ZSIsInNwbGljZSIsImwiLCJjbGVhbnVwQ29sbGVjdGlvbiIsInVwZGF0ZUJvdW5kaW5nVm9sdW1lIiwidGltZSIsImFjY2VsZXJhdGUiLCJ1cGRhdGVNZXNoUG9zaXRpb24iLCJjbGVhbnVwIiwidGltZXN0ZXAiLCJub3ciLCJvbmVzdGVwIiwiZGlmZiIsInBlcmZvcm0iLCJtZXNoIiwicG9zaXRpb24iLCJnZXRQb3NpdGlvbiIsInNldCIsIkJvZHkiLCJhcmdzIiwicGFyYW1zIiwiT2JqZWN0IiwiYXNzaWduIiwiaGFyZG5lc3MiLCJyZXN0aXR1dGlvbiIsIngiLCJ5IiwieiIsImRlbnNpdHkiLCJpZCIsIm1hc3MiLCJpbnZfbWFzcyIsImNvbXB1dGVNYXNzIiwiYXgiLCJheSIsImF6IiwicHgiLCJweSIsInB6Iiwib3RoZXIiLCJvbkNvbnRhY3QiLCJ2ZWxvY2l0eSIsImdldFZlbG9jaXR5Iiwic2V0VmVsb2NpdHkiLCJNYXRoIiwic3FydCIsInhuIiwieW4iLCJ6biIsInYxIiwidjIiLCJ2cngiLCJ2cnkiLCJ2cnoiLCJ2ZG90biIsInhzIiwieXMiLCJ6cyIsInNwZWVkIiwiY29sbGlkZUFBQkIiLCJjb2xsaWRlU3BoZXJlIiwiY2xhbXAiLCJ2YWx1ZSIsImhhbmRsZUNvbnRhY3QiLCJkZXB0aCIsInYxeCIsInYxeSIsInYxeiIsInYyeCIsInYyeSIsInYyeiIsIm10IiwiZjEiLCJmMiIsIm9mZjEiLCJvZmYyIiwibW9kaWZpZWRWZWxvY2l0eSIsImoxIiwiajIiLCJ3aWR0aCIsImhlaWdodCIsImluaXQiLCJiIiwiY3giLCJjeSIsImN6IiwibHMiLCJyYWRpdXMiLCJTcGhlcmUiLCJQSSIsInBvdyIsInRhcmdldCIsIkZvcmNlIiwiTGluZWFyQWNjZWxlcmF0b3IiLCJkaXJlY3Rpb24iXSwibWFwcGluZ3MiOiI7Ozs7OztJQUFPLElBQU1BLFFBQVE7SUFDakJDLFVBQU0sTUFEVztJQUVqQkMsWUFBUSxRQUZTO0lBR2pCQyxXQUFPO0lBSFUsQ0FBZDs7SUFNUCxJQUFJQyxTQUFTLENBQWI7QUFDQSxJQUFPLElBQU1DLFFBQVEsU0FBUkEsS0FBUSxHQUFNO0lBQ3ZCLFdBQU9ELFFBQVA7SUFDSCxDQUZNOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztJQ1BQO0FBQ0EsSUFDQTtJQUNBLElBQU1FLFNBQVMsU0FBVEEsTUFBUyxDQUFDQyxFQUFELEVBQUtDLEVBQUwsRUFBWTtJQUN2QixXQUFPRCxHQUFHRSxJQUFILEdBQVVELEdBQUdDLElBQXBCO0lBQ0gsQ0FGRDs7UUFJTUM7SUFDRixxQkFBYztJQUFBOztJQUNWLGFBQUtDLENBQUwsR0FBUyxDQUFUO0lBQ0EsYUFBS0MsTUFBTCxHQUFjLEVBQWQ7SUFDQSxhQUFLQyxNQUFMLEdBQWMsRUFBZDtJQUNBLGFBQUtDLE9BQUwsR0FBZSxDQUFDLEtBQUtGLE1BQU4sRUFBYyxLQUFLQyxNQUFuQixDQUFmO0lBQ0g7Ozs7a0NBRUs7SUFDRixpQkFBSyxJQUFJRSxJQUFJLENBQWIsRUFBZ0JBLElBQUlDLFVBQVVDLE1BQTlCLEVBQXNDRixHQUF0QyxFQUEyQztJQUN2QyxvQkFBTUcsTUFBTUYsVUFBVUQsQ0FBVixDQUFaO0lBQ0FHLG9CQUFJQyxLQUFKLEdBQVksSUFBWjs7SUFFQSxvQkFBSUQsSUFBSUUsSUFBSixLQUFhcEIsTUFBTUcsS0FBdkIsRUFBOEI7SUFDMUIseUJBQUtVLE1BQUwsQ0FBWVEsSUFBWixDQUFpQkgsR0FBakI7SUFDSCxpQkFGRCxNQUVPO0lBQ0gseUJBQUtOLE1BQUwsQ0FBWVMsSUFB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
