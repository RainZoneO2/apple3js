import { Mesh } from 'three';

import { createGeometries } from './geometries';
import { createMaterials } from './materials';

function createMeshes() {
    const geometries = createGeometries();
    const materials = createMaterials();

    // Create pole mesh
    const pole1 = new Mesh(
        geometries.pole,
        materials.poleMaterial
    );
    pole1.position.set(-1, 0.5, 0);
      
    const pole2 = new Mesh(
        geometries.pole,
        materials.poleMaterial
    );
    pole2.position.set(1, 0.5, 0);
    
    // Create box mesh
    const box = new Mesh(geometries.box, materials.boxMaterial);
    box.position.set(0, 1.75, 0);

    return {
        box,
        pole1,
        pole2,
    };
}

export { createMeshes }