import { MeshBasicMaterial, MeshStandardMaterial, TextureLoader } from "three";
import { createTexture } from "./texture";


function createMaterials(imagePath, aspectRatio) {
    const boxMaterial = new MeshStandardMaterial({
        color: 'SteelBlue',
        flatShading: true,
      });

    const poleMaterial = new MeshStandardMaterial({
        color: 'gray',
        flatShading: true,
    });

    const imageMaterial = new MeshBasicMaterial({
        map: createTexture(imagePath, aspectRatio),
    });

    return {
        boxMaterial,
        poleMaterial,
        imageMaterial,
    };
}

export { createMaterials }