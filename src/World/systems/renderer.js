import { WebGLRenderer, SRGBColorSpace } from "three";

function createRenderer() {
    const renderer = new WebGLRenderer({antialias: true});

    renderer.gammaFactor = 2.2;
    renderer.outputColorSpace = SRGBColorSpace;

    return renderer;
}

export { createRenderer };