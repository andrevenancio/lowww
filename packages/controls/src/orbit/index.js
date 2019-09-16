import { vec3 } from 'gl-matrix';
import { clamp } from '../utils/math';

const offset = -Math.PI * 0.5;

class OrbitControls {
    constructor(camera, domElement) {
        this.camera = camera;
        this.domElement = domElement;

        this.radius = Math.max(camera.position.x, camera.position.z);

        this.rx = Math.atan2(camera.position.y, this.radius);
        this.ry = Math.atan2(camera.position.z, camera.position.x) + offset;

        this.ox = 0;
        this.oy = 0;

        this.width = window.innerWidth;
        this.height = window.innerHeight;

        // rotation
        this.rotationSpeed = 5 * window.devicePixelRatio;

        // zoom
        this.zoomMin = 0.1;
        this.zoomMax = Infinity;
        this.zoomSpeed = 100;

        this.isDown = false;

        // cache
        this.curDiff = 0;
        this.oldDiff = -1;

        this.enable();
    }

    enable() {
        this.domElement.addEventListener('mousedown', this.onStart, false);
        this.domElement.addEventListener('mousemove', this.onMove, false);
        this.domElement.addEventListener('mouseup', this.onEnd, false);
        this.domElement.addEventListener('touchstart', this.onStart, false);
        this.domElement.addEventListener('touchmove', this.onMove, false);
        this.domElement.addEventListener('touchend', this.onEnd, false);
        this.domElement.addEventListener('wheel', this.onWheel, false);
    }

    disable() {
        this.domElement.removeEventListener('mousedown', this.onStart, false);
        this.domElement.removeEventListener('mousemove', this.onMove, false);
        this.domElement.removeEventListener('mouseup', this.onEnd, false);
        this.domElement.removeEventListener('touchstart', this.onStart, false);
        this.domElement.removeEventListener('touchmove', this.onMove, false);
        this.domElement.removeEventListener('touchend', this.onEnd, false);
        this.domElement.removeEventListener('wheel', this.onWheel, false);
    }

    onStart = event => {
        event.preventDefault();

        this.oy = this.ry;
        this.ox = this.rx;

        this.startY = event.pageX / this.width;
        this.startX = event.pageY / this.height;

        this.isDown = true;
    };

    onMove = event => {
        if (this.isDown) {
            const y = event.pageX / this.width;
            const x = event.pageY / this.height;
            this.rx = this.ox + -(this.startX - x) * this.rotationSpeed;
            this.ry = this.oy + (this.startY - y) * this.rotationSpeed;
            this.rx = clamp(this.rx, -Math.PI * 0.5, Math.PI * 0.5);

            // when user uses 2 fingers, zoom in / out.
            if (event.touches && event.changedTouches.length > 1) {
                const one = event.changedTouches[0];
                const two = event.changedTouches[1];
                this.curDiff = this.pinchMode(
                    one.clientX,
                    one.clientY,
                    two.clientX,
                    two.clientY
                );

                let amount = 0;
                if (this.curDiff > this.oldDiff) {
                    amount = -100;
                } else {
                    amount = 100;
                }

                this.zoom(amount);
                this.oldDiff = this.curDiff;
            }
        }
    };

    onEnd = () => {
        this.isDown = false;
        this.oldDiff = -1;
    };

    onWheel = event => {
        event.preventDefault();
        this.zoom(-event.deltaY);
    };

    pinchMode(x1, y1, x2, y2) {
        return Math.sqrt((x1 - x2) * (x1 - x2) + (y1 - y2) * (y1 - y2));
    }

    zoom(delta) {
        this.radius += (delta / 1000) * this.zoomSpeed;
        this.radius = clamp(this.radius, this.zoomMin, this.zoomMax);
    }

    update() {
        const y = this.radius * Math.sin(this.rx);
        const r = this.radius * Math.cos(this.rx);
        const x = Math.sin(this.ry) * r;
        const z = Math.cos(this.ry) * r;
        vec3.set(this.camera.position.data, x, y, z);
    }
}

export default OrbitControls;
