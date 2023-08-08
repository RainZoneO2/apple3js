import { MeshBasicMaterial, MeshStandardMaterial, NoToneMapping, TextureLoader } from "three";
import { createImageTexture, createVideoTexture } from "./texture";
import { isImageOrVideo } from "../../systems/imgVidCheck";


function createMaterials(path, aspectRatio) {
    const boxMaterial = new MeshStandardMaterial({
        color: 'SteelBlue',
        flatShading: true,
      });

    const poleMaterial = new MeshStandardMaterial({
        color: 'gray',
        flatShading: true,
    });

    const type = isImageOrVideo(path);
    console.log(type);

    const imageMaterial = new MeshBasicMaterial({
        map: type === 'image' ? createImageTexture(path, aspectRatio)
            : type === 'video' ? createVideoTexture(path, aspectRatio)
            : null,
        
        toneMapped: false,
    });

    return {
        boxMaterial,
        poleMaterial,
        imageMaterial,
    };
}

export { createMaterials }