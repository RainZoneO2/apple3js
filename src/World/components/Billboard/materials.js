import { MeshBasicMaterial, MeshStandardMaterial, TextureLoader } from "three";
import { createTexture } from "./texture";


function createMaterials(imagePath) {
    const boxMaterial = new MeshStandardMaterial({
        color: 'blue',
        flatShading: true,
      });

    const poleMaterial = new MeshStandardMaterial({
        color: 'gray',
        flatShading: true,
    });

    const imageMaterial = new MeshBasicMaterial({
        map: createTexture(imagePath),
    });

    return {
        boxMaterial,
        poleMaterial,
        imageMaterial,
    };
}

export { createMaterials }