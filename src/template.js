/* global dat */
class Template {
    constructor() {
        window.addEventListener('resize', this.handleResize.bind(this), false);
        window.addEventListener('focus', this.handleResume.bind(this), false);
        window.addEventListener('blur', this.handlePause.bind(this), false);

        this.gui = new dat.GUI();
        this.gui.close();

        this.setup();
        this.init();
        this.handleResize();
        this.handleResume();
    }

    handleResize() {
        this.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
    }

    handleResume() {
        this.resume();
        this.raf = requestAnimationFrame(this.handleUpdate.bind(this));
    }

    handlePause() {
        this.pause();
        cancelAnimationFrame(this.raf);
        this.update();
    }

    handleUpdate() {
        this.update();
        this.raf = requestAnimationFrame(this.handleUpdate.bind(this));
    }

    // to be overriden
    setup() { console.warn('please add the setup() method'); }
    init() { console.warn('please add the init() method'); }
    resize() { console.warn('please add the resize() method'); }
    pause() { console.warn('please add pause() method'); }
    resume() { console.warn('please add resume() method'); }
    update() { console.warn('please add the update() method'); }
}

export default Template;
