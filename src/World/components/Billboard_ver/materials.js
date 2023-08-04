import { MeshStandardMaterial } from "three";

function createMaterials() {
    const boxMaterial = new MeshStandardMaterial({
        color: 'blue',
        flatShading: true,
      });

    const poleMaterial = new MeshStandardMaterial({
        color: 'gray',
        flatShading: true,
    });

    return {
        boxMaterial,
        poleMaterial,
    };
}

export { createMaterials }