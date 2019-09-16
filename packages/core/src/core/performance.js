class Performance {
    constructor(params = {}) {
        this.theme = params.theme || {
            font:
                'font-family:sans-serif;font-size:xx-small;font-weight:bold;line-height:15px;-moz-osx-font-smoothing: grayscale;-webkit-font-smoothing: antialiased;',
            color1: '#242424',
            color2: '#2a2a2a',
            color3: '#666',
            color4: '#999',
        };

        const container = document.createElement('div');
        container.style.cssText =
            'position:fixed;bottom:0;left:0;min-width:80px;opacity:0.9;z-index:10000;';

        this.holder = document.createElement('div');
        this.holder.style.cssText = `padding:3px;background-color:${this.theme.color1};`;
        container.appendChild(this.holder);

        const title = document.createElement('div');
        title.style.cssText = `${this.theme.font};color:${this.theme.color3};`;
        title.innerHTML = 'Performance';
        this.holder.appendChild(title);

        this.msTexts = [];

        this.domElement = container;
    }

    rebuild(params) {
        this.msTexts = [];
        Object.keys(params).forEach(key => {
            const element = document.createElement('div');
            element.style.cssText = `${this.theme.font};color:${this.theme.color4};background-color:${this.theme.color2};`;
            this.holder.appendChild(element);
            this.msTexts[key] = element;
        });
    }

    update(renderer) {
        if (
            Object.keys(this.msTexts).length !==
            Object.keys(renderer.performance).length
        ) {
            this.rebuild(renderer.performance);
        }

        Object.keys(renderer.performance).forEach(key => {
            this.msTexts[
                key
            ].textContent = `${key}: ${renderer.performance[key]}`;
        });
    }
}

export default Performance;
