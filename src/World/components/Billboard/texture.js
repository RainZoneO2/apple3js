import { LinearFilter, SRGBColorSpace, TextureLoader, VideoTexture } from "three";

function createImageTexture(path, aspectRatio) {
    const textureLoader = new TextureLoader();
    const texture = textureLoader.load(path, () => {
        cover(texture, aspectRatio);
    });

    texture.matrixAutoUpdate = false;
    return texture;
}

function createVideoTexture(videoPath, aspectRatio) {
    var video = document.createElement('video');
    video.src = '/rain.webm';
    video.load();
    video.preload = 'auto';
    video.autoload = true;
    video.loop = true;
    video.playsInline = true;
    
    
    const texture = new VideoTexture(video);
    
    //texture.minFilter = LinearFilter;
    //texture.magFilter = LinearFilter;
    //texture.colorSpace = SRGBColorSpace;
    
    video.play();

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



export { createImageTexture, createVideoTexture };