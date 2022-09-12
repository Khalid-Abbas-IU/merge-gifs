// Defaults
const defaultOptions = {
    format: 'image/png',
    quality: 0.92,
    width: undefined,
    height: undefined,
    Canvas: undefined,
    crossOrigin: undefined
};

// Return Promise
const mergedGifs = (sources = [], options = {}) => new Promise(resolve => {
    options = Object.assign({}, defaultOptions, options);

    // Setup browser/Node.js specific variables
    const canvas = document.getElementById('#canvasCombine');
    // const Image = options.Image;
    debugger

    // Load sources
    const images = sources.map(source => new Promise((resolve, reject) => {
        // Convert sources to objects
        if (source.constructor.name !== 'Object') {
            source = { src: source };
        }

        // Resolve source and img when loaded
        const img = new Image();
        img.crossOrigin = options.crossOrigin;
        img.onerror = () => reject(new Error('Couldn\'t load image'));
        img.onload = () => resolve(Object.assign({}, source, { img }));
        img.src = source.src;
    }));

    // Get canvas context
    const ctx = canvas.getContext('2d');

    // When sources have loaded
    resolve(Promise.all(images)
        .then(images => {
            // Set canvas dimensions
            const getSize = dim => options[dim] || Math.max(...images.map(image => image.img[dim]));
            canvas.width = getSize('width');
            canvas.height = getSize('height');

            // Draw images to canvas
            images.forEach(image => {
                ctx.globalAlpha = image.opacity ? image.opacity : 1;
                return ctx.drawImage(image.img, image.x || 0, image.y || 0);
            });

            if (options.Canvas && options.format === 'image/jpeg') {
                // Resolve data URI for node-canvas jpeg async
                return new Promise((resolve, reject) => {
                    canvas.toDataURL(options.format, {
                        quality: options.quality,
                        progressive: false
                    }, (err, jpeg) => {
                        if (err) {
                            reject(err);
                            return;
                        }
                        resolve(jpeg);
                    });
                });
            }

            // Resolve all other data URIs sync
            return canvas.toDataURL(options.format, options.quality);
        }));
});

// export default mergedGifs;
// module.exports = mergedGifs

mergedGifs([
    { src: 'body.png', x: 0, y: 0 },
    { src: 'eyes.png', x: 32, y: 0 },
    { src: 'mouth.png', x: 16, y: 0 }
])
    .then(b64 => {
        console.log("base64", b64)
    });