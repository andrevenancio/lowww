/* global Worker, Blob */
const worker = new Worker(
    URL.createObjectURL(
        new Blob([
            `
    onmessage = event => {
        postMessage('Hello ' + event.data);
    };
`,
        ])
    )
);
worker.onmessage = e => {
    console.log(e.data);
};
worker.postMessage('World');
