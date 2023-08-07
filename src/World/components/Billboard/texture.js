import { TextureLoader } from "three";

function createTexture(imagePath, aspectRatio) {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(imagePath, () => {
        cover(texture, aspectRatio);
    });

    texture.matrixAutoUpdate = false;
    return texture;
}

function cover( texture, aspect ) {
    var imageAspect = texture.image.width / texture.image.height;
    console.log(aspect);
    if ( aspect < imageAspect ) {
        texture.matrix.setUvTransform( 0, 0, aspect / imageAspect, 1, 0, 0.5, 0.5 );
    } else {
        texture.matrix.setUvTransform( 0, 0, 1, imageAspect / aspect, 0, 0.5, 0.5 );
    }
  }

export { createTexture };