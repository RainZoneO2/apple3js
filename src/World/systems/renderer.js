import { WebGLRenderer, SRGBColorSpace, ACESFilmicToneMapping, PCFShadowMap } from "three";

function createRenderer() {
    const renderer = new WebGLRenderer({antialias: true, alpha: true});

    renderer.gammaOutput = true;
    renderer.gammaFactor = 2.2;
    renderer.toneMapping = ACESFilmicToneMapping;
    renderer.outputColorSpace = SRGBColorSpace;
    renderer.shadowMap.enabled = true;
    renderer.shadowMap.type = PCFShadowMap;
    //renderer.toneMappingExposure = 1;


    return renderer;
}

export { createRenderer };