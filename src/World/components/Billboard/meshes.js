import { Mesh } from 'three';

import { createGeometries } from './geometries';
import { createMaterials } from './materials';

function createMeshes() {
    const geometries = createGeometries();
    const materials = createMaterials();
}

export { createMeshes }