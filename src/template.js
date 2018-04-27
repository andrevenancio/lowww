class Template {
    constructor() {
        window.addEventListener('resize', this.handleResize.bind(this), false);

        this.setup();
        this.init();
        this.handleResize();
        this.handleUpdate();
    }

    handleResize() {
        this.resize(window.innerWidth, window.innerHeight, window.devicePixelRatio);
    }

    handleUpdate() {
        this.update();
        requestAnimationFrame(this.handleUpdate.bind(this));
    }

    // to be overriden
    setup() { console.warn('please add the setup() method'); }
    init() { console.warn('please add the init() method'); }
    resize() { console.warn('please add the resize() method'); }
    update() { console.warn('please add the update() method'); }
}

export default Template;
