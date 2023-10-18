export const getViewportQuality = (container) => {

    const pixelRatio = window.devicePixelRatio ? window.devicePixelRatio : 1;
    let rect = undefined;
    let width, height;
    if (container) { rect = container.getBoundingClientRect(); }
    if (rect) { width = rect.width; height = rect.height; }
    if (!width) { width = window.innerWidth; }
    if (!height) { height = window.innerHeight; }

    return { pixelRatio, width, height };
}