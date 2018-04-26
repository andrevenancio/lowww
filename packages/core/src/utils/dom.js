export function resize(domElement, width, height, ratio) {
    domElement.width = width * ratio;
    domElement.height = height * ratio;
    domElement.style.width = `${width}px`;
    domElement.style.height = `${height}px`;
}

export function unsupported() {
    const div = document.createElement('div');
    div.innerHTML = 'Your browser doesn\'t support WebGL.<br><a href="https://get.webgl.org">Get WebGL</a>';
    div.style.display = 'table';
    div.style.margin = '20px auto 0 auto';
    div.style.border = '1px solid #333';
    div.style.backgroundColor = 'rgba(255, 255, 255, 0.1)';
    div.style.borderRadius = '4px';
    div.style.padding = '10px';
    div.style.fontFamily = 'monospace';
    div.style.fontSize = '12px';
    div.style.textAlign = 'center';
    return div;
}
