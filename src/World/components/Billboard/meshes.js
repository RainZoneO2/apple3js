import { Mesh } from 'three';

import { createGeometries } from './geometries';
import { createMaterials } from './materials';

function createMeshes(type, imagePath) {
    const geometries = createGeometries(type);
    const materials = createMaterials(imagePath);

    // Create pole meshes
    const pole1 = new Mesh(
        geometries.pole,
        materials.poleMaterial
    );
    
    const pole2 = new Mesh(
        geometries.pole,
        materials.poleMaterial
    );
    
    // Create box mesh
    const box = new Mesh(geometries.box, materials.boxMaterial);
    

    // Check type
    if (type === 'vertical') {
        pole1.position.set(-0.5, 0.5, 0);
        pole2.position.set(0.5, 0.5, 0);
        box.position.set(0, 2.25, 0);
    } else if (type === 'horizontal') {
        pole1.position.set(-1, 0.5, 0);
        pole2.position.set(1, 0.5, 0);
        box.position.set(0, 1.75, 0);
    }
    
    return {
        box,
        pole1,
        pole2,
    };
}

export { createMeshes }