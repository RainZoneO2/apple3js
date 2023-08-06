import { TextureLoader } from "three";

function createTexture(imagePath) {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(imagePath);

    return texture;
}

export { createTexture };